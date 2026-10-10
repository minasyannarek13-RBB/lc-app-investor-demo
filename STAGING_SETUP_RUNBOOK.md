# LC App Isolated Staging Setup Runbook

- Project: LC App
- Version: v1.1
- Status: Preparation only; execution blocked by remaining gates
- Last updated: 2026-10-10
- Owner: Release engineer
- Audience: Supabase project administrator, QA
- Sources: migrations 001–060, `tools/test-db.sh`, `RELEASE_SECURITY_MATRIX.md`
- Assumptions: A separate disposable Supabase project will be supplied; secrets remain in the operator's secret manager
Open question: Execution authorization, 052–054 provenance, integration isolation and recovery.

Hosted baseline inspection PASS via ChatGPT connected Supabase, externally verified 2026-10-10 and relayed by Narek; local Codex did not perform hosted inspection. See `STAGING_READINESS_REPORT.md` for counts and `DISPOSABLE_SUPABASE_RECOVERY_RUNBOOK.md` for the prepared disposable rehearsal. The absent migration ledger is expected for the verified empty staging baseline.

## 1. Local preflight

Run from the repository root:

```bash
test "$(git branch --show-current)" = "codex/lc-app-p1-stabilization"
git status --short
git rev-parse HEAD
node --test tests/*.test.mjs
bash -n run-local.sh tools/test-db.sh
./tools/test-db.sh
cmp -s auth.js LC_App_GitHub_Pages_Upload/auth.js
cmp -s app-product.js LC_App_GitHub_Pages_Upload/app-product.js
cmp -s sw.js LC_App_GitHub_Pages_Upload/sw.js
git diff --check
```

Acceptance: clean starting tree; all Node tests pass; schema audit passes; DB matrix passes; all `cmp` and syntax checks exit 0.

## 2. Prove project isolation

The authorised operator supplies `STAGING_PROJECT_REF` and `STAGING_DATABASE_URL` at runtime. Never write either value to this repository, shell history, screenshots or reports.

```bash
psql "$STAGING_DATABASE_URL" -X -v ON_ERROR_STOP=1 -Atc \
  "select current_database(), current_user, inet_server_addr(), version();"
psql "$STAGING_DATABASE_URL" -X -v ON_ERROR_STOP=1 -Atc \
  "select count(*) from auth.users;"
```

Record redacted output in the release evidence directory. Stop if the project ref, database host, user count, custom domains, webhooks or integrations resemble production. Staging must have separate Auth users, Storage objects, email configuration and partner destinations. Use synthetic `example.test` destinations only until an approved staging destination exists.

## 3. Capture authoritative baseline and drift

```bash
evidence_dir="/private/tmp/lc-staging-evidence-$(date +%Y%m%dT%H%M%S)"
mkdir -p "$evidence_dir"
pg_dump "$STAGING_DATABASE_URL" --schema-only --no-owner --no-privileges \
  > "$evidence_dir/pre-schema.sql"
pg_dump "$STAGING_DATABASE_URL" --format=custom --no-owner \
  > "$evidence_dir/pre-apply.dump"
ledger_exists="$(psql "$STAGING_DATABASE_URL" -X -v ON_ERROR_STOP=1 -Atc \
  "select to_regclass('supabase_migrations.schema_migrations') is not null;")"
if [ "$ledger_exists" = t ]; then
  psql "$STAGING_DATABASE_URL" -X -v ON_ERROR_STOP=1 -P pager=off -c \
    "select version,name,statements from supabase_migrations.schema_migrations order by version;" \
    > "$evidence_dir/pre-migration-history.txt"
else
  printf 'Ledger absent; zero recorded migrations (empty baseline).\n' \
    > "$evidence_dir/pre-migration-history.txt"
fi
psql "$STAGING_DATABASE_URL" -X -v ON_ERROR_STOP=1 -P pager=off -c \
  "select verification_status,profile_status,count(*) from public.creator_profiles group by 1,2 order by 1,2;" \
  > "$evidence_dir/pre-creator-state.txt" 2>&1 || true
psql "$STAGING_DATABASE_URL" -X -v ON_ERROR_STOP=1 -P pager=off -c \
  "select provenance,visibility,status,count(*) from public.creator_sessions group by 1,2,3 order by 1,2,3;" \
  > "$evidence_dir/pre-session-state.txt" 2>&1 || true
```

Compare `pre-schema.sql` with migrations 001–060. Stop for manual review when an object exists with a different definition, when a migration version exists remotely but not locally, or when local 052–054 gaps appear in remote history.

## 4. Dry-run on a disposable shadow database

