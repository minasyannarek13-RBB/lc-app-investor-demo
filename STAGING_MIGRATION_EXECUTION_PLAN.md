# LC App Staging Migration Execution Plan

- Project: LC App
- Version: v1.5
- Status: Reviewable plan; execution not authorised
- Date: 2026-10-10
- Target ref: `dnpizrjuxkcnmdgmvnks`
- Protected production ref: `aspbwgsfkebduvviyeuo`

## Authorization boundary

This plan contains no authority to apply SQL. All hosted actions in this task stop at read-only inspection. Never link a writable CLI session until project identity, host and isolation evidence have been reviewed.

## Hosted baseline and remaining preconditions

**HOSTED BASELINE INSPECTION: PASS**, source **ChatGPT connected Supabase**, externally verified 2026-10-10 and relayed by Narek. A separate current Codex read-only connector refresh also passes; see `STAGING_READINESS_REPORT.md` and its receipt. Canonical counts: `STAGING_READINESS_REPORT.md`, Hosted baseline section (PostgreSQL 17.11, all listed application counts zero, migration ledger absent). Production `aspbwgsfkebduvviyeuo` remains protected.

1. Refresh the accepted baseline before apply and verify credential/database host mapping to the approved target.
2. Read `to_regclass('supabase_migrations.schema_migrations')` first. An absent ledger is expected for this empty baseline; query rows only if it exists. Inspect roles/grants, platform policies, custom domains, SMTP, webhooks, integrations and deployment configuration separately.
3. Require no production destinations, shared credentials or deployment configuration. Empty tables/users/buckets do not prove this.
4. Source provenance 052–054 remains unresolved despite zero staging migration records. Recover authoritative SQL or obtain an explicitly recorded decision approving only the present experimental chain in a disposable project. No gap repair or placeholder SQL.
5. Review the present 57-file chain and reconstructed 057–058 against the baseline. Existing application-object conflicts block apply.
6. Rehearse migration/recreation recovery in a separately authorised disposable project using `DISPOSABLE_SUPABASE_RECOVERY_RUNBOOK.md`. This does not establish restoration of populated staging data.
7. Obtain separate target-specific execution authorization. No hosted actions are authorised by preparing these files.

## Configuration and environment preflight — current checkpoint

Staging activation is disabled by `STAGING_ACTIVATION_APPROVED=false` in both Auth copies. Explicit staging mode fails before client creation, including the unchanged inline production configuration. After separate activation approval, replace that inline config only in an isolated staging entry with `ENVIRONMENT=staging`, exact staging URL and explicit staging legacy anon JWT. No production fallback or localStorage credential is accepted on the staging path. Opaque publishable and service keys are rejected. `.env.example` is a blank preparatory template, not an active environment. Keep production configuration unchanged. Hosted Auth redirect/provider/SMTP/hooks/integration review and recovery gates remain mandatory.

| Purpose | Minimum inputs; values remain private where applicable |
|---|---|
| Static browser runtime | `SUPABASE_URL` = staging URL; `ENVIRONMENT` = staging; `SUPABASE_ANON_KEY` = staging legacy public anon JWT (ref/role/expiry validated; signature validity requires hosted verification after authorization). Opaque publishable keys are not supported by the staging guard. Provide through the reviewed `LC_APP_CONFIG` mechanism; this repository does not automatically consume dotenv. Never include service keys. |
| Authorised migration connection | Verified project ref and direct database host; runtime-only `PGPASSWORD` and verified TLS. Use staging-specific credentials; no production fallback, ambient service files or shared secrets. |
| Hosted synthetic E2E, after separate authorization | `LC_TEST_PROJECT_REF`, `LC_TEST_ANON_KEY`, `LC_TEST_SERVICE_KEY`; target-specific `LC_HOSTED_WRITE_APPROVAL`, `LC_SYNTHETIC_FIXTURE_APPROVAL`, and staging-only `LC_STAGING_E2E_APPROVAL`. Service credential is server/test-runner only. |
| Separate disposable rehearsal | `LC_TEST_PROJECT_REF`, `LC_DISPOSABLE_DATABASE_HOST`, `PGPASSWORD`, `LC_DISPOSABLE_REHEARSAL_APPROVAL`, `LC_PRESENT_CHAIN_APPROVAL`; existing runner rejects both staging and production refs. |

