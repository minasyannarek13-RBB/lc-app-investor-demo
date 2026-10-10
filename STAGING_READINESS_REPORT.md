# LC App Staging Readiness Report

- Project: LC App
- Version: v0.9
- Status: Hosted baseline inspection PASS; migration and release readiness blocked
- Last updated: 2026-10-10
- Owner: Narek / Engineering
- Audience: Release engineer, security reviewer
- Sources: branch `codex/lc-app-p1-stabilization`, migrations 001–060, local PostgreSQL 17 evidence, Node and browser tests; ChatGPT connected Supabase external inspection dated 2026-10-10, relayed by Narek
- Assumptions: Historical ChatGPT evidence remains separately attributed. Current read-only Codex connector evidence is stored in `evidence/staging-readonly-2026-10-10.json`; no remote writes were performed.
- Open question: Integrations/configuration isolation, provenance 052–054, hosted E2E and recovery evidence; separate execution authorization

## Local runtime safety closure — 2026-10-10

Starting checkpoint `279c5e2`. Explicit staging mode (`?environment=staging` or `LC_APP_CONFIG.ENVIRONMENT=staging`) fails closed before SDK client creation. `STAGING_ACTIVATION_APPROVED=false` is a code gate, not an environment/query override. Staging URL hints also cannot fall through the legacy production path. Production inline configuration is unchanged; it is rejected when staging is requested. No active environment, credential or hosted setting was changed.

After separately approved activation, configuration requires the exact staging URL and an explicit public legacy anon JWT with staging `ref`, `anon` role and future expiry. Missing/malformed/expired credentials, production references, service-role/secret fields and opaque publishable keys are rejected. JWT claim validation is structural; authenticity is checked by Supabase, not inferred locally. Opaque keys remain unsupported because local code cannot establish their project binding. Staging ignores legacy credential fallbacks. The isolated staging entry must replace existing inline production config before activation; `.env.example` is preparatory and is not loaded by this static application.

Targeted Node tests: **42/42 PASS** across staging runtime, investor isolation, service-worker privacy, release stabilization and migration integrity. Auth/SW syntax checks and mirrored runtime parity pass. Browser/hosted credential validity was not retested. Source recovery findings: see `MIGRATION_FORENSICS_REPORT.md`, current follow-up; 052–054 remain BLOCKED.

## Decision

**HOSTED BASELINE INSPECTION: PASS. STAGING READY: NO. STAGING MIGRATION READY: NO. PRODUCTION READY: NO.** Empty application state is verified externally; it does not establish integration isolation, application correctness, backup/recovery or browser readiness.

## Staging configuration and migration gate — local follow-up

Starting checkpoint **ce40223**. No hosted requests, migrations, settings changes, users or regression/Safari reruns in this follow-up. Independent empty staging baseline remains accepted; no new production connection was made.

Complete literal project-reference inventory in executable/config files at the starting checkpoint:

| Location | Meaning / disposition |
|---|---|
| `.env.example:1` | Production URL in sample environment. Replaced with staging URL and blank publishable-key credential; template only, no active environment created. |
| `auth.js:4` and `LC_App_GitHub_Pages_Upload/auth.js:4` | Production fallback URL used when higher-priority config/storage is missing. Unchanged; blocks authenticated staging use without reviewed fail-closed mapping. |
| `LC_App_GitHub_Pages_Upload/index.html` inline `LC_APP_CONFIG` | Production URL plus production publishable client credential. Unchanged; overrides URL/key fallbacks and would override an earlier staging injection. Never copy its credential into the staging template. |
| `tools/hosted-e2e.py:12` | PRODUCTION denylist constant; retain as protection, not a test target. |
| `tools/disposable-migration.sh:9` | Production/staging forbidden targets for disposable runner; retain. This runner is not the nominated-staging migration workflow. |

Documentation/evidence references describe the protected ref or historical findings; they are not connection configuration. Dynamic URL/key sources also exist in `window.LC_APP_CONFIG`, `window.__LC_APP_CONFIG__`, window overrides and `lc-app:supabase-*` localStorage. Their external runtime values cannot be proven safe by a literal repository scan. Inline config wins over these fallback values. Use a fresh staging profile and verify effective origin before Auth/client creation; investor demo isolation remains unchanged.

No real credential was retrieved, printed or modified. Current `.env.example` has the exact staging origin and an empty credential placeholder; it is not automatically loaded by the static app. No privileged credentials belong in browser output. Prepared mapping, Dashboard checklist, detailed 052–054/057–058 dependencies/rollback risks and exact ordered manifest are in `STAGING_MIGRATION_EXECUTION_PLAN.md` v1.4. Synthetic-user Auth/RLS/Storage/tenant scenarios are in `RELEASE_SECURITY_MATRIX.md` v1.1; existing smoke script remains NOT RUN.

