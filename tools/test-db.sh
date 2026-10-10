#!/usr/bin/env bash
set -euo pipefail

# Inherited connection settings/password files must not influence this local cluster.
unset PGHOST PGHOSTADDR PGPORT PGDATABASE PGUSER PGPASSWORD PGSERVICE PGSERVICEFILE PGOPTIONS
export PGSSLMODE=disable
LC_REPLAY_EVIDENCE_DIR="${LC_REPLAY_EVIDENCE_DIR:-}"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PG_BIN="${PG_BIN:-/opt/homebrew/opt/postgresql@17/bin}"
PG_PORT="${PG_PORT:-55432}"
DB_ROOT="$(mktemp -d /private/tmp/lc-app-postgres.XXXXXX)"
DB_DATA="$DB_ROOT/data"
DB_LOG="$DB_ROOT/postgres.log"
DB_NAME="lc_app_test"
export PGPASSFILE="$DB_ROOT/empty.pgpass"
: > "$PGPASSFILE"
chmod 600 "$PGPASSFILE"

cleanup() {
  "$PG_BIN/pg_ctl" -D "$DB_DATA" -m immediate stop >/dev/null 2>&1 || true
  rm -rf "$DB_ROOT"
}
trap cleanup EXIT INT TERM

"$PG_BIN/initdb" -D "$DB_DATA" --no-locale --encoding=UTF8 --auth=trust >/dev/null
"$PG_BIN/pg_ctl" -D "$DB_DATA" -l "$DB_LOG" -o "-h 127.0.0.1 -p $PG_PORT -F" start >/dev/null
"$PG_BIN/createdb" -h 127.0.0.1 -p "$PG_PORT" "$DB_NAME"

PSQL=("$PG_BIN/psql" -X -q -v ON_ERROR_STOP=1 -h 127.0.0.1 -p "$PG_PORT" -d "$DB_NAME")
export PGOPTIONS="--client-min-messages=warning"
"${PSQL[@]}" -f "$ROOT_DIR/tests/db/supabase-platform-shim.sql" >/dev/null

while IFS= read -r migration; do
  printf 'apply %s\n' "$(basename "$migration")"
  "${PSQL[@]}" -f "$migration" >/dev/null
done < <(find "$ROOT_DIR/supabase/migrations" -type f -name '*.sql' -print | sort)

if [[ -n "$LC_REPLAY_EVIDENCE_DIR" ]]; then
  mkdir -p "$LC_REPLAY_EVIDENCE_DIR"
  "$PG_BIN/pg_dump" -h 127.0.0.1 -p "$PG_PORT" -d "$DB_NAME" --schema-only --no-owner | sed '/^\\restrict /d; /^\\unrestrict /d' > "$LC_REPLAY_EVIDENCE_DIR/schema-initial.sql"
fi

for migration in \
  "$ROOT_DIR/supabase/migrations/202610090057_foundation_contract_recovery.sql" \
  "$ROOT_DIR/supabase/migrations/202610090058_avatar_storage_contract_recovery.sql" \
  "$ROOT_DIR/supabase/migrations/202610090059_private_profile_policy_compatibility.sql" \
  "$ROOT_DIR/supabase/migrations/202610090060_foundation_privilege_and_suspension_hardening.sql"; do
  printf 'reapply %s\n' "$(basename "$migration")"
  "${PSQL[@]}" -f "$migration" >/dev/null
done

if [[ -n "$LC_REPLAY_EVIDENCE_DIR" ]]; then
  mkdir -p "$LC_REPLAY_EVIDENCE_DIR"
  "$PG_BIN/pg_dump" -h 127.0.0.1 -p "$PG_PORT" -d "$DB_NAME" --schema-only --no-owner | sed '/^\\restrict /d; /^\\unrestrict /d' > "$LC_REPLAY_EVIDENCE_DIR/schema.sql"
  cmp "$LC_REPLAY_EVIDENCE_DIR/schema-initial.sql" "$LC_REPLAY_EVIDENCE_DIR/schema.sql"
  printf 'REAPPLY SCHEMA PARITY: PASS\n'
  "${PSQL[@]}" -At -f "$ROOT_DIR/tests/db/schema-catalog.sql" > "$LC_REPLAY_EVIDENCE_DIR/catalog.json"
  python3 "$ROOT_DIR/tools/migration-dependencies.py" --output "$LC_REPLAY_EVIDENCE_DIR/dependencies.json"
else
  "${PSQL[@]}" -At -f "$ROOT_DIR/tests/db/schema-catalog.sql" >/dev/null
fi

"${PSQL[@]}" -f "$ROOT_DIR/tests/db/schema-security-audit.sql"
"${PSQL[@]}" -f "$ROOT_DIR/tests/db/security-matrix.sql"