Ordered release sequence: (1) obtain read-only Auth/redirect/integration settings evidence; (2) resolve 052–054 source or approve only a present-chain experiment on a separately authorised disposable target; (3) prepare/review isolated staging config, no production destinations or shared secrets; (4) pin the 57-file manifest below (current checksum comparison: zero mismatches); (5) obtain and rehearse an explicit recovery point before writes; (6) fresh baseline and reviewed dry-run/version comparison; (7) target-specific authorization, then ledger-managed staging apply in exact manifest order 001–051, 055–060; (8) post-catalog/security/history checks; (9) hosted role/tenant/Auth/Storage/browser/integration acceptance. None of steps involving remote changes was executed.

Rollback is a recovery plan, not an invented down-migration chain. Each failed transaction rolls back its uncommitted statements; earlier committed migrations can remain. Stop immediately, capture redacted logs and compare applied versions. Before traffic prefer a reviewed forward repair. Rebuild a disposable target from its verified empty baseline for experiments; populated staging requires a proven backup/restore point covering database, Auth and Storage/config separately. Do not assume a database-only backup restores object binaries or Auth/provider settings. No restore/recreate, ledger repair, destructive reset or automated Creator publication reversal is authorised.

## Focused migration gate audit — checkpoint ce40223

This is a local source/dependency review, not another hosted audit or SQL execution. Accepted empty staging baseline remains the pre-apply source; refresh it only immediately before separately authorised execution. All 57 manifest files remain unchanged.

| Migration | Provenance / dependencies | Mutation and rollback risk | Gate |
|---|---|---|---|
| 052–054 | No files or reachable migration-history entries found; current forensic follow-up checked 18 reflog trees, three unreachable blobs, local package files and 12 ZIP archives without an original. Neither empty staging nor executable lexical ordering proves intentional omission. | Unknown operations cannot have a valid reverse migration invented. Later 055 depends on existing follows/reminders/product events; successful local execution does not establish historical intent. | BLOCKED: recover authoritative source, or record an explicit scoped provenance decision. Existing permission for a disposable experiment is not permission for staging execution. |
| 057 | Verified local reconstruction: documented foundation in 001, frontend `get_own_profile`/profile updates, prior clean-room evidence. Requires `profiles`/`user_settings` (001), active-profile helper (008), auth.users/auth.uid and anon/authenticated roles. Profile update field guards from 007/011 remain relevant. | CREATE OR REPLACE functions and DROP/CREATE Auth trigger/policies replace same-name objects; column grants alter access. Trigger applies only to future Auth inserts; no backfill of existing identities. Rollback must restore captured definitions/ACLs, never drop shared foundation tables or expose private columns. | Empty accepted staging has no custom Auth-user trigger/application objects, reducing known name conflicts; platform privileges/helpers must be checked before apply. No signup/test-user creation until the complete reviewed chain is applied. |
| 058 | Verified local reconstruction: 001 avatar notes plus auth.js 5 MB PNG/JPEG/WebP upload and owner-path logic. Requires storage.buckets/storage.objects/storage.foldername, auth.uid, browser roles and hosted Storage RLS platform contract. | Upsert overwrites an existing avatars bucket's public flag/limits; DROP/CREATE policies replace same-name policies. Public avatars are intentional, not private customer documents. SQL rollback does not restore deleted object bytes; no blanket bucket/object removal is prepared. | Capture bucket/policy definitions and object state; accepted baseline currently empty. Validate real Storage API ownership/MIME/size after separate fixture approval. |
| 059–060 after reconstruction | 059 depends on earlier posts/comments/likes and tenant mapping/audit objects/helpers; 060 depends on 001/008/011/reports plus 058 storage policies. | 059 restores private-column-compatible RLS; 060 restricts ACL/schema CREATE and adds suspension checks. Reversing only 057/058 after these changes can leave incompatible grants/policies or remove suspension protection. | Review final state as the whole chain; do not stop at 058 or roll back a reconstruction in isolation. |

