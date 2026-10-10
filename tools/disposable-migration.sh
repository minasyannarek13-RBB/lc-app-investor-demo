#!/usr/bin/env bash
set -euo pipefail
root_dir="$(cd "$(dirname "$0")/.." && pwd)"
: "${LC_TEST_PROJECT_REF:?Supply separately authorised disposable ref}"
: "${LC_DISPOSABLE_DATABASE_HOST:?Supply verified direct database host}"
: "${LC_DISPOSABLE_REHEARSAL_APPROVAL:?Target-specific write approval required}"
: "${LC_PRESENT_CHAIN_APPROVAL:?Explicit 052–054 experimental-chain decision required}"
[[ "$LC_TEST_PROJECT_REF" =~ ^[a-z]{20}$ ]]
[[ "$LC_TEST_PROJECT_REF" != aspbwgsfkebduvviyeuo && "$LC_TEST_PROJECT_REF" != dnpizrjuxkcnmdgmvnks ]]
[[ "$LC_DISPOSABLE_REHEARSAL_APPROVAL" == "$LC_TEST_PROJECT_REF" && "$LC_PRESENT_CHAIN_APPROVAL" == "$LC_TEST_PROJECT_REF" ]]
[[ "$LC_DISPOSABLE_DATABASE_HOST" == "db.${LC_TEST_PROJECT_REF}.supabase.co" ]]
# Ignore ambient connection URLs/service files; use direct host and runtime PGPASSWORD.
unset PGHOSTADDR PGSERVICE PGSERVICEFILE PGOPTIONS
export PGHOST="$LC_DISPOSABLE_DATABASE_HOST" PGPORT=5432 PGDATABASE=postgres PGUSER=postgres PGSSLMODE=verify-full
: "${PGPASSWORD:?Supply disposable password through secret manager}"
command -v psql >/dev/null
receipt_dir="$(mktemp -d /private/tmp/lc-disposable-receipt.XXXXXX)"
chmod 700 "$receipt_dir"
python3 - "$root_dir" "$receipt_dir" <<'PY'
import hashlib,re,sys
from pathlib import Path
root,out=map(Path,sys.argv[1:])
rows=re.findall(r'\| (\d{3}) \| `([^`]+)` \| `([a-f0-9]{64})` \|',(root/'STAGING_MIGRATION_EXECUTION_PLAN.md').read_text())
files=sorted(root.glob('supabase/migrations/*.sql'))
assert len(rows)==57 and len(files)==57
assert [root/path for _,path,_ in rows]==files
for order,path,expected in rows:
    assert order not in ('052','053','054')
    assert hashlib.sha256((root/path).read_bytes()).hexdigest()==expected,path
(out/'manifest.tsv').write_text(''.join(f'{order}\t{path}\t{digest}\n' for order,path,digest in rows))
PY
# This runner deliberately accepts only an empty experimental app baseline.
psql -X -v ON_ERROR_STOP=1 <<'SQL' > "$receipt_dir/preflight.txt"
begin read only;
do $$ begin
  if exists(select 1 from pg_tables where schemaname='public')
    or exists(select 1 from pg_views where schemaname='public')
    or exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public')
    or exists(select 1 from pg_policies where schemaname='public')
    or exists(select 1 from auth.users)
    or exists(select 1 from storage.buckets)
    or exists(select 1 from storage.objects)
    or to_regclass('supabase_migrations.schema_migrations') is not null
  then raise exception 'Disposable baseline is not empty: stop'; end if;
end $$;
select version();
commit;
SQL
while IFS=$'\t' read -r order path digest; do
  psql -X -v ON_ERROR_STOP=1 -f "$root_dir/$path" >> "$receipt_dir/apply.log" 2>&1
  printf '%s\t%s\t%s\n' "$order" "$path" "$digest" >> "$receipt_dir/applied.tsv"
done < "$receipt_dir/manifest.tsv"
printf 'DISPOSABLE CHAIN APPLIED; no Supabase ledger written. Private receipt: %s\n' "$receipt_dir"