pass_count=0

as_actor() {
  local role_name="$1" actor_id="$2" statement="$3"
  "${PSQL[@]}" -Atq <<SQL
begin;
set local role ${role_name};
set local "request.jwt.claim.sub" = '${actor_id}';
set local "request.jwt.claim.role" = '${role_name}';
${statement}
rollback;
SQL
}

as_actor_commit() {
  local role_name="$1" actor_id="$2" statement="$3"
  "${PSQL[@]}" -Atq <<SQL
begin;
set local role ${role_name};
set local "request.jwt.claim.sub" = '${actor_id}';
set local "request.jwt.claim.role" = '${role_name}';
${statement}
commit;
SQL
}

as_service_role_commit() {
  local statement="$1"
  "${PSQL[@]}" -Atq <<SQL
begin;
set local role service_role;
set local "request.jwt.claim.sub" = '';
set local "request.jwt.claim.role" = 'service_role';
${statement}
commit;
SQL
}

expect_value() {
  local label="$1" role_name="$2" actor_id="$3" expected="$4" statement="$5" actual
  actual="$(as_actor "$role_name" "$actor_id" "$statement")"
  if [[ "$actual" != "$expected" ]]; then
    printf 'FAIL %s: expected %s, got %s\n' "$label" "$expected" "$actual" >&2
    return 1
  fi
  pass_count=$((pass_count + 1))
  printf 'PASS %s\n' "$label"
}

expect_denied() {
  local label="$1" role_name="$2" actor_id="$3" statement="$4"
  if as_actor "$role_name" "$actor_id" "$statement" >/dev/null 2>&1; then
    printf 'FAIL %s: statement unexpectedly succeeded\n' "$label" >&2
    return 1
  fi
  pass_count=$((pass_count + 1))
  printf 'PASS %s\n' "$label"
}

expect_denied "anonymous profile table access" anon 00000000-0000-4000-8000-000000000000 \
  "select id from public.profiles;"
expect_value "player full own profile RPC" authenticated 11111111-1111-4111-8111-111111111111 \
  '11111111-1111-4111-8111-111111111111' \
  "select public.get_own_profile()->>'id';"
expect_denied "private profile fields excluded from client table reads" authenticated 11111111-1111-4111-8111-111111111111 \
  "select age_confirmed from public.profiles where id = '11111111-1111-4111-8111-111111111111';"
expect_value "player cannot read another inbox" authenticated 11111111-1111-4111-8111-111111111111 0 \
  "select count(*) from public.notifications where recipient_id = '22222222-2222-4222-8222-222222222222';"
expect_denied "player cannot manufacture notifications" authenticated 11111111-1111-4111-8111-111111111111 \
  "insert into public.notifications(recipient_id,actor_id,type,target_type) values ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','new_follower','profile');"
expect_denied "player cannot escalate role" authenticated 11111111-1111-4111-8111-111111111111 \
  "update public.profiles set role = 'admin' where id = '11111111-1111-4111-8111-111111111111';"
expect_denied "unverified creator cannot self-publish" authenticated 44444444-4444-4444-8444-444444444444 \
  "update public.creator_profiles set profile_status = 'published' where user_id = '44444444-4444-4444-8444-444444444444';"
expect_denied "unverified creator cannot publish session" authenticated 44444444-4444-4444-8444-444444444444 \
  "insert into public.creator_sessions(creator_id,game,starts_at,status,visibility,provenance) values ('44444444-4444-4444-8444-444444444444','Roulette',now() + interval '1 hour','scheduled','public','user_generated');"
expect_denied "creator cannot write another creator post" authenticated 33333333-3333-4333-8333-333333333333 \
  "insert into public.posts(author_id,body) values ('44444444-4444-4444-8444-444444444444','forged');"
expect_value "player cannot read another reporter submission" authenticated 11111111-1111-4111-8111-111111111111 0 \
  "select count(*) from public.reports where id = '99999999-9999-4999-8999-999999999999';"
expect_value "admin sees moderation queue" authenticated 77777777-7777-4777-8777-777777777777 1 \
  "select count(*) from public.reports where id = '99999999-9999-4999-8999-999999999999';"
as_actor_commit authenticated 77777777-7777-4777-8777-777777777777 \
  "update public.reports set status = 'reviewing' where id = '99999999-9999-4999-8999-999999999999';" >/dev/null
expect_value "admin review stamps moderator and timestamp" authenticated 77777777-7777-4777-8777-777777777777 \
  '77777777-7777-4777-8777-777777777777|true' \
  "select reviewed_by::text || '|' || (reviewed_at is not null)::text from public.reports where id = '99999999-9999-4999-8999-999999999999';"