Staging-only execution order remains **001–051 → 055 → 056 → 057 → 058 → 059 → 060**, exact paths/hashes in the existing manifest. Missing numbers stay absent. Before apply: resolve provenance decision, verify Auth/Storage platform dependencies and configuration isolation, capture a recovery point, select a ledger-managed workflow, compare remote versions and obtain target-specific authorization. No `migration repair`, placeholder gap files, production linking or test traffic.

On failure stop at the first error and record exactly which versions committed. Transactional 057/058 must roll back their own uncommitted work; earlier migrations or non-transaction-wrapped statements may remain committed depending on the reviewed runner. Do not assume a whole-chain rollback. Prefer reviewed forward repair; restore/rebuild only the authorised staging/disposable target using the rehearsed recovery method. Keep Auth/user creation closed to the test workflow until final schema/ACL verification completes.

### Prepared static runtime mapping — not installed

The environment template is an input contract, not a loader. In the isolated staging copy, the production inline config must be replaced before auth.js executes; adding a later script or changing dotenv alone is insufficient. Review a fail-closed mapping equivalent to:

```javascript
window.LC_APP_CONFIG = {
  SUPABASE_URL: "https://dnpizrjuxkcnmdgmvnks.supabase.co",
  ENVIRONMENT: "staging",
  SUPABASE_ANON_KEY: "" // staging public anon JWT supplied privately
};
```

Require exact staging origin and a nonempty staging-bound browser credential before enabling the authenticated product. Do not fall through to Auth's production default or persisted `lc-app:supabase-url` / `lc-app:supabase-anon-key` from another profile. Use fresh staging browser storage; do not copy production sessions. Server/test credentials remain separate runtime-only inputs already listed above. No mapping, credential or localStorage modification was performed here.

### Manual Supabase Dashboard evidence required

All reviews below target **dnpizrjuxkcnmdgmvnks** only. Record non-secret settings/screenshots and reviewer/date; redact credential values. Dashboard sign-in is needed because the available connector did not expose these configuration fields.

| Settings | Required acceptance evidence |
|---|---|
| Auth URL Configuration | Exact staging Site URL and permitted callback origins/paths; localhost only if approved for full-product testing. Signup/resend callback derives current page URL; reset uses `#/reset-password`. Verify return route, recovery session and disallowed redirect behavior. No production callback or broad wildcard accepted without review. |
| Auth signup/email/session | Email confirmation, signup access, password/reset settings, session/refresh behavior, rate limits and test-user lifecycle. Zero users is not configuration evidence. |
| OAuth providers | Enabled providers, staging callback/project identity, separate client registrations and test accounts. Review secret presence/separation without exposing values; production identity scopes/callbacks must not be reused for tests. |
| SMTP/email templates | Staging-controlled sender and test recipient routing, confirmation/reset template destination, delivery/rate limits; no production mailing credentials or real-user emails. |
| Auth hooks | Enabled hook names, endpoint origins and signing-secret separation; verify no production webhook or side effect destination. Disabled hooks also need recorded evidence. |
| Integrations/platform | Webhooks, custom domains, external operator destinations, project secrets, Realtime/Data API exposure, logging and backup controls. Verify staging-owned destinations and synthetic-only traffic. Empty public tables/Edge Functions do not prove these settings are isolated. |

Prepared hosted test scenarios and fixture acceptance are canonical in `RELEASE_SECURITY_MATRIX.md`, staging scenario section. They are NOT RUN.

## Ordered immutable manifest

