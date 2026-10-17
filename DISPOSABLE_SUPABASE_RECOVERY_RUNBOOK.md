# LC App disposable Supabase migration and recovery rehearsal

Project: LC App | Version: v0.1 | Status: Prepared, NOT EXECUTED | Updated: 2026-10-10
Owner: Narek / release engineer | Audience: authorised Supabase administrator and QA
Sources: `STAGING_MIGRATION_EXECUTION_PLAN.md` (immutable manifest), `STAGING_READINESS_REPORT.md` (accepted external baseline), migrations 001–060.
Assumptions: A separate empty disposable project and target-specific authorization will be supplied; no credentials are stored here.
Open questions: 052–054 provenance; full hosted role matrix, integrations, browser evidence and populated-data restore.

## Boundary and prerequisites

No execution is authorised by this runbook. Staging `dnpizrjuxkcnmdgmvnks` and protected production `aspbwgsfkebduvviyeuo` are forbidden targets for the migration runner. Obtain separate authorization for project creation, experimental application of the 57 present files despite unresolved 052–054, synthetic Auth/Storage fixtures and project recreation. Record owner, exact refs, commit, manifest hashes and recovery acceptance before starting. Do not use production credentials, destinations, SMTP, webhooks or deployment linkage.

The externally verified empty staging baseline is PASS as of October 10, 2026, source ChatGPT connected Supabase; its raw connector output is not stored locally. This rehearsal uses another project. Empty staging has no recorded migration ledger: inspect `to_regclass` before querying history. Recovering absent source SQL remains a separate gate.

## Apply the present experimental chain

1. In the authorised Supabase dashboard create an empty disposable project A; record ref, region, PostgreSQL version and direct database hostname. Capture empty public/Auth/Storage counts, Edge Functions, advisor results and integration configuration. Default platform functions/extensions must be inspected: the runner deliberately rejects public functions as well as tables/views/policies; review any unexpected baseline instead of bypassing the guard.
2. Supply secrets only through the secret manager/runtime environment. Set the direct TLS CA with `PGSSLROOTCERT` if required. CLI help inspection in this local session failed at sandboxed `/Users/macbook/.supabase` directory creation, so this runbook uses explicit `psql`, not guessed CLI commands.
3. With separate authorization, set these non-secret variables and run from this checkout:

```bash
export LC_TEST_PROJECT_REF="$APPROVED_DISPOSABLE_REF"
export LC_DISPOSABLE_DATABASE_HOST="db.${LC_TEST_PROJECT_REF}.supabase.co"
export LC_DISPOSABLE_REHEARSAL_APPROVAL="$LC_TEST_PROJECT_REF"
export LC_PRESENT_CHAIN_APPROVAL="$LC_TEST_PROJECT_REF"
# PGPASSWORD and PGSSLROOTCERT supplied privately at runtime.
./tools/disposable-migration.sh
```

The script verifies all 57 hashes, refuses both named projects, checks an empty application baseline, applies SQL in immutable order with stop-on-error, and writes a restricted receipt under `/private/tmp`. No platform shim is applied. Direct SQL deliberately leaves Supabase migration history unmanaged; `applied.tsv` records only successfully completed files. This is an experimental chain rehearsal, not a ledger-managed staging deployment. Do not run subsequent CLI db push/pull/repair against this disposable chain. Before staging, select and review a ledger-managed workflow separately.

Files containing BEGIN/COMMIT manage their own transactions; an error can leave earlier files or statements committed. Stop on failure, retain private logs, inspect the failed file and recreate the disposable target. Do not retry the whole chain against a partial database or manually mark versions applied.

4. Inspect hosted schema, RLS/grants/functions and avatar configuration against `STAGING_MIGRATION_EXECUTION_PLAN.md`. Review `tests/db/schema-security-audit.sql` before running it against hosted platform catalogs; do not run the synthetic SQL security matrix blindly because it seeds fixed fixtures. Capture advisor and Postgres/Auth/Storage logs.

## Hosted API smoke — prepared, not run

Use Python 3 standard library; no new dependency. Provide `LC_TEST_ANON_KEY` (legacy anon JWT for these direct REST calls) and `LC_TEST_SERVICE_KEY` (server-side service-role JWT) privately. The exact ref derives the only permitted API origin; redirects are refused. Never inject privileged keys into the browser. Run only after migration and fixture authorization:

```bash
export LC_HOSTED_WRITE_APPROVAL="$LC_TEST_PROJECT_REF"
export LC_SYNTHETIC_FIXTURE_APPROVAL="$LC_TEST_PROJECT_REF"
./tools/hosted-e2e.py
```

The script creates two unique synthetic confirmed users, signs in, checks Auth identity and owner RPC, private-column denial, positive report creation and cross-user denial, owner avatar upload/update/public retrieval, foreign-folder and foreign-user denial, suspension enforcement, refresh and logout refresh revocation. Synthetic fixture creation bypasses email delivery; signup/verification/reset/mail delivery remain untested. Tokens stay in memory and responses are redacted. There are no mutation retries. Cleanup deletes only generated object paths and user IDs; cascade deletion is not proof that every dependent audit record is gone. Inspect residual rows, sessions and buckets after any failure, including ambiguous timeout during fixture creation. Public avatars are intentionally readable; mutation ownership is the tested boundary. Logout does not imply immediate invalidation of every issued access JWT.

To run this smoke later on nominated staging additionally require `LC_STAGING_E2E_APPROVAL` equal to its ref and separate staging approval. This session does not authorise that.

A smoke PASS is insufficient for release. Execute the remaining acceptance matrix using reviewed fixtures: approved/unapproved Creator publication, Operator A/B tenancy and membership/owner lifecycle, active/suspended Admin moderation, notification integrity, product-event metadata/rate limit, approved HTTPS handoff, ambiguous destination rejection, attribution and return replay/idempotency. Check integrations, email, Realtime and logs. Run authenticated Chrome and WebKit through player/creator/operator/admin journeys with fresh sessions, mobile/desktop, back/reload, callback/session expiry, offline recovery and avatar UI. Never send live partner traffic.

API references: [Supabase Auth admin createUser](https://supabase.com/docs/reference/javascript/auth-admin-createuser), [Storage upload](https://supabase.com/docs/reference/javascript/storage-from-upload). Changelog markdown fetch was unavailable in this session; no dependency or schema/API capability change is claimed.

## Recovery rehearsal and acceptance

1. Before apply, retain private schema/configuration snapshots, counts and approved fixture definitions; record RPO = empty application baseline for this disposable-only experiment. Secrets remain outside evidence. Set an owner-approved RTO target before testing; record actual elapsed time.
2. After success or an application failure, stop all test clients and writes. Retain receipts and redacted logs. Leave project A intact for diagnosis; create separately authorised empty project B with a different ref. No drop/reset/delete of A is needed for rehearsal.
3. Prove B's empty baseline and integration isolation. Point only the rehearsal environment to B, repeat the same commit/hash-pinned migration runner and API smoke, and compare schema/policies/grants, avatar limits, behaviour and logs. Record new ref and measured elapsed rebuild time. Verify no client still targets A.
4. Accept disposable rebuild only if B baseline, all 57 receipt hashes, hosted schema/security checks, selected API behaviour and configured RTO pass; full acceptance still needs the remaining matrix and browser evidence. Record failures and leave readiness NO.
5. Project recreation demonstrates recovery of schema/known synthetic fixtures from zero. It does **not** prove recovery of populated Auth identities, sessions, Storage bytes, tenant data or user-generated content. A separate provider-supported backup/restore rehearsal must capture and verify those, object checksums, configuration, RPO/RTO and application behaviour before staged release readiness.
6. Do not reverse migration 012 by automatically republishing unverified creator profiles/sessions. For any future populated staging migration, snapshot affected publication states and restore only through a reviewed decision. Prefer reviewed forward repair after commit.
7. Cleanup/revoke disposable credentials and archive redacted evidence only after separate operator authorization; never restore or copy disposable/staging data into production.

## Evidence disposition

Keep raw dumps, receipts and tokens out of Git; private logs may include database details. `STAGING_HANDOFF.zip` is pre-existing, untracked and historical; it was not rebuilt and is not the authority for these changes. Record commit, counts, timings and redacted PASS/FAIL summaries in the canonical readiness/state files after authorised execution. All hosted E2E, migration and recovery procedures in this document are currently NOT RUN.
