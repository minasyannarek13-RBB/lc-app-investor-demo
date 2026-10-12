# LC App V4 — verified local release checkpoint
Project: LC App | Version: 1.1 | Date: 2026-10-12 | Owner: Narek
Status: PUBLIC STATIC CANDIDATE LOCAL PASS; REMOTE/HOSTED ACCEPTANCE BLOCKED
Audience: release owner, engineering, QA
Sources: f5672a9 hardening handoff,181 hash-verified QA receipts, Git history,
current read-only GitHub/Pages and staging receipts; evidence/release-ready-2026-10-12/.

## DONE
Canonical repository minasyannarek13-RBB/lc-app-investor-demo; local feature branch.
Serving main remains3a9d2008689312f4642fa42a1fc8c658e92a42be; feature absent remotely;
Pages legacy main/root, lc.open-gamer.com, HTTPS enforced. No external mutations.
One landing / one public_demo application. Root app aliases and investor URL route into
the same demo, not independent product variants. Approved EN/RU,11 scenes,4 roles,
portraits, CTA mn@open-gamer.com and social discovery/return flow preserved.
No operator integrations, pilots, customers or commercial metrics claimed as proven.
No bets/payments; licensed operator owns gambling/KYC/AML. Demo outbound/return is
synthetic and no real operator integration is asserted.

New P1 resolved locally: create_industry_org_invitation accepted NULL actor_role
when caller had no tenant membership. Original body reproduced on an isolated
loopback synthetic DB in a transaction: unauthorized_token_length=64, rolled back.
Correction: explicit actor_role IS NULL / invited_role IS NULL denial before write.
Original SQL unchanged; new CLI migration `supabase/migrations/20261012095847_invitation_manager_null_guard.sql` SHA-256 `be0996109aba13b1588ddcf2c6b493c19de8752b7b6efd540adde2e8cc915acf`.
DB runner includes four meaningful regression cases and opt-in retained stopped DB.
Supabase CLI local .temp metadata excluded; no secrets added.

## Tests: PASS / FAIL / NOT RUN
| Gate | Status | Evidence / scope |
|---|---|---|
| Existing evidence integrity | PASS fresh |181/181 SHA receipts match hardening checkpoint |
| Public/rollback integrity | PASS fresh |55/13 allowlists and hashes unchanged; public-integrity.json, rollback-integrity.json |
| Changed SQL chain/security | PASS fresh |58 migrations; schema audit and44 DB matrix gates; db-tests.txt |
| Invitation baseline | FAIL reproduced before correction |64-byte token issued to nonmember; transaction rolled back |
| Invitation correction | PASS fresh |nonmember/cross-tenant/NULL denied; owner64-byte token allowed |
| Relevant Node contracts | PASS fresh |8/8 invitation/foundation tests; targeted-node.txt |
| Secret scanner / syntax | PASS fresh |security.txt; node --check two runtimes, bash -n, git diff --check |
| Node full suite / infrastructure | PASS reused |156/156 Node22 and24;25/25 Python; source unchanged in covered runtime/workflows |
| Local public build | PASS reused |clean snapshot reproduced both exact pinned ZIP hashes; snapshot-build-parity.json |
| Browser / mobile engine | PASS reused |Chromium/WebKit375/768/1440 six cases; complete Follow/Schedule/Live/Handoff/Return |
| EN/RU scenes / roles / axe | PASS reused within tested scope |4/4,11 scenes,4 roles; zero reported axe violations; incomplete contrast/ARIA review retained |
| PWA/offline/recovery | PASS reused |4/4 root/nested v118→v144→v145; public bytes unchanged |
| Mobile lab performance | PASS reused laboratory only |cold median99, LCP1.929s; not field CWV or production measurements |
| Typecheck / formal lint | NOT RUN / not configured |static JS repository, no package.json/TS/lint configuration; syntax checks above |
| Native iPhone / VoiceOver | NOT RUN |WebKit emulation is not device or assistive-technology proof |
| Remote CI / OIDC / serving V4 | NOT RUN |feature absent,0 runs at f5672a9; push forbidden; OAuth workflow scope blocker |
| Hosted migration/recovery/Auth/RLS | NOT RUN / BLOCKED |staging empty; no hosted writes authorised |