Use a fresh local PostgreSQL 17 instance:

```bash
./tools/test-db.sh
```

For a staging-shaped rehearsal, restore the captured schema into a disposable database and apply only versions absent from `pre-migration-history.txt`. Each missing file must be executed with `psql -X -v ON_ERROR_STOP=1 -f`. Do not mark or repair migration history to bypass a mismatch. Review migrations 001–006 and 057–060 object-by-object before hosted execution.

If the authorised Supabase CLI environment is available:

```bash
supabase link --project-ref "$STAGING_PROJECT_REF"
supabase migration list --linked
supabase db push --linked --dry-run
```

These are deferred operator commands; discover supported CLI flags with `--help` before execution. Do not use `--include-all` or ledger repair without a separately reviewed version comparison. A 052–054 provenance decision and rehearsal evidence are required before apply.

Acceptance: project identity is staging; migration history is understood; dry-run contains no unreviewed drop, truncate, ownership transfer or production destination.

## 5. Apply to isolated staging

```bash
supabase db push --linked
supabase migration list --linked
pg_dump "$STAGING_DATABASE_URL" --schema-only --no-owner --no-privileges \
  > "$evidence_dir/post-schema.sql"
psql "$STAGING_DATABASE_URL" -X -v ON_ERROR_STOP=1 \
  -f tests/db/schema-security-audit.sql
```

Do not apply if the dry-run differs from the reviewed plan. Do not run this step against production. Keep the full CLI output and redacted schema diff.

## 6. Seed synthetic identities

Create unique staging-only accounts through Supabase Auth:

- Player A and Player B;
- verified Creator and unverified Creator;
- Operator A owner and Operator B owner in separate organisations;
- moderator/admin account;
- one suspended Player and one suspended moderator.

Administrative state changes must use the protected server/admin path. Never place a service-role key in browser code. Use only synthetic profiles, emails and `example.test` handoff URLs.

## 7. Hosted security and journey execution

Execute every row marked `STAGING REQUIRED` in `RELEASE_SECURITY_MATRIX.md` through public Auth/PostgREST/Storage APIs. Run Chrome and WebKit with fresh contexts. Capture request status, relevant redacted response, database verification query and browser console errors.

Acceptance:

- Player cannot mutate another user or manufacture notifications/attribution.
- Unverified Creator cannot publish profile/session; verified Creator can complete the intended lifecycle.
- Operator A cannot read or mutate Operator B organisation, mappings, audit, support or handoff data.
- Suspended accounts lose mutation and moderation capabilities immediately with an existing token.
- Handoff resolves only one approved HTTPS destination; ambiguity fails closed; return is attributable and idempotent.
- Avatar Storage enforces size, MIME, owner folder and active-account status.
- Auth signup, verification, login, reset, logout and session recovery pass in Chrome and WebKit.

## 8. Observability gate

During the test window collect:

- Supabase Postgres logs: policy, constraint, trigger and function errors;
- Auth logs: signup, verification, login, reset, refresh and rate-limit failures;
- Storage logs: rejected MIME, size and cross-folder requests;
- browser console/page errors and failed requests;
- counts of `handoff_intent`, `handoff_return`, duplicate rejection and ambiguous resolver results.

Acceptance: zero unexplained 5xx, zero cross-tenant disclosure, zero browser secret, zero unexpected function permission error, and all expected negative tests fail with controlled 4xx/Postgres denial.

## 9. Recovery and rollback

First execute the separately authorised hosted rebuild in `DISPOSABLE_SUPABASE_RECOVERY_RUNBOOK.md`. The local commands below are supplementary database-only restore checks and cannot establish hosted Auth/Storage/configuration recovery. Confirm the local database connection and a collision-free disposable database name before any execution; the example name must not identify an existing database.

Before apply, confirm `pre-apply.dump` restores into that local disposable database:

```bash
createdb lc_app_restore_rehearsal
pg_restore --dbname=lc_app_restore_rehearsal --no-owner --exit-on-error \
  "$evidence_dir/pre-apply.dump"
dropdb lc_app_restore_rehearsal
```

If migration application fails before completion, preserve logs and restore/recreate the isolated staging project from the pre-apply backup. If application succeeds but validation fails, stop all staging traffic and prefer a reviewed forward repair. Restore only in isolated staging after confirming frontend/schema compatibility. Never reopen rows made private by migration 012 without explicit review.

## 10. Exit criteria

Update `STAGING_READINESS_REPORT.md` to YES only after the complete hosted matrix, observability gate and recovery rehearsal pass. Production remains NO until a separate approval, production drift review, deployment plan and rollback authority exist.