**Configuration preparation complete; activation/migration gate remains BLOCKED.** 052–054 source/provenance decision, Dashboard Auth/OAuth/SMTP/hooks/integration evidence, approved isolated runtime mapping, recovery rehearsal and hosted acceptance are still required. All readiness remains NO.

## Current read-only staging audit — 2026-10-10

Source: **Codex connected Supabase**, current session, restricted to `dnpizrjuxkcnmdgmvnks`. This refresh is separate from the historical ChatGPT inspection below. Raw connector receipt: `evidence/staging-readonly-2026-10-10.json`. Production was not queried. Project `lc-app-staging`, region `ap-southeast-2`, ACTIVE_HEALTHY; direct database identity `db.dnpizrjuxkcnmdgmvnks.supabase.co`, engine PostgreSQL 17.11. All public table/policy/view/function, Auth-user, Storage-bucket/object counts remain zero. Migration ledger absent; migration list, Edge Functions and Security Advisor findings empty. A separate SELECT returned storage policies=[], buckets=[], auth-user custom triggers=[]. Platform Auth migration history is distinct from the absent application migration ledger.

| Gate | Current finding |
|---|---|
| Read-only project/schema identity | PASS; connector calls explicitly target staging. |
| Application staging targeting | Local fail-closed guard PASS; activation BLOCKED. Historical configuration finding: Both `auth.js` defaults and nested `index.html` inline configuration still target production. `.env.example` is now a staging-only prepared template, not active runtime. The inline publishable key is public client configuration, not a service secret; it nevertheless belongs to the production configuration and must not be reused for staging. Production configuration unchanged; staging guard now rejects it before client creation. |
| Auth URL/provider/email settings | BLOCKED by missing management-setting access. Connector exposes project/SQL metadata but no Auth configuration endpoint; dashboard fallback redirects to sign-in. Site URL, redirect allowlist, providers, SMTP, hooks, signup and confirmation settings remain unverified. Zero Auth users does not verify these settings. |
| Storage | Empty buckets/objects and zero Storage policies confirmed. Hosted API enforcement still untested. |
| 052–054 | Still absent from available migration paths/history. Empty staging cannot supply their source or establish intentional omission. No replacement SQL invented. |
| 057–058 | Local reconstruction classification retained; all manifest hashes match. Migration 001/frontend support owner-profile trigger/RPC and UUID-owned public avatar contract. Empty hosted app objects and no custom Auth-user trigger show no current named app conflict; hosted Auth/PostgREST/Storage correctness is not established by this. |
| Secret/integration isolation | No private-key/service-secret signatures found by a limited tracked code/config scan; no local `.env` or Supabase link/config file present. This does not prove remote credential separation. Shared SMTP/OAuth/webhook secrets, custom domains and integrations remain inaccessible/unverified. |
| Recovery/hosted E2E | Prepared scripts remain unexecuted. Backup/restore or disposable rebuild and authenticated multi-role/browser negative tests remain required. |

Investor demo still isolates its local data and bypasses Supabase startup; the production defaults block **full-product staging use**, not the tested demo. Runtime config precedence matters: a `.env.example` edit alone would not replace inline `LC_APP_CONFIG` in this static application. Approve an isolated staging build/configuration before any authenticated full-product launch. Minimum variables and ordered migration/recovery gates are in `STAGING_MIGRATION_EXECUTION_PLAN.md`.

**STAGING READY: NO. FULL PRODUCT READY: NO.** Empty hosted baseline is PASS; complete configuration isolation, missing provenance, hosted E2E/integrations and recovery are not PASS.

## Hosted baseline — externally verified 2026-10-10

Evidence source: **ChatGPT connected Supabase**, independently verified outside local Codex and relayed by Narek on October 10, 2026. Local Codex records this evidence; it did not execute hosted inspection or writes. Scope: staging `dnpizrjuxkcnmdgmvnks`. Protected production: `aspbwgsfkebduvviyeuo` (untouched).

| Inspection | Verified result |
|---|---|
| PostgreSQL | 17.11 |
| Public tables / RLS policies | 0 / 0 |
| Public views / functions | 0 / 0 |
| Auth users | 0 |
| Storage buckets / objects | 0 / 0 |
| Recorded migrations | 0 |
| Migration ledger | `supabase_migrations.schema_migrations` absent |
| Edge Functions | 0 |
| Supabase Security Advisor findings | 0 |