expect_denied "browser admin cannot execute verification mutation" authenticated 77777777-7777-4777-8777-777777777777 \
  "select public.admin_set_creator_verification('44444444-4444-4444-8444-444444444444','verified','forged');"
expect_value "tenant owner sees own organization" authenticated 55555555-5555-4555-8555-555555555555 1 \
  "select count(*) from public.industry_organizations;"
expect_value "tenant isolation hides other organization" authenticated 55555555-5555-4555-8555-555555555555 0 \
  "select count(*) from public.industry_organizations where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2';"
expect_value "tenant audit trail hides other organization" authenticated 55555555-5555-4555-8555-555555555555 0 \
  "select count(*) from public.industry_creator_table_mapping_audit where organization_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2';"
expect_denied "cross-tenant mapping mutation denied" authenticated 66666666-6666-4666-8666-666666666666 \
  "select public.pause_industry_creator_table_mapping('dddddddd-dddd-4ddd-8ddd-ddddddddddd1');"
expect_denied "cross-tenant destination assignment denied" authenticated 66666666-6666-4666-8666-666666666666 \
  "select public.assign_industry_creator_table_handoff('dddddddd-dddd-4ddd-8ddd-ddddddddddd1','cccccccc-cccc-4ccc-8ccc-ccccccccccc2');"
expect_denied "invalid non-HTTPS destination rejected" authenticated 55555555-5555-4555-8555-555555555555 \
  "insert into public.industry_handoff_destinations(organization_id,label,destination_url,created_by) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','Invalid','http://invalid.test','55555555-5555-4555-8555-555555555555');"
expect_value "unique approved handoff resolves" anon 00000000-0000-4000-8000-000000000000 \
  'Synthetic Operator One|https://operator-one.example.test/play' \
  "select destination_label || '|' || destination_url from public.resolve_licensed_operator_handoff('33333333-3333-4333-8333-333333333333','TABLE-ONE');"
expect_value "ambiguous handoff fails closed" anon 00000000-0000-4000-8000-000000000000 0 \
  "select count(*) from public.resolve_licensed_operator_handoff('33333333-3333-4333-8333-333333333333','TABLE-SHARED');"
expect_value "session-bound approved handoff resolves" anon 00000000-0000-4000-8000-000000000000 \
  'Synthetic Operator One|https://operator-one.example.test/play' \
  "select destination_label || '|' || destination_url from public.resolve_live_session_operator_handoff('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1');"
expect_denied "browser cannot forge server handoff intent" authenticated 11111111-1111-4111-8111-111111111111 \
  "insert into public.product_events(user_id,event_name,event_key,journey_id,creator_id,creator_session_id,metadata) values ('11111111-1111-4111-8111-111111111111','handoff_intent','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1','ffffffff-ffff-4fff-8fff-fffffffffff1','33333333-3333-4333-8333-333333333333','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','{\"action\":\"outbound_navigation\"}');"
expect_denied "event metadata injection rejected" authenticated 11111111-1111-4111-8111-111111111111 \
  "insert into public.product_events(user_id,event_name,event_key,journey_id,metadata) values ('11111111-1111-4111-8111-111111111111','product_open','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2','ffffffff-ffff-4fff-8fff-fffffffffff2','{\"email\":\"secret@example.test\"}');"
expect_value "avatar bucket contract restored" anon 00000000-0000-4000-8000-000000000000 \
  'true|5242880|image/png,image/jpeg,image/webp' \
  "select public::text || '|' || file_size_limit::text || '|' || array_to_string(allowed_mime_types, ',') from storage.buckets where id = 'avatars';"
as_actor_commit authenticated 11111111-1111-4111-8111-111111111111 \
  "insert into storage.objects(bucket_id,name,owner_id) values ('avatars','11111111-1111-4111-8111-111111111111/avatar.png','11111111-1111-4111-8111-111111111111');" >/dev/null
pass_count=$((pass_count + 1))
printf 'PASS avatar owner upload path\n'
expect_denied "avatar cross-user upload path rejected" authenticated 11111111-1111-4111-8111-111111111111 \
  "insert into storage.objects(bucket_id,name,owner_id) values ('avatars','22222222-2222-4222-8222-222222222222/forged.png','11111111-1111-4111-8111-111111111111');"

as_actor_commit authenticated 22222222-2222-4222-8222-222222222222 \
  "insert into public.product_events(user_id,event_name,event_key,journey_id,metadata) select '22222222-2222-4222-8222-222222222222','product_open',gen_random_uuid(),gen_random_uuid(),'{}'::jsonb from generate_series(1,120);" >/dev/null