| Order | SQL file | SHA-256 |
|---:|---|---|
| 001 | `supabase/migrations/202608080001_auth_profiles_storage.sql` | `77e6bb38e1c60aa6f478564cfa5ac422562cba2b01ee2205dc9556a82309e913` |
| 002 | `supabase/migrations/202608080002_profiles_role_and_moderation_helper.sql` | `aa356b306ace1fd96bc1886c7f6bb53dc48c0c319cf0058015038b8978919b6f` |
| 003 | `supabase/migrations/202608080003_social_graph.sql` | `17bbb3e4e67818c265e87ba97842231cf209170f1d7f11fb4304185cbacbe8e1` |
| 004 | `supabase/migrations/202608080004_posts_engagement.sql` | `a0236c2437de9c362975722346831e25be6ad09823fc93141455d54bfe203d1c` |
| 005 | `supabase/migrations/202608080005_activity_notifications.sql` | `fac4816ac4fd24bf543dd9e69dbf47998640ad58948edd70b527292a27a8b8a0` |
| 006 | `supabase/migrations/202608080006_reports.sql` | `394b69364bd6046dd9ab96c93c5d30d40a73cf7e52aff98496b72b6056d3b273` |
| 007 | `supabase/migrations/202608080007_profiles_system_field_guard.sql` | `7040d0e6feb90048710473969051a07fb6d79be4546c929d36f360706363e84d` |
| 008 | `supabase/migrations/202608080008_product_personas_creator_industry.sql` | `9d76ebdc6020ea29befc578ac01cf754994b15baded3d2c3d33b374a17e5cc15` |
| 009 | `supabase/migrations/202608080009_creator_session_eligibility.sql` | `304799b5c543999a6ee88f90375dbbce930a4103f36840ad3384ee5bd409050e` |
| 010 | `supabase/migrations/202608080010_active_profile_mutation_gate.sql` | `59fd9dd4eee1f87b57b3b5038cb6fa2363aaf7ffaff03cb0709d5a230b7d3c11` |
| 011 | `supabase/migrations/202608080011_profile_account_status_admin_maintenance.sql` | `1049d2f3e964de893e778915c49fa1fc4ecace5bf274b23176f81192913b1866` |
| 012 | `supabase/migrations/202608080012_creator_approval_gate.sql` | `b2ce0574116649d9eff8115994e95caca9d690dd166d2bdc9d4b2b8f2a4c98d6` |
| 013 | `supabase/migrations/202609080013_product_attribution_events.sql` | `59e8fbee9e62039a71298b79911399e7122af7a1530e60250ef47b74ad32dd11` |
| 014 | `supabase/migrations/202609080014_creator_publication_control.sql` | `ddfb1d715985ec36842ef6466463165cb95af48263d0a1198c6e1781674f4974` |
| 015 | `supabase/migrations/202609080015_block_follow_cleanup.sql` | `d99ba710779aa6001306291ae77112f2f11ed8aff6edf41fc8e5e145e3e64a95` |
| 016 | `supabase/migrations/202609080016_account_deletion_requests.sql` | `6925f1071e2132363ef3ebf0d8620a42e5b6fca654a77a88517359770279ebf7` |
| 017 | `supabase/migrations/202609080017_creator_live_return_signals.sql` | `c7ccd2dee857bd56d86cb5164b0077b003a95d001e9e431ff32ccc9266ce9cbf` |
| 018 | `supabase/migrations/202609080018_pilot_measurement_briefs.sql` | `af84065aa8fa443be47a06391cf3082c45390c90e13babc8b87bb90e958f4f2b` |
| 019 | `supabase/migrations/202609080019_pilot_brief_review_workflow.sql` | `1d5baa345ab3af32f868a267e1fe8376c3f0f2d6d0c74d1a57387667bcd2b19f` |
| 020 | `supabase/migrations/202609080020_live_signal_follow_catchup.sql` | `95ee78703c0685d487ce74d38187855c3b146a3d5296e2f0558dc7fbd38f9a7f` |
| 021 | `supabase/migrations/202609080021_creator_session_state_machine.sql` | `83e12b6c32bf8eedaa4b550c9877364dd4bb1848826b200beec7204d7cf02a48` |
| 022 | `supabase/migrations/202609080022_product_event_context_guard.sql` | `70a4b2165796542a166acfc4d13f7ea699444f050d2524cc72c2c9a809afad94` |
| 023 | `supabase/migrations/202609080023_schedule_reminder_integrity.sql` | `e0cd493e62e89d7f24fb9489934d3f08af87024046e88cf5651d6064947ce10f` |
| 024 | `supabase/migrations/202609080024_attributable_return_integrity.sql` | `b68e1f80378cb60ca86dfded3a2c3dc6f1e921569c4db3dde5a81ba572ac4c7f` |
| 025 | `supabase/migrations/202609080025_per_creator_live_alert_preferences.sql` | `15a20deb9647a9674e9035e88b5edd64c6eb4d9c3e9850541f3b9f405dd66cbc` |
| 026 | `supabase/migrations/202609080026_global_live_signal_preference_integrity.sql` | `dc3aaabacac34830a195ee8fd7e434333242cec1e5868db911468cf80b406610` |
| 027 | `supabase/migrations/202609080027_creator_public_surface_integrity.sql` | `590680983ecd2644d511b7caef0d52eb378ee6948b1c74bca0b337ae7bb910a7` |
| 028 | `supabase/migrations/202609210028_product_event_attribution_trust.sql` | `182b70e61ae94c296cf15da9c730557ea0ef413c31ddbdaaed21f07948967b9a` |
| 029 | `supabase/migrations/202609210029_handoff_intent_server_boundary.sql` | `3871e658b53c06a1e0a16411a922599d05db5d4d3ca54d2c8d4c6272ee51d972` |
| 030 | `supabase/migrations/202609220030_industry_organizations_rbac.sql` | `ac20ebd6453be01b1ee6a66d7f4b6ecb493b26fab66989a65422ed907126f646` |
| 031 | `supabase/migrations/202609220031_industry_pilot_configuration.sql` | `b93299fb58d80546e5e9fbee70d6e472c018ba16571c968675c9657a885e89cc` |
| 032 | `supabase/migrations/202609220032_industry_support_cases.sql` | `58b7b132687fe747e403b887f8a9c9b88ebab29fe67226dcca9d834cced2d70b` |
| 033 | `supabase/migrations/202609220033_industry_integration_health.sql` | `d696823a014ef9dd4d848a71bfe5f66936631b8801a1401142757e6f2a6e1b2f` |
| 034 | `supabase/migrations/202609220034_account_data_export_requests.sql` | `af1742a1aa89963e0fd1932626200d4b92556ea8acfe81c1c6938bcdae2bc9a5` |
| 035 | `supabase/migrations/202609220035_creator_return_preferences.sql` | `6439f8bae8082028772adb0dad6917bde9acb3763e4a3c4120df2b17aad1a440` |
| 036 | `supabase/migrations/202609220036_creator_return_follow_integrity.sql` | `a0b68b412e127b4592451e2507399cf3d5287330306a3e1c6dc3f6ccdacaa4e6` |
| 037 | `supabase/migrations/202609220037_creator_return_live_signal_sync.sql` | `347aca700368b8b517c2d62e2c638c03040d04d0cc7b04b842e004f844382271` |
| 038 | `supabase/migrations/202609220038_creator_live_signal_generation_preference_gate.sql` | `66c5c06318ef09247f665fca435aa5065d3f86b50158f785fc5a2f470955d044` |
| 039 | `supabase/migrations/202609220039_return_signal_read_integrity.sql` | `42622b750ef4d5449825891c67162b3b60fef2bb0479d63407466bbf6e7b30a4` |
| 040 | `supabase/migrations/202609220040_player_session_reminder_integrity.sql` | `e2f3911b547063760a8ee93965b6470dd63f0149c1bd0d2019ec571490cb227f` |
| 041 | `supabase/migrations/202609220041_industry_org_invitation_lifecycle.sql` | `b8076fdf748346dd253f8deccd8a2d4dd16c2aafaedf6610df21d74e907c4b46` |
| 042 | `supabase/migrations/202609220042_industry_org_invitation_membership_guard.sql` | `fd843f91fdaa8b5f27fd1be55f11637ad47905d171afbe75524d0e9cdcaac5be` |
| 043 | `supabase/migrations/202609220043_industry_creator_table_mapping.sql` | `f3bd5ecddee02354ca795207b0a36e11c1719211b39e83ee5ea97fff048e17a3` |
| 044 | `supabase/migrations/202609220044_harden_creator_table_mapping_pause.sql` | `1efbc69129f1529f174988bb3cc311832cc50c4d5a09c746fd28508e0b7eb43b` |
| 045 | `supabase/migrations/202609220045_creator_table_mapping_audit.sql` | `2b121f575e2d4dc784a605df8a8600f855a5e8a245e68c6dd048dcae0b964229` |
| 046 | `supabase/migrations/202609220046_industry_membership_lifecycle.sql` | `48250a7f642b5b4dbc77833e8368b3565e7c8a8b9c0b173f89046e49ded690e5` |
| 047 | `supabase/migrations/202609220047_serialize_industry_owner_lifecycle.sql` | `6eaac32fbef0d05b277ab048f7a2dc122da64a1801e09a265c3225ccf1fd7068` |
| 048 | `supabase/migrations/202609240048_approved_operator_handoff_resolution.sql` | `5319d4b703edb1b05cdd11aaf64fe1bfb0d7bb3f74a4e5902005b7eba81e681b` |
| 049 | `supabase/migrations/202609240049_fail_closed_ambiguous_operator_handoff.sql` | `40be0943331d09b3055c828a76b89c6daf831d0733d4ab3ee4adb1b19c2f6f9d` |
| 050 | `supabase/migrations/202609240050_handoff_return_idempotency.sql` | `add2a724210013f7c9465121c6dc8cb3e84c733f4656b0865e9c1e38092daa06` |
| 051 | `supabase/migrations/202609240051_creator_session_handoff_binding.sql` | `1aee6fed80540a184d3c80613ced5f2df9d1b81ba031359a82f19897299002c0` |
| 055 | `supabase/migrations/202609240055_product_event_state_integrity.sql` | `389c3d20e9316caa1ec8865b326481984efd61fbf55553afc8dc6d94693572d4` |
| 056 | `supabase/migrations/202610090056_product_event_contract_hardening.sql` | `70eb6503cb6e1f9e600f52cf0ff342b8b7d8af9c3023bfe5e7581bd87ddb109e` |
| 057 | `supabase/migrations/202610090057_foundation_contract_recovery.sql` | `c3eeb58854d17736937375809c03f2797981d90409b3c0fa5140afe3bbde43fa` |
| 058 | `supabase/migrations/202610090058_avatar_storage_contract_recovery.sql` | `754a946a37d05c7b22e804d9fc101d760557ef8ff4994887508e43ecf38e5096` |
| 059 | `supabase/migrations/202610090059_private_profile_policy_compatibility.sql` | `5ce85bbff3b51da6260e29147811d0a1bf93fede51ecc336c3bdfd4d1c7af1c7` |
| 060 | `supabase/migrations/202610090060_foundation_privilege_and_suspension_hardening.sql` | `eb8ec51bbd4607f50709f6811523872779ac0e99eb40938e0f654c78e87988f9` |

