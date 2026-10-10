# LC App Release Security Matrix

- Project: LC App
- Version: v1.1
- Status: Local evidence complete; hosted evidence pending
- Last updated: 2026-10-10
- Owner: Engineering / QA
- Audience: Security reviewer, release engineer
- Sources: migrations 001–060, DB matrix, Node tests, Chrome/WebKit smoke
- Assumptions: Local DB actors simulate JWT claims; they do not simulate Supabase gateways
Open question: Staging configuration/provenance authorization and hosted scenario execution; identity baseline is separately confirmed

Status vocabulary: `LOCAL PASS`, `STAGING REQUIRED`, `BLOCKED`, `N/A`.

| Area | Actor / attack | Expected result | Local evidence | Status |
|---|---|---|---|---|
| Profile | Anonymous table read | Denied | DB matrix | LOCAL PASS |
| Profile | Owner full profile RPC | Own row only | DB matrix | LOCAL PASS |
| Profile | Authenticated direct sensitive-column read | Denied | DB matrix + ACL audit | LOCAL PASS |
| Profile | User changes role/account status | Denied | DB matrix + trigger | LOCAL PASS |
| Profile | Suspended user reads own status | Allowed for lockout UI | DB matrix | LOCAL PASS |
| Foundation | Browser creates object in `public` schema | Denied | Schema audit | LOCAL PASS |
| Functions | PUBLIC executes unapproved non-trigger `SECURITY DEFINER` | None exposed | Schema audit | LOCAL PASS |
| Functions | `SECURITY DEFINER` without fixed search path | None | Schema audit | LOCAL PASS |
| Social | User writes as another author | Denied | DB matrix | LOCAL PASS |
| Social | Suspended user creates post | Denied | DB matrix | LOCAL PASS |
| Moderation | User reads another report | Hidden | DB matrix | LOCAL PASS |
| Moderation | Active admin reviews report | Allowed; reviewer/time stamped | DB matrix | LOCAL PASS |
| Moderation | Browser admin calls Creator approval RPC | Denied | DB matrix | LOCAL PASS |
| Moderation | Suspended admin retains queue access | Denied | DB matrix | LOCAL PASS |
| Reports | Suspended user creates report | Denied | DB matrix | LOCAL PASS |
| Creator | Unverified Creator publishes profile/session | Denied | DB matrix + Node contracts | LOCAL PASS |
| Creator | Verified Creator lifecycle through hosted API | Works with approved transitions | None | STAGING REQUIRED |
| Tenant | Operator A reads Operator B organisation | Hidden | DB matrix | LOCAL PASS |
| Tenant | Operator A mutates Operator B mapping/destination | Denied | DB matrix | LOCAL PASS |
| Tenant | Operator A reads Operator B audit trail | Hidden | DB matrix | LOCAL PASS |
| Tenant | Concurrent last-owner lifecycle | Serialised, no ownerless tenant | Static/SQL contract only | STAGING REQUIRED |
| Notifications | User manufactures notification | Denied | DB matrix | LOCAL PASS |
| Notifications | Hosted trigger creates intended notification | Correct recipient/context | Static contracts only | STAGING REQUIRED |
| Events | Browser manufactures trusted handoff intent | Denied | DB matrix | LOCAL PASS |
| Events | Sensitive/unapproved metadata | Denied | DB matrix | LOCAL PASS |
| Events | More than 120 events/minute | Event 121 denied | DB matrix | LOCAL PASS |
| Events | Suspended user emits event | Denied | DB matrix | LOCAL PASS |
| Attribution | Return without intent | Denied | DB matrix | LOCAL PASS |
| Attribution | Duplicate return replay | Denied | DB matrix | LOCAL PASS |
| Handoff | Unique approved HTTPS destination | Resolves | DB matrix | LOCAL PASS |
| Handoff | Ambiguous mapping | Fails closed | DB matrix | LOCAL PASS |
| Handoff | Real approved staging destination | External navigation and return preserved | None | BLOCKED |
| Storage | Avatar bucket type/size contract | 5 MB; PNG/JPEG/WebP | DB matrix | LOCAL PASS |
| Storage | Cross-user avatar path | Denied | DB matrix | LOCAL PASS |
| Storage | Suspended user avatar mutation | Denied | DB matrix | LOCAL PASS |
| Storage | Hosted Storage API MIME/size enforcement | Denied outside contract | Local table simulation only | STAGING REQUIRED |
| Auth | Signup and verification | Profile/settings trigger succeeds | Local trigger only | STAGING REQUIRED |
| Auth | Login/reset/refresh/logout | Safe UX and valid session transitions | Demo/static only | STAGING REQUIRED |
| Browser | Chrome responsive/demo journey | No overflow/page error; demo interactions pass | 63 route/viewport + journey smoke | LOCAL PASS |
| Browser | WebKit responsive/keyboard smoke | No overflow/page error; visible labelled focus | 21 route/viewport checks | LOCAL PASS |
| Browser | Authenticated Chrome/WebKit journeys | Player/Creator/Operator/Admin pass | No hosted identity | BLOCKED |
| Observability | Postgres/Auth/Storage/browser errors | Zero unexplained release errors | No hosted logs | BLOCKED |
| Recovery | Restore pre-apply backup | Successful disposable restore | Not run against hosted snapshot | BLOCKED |