pass_count=$((pass_count + 1))
printf 'PASS product event rate limit permits first 120 events\n'
expect_denied "product event rate limit rejects event 121" authenticated 22222222-2222-4222-8222-222222222222 \
  "insert into public.product_events(user_id,event_name,event_key,journey_id,metadata) values ('22222222-2222-4222-8222-222222222222','product_open',gen_random_uuid(),gen_random_uuid(),'{}');"

as_actor_commit service_role 00000000-0000-4000-8000-000000000000 \
  "insert into public.product_events(user_id,event_name,event_key,journey_id,creator_id,creator_session_id,attribution_confidence,metadata) values ('11111111-1111-4111-8111-111111111111','handoff_intent','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee3','ffffffff-ffff-4fff-8fff-fffffffffff3','33333333-3333-4333-8333-333333333333','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','direct','{\"action\":\"outbound_navigation\"}');" >/dev/null
return_count="$(as_actor_commit authenticated 11111111-1111-4111-8111-111111111111 \
  "insert into public.product_events(user_id,event_name,event_key,journey_id,creator_id,creator_session_id,metadata) values ('11111111-1111-4111-8111-111111111111','handoff_return','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee4','ffffffff-ffff-4fff-8fff-fffffffffff3','33333333-3333-4333-8333-333333333333','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','{}'); select count(*) from public.product_events where event_name = 'handoff_return' and journey_id = 'ffffffff-ffff-4fff-8fff-fffffffffff3';")"
if [[ "$return_count" != "1" ]]; then
  printf 'FAIL attributable return persists once: got %s\n' "$return_count" >&2
  exit 1
fi
pass_count=$((pass_count + 1))
printf 'PASS attributable return persists once\n'
expect_denied "duplicate return replay rejected" authenticated 11111111-1111-4111-8111-111111111111 \
  "insert into public.product_events(user_id,event_name,event_key,journey_id,creator_id,creator_session_id,metadata) values ('11111111-1111-4111-8111-111111111111','handoff_return','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee5','ffffffff-ffff-4fff-8fff-fffffffffff3','33333333-3333-4333-8333-333333333333','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','{}');"
expect_denied "return without prior intent rejected" authenticated 22222222-2222-4222-8222-222222222222 \
  "insert into public.product_events(user_id,event_name,event_key,journey_id,creator_id,creator_session_id,metadata) values ('22222222-2222-4222-8222-222222222222','handoff_return','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee6','ffffffff-ffff-4fff-8fff-fffffffffff4','33333333-3333-4333-8333-333333333333','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','{}');"

as_service_role_commit \
  "select public.admin_set_profile_account_status('22222222-2222-4222-8222-222222222222','suspended');" >/dev/null
expect_value "suspended player can read own account status" authenticated 22222222-2222-4222-8222-222222222222 suspended \
  "select public.get_own_profile()->>'account_status';"
expect_denied "suspended player cannot create post" authenticated 22222222-2222-4222-8222-222222222222 \
  "insert into public.posts(author_id,body) values ('22222222-2222-4222-8222-222222222222','blocked');"
expect_denied "suspended player cannot create report" authenticated 22222222-2222-4222-8222-222222222222 \
  "insert into public.reports(reporter_id,target_type,target_id,reason) values ('22222222-2222-4222-8222-222222222222','profile','11111111-1111-4111-8111-111111111111','other');"
expect_denied "suspended player cannot upload avatar" authenticated 22222222-2222-4222-8222-222222222222 \
  "insert into storage.objects(bucket_id,name,owner_id) values ('avatars','22222222-2222-4222-8222-222222222222/suspended.png','22222222-2222-4222-8222-222222222222');"
expect_denied "suspended player cannot create product event" authenticated 22222222-2222-4222-8222-222222222222 \
  "insert into public.product_events(user_id,event_name,event_key,journey_id,metadata) values ('22222222-2222-4222-8222-222222222222','product_open',gen_random_uuid(),gen_random_uuid(),'{}');"

as_service_role_commit \
  "select public.admin_set_profile_account_status('77777777-7777-4777-8777-777777777777','suspended');" >/dev/null
expect_value "suspended admin loses moderator capability" authenticated 77777777-7777-4777-8777-777777777777 f \
  "select public.is_moderator();"
expect_value "suspended admin cannot read moderation queue" authenticated 77777777-7777-4777-8777-777777777777 0 \
  "select count(*) from public.reports where id = '99999999-9999-4999-8999-999999999999';"
expect_value "suspended admin cannot update moderation queue" authenticated 77777777-7777-4777-8777-777777777777 0 \
  "with changed as (update public.reports set status = 'actioned' where id = '99999999-9999-4999-8999-999999999999' returning 1) select count(*) from changed;"

printf 'DB SECURITY MATRIX: %s PASS\n' "$pass_count"