The missing numbers `052–054` are deliberately absent from the manifest; they are unresolved history gaps, not empty migrations.

## Execution method after separate authorization

1. Record `git rev-parse HEAD`, verify every manifest hash with `shasum -a 256`, and require a clean tracked worktree. The pre-existing untracked STAGING_HANDOFF.zip is historical and is not updated or authorised for use by this checkpoint.
2. Run `node --test tests/*.test.mjs` and `./tools/test-db.sh` locally.
3. Generate a dry-run against the confirmed staging project. Apply only files absent from remote history, in manifest order. Never use `migration repair`, `db reset`, `--include-all` without a reviewed version comparison, or production credentials.
4. Use a reviewed Supabase migration workflow that records history for staging. Do not mix direct SQL application and ledger-managed deployment. The disposable-only direct SQL runner described in the recovery runbook deliberately does not populate a Supabase ledger; its hash receipt is experimental evidence, not migration history. On any error stop; earlier committed files can remain applied.
5. Capture post-schema and post-history; compare them with the reviewed expected state.

## Verification queries

Run read-only queries after apply to verify:

- all `public` tables have `relrowsecurity = true`;
- no browser role has `CREATE` on schema `public`;
- browser roles lack direct sensitive-column access on `profiles`;
- all non-trigger `SECURITY DEFINER` functions have fixed `search_path` and explicit ACLs;
- expected policies exist on profiles, reports, tenant tables, product events and `storage.objects`;
- `avatars` is public, 5 MB, and limited to PNG/JPEG/WebP;
- migration history exactly matches the manifest with no `052–054` rows.

