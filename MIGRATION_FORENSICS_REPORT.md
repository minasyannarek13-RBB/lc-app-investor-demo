# LC App Migration Forensics Report

- Project: LC App
- Version: v1.0
- Status: Local forensic audit complete; hosted staging evidence pending
- Date: 2026-10-09
- Branch: `codex/lc-app-p1-stabilization`
- Starting checkpoint: `433b6f9378f0402866d81391507a8a9324808a86`
- Production Supabase: `aspbwgsfkebduvviyeuo` — protected, not accessed
- Staging Supabase: `dnpizrjuxkcnmdgmvnks` — read-only identity checks only

> Historical 2026-10-09 forensic snapshot. Current hosted empty baseline/access findings supersede its pending-access statements: see `STAGING_READINESS_REPORT.md` v0.7. Source gaps remain unresolved; original forensic evidence is preserved.

## Result

**STAGING MIGRATION READY: NO. PRODUCTION READY: NO.** The 57-file local chain applies from empty PostgreSQL 17 and passes the security matrix. Hosted staging isolation, schema baseline, migration history, Auth/Storage state and recovery rehearsal are not independently verified. No hosted migration was executed.

## Repository and history findings

- Starting branch/HEAD matched the request and the worktree was clean.
- Available histories inspected: current branch, `codex/final-product-build`, `codex/lc-content-alignment-safe`, `rc/session-handoff-binding`, all reflogs, reachable migration history and three unreachable blobs.
- Historical branches contain migrations `007–051` and `055`; current branch adds `001–006` and `056–060`.
- Migration filenames and versions are unique. Lexical filename order equals intended version order.
- No file, rename, squash marker, commit, reflog entry or unreachable blob supplies migrations `052–054`.
- The numbering gap is executable on an empty database, but remains a hosted drift blocker until `supabase_migrations.schema_migrations` is read from staging.

## Provenance conclusions

### 001–006

Classified **VERIFIED ORIGINAL***: recovered byte-for-byte from the authoritative local LC App package during commit `78132f3`; SHA-256 values are pinned by `tests/foundation-recovery-integrity.test.mjs`. The asterisk records a limitation: the source package is not retained as a second copy in this repository, so Git proves integrity since recovery, not its pre-recovery origin.

### 052–054

Classified **MISSING**. There is no evidence that these numbers were intentionally empty, and no SQL was invented. They are non-blocking for clean lexical execution but blocking for hosted migration-history reconciliation.

### 057

Classified **VERIFIED RECONSTRUCTION**. Statements are supported by migration 001's documented live-foundation contract, existing frontend calls (`get_own_profile`, profile updates), downstream RLS dependencies and clean-room tests. It reconstructs the Auth trigger, profile/settings policies, column grants and owner-profile RPC. Hosted compatibility remains unverified.

### 058

Classified **VERIFIED RECONSTRUCTION**. The `avatars` bucket, public read, UUID-owner path, 5 MB limit and PNG/JPEG/WebP set are independently reflected in migration 001 and `auth.js`. Clean-room Storage-policy tests pass. Hosted bucket/object compatibility remains unverified.

### 059–060

Classified **VERIFIED ORIGINAL** local corrective migrations. Migration 059 restores RLS compatibility after profile-column restrictions. Migration 060 fixes confirmed privilege and suspension gaps. Both apply after 057–058 and pass a second local application.

## Migration 060 compatibility

Migration 060 depends on `profiles`, `user_settings`, `reports`, `storage.objects`, `is_active_profile()` and `admin_set_profile_account_status()` created earlier. The full chain plus a replay of 057–060 succeeds. Schema audit confirms every public table has RLS, browser roles cannot create in `public`, sensitive profile columns remain excluded, privileged RPC ACLs are closed and `SECURITY DEFINER` functions have fixed search paths.

## Local validation evidence

| Command | Result |
|---|---|
| `node --test tests/*.test.mjs` | 117/117 PASS |
| `./tools/test-db.sh` | 57 migrations applied; schema audit PASS; 40/40 security matrix PASS |
| recovery replay in `tools/test-db.sh` | 057–060 reapplied successfully |
| `bash -n run-local.sh tools/test-db.sh` | PASS |
| root/nested `auth.js`, `app-product.js`, `sw.js` comparison | PASS |
| `git diff --check` | PASS before report generation |

The PostgreSQL shim validates SQL, RLS, grants, actors and negative paths. It does not reproduce hosted Supabase Auth, PostgREST, Storage API, Realtime, email or connection pooling. No reproducible Chrome/WebKit harness is committed in this checkout; prior browser results remain historical evidence and were not rerun here.

## Staging evidence and limits

- User-supplied metadata: project `dnpizrjuxkcnmdgmvnks`, name `lc-app-staging`, region `ap-southeast-2`, zero public tables, zero recorded migrations and zero Edge Functions.
- Independently verified without credentials: its Supabase hostname responds; base path `404`, Auth health `401`, REST `401`.
- Repository/deployment search found no reference to the staging ref. All checked application configuration still points to production ref `aspbwgsfkebduvviyeuo`.
- Not independently verified: project name/region, separate database host, Auth users, Storage buckets/objects, schemas, migration history, secrets, custom domains, webhooks or integrations.

## Blockers

1. Authorised read-only staging metadata/schema access is unavailable.
2. Staging isolation from production accounts, data and integrations is not proven.
3. Hosted migration history cannot resolve whether `052–054` ever existed remotely.
4. Hosted drift against reconstructed `057–058` is unknown.
5. Backup/restore rehearsal and hosted Auth/PostgREST/Storage/Chrome/WebKit security journeys have not run.