The full runtime suite is deliberately not rerun: product runtime, public ZIP,
workflows and assets are unchanged. Only the changed SQL security scope was replayed.

## SECURITY DEFINER and migration scope
Staging fresh read-only pg_proc inspection found0 public definers and0 public tables,
no migration ledger. Only three platform definers (pgbouncer/vault), all deny
anon/authenticated EXECUTE. Their definitions were inspected, never invoked;
no secret rows or production objects queried. The requested nine hosted application
functions cannot be identified/verified there. Preserved local schema contains24
non-trigger app SECURITY DEFINER bodies, all reviewed with ACLs and fixed search paths;
local-definer-bodies.json pins exact bodies. This is local source review, not hosted proof.
Guarded owner/tenant operations, service-only admin setters and boolean/RLS helpers
have different exposure contracts. Remaining hosted ACL/owner/body parity, concurrency,
helper information exposure, Auth/PostgREST/Storage and native-device checks stay blocked;
no blanket claim that nine hosted functions passed.
052–054 unresolved;057–058 reconstructed. Existing57-file migration archive and
runner remain frozen, superseded for new authenticated activation by the reviewed
58th correction, not silently rebuilt. Public demo needs none of these hosted paths.
Security reference: https://supabase.com/docs/guides/database/functions

## Cleanup proposal — NO DELETION AUTHORISED
Canonical sources: this repository, app-product.js/auth.js/social.js and their nested
mirrors; landing index.html; public build specialization; releases/lc-v4/contract.json.
Exact public allowlist55 and rollback13 are the only publication source.
Sibling lc-marketing-content-alignment is a worktree of the same repository at1bf3dea,
not a new repository/site. Inventory captures396 +185 tracked paths and134 identical
byte groups; equality does not prove safe removal.28 legacy preview files have path,
size and SHA deletion-candidate manifest; all HOLD until dependency+backup approval.

| Candidate | Unique/dependency evidence | Proposed diff after separate cleanup instruction |
|---|---|---|
| sibling content-alignment worktree/branch |compare commits and any unique content first |archive recoverable snapshot, then remove worktree only after approval |
| showcase-v2 / static_preview / nested static_preview |historical UI/game screenshots and previews; not public55 |archive directory trees, update README links, remove only confirmed unreferenced paths |
| 02_OPEN_STATIC_PREVIEW.html |legacy preview entry, not public55 |replace inbound references with canonical demo; archive entry |
| legacy-preview.js / inline lcLegacyPreview |still public55 and loader/build dependent |KEEP; deleting requires removing fallback path and new build/browser/PWA QA |
| root/nested app/auth/social/SW |parity and source/delivery boundaries intentional |KEEP; no dedup by filename/hash alone |
| V2/V3 CSS/components and portraits |current runtime and11 scenes depend on historical names |KEEP; reference graph review before any removal |
| old release ZIPs / handoffs / SQL evidence |rollback/provenance/version proof |KEEP local, never Pages publish; do not erase052–054 gap evidence |
| .vercel / historical preview deployments |remote deployment receipts inventory only; current projects not verified |HOLD; owner/provider read-only inventory before project deletion |
| dependencies |no npm application build; tooling esbuild/Playwright outside payload |KEEP pinned tooling; no package uninstall required |
| historical writer workflows |disabled with if:false, verifiedCI contract |KEEP until replacement governance approved; no security-gate weakening |

Artifacts: evidence/release-ready-2026-10-12/source-inventory.json,
cleanup-manifest.json, remote-branches.json, remote-deployments.json.
Hash groups identify candidates only. No source or existing artifact removed.
Rollback before cleanup: preserve current commit+all affected branch refs; separate
owner-only archive of untracked/ignored files, SHA manifest and restore rehearsal.
Only then approve a bounded deletion diff. Never include private evidence in public ZIP.