Use `tests/db/schema-security-audit.sql` only after reviewing compatibility with hosted catalog behavior.

## Prepared executable tests (not run)

`tools/hosted-e2e.py` exercises real Auth password/refresh/logout, owner profile RPC, private-column denial, cross-user RLS and Storage ownership using synthetic users. `tools/disposable-migration.sh` applies only the hash-pinned present chain to a separate disposable target after explicit runtime guards. Neither was run. See the recovery runbook for prerequisites, invocation, cleanup, acceptance and remaining role/tenant/browser cases.

## Hosted functional acceptance

Using staging-only synthetic accounts, run Player, approved/unapproved Creator, Operator A/B, Admin, suspended Player and suspended Admin paths through Auth/PostgREST/Storage. Require cross-tenant denial, approval boundaries, suspension enforcement, notification integrity, one approved HTTPS handoff, ambiguous handoff denial, attribution validation and idempotent return. Run authenticated Chrome and WebKit journeys with fresh sessions and capture redacted logs.

## Failure recovery

- Before commit: transaction error must rollback; preserve logs and re-diff.
- After commit but before traffic: stop testing, disable staging access through the approved operational control, and prefer a reviewed forward repair.
- Restore/recreate only the isolated staging project from the verified pre-apply recovery point when forward repair is unsafe.
- Never restore staging content into production. Never make Creator rows public automatically when reversing migration 012.