An absent migration ledger is the verified empty baseline, not a failed SELECT or evidence that missing source versions never existed. Staging has no recorded 052–054; their source provenance remains unresolved. Zero advisor findings on an empty project do not certify the migrated app. Public-object counts do not mean Supabase platform schemas are absent. Baseline must be refreshed before any later authorised apply.

Prepared, not executed: `tools/hosted-e2e.py`, `tools/disposable-migration.sh` and `DISPOSABLE_SUPABASE_RECOVERY_RUNBOOK.md`. Auth/RLS/Storage smoke coverage does not replace the full hosted role/tenant/integration/browser acceptance matrix.

## Verified local evidence

- Baseline checkpoint verified at `78132f3e6a3b1ae730d2e67216611c9cee49c62c`; work continued only on `codex/lc-app-p1-stabilization`.
- Recovered migrations 001–006 match their authoritative local-source SHA-256 values. Git history and unreachable objects contain no alternate copies. Migrations 057–058 remain explicitly labelled reconstructions.
- PostgreSQL 17 applies all 57 present files in the 001–060 sequence from an empty test database and safely reapplies 057–060. `tests/db/schema-security-audit.sql` verifies RLS, schema CREATE restrictions, foundation ACLs, administrative RPC ACLs and `SECURITY DEFINER` controls.
- Authenticated synthetic matrix covers Player, Creator, two Operator tenants, Admin, suspension, moderation, notifications, handoff, attribution, replay, metadata, avatar ownership and rate limiting.
- Root and nested `auth.js` use `get_own_profile()` and remain byte-identical.
- Chrome/WebKit results are local demo/browser smoke. They do not prove hosted authentication, email flows, storage API enforcement or PostgREST behavior.

## Findings and fixes

| ID | Severity | Finding | Resolution / status |
|---|---|---|---|
| SEC-01 | P1 | `is_moderator()` did not require an active account, so a suspended moderator/admin retained moderation capability. | Fixed in migration 060; executable suspension tests added. |
| SEC-02 | P1 | Suspended users could still create reports and mutate their avatar objects. | Fixed in migration 060; report and storage policies now require an active profile. |
| SEC-03 | P1 | Foundation table privileges depended on environment default ACLs. | Fixed in migration 060 with explicit `profiles` and `user_settings` grants/revokes. |
| SEC-04 | P1 | Browser roles could be exposed to search-path object substitution if the public schema retained CREATE. | Migration 060 revokes public-schema CREATE from browser roles; schema audit enforces it. |
| MIG-01 | P1 | Migration 001 documents pre-existing live auth/storage behavior but does not define all of it; 057–058 reconstruct that behavior. | Hosted schema comparison is a mandatory staging gate. Do not apply reconstruction blindly over an existing project. |
| MIG-02 | P1 | Migration 012 changes unverified published Creator rows and public user-generated sessions. | Snapshot affected rows before staging apply; acceptance requires reviewed before/after counts. |
| MIG-03 | P1 | Sequence numbers 052–054 are absent from every inspected branch, reflog, reachable history and unreachable blob. | No placeholders. External staging baseline has no recorded migrations and no ledger; source provenance 052–054 remains BLOCKED. |
| STG-01 | P1 | Hosted empty baseline inspection PASS via ChatGPT connected Supabase on 2026-10-10; integrations and recovery remain unverified. | Keep execution blocked pending provenance, integration isolation, recovery rehearsal and separate authorization. |
| OBS-01 | P2 | No hosted release telemetry or alert thresholds have been verified. | Staging runbook defines required log capture and zero-error acceptance criteria. |

## Coverage limits

The local PostgreSQL shim emulates roles, `auth.users`, claims and storage tables. It validates application SQL and RLS logic, but it is not Supabase Auth, PostgREST, Storage API, Realtime, email delivery or hosted connection pooling. The demo browser suite uses simulated content and cannot replace authenticated hosted E2E.

## Acceptance gate

Staging becomes ready only when all items below pass on a newly isolated, explicitly authorised project:

1. Project ref and database identity are recorded and proven different from production.
2. Pre-apply schema, migration history and affected migration-012 row counts are captured.
3. Dry-run shows only reviewed migrations; 001–006/057–060 have no destructive drift conflict.
4. Player, Creator, Operator A/B and Admin hosted journeys pass in Chrome and WebKit.
5. Cross-tenant, suspension, RLS, storage, attribution, idempotency and handoff negative tests pass through public APIs.
6. No unexpected Postgres/Auth/Storage errors appear during the test window.
7. Backup restore or disposable-project rebuild is rehearsed and timed.