## Release / rollback / owner decisions
1. Owner: fix Git OAuth workflow scope, then separately approve feature push and PR
creation to trigger main-targeted CI. No auth changes/push/PR performed here.
2. QA owner: native iPhone Safari + VoiceOver and incomplete axe review; hosted owner:
identify the intended nine functions from authorised exported evidence. Do not query production.
3. After CI/review: separately approve Pages source switch, reviewed merge and manual
public dispatch in that order; approve actual resulting main SHA, not historical f5672a9.
Preserve existing domain/HTTPS. Monitor site during switch; zero downtime not proven.
Public SHA-256 a609bf2a23f23cbf8a17eac6a0b153aa42a42e61026700a7ff9a84aafca0ce3d.
Emergency frozen v145 SHA-256 dac10adb378e71cb8dec62012e3c9f2afd42e6063a887ac1cf5f4a614c01525c.
Before merge a failed switch can restore old main/root only with owner approval.
After merge recover through independent approved v145 Actions workflow; do not revert
source to root or downgrade SW. v145 is fail-closed contact/landing, not interactive rollback.
Next interactive release after recovery must usev146+.
4. Hosted activation is a separate programme: provenance decision, disposable target
approval, reviewed58-file package and actual backup/restore/Auth/RLS rehearsal.
It is not a prerequisite for the isolated public synthetic demo and is not approved here.
5. Cleanup needs its own bounded instruction; no decision needed until after release gates.

Conclusion: no known material P0/P1 remains in verified public static-demo scope;
confirmed local invitation P1 corrected. Production/publication acceptance and
hosted authenticated-product readiness remain NO-GO pending the gates above.

## Final release execution — 2026-10-12

Starting candidate bae8d153bd43d62f3c7363635ba3cc09b5748e58, clean tree. Existing HTTPS GitHub keyring account minasyannarek13-RBB has scopes repo/read:org/gist, no workflow. No GH_TOKEN/GITHUB_TOKEN fallback exists. Existing SSH key authentication probe returned Permission denied(publickey); agent has no identities. Scope expansion/login consent was not requested automatically because founder requires an explicit provider approval step. No credential created/expanded, no push/PR/dispatch performed. Workflow changes are essential release/recovery/security gates; dropping them merely to bypass scope would invalidate the verified candidate. Remote main remains3a9d200; Pages legacy main/root, lc.open-gamer.com, HTTPS enforced.

Fresh executable QA: exact public ZIP55-file verification PASS; one targeted WebKit375 full journey PASS, EN/RU contact/mailto/copy, four roles, Follow/Content/Schedule/Live/Handoff/Return, refresh, keyboard/reduced motion, actual offline recovery and authenticated-query rejection.0 external/Supabase/Auth-storage accesses. HAR,7 screenshots and results: evidence/release-execution-2026-10-12/. Existing181 QA receipts not rehashed/rerun again. Existing32 axe screens report0 violations, but color-contrast/ARIA incomplete checks remain human accessibility acceptance, not full accessibility PASS. No compatible native iPhone interface is exposed by computer-use tools; Xcode/xctrace unavailable. Native iPhone/VoiceOver NOT RUN; desktop WebKit is not native proof. Hosted staging/migration/security blockers unchanged; no production query or hosted writes.

Remote CI: NOT RUN, Draft PR: NOT CREATED, feature push: BLOCKED on existing authentication. Next explicit approval: GitHub OAuth workflow-scope consent (or owner supplies an already-authorised workflow-capable method), then use already granted feature-push/Draft-PR/CI authority. After green CI and device/accessibility acceptance, separately approve source switch → reviewed main merge → manual public dispatch at exact approved resulting main SHA/public ZIP hash. Frozen independentv145 recovery needs its own approval and current main SHA. Preserve FINAL CODEX CLEANUP HANDOFF: existing cleanup table/manifests and rollback remain HOLD, no deletion authorised. Production unchanged.