## Prepared staging E2E scenarios — NOT RUN

Target exclusively `dnpizrjuxkcnmdgmvnks`; refuse production before any connection. Execution needs separate synthetic-fixture and hosted-write approval after migration/configuration gates. `tools/hosted-e2e.py` already prepares a two-user API smoke; it does not implement the complete tenant/Creator/Admin/email matrix below. Do not run its fixed-identity local SQL counterpart against hosted staging.

Fixture set: two generated Players P1/P2; approved Creator C1 and unapproved Creator C2; two industry principals O1/O2 each owning a separately created synthetic tenant A/B; active Admin A1; suspended Player S1 and suspended Admin S2. Generate random emails/UUIDs/passwords per run, use approved test inboxes for real email delivery, capture generated fixture IDs in a private run manifest. Provision privileged/approval state only through the reviewed staging administrative workflow; editable user_metadata must never grant roles. Client actions use each actor's access token, never the service token. Cross-user and cross-tenant roles are separate cases.

| ID | Scenario / action | Required positive and negative assertions |
|---|---|---|
| AUTH-1 | Signup, confirmation, profile bootstrap | Real staging signup/approved test mail creates exactly one profiles/settings row; unconfirmed session obeys actual policy; replay does not duplicate rows. Distinguish admin-created confirmed smoke users from email verification evidence. |
| AUTH-2 | Login, wrong password, refresh, logout, recovery | Identity matches fixture; bad credentials/expired refresh denied; refresh rotates according to captured settings; logout revokes refresh. Old access JWT expiry is recorded, not assumed immediately revoked. Reset/confirmation callback stays on approved staging origin and handles expired/invalid links safely. |
| RLS-1 | Owner/private profile and settings | P1 owner RPC returns only P1 full profile; direct private-column query denied; public/other-profile columns follow reviewed visibility. P2 cannot update P1 or assign role/account_status; no JWT user_metadata escalation. |
| RLS-2 | Social ownership/block/suspension | P1's positive post/comment/report flow succeeds; forged author/user IDs denied; P2 cannot read P1 private reports/settings/notifications. Blocked-pair visibility and suspended mutation denials remain effective through PostgREST. |
| CREATOR-1 | Publication/approval boundaries | C1 allowed transitions and published visibility work; C2 cannot publish profile/session or self-approve. Unprivileged approval RPC denied. Server approval state is auditable. |
| STORAGE-1 | Owner upload, update/upsert, delete and public read | P1 UUID-folder PNG/JPEG/WebP <=5 MB succeeds; anonymous public avatar read is intentionally allowed. P2 insert/update/delete of P1 path and P1 upload to P2 path denied. Test actual upsert permissions, oversize (>5 MB), invalid MIME and content/header mismatch separately; capture provider behavior rather than assuming local validation equals enforcement. Suspended S1 mutations denied. |
| TENANT-1 | Org membership, configuration, mappings/support/audit | O1 positive tenant-A operations succeed; O2 tenant-B rows are absent from O1 lists and direct reads. Cross-tenant writes/RPCs, guessed IDs and audit reads denied; spoofed organization_id/owner changes rejected. Repeat reciprocal B-to-A and nonmember cases. Public creator records remain outside tenant-private scope. |
| TENANT-2 | Invitations, removed membership, last-owner concurrency | Invitation accept/expiry/revoke/replay uses intended identity and tenant; removed/suspended member access revoked under reviewed token/session behavior. Concurrent final-owner operations cannot produce ownerless tenant; administrative recovery remains authorised/auditable. |
| ADMIN-1 | Active vs suspended moderation | A1 permitted queue actions record reviewer/time; ordinary users and suspended S2 cannot moderate, approve or mutate protected state. |
| RETURN-1 | Notifications/handoff/attribution | Intended recipient receives correct context; users cannot manufacture trusted notifications/intent. Staging-owned mock destination only; approved unique HTTPS mapping resolves, ambiguous mapping denied, wrong session/metadata/return replay denied. No production operator request or real wagering. |
| CLEANUP-1 | Fixture teardown and residual audit | Revoke generated sessions, remove only run-owned object paths/users/tenants/rows through approved cleanup; verify residual notifications/events/audit rows and bucket counts. On ambiguous create timeout audit before retry; no mutation retries or broad deletion. Restore expected baseline only within approved scope. |

For each case capture actor label, staging ref, sanitized endpoint/operation, HTTP status, expected row visibility/state, assertion result and time. Denied writes may return HTTP errors; filtered reads can return 200 + empty rows. Verify no unintended state change, not just a status code. Redact access/refresh tokens, passwords, keys and email links. A single denied assertion failure blocks readiness. Include Postgres/Auth/Storage error correlation and authenticated browser checks after API acceptance. All current hosted scenario statuses: **STAGING REQUIRED / NOT RUN**.

## Release decision

- Local RC: eligible for isolated staging entry after the local suite passes at the final commit.
- Staging: NO until every `STAGING REQUIRED` and `BLOCKED` row has evidence.
- Production: NO; production credentials, drift, deployment and approval are outside this audit.
