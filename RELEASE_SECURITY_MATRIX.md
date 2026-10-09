# LC App Release Security Matrix

- Project: LC App
- Version: v1.0
- Status: Local evidence complete; hosted evidence pending
- Last updated: 2026-10-09
- Owner: Engineering / QA
- Audience: Security reviewer, release engineer
- Sources: migrations 001–060, DB matrix, Node tests, Chrome/WebKit smoke
- Assumptions: Local DB actors simulate JWT claims; they do not simulate Supabase gateways
Open question: Authorised staging identity and hosted evidence location

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

## Release decision

- Local RC: eligible for isolated staging entry after the local suite passes at the final commit.
- Staging: NO until every `STAGING REQUIRED` and `BLOCKED` row has evidence.
- Production: NO; production credentials, drift, deployment and approval are outside this audit.