## Acceptance decision

Approve staging migration only after every precondition, schema/security query, hosted journey, observability check and recovery rehearsal passes. Production requires a separate drift audit, plan and explicit authorization.

## Current recovery/runtime validation receipt

No migration content or manifest checksum changed. Original 052–054 SQL/checksums/dependencies remain unknown; no evidence establishes intentional removal or renaming. 057 directly requires profiles/user_settings from 001, active-profile helper from 008, Auth platform roles/users; 058 requires Storage platform buckets/objects/foldername and Auth uid. Neither names an object known to originate in 052–054, which cannot prove absent unknown side effects. Both remain reconstructions with unchanged pinned hashes. Hosted apply remains blocked; do not invent rollback for unknown migrations. Local targeted tests 42/42 PASS; no hosted command executed.

## Local full-chain replay gate — 2026-10-10

57/57 available migrations apply on isolated PostgreSQL 17.11 with the test-only Supabase shim; 057–060 repeat with schema+ACL parity, schema catalog/audit PASS and security matrix 40/40 PASS. Full Node suite 144/144 PASS. Evidence and reproduction commands: MIGRATION_FORENSICS_REPORT.md, Reproducible local schema acceptance; dependency map: MIGRATION_PROVENANCE_MATRIX.md. No confirmed defect requires a corrective migration; future corrections must use a new unused version after 060, never invented gap SQL. No application SQL or hosted state changed. Production's earlier schema is not used as a full-schema reference. Staging activation remains disabled, provenance gap remains BLOCKED, and hosted Auth/RLS/Storage/integrations/settings/recovery acceptance remains required. These local results do not authorize staging apply.

## 2026-10-12 security correction — hosted execution remains blocked

New local correction: `supabase/migrations/20261012095847_invitation_manager_null_guard.sql`, SHA-256 `be0996109aba13b1588ddcf2c6b493c19de8752b7b6efd540adde2e8cc915acf`. Local PostgreSQL replay of 58 available files and security matrix44 PASS. Original57-file package remains preserved but lacks this fix: do not use it to activate authenticated functionality. Its disposable runner intentionally fails closed when the source file count is58; do not relax that pin. After owner approval of the unresolved052–054 strategy and disposable target, engineering must produce/review a new target-specific58-file provenance manifest and recovery rehearsal before staging writes. Public static-demo release does not require hosted migrations.
