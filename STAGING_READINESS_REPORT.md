# LC App Staging Readiness Report

- Project: LC App
- Version: v0.5
- Status: Local migration chain verified; staging isolation not independently proven
- Last updated: 2026-10-09
- Owner: Narek / Engineering
- Audience: Release engineer, security reviewer
- Sources: branch `codex/lc-app-p1-stabilization`, migrations 001–060, local PostgreSQL 17 evidence, Node and browser tests
- Assumptions: Staging identity/counts were user-supplied; no hosted schema or migration history was independently available
- Open question: Read-only staging metadata access and explicit migration authorization

## Decision

**STAGING READY: NO.** Project ref `dnpizrjuxkcnmdgmvnks` is nominated for isolated staging, but only endpoint existence was independently verified; hosted isolation, schema baseline, authenticated journeys and rollback rehearsal remain unverified. **PRODUCTION READY: NO.**

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
| MIG-03 | P1 | Sequence numbers 052–054 are absent from every inspected branch, reflog, reachable history and unreachable blob. | Do not invent placeholders; read-only staging migration history must confirm they were never applied remotely. |
| STG-01 | P1 | Staging ref is supplied and its endpoint exists, but host, users, data, integrations and migration history are not independently verified. | Keep migration execution blocked pending authorised read-only metadata evidence. |
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
