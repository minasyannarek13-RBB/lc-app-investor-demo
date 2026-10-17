# LC App V4 — verified local release checkpoint
Latest authority: **2026-10-17 consolidation and FINAL CODEX CLEANUP HANDOFF below**.
Earlier dated results are historical; current serving site has a confirmed broken demo entry.
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

## Auth retry / accessibility completion — 2026-10-12

Founder reported authentication complete. Fresh verification: repo admin/push rights present, but active gh keyring token still has repo/read:org/gist without workflow. One authorised feature push of1745989 was rejected by GitHub for lc-pages-fail-closed-rollback.yml lacking workflow scope; remote feature ref absent, main unchanged3a9d200.0 Actions runs for1745989. Draft PR/CI NOT CREATED/NOT RUN, not FAIL in code. Do not remove release/rollback/security workflows merely to bypass permissions. Provider action required: gh auth refresh --hostname github.com --scopes workflow, approve GitHub consent, then ensure Git uses the refreshed authorised credential. No scope/token expansion performed here. Feature push/Draft PR/CI remain authorised once this blocker clears.

Executed detailed contrast/ARIA/name/tabindex audits: Chromium+WebKit375/1440, landing and4 roles=20 cases.0 axe violations,0 document overflow. Fixed two explicit incomplete ARIA cases: core-loop div role=group and labelled navigation div role=navigation. After correction0 ARIA incomplete; gradients/pseudo-elements still prevent automatic color-contrast proof, so contrast is PARTIAL/REVIEW REQUIRED. Visible focused controls have outlines; WebKit Tab traversal is platform-dependent (some presses return BODY), not claimed as full native keyboard/VoiceOver acceptance. Native iPhone/VoiceOver NOT RUN.

Fresh affected gates: Node156/156, infrastructure25/25, secret scanner PASS, root/nested product parity PASS, deterministic public build55-file PASS and immutable recovery13-file PASS. Mobile WebKit375 full EN/RU/four-role journey, follow/reminder/live/handoff/return/CTA/deep refresh/offline/privacy PASS;0 external/Supabase/Auth-storage requests. Evidence: evidence/final-accessibility-2026-10-12/. Original181 receipts preserved and not repeated. Backend DB44/44 reused (SQL unchanged).

ACTIVE public ZIP SHA now d85d3bb6c2daa50742aefb0b779403c18af9957774b0c0de1b19458b2a7755bc; this supersedes all previous public approval hashes in this checkpoint/historical reports. contract.json and manifest repinned. v144 retained only because it has never been published; this is a pre-release candidate refinement, not an authorised cache downgrade/replay. Original ZIPa609bf remains in prior evidence. Frozenv145 rollback SHA unchanged dac10adb378e71cb8dec62012e3c9f2afd42e6063a887ac1cf5f4a614c01525c. Before authorised deployment inspect current remote serving SW and never sendv144 afterv145 recovery.

Production path after external gates: feature push → Draft PR/green CI → separately approved Pages Actions switch while main still3a9d200 and domain/HTTPS monitored → separately approved reviewed merge → record/approve resulting exact40-hex main SHA → separately approved lc-pages-public-release.yml manual dispatch (release_mode=public, expected_sha=approved resulting main, expected_zip_sha256=d85d3bb6c2daa50742aefb0b779403c18af9957774b0c0de1b19458b2a7755bc) → production55-byte-hash/UX/privacy/CDN smoke. Recovery separately approved independent lc-pages-fail-closed-rollback.yml with current approved main SHA/frozenv145 hash. No merge, settings, dispatch, deploy, DNS, Supabase or cleanup mutations performed.

## PR19 remote CI acceptance — 2026-10-12

Verified published head d45baa01a1264429b926c23d7090dd5a06d74aa5 on codex/lc-v4-release-ready-2026-10-12; PR19 OPEN/DRAFT targeting main: https://github.com/minasyannarek13-RBB/lc-app-investor-demo/pull/19. Previous authentication blocker RESOLVED. No correction required.
- LC App Regression Tests SUCCESS,156 tests/156 pass/0 fail: https://github.com/minasyannarek13-RBB/lc-app-investor-demo/actions/runs/38236006843
- LC App Release Gate SUCCESS: https://github.com/minasyannarek13-RBB/lc-app-investor-demo/actions/runs/38236007187 — JS syntax, private credential scanner, product boundary, canonical migration source, no public QA harness and mirrored runtime parity all completed successfully.
- Historical source-writer jobs SKIPPED as intended. Main protection endpoint404: no required-status enforcement installed; green project gates are not branch protection. Runner warning about Node20 action runtime deprecation is nonfatal; Node regression suite uses configured Node22.
- GitHub reports an existing automatic Vercel preview/status SUCCESS from the founder's push. No Vercel deploy/dispatch was performed by this turn; no extra push issued merely to publish documentation. Review automatic preview integration before any future pushes; do not create another site.
- Fresh current-commit artifact verification: public55 and rollback13 allowlists/ZIP/file hashes/privacy PASS. Active public SHA d85d3bb6c2daa50742aefb0b779403c18af9957774b0c0de1b19458b2a7755bc; frozenv145 SHA dac10adb378e71cb8dec62012e3c9f2afd42e6063a887ac1cf5f4a614c01525c. Existing clean-build, infrastructure25, DB44 and mobile journey evidence remains applicable; no code/artifact changes this turn.
- Automated accessibility completed within available scope: existing20 Chromium/WebKit cases,0 violations/overflow and0 ARIA incomplete. Additional Chromium375 rendered-background contrast sampling across landing/4 roles:158 elements,105 sampled above threshold,53 unmeasurable (zero usable glyph samples), no measured below-threshold case. Sampling is supplementary, not full WCAG certification; gradients/pseudo-elements and fixed controls still require reliable manual colour review. Native iPhone/VoiceOver NOT RUN.
- Main/Pages read-only post-check: main3a9d2008689312f4642fa42a1fc8c658e92a42be; Pages legacy main/root, lc.open-gamer.com, HTTPS enforced. No merge/deploy/source switch/DNS/Supabase/cleanup/LinkedIn mutation. Hosted security/recovery and052–054 provenance blockers remain for backend activation, independently of isolated public-demo release.

Evidence: evidence/ci-accepted-2026-10-12/ (actual remote logs, acceptance receipt, raster evidence); existing final-accessibility results retained. This checkpoint update is LOCAL/UNCOMMITTED documentation only so the CI-accepted published candidate SHA remains unchanged; no untested source fixes are waiting.
Next approvals: complete human contrast/native-device acceptance or explicitly accept those outstanding risks; separately approve Pages Actions source switch with monitoring while main is still3a9d200, reviewed PR merge, and manual public deployment using resulting approved main SHA and active ZIP hash. Frozenv145 recovery separately authorised if needed. Neither manual release workflow nor real OIDC/Pages deploy has been executed; zero-downtime remains unproven. Existing cleanup handoff remains HOLD.

## Rendered contrast release gate — 2026-10-12

Previous PARTIAL contrast gate superseded in the audited scope. Existing53 unmeasured Chromium375 elements:44 text/value PASS,1 essential icon-only control PASS under non-text contrast,8 redundant/decorative glyphs. Input.value was measured explicitly; empty innerText is not an exemption. None remains unmeasured. Expanded EN/RU375/1440 Chromium/WebKit:40 page/role cases,1448 measured text/value instances PASS,8 non-text profile-control instances PASS,136 decorative instances,16 logotypes exempt from text contrast. All16 input-value cases PASS; input evidence: inputs/contrast-results.json.0 measured failures/0 unmeasured after merged full pass + targeted robust recheck. Minimum ordinary-text ratio4.935:1; large-text minimum5.2005:1.0 axe supported-rule violations/ARIA incomplete/overflow; this is scoped automated acceptance, not full WCAG certification or physical-device acceptance.

Real failures:44 repeated low-contrast label occurrences across contexts (workspace-access heading, sidebar sublabels/verification note/network/boundary captions), approximately3.77–3.86:1. Corrected only shared dim alpha.43→.55 and business-label alpha.42→.55 in canonical source CSS and concatenated public stylesheet; workspace label now minimum5.6753:1. No layout/fonts/portraits/component behavior changed. Previous capture artefacts came from full-page/fixed-position coordinates, sticky navigation occlusion and test-style injection triggering the layout observer. Robust recheck centers targets and installs the glyph-hiding style once before measurement, without changing backgrounds/currentColor borders/pseudo layers.

Method: CSS/user-agent foreground (-webkit-text-fill-color), font size/weight, actual rendered background from paired element clips with only glyph fill/shadow suppressed, alpha compositing including transparent text, linear-sRGB luminance and unrounded4.5:1 ordinary /3:1 large thresholds. Glyph anti-aliasing pixels locate background samples; anti-aliased edge colors are not treated as the normative foreground. Source: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html ; non-text scope: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html . Redundant glyphs accompanying visible text labels are enumerated as decorative, not counted as PASS. The icon-only profile control is explicitly tested under SC1.4.11 in8 engine/language/viewport cases, minimum12.9404:1 against the3:1 threshold; aria-hidden alone is never an exemption. Evidence: nontext/contrast-results.json. Dynamic photos/gradients in other unvisited screens, native rendering, forced colors and all possible interaction states are not blanket-certified.

Keyboard QA additionally reproduced a real first-direct-RU-load B2B-contact bug: initial banner href keptlang=en although UI later translated toRU. Public bootstrap now establishes validated query EN/RU before mount without reading storage; existing locale translator normalises the contact href on every render (including saved locale). Existing strict bootstrap no-storage/no-Auth/network tests preserved; new first-mount regression added.32 focused CTA/Enter/locale/responsive cases PASS in both engines, EN/RU375/1440/four roles. Focus ring visible; this is browser-engine keyboard QA, not native iPhone VoiceOver proof. Relevant Node12/12 PASS; local build/55-file privacy+allowlist PASS; frozen13-file recovery unchanged. Earlier infrastructure25 and DB44 retained where code unchanged.

ACTIVE ZIP SHA a28dec08895e0307b948c0d82b112ed9808b2ad617222c335b18385046be6078 supersedes all previous public hashes. Measured stylesheet is byte-identical in final ZIP (SHA c5b16228ed6f8360f4a84db571a7f7b348d08ee1716fcf0fec625bcbf43e2c1e); later startup-locale fix does not change measured stylesheet. Publicv144 is still pre-publication; no serving-cache downgrade allowed afterv145. Rollback SHA remains dac10adb378e71cb8dec62012e3c9f2afd42e6063a887ac1cf5f4a614c01525c.

Evidence: evidence/contrast-final-2026-10-12/summary.json, original-53-disposition.json, final-contrast-results.json, paired clips/metadata, recheck/keyboard-results.json, final-targeted-node.txt, final-public-verification.json, final-rollback-verification.json. Exact published SHA, PR state and final CI run URLs/results are recorded in evidence/contrast-final-2026-10-12/remote-ci.json after remote acceptance; this avoids a self-referential commit hash in tracked documentation. Release acceptance requires both LC App Release Gate and LC App Regression Tests SUCCESS at that exact head. No merge/source switch/manual deploy/DNS/Supabase/cleanup/LinkedIn action is authorised or performed.

### Native iPhone / VoiceOver checklist — NOT RUN
1. Record physical device, iOS/Safari version, VoiceOver settings, exact candidate SHA/allowlist ZIP and authorised QA URL; never substitute an emulated viewport.
2. EN andRU: traverse all11 guided scenes and enter the same demo; verify language persists through role changes and keyboard/VoiceOver activation of contact CTA.
3. Swipe/rotor order and names: navigation, roles, headings, buttons, inputs and native business-section select; no traps or hidden controls receiving focus.
4. Complete Discover→Creator→Follow→Content/Schedule→Live→synthetic operator handoff→Return; verify state announcements, selected/pressed states and illustrative/unverified labels.
5. Check portrait/landscape, Safari toolbars/safe areas, large text/zoom and visible focus not obscured by sticky navigation; verify reduced motion and no unexpected auto-scroll.
6. B2B CTA: correct mn@open-gamer.com composer and copy feedback/denied-clipboard fallback; cancel composer, do not send. Check invalid deep links and error recovery with VoiceOver.
7. Test offline/reopen and approved SW upgrade on candidate access; inspect network for0 Supabase/Auth requests and record screenshots/VoiceOver observations. No production DB, wagering, payments or KYC/AML action.

Remaining risks: native device/VoiceOver NOT RUN, full accessibility conformance beyond audited screens/states not claimed. Hosted backend/migration provenance052–054 remains separately blocked and is not needed for the isolated public demo. Existing cleanup handoff remains HOLD. Production still requires separate monitored Pages switch, reviewed merge and manual dispatch approvals with resulting main SHA and ACTIVE ZIP hash; independentv145 recovery approval remains separate.

## Final consolidation — 2026-10-17

Project: LC App | Version: 1.2 | Status: LOCAL RC VERIFIED; PUBLIC RELEASE BLOCKED
Owner: Narek | Audience: founder, release engineer, security reviewer
Sources: current Git/PR19, read-only GitHub/Pages/Vercel/Supabase catalogues;
`evidence/consolidation-2026-10-17/`. No new business assumptions introduced.

### Source of truth and implemented corrections

- Starting local HEAD = remote PR19 head = `8e65946797f2fc542b3e97eb471ab4d77c5738d1`;
  branch `codex/lc-v4-release-ready-2026-10-12`. PR19 OPEN/DRAFT, base main.
  Remote main remains `3a9d2008689312f4642fa42a1fc8c658e92a42be`.
- Local build P1 fixed: replace `/private/tmp/lc-performance-build` default with project
  dependency resolution; esbuild exactly 0.25.12, private package.json and committed lockfile.
  Version mismatch fails before specialization. Independent npm-ci build reproduces both ZIPs.
  Tooling only; public JS/CSS/assets and approved product behavior unchanged.
- Security correction prepared as CLI-created migration
  `supabase/migrations/20261017100844_blocked_pair_rpc_privacy.sql`.
  Public wrapper requires a non-NULL authenticated participant; anon EXECUTE revoked in the
  proposed SQL only. Unrestricted lookup moves to `lc_private`, inaccessible to client roles.
  Existing SECURITY DEFINER internal callers use that private helper; the ownership-guarded
  invoker reminder trigger keeps the public participant wrapper. No RLS policy is replaced.
  Unknown invoker callers fail migration rather than silently gaining privileges.
- Database runner now proves baseline disclosure, corrected caller isolation, participant
  symmetry, NULL denial, private ACLs, blocked/unblocked feed visibility and denied blocked
  follow/like/comment; existing notification/reminder/security matrix remains 44 PASS.
  Full schema/ACL snapshot → migration → rollback → exact dump comparison → reapply PASS.
  Separate minimal local production-shape fixture uses exact live function bodies and six
  policies; migration and exact schema/ACL rollback PASS. This is not hosted Auth/RLS acceptance.
- Existing untracked `LC_APP_INTEGRITY_AUDIT.md` preserved, not staged or rewritten.

### Current evidence and verification scope

| Gate | Result | Receipt |
|---|---|---|
| Local Node regression | 157/157 PASS | node-tests.txt |
| Infrastructure regression | 25/25 PASS | python-tests.txt |
| Full local database replay | 59 available migrations; 44 existing security gates PASS plus privacy/RLS assertions and rollback parity | db-tests.txt, db/ |
| Production-shape local correction/rollback | PASS, synthetic rows and exact live function/policy source | production-shape-test.json |
| Independent clean npm-ci build | PASS; exact existing public/fallback SHA | clean-npm-ci.txt, clean-build-parity.json |
| Pinned release/rollback integrity | PASS; 55/13 paths, privacy and hash verification | artifact-integrity.json |
| Chromium/WebKit 375/768/1440 | 6/6 PASS; EN/RU landing, four roles, feed/follow, creator/reminder/live, scripted handoff/return, keyboard/reduced motion, refresh/offline, alias routes | browser/browser-results.json |
| Public-demo isolation | 0 forbidden backend requests and Auth-storage accesses in six cases | browser/browser-results.json |
| Existing contrast/ARIA evidence | 26 JSON receipts rehashed, 0 mismatches; prior 40-case scope preserved: 1,448 text/value PASS, 8 non-text PASS, no unmeasured samples | accessibility-receipt-check.json |
| Syntax, secret scan, npm audit, diff hygiene | PASS; npm audit 0 vulnerabilities | security.txt, npm-audit.json; final source checks |
| Remote GitHub CI | Regression and Release Gate SUCCESS at starting SHA, not at the new unpushed commit | remote-regression.json, remote-release-gate.json |
| Native iPhone/VoiceOver | NOT RUN | acceptance checklist below |

Runtime bytes are unchanged; prior rendered contrast sampling is reused, not reported as a
fresh measurement or full WCAG certification. Fresh browser evidence covers the same public ZIP.
Follow/unfollow, schedule, content, notifications and operator transitions remain synthetic;
LC App does not take bets, payments, settlement or operator KYC/AML responsibility.

Active public ZIP: `releases/lc-v4/public-v144.zip`, SHA-256
`a28dec08895e0307b948c0d82b112ed9808b2ad617222c335b18385046be6078`.
Frozen recovery ZIP: `releases/lc-v4/fail-closed-v145.zip`, SHA-256
`dac10adb378e71cb8dec62012e3c9f2afd42e6063a887ac1cf5f4a614c01525c`.
Recovery is a contact/landing fallback, not a complete interactive application rollback.

### Public website: confirmed available, confirmed funnel defect

Independent unsandboxed checks and DNS resolvers 1.1.1.1/8.8.8.8 succeed:
`lc.open-gamer.com` CNAME → `minasyannarek13-rbb.github.io`, GitHub Pages addresses.
HTTPS certificate validation succeeds; `/` and `/LC_App_GitHub_Pages_Upload/` return 200.
The sandbox's DNS/network failure is a false negative for public availability.
Pages still uses legacy main/root, domain unchanged, HTTPS enforced; approved certificate
expires 2026-12-06. No DNS/TLS repair is warranted from this evidence.

**P0 public funnel remains broken:** the live demo route
`/LC_App_GitHub_Pages_Upload/?app=1#/product/demo/player` renders
“Supabase is not configured” / required public runtime key. Both Chromium desktop and
WebKit 375 reproduce it; LC_APP_MODE is absent and the V4 product shell does not mount.
Do not add a hosted key as a public-demo repair: publish the already isolated public ZIP.
Old live landing lacks the candidate's explicit demo/contact links and canonical metadata;
live robots.txt and sitemap.xml return 404; serving SW is v118. Candidate contains canonical
SEO files and working B2B/demo CTAs. No mail was sent. Existing live pages have no observed
horizontal overflow or JS exception in these checks; this does not make the broken funnel PASS.
Receipts: public-http.json, public-browser.json, public-*.png, DNS receipts.

### Supabase P1: proven endpoint and vulnerable semantics; correction not applied

Read-only production catalogue `aspbwgsfkebduvviyeuo` confirms:
`public.is_blocked_pair(uuid,uuid)` is STABLE SECURITY DEFINER, search_path=public,
EXECUTE for postgres/anon/authenticated/service_role; no actor/parameter ownership guard.
Six policies depend on it: posts_select_visible, comments_select_visible,
post_likes_select_visible, follows_insert_own, comments_insert_own, post_likes_insert_own.
Three current hosted internal callers: notify_new_follower, notify_post_like, notify_comment.
The newer local chain has additional reminder/live-signal callers; the migration handles
both schema generations without requiring the missing newer trigger in production.

An anonymous HTTP GET to PostgREST RPC with two all-zero synthetic UUIDs returns 200/false.
Thus endpoint exposure is proven, not inferred from a nullable pgrst setting. No real user UUIDs,
private relationships, credentials or user data were sampled. The exact hosted function body
on synthetic local blocked/unblocked rows discloses the boolean anonymously: exploit semantics
are demonstrated locally. Production relationship enumeration was intentionally not performed.
This is private relationship inference, not proof of account takeover or gambling-wallet exposure.

Review `production-catalog-normalized.json`, `postgrest-synthetic-readonly.json`, proposed
migration and tests. Functions should restrict execution and definer search paths as described
in [Supabase function security](https://supabase.com/docs/guides/database/functions).
Before separately approved hosted application: recapture body/owner/ACL/policies/callers,
review exact diff, confirm private schema is not exposed, preserve a current rollback and backup,
then test in an authorised disposable hosted environment. Staging currently has zero public
tables; it cannot validate application RLS. No production/staging SQL writes occurred.
`production-privacy-rollback-PROPOSAL.sql` restores the observed older source/ACL only;
`db/privacy-rollback-local-only.sql` restores the newer local schema. Never interchange them.
Emergency rollback reintroduces the vulnerability and requires explicit approval. Prefer a
reviewed forward correction; neither rollback is an automated deployment instruction.

### Legacy Vercel: diagnosed; project-only change prepared

Read-only Vercel API confirms `lc-app-review` links to canonical repository, production branch
main, root `LC_App_GitHub_Pages_Upload`; no deploy hooks. Git feature pushes generated previews.
The latest exact starting-SHA deployment is ERROR `git_info_fail`; several earlier feature
previews are READY. This is a Vercel Git-metadata failure, not a failing GitHub regression gate.
SSO protection is enabled for all_except_custom_domains. Listed aliases are Vercel domains;
`lc.open-gamer.com` is assigned to GitHub Pages, not either inventoried legacy Vercel project.
`lc-app-preview` is a separate repository/project, linked to its own main, root unset, latest
preview READY, same SSO protection. No dependency of canonical Pages release on it is established.

Safest bounded proposal: project-only `previewDeploymentsDisabled=true` on `lc-app-review`,
keeping repository connection, domains, production branch and existing artifacts. Exact PATCH,
current/default-null rollback and acceptance steps: `vercel-preview-disable-PROPOSAL.json`.
[API reference](https://vercel.com/docs/rest-api/projects/update-an-existing-project).
No Vercel config file added, no project disconnected/deleted, no setting changed. This proposal
stops preview auto-deployments; it does not disable main/production Git deployments. Obtain
separate Vercel approval before any newly authorised push; main merge also needs its own gate.

### Migration provenance and replacement recovery boundary

Fresh bounded search: 130 SQL files, 28 ZIP archives, workspace plus Downloads LC sources,
all current local Git refs; original 052–054 not found, no search errors. Same-day integrity
receipts for historical object stores are retained without claiming whole-Mac completeness.
057–058 remain reconstructed, not recovered originals. Current chain is 59 files including
both dated local security corrections; frozen historical 57-file archive remains unchanged.
No invented historical SQL. Replacement plan remains DISPOSABLE_SUPABASE_RECOVERY_RUNBOOK.md:
founder accepts missing-history provenance → new reviewed 59-file manifest/package → authorised
disposable hosted replay → Auth/Storage/RLS and backup/restore rehearsal → separate activation
approval. Existing 57-file STAGING_HANDOFF.zip is historical and must not be applied as the
current complete chain. Hosted recovery is not a dependency of the isolated public demo.

### Physical iPhone / VoiceOver acceptance — all NOT RUN

No actual iPhone/VoiceOver control interface was available; WebKit automation is separate.
QA owner must record device, iOS/Safari version, date, build SHA, ZIP hash and result per item:

- Open landing in fresh Safari, navigate EN/RU, enter demo; verify viewport/safe areas at 320–430px equivalent, portrait/landscape and text zoom without clipped controls.
- VoiceOver swipe/rotor: meaningful heading order, landmarks, labelled language/role controls and visible focus; no trap in guide or modal; focus returns to opener.
- Discover → game choice → dealer profile: confirm names, descriptions, follow/unfollow announcement and state; no reliance on colour alone.
- Feed/content → schedule/reminder → notifications: read changed states and selected controls without duplicate hidden labels.
- Live preview: announce synthetic boundary; operate scripted round/chat/reaction; dismiss overlays with accessible controls.
- Operator handoff → return: announce simulated transition and responsibility boundary; retain locale/context without implying a real operator integration.
- Pilot/contact: open correct mailto draft to mn@open-gamer.com in EN/RU; verify copy fallback and live-region confirmation; do not send.
- Reload, Safari back/forward and offline reopen: recover demo state safely; no Auth/private data entry or private-cache exposure.

### Exact release sequence and approvals

1. Review this local commit/diff. Separately approve the bounded legacy Vercel preview setting;
   read it back before separately authorising `git push origin HEAD:codex/lc-v4-release-ready-2026-10-12`.
2. Existing PR19 updates automatically; re-read head and rerun/await Regression Tests and Release
   Gate on that exact new SHA. Prior green CI is not acceptance of unpushed changes.
3. Complete physical-device acceptance or explicitly accept its outstanding risk. Review public
   ZIP hash and frozen recovery; inspect currently serving SW before approving publication.
4. Separately approve Pages legacy→Actions source switch while old main remains preserved;
   monitor current domain during switch. Separately approve reviewed PR19 merge. Record and approve
   the resulting full main SHA. Account for legacy Vercel main auto-deployment before merge;
   if unwanted, separately approve its Git disconnection/config boundary first. No merge yet.
5. Separately authorise manual `lc-pages-public-release.yml` dispatch with release_mode=public,
   expected_sha=approved resulting main SHA, expected_zip_sha256=`a28dec08895e0307b948c0d82b112ed9808b2ad617222c335b18385046be6078`.
   Recheck exact 55-file live hashes, canonical URLs/robots/sitemap, mobile EN/RU complete journey,
   contact, HTTPS and no Supabase traffic. Zero downtime has not been proven.
6. If needed, separately approve independent `lc-pages-fail-closed-rollback.yml` at current approved
   main SHA and frozen v145 hash. After v145 activation use v146+ for any future interactive build;
   never downgrade SW to v144. SQL security remediation follows its own approval/rehearsal path.

No push, merge, deployment, Pages/DNS/Vercel configuration, Supabase write, credential change,
paid resource, outreach, LinkedIn post or destructive cleanup was performed.

## FINAL CODEX CLEANUP HANDOFF — 2026-10-17

Canonical: this repository and PR19 feature branch; only `releases/lc-v4/contract.json` allowlists
are publication sources. The original source modules plus delivery specialization are intentional.
Inventory: canonical-source-inventory.json; preserved prior cleanup manifest; same-day historical
comparison/object-gap/untracked-source receipts. Review proposed deletions only after verified backup.

| Resource | Preserve / proposed diff / dependency | Disposition |
|---|---|---|
| Current root/nested runtimes, V2-named CSS, V3/V4 layers, dealer portraits | Current app/build/SW depend on them; preserve locale fixes, role journeys, privacy boundaries | KEEP; names/hashes alone do not prove duplication |
| showcase-v2, static_preview and nested static_preview, 02_OPEN_STATIC_PREVIEW.html | Historical screen/game evidence; 28 earlier hashed file candidates in preserved manifest; archive and update inbound README links before a bounded deletion diff | HOLD; no deletion |
| legacy-preview.js and inline legacy block | Still build/loader-dependent and in public allowlist | KEEP until replacement build/browser/PWA acceptance |
| sibling lc-marketing-content-alignment worktree, 1bf3dea | Same Git store, separate branch; inspect unique marketing patches, do not blindly merge historical content | HOLD; archive snapshot and refs before removal |
| Downloads LC_App_GitHub_Pages_Upload / visual-2-reveal, ef5d2c6 | Separate historical object store; integrity audit identifies six historical commits and seven untracked source paths requiring disposition | KEEP pending verified backup and per-patch/asset review |
| LC_APP_PLATFORM, 601f0dc; AndroidStudioProjects/LCApp | Independent platform/native source; not replaced by static demo, not declared dead code | OUTSIDE cleanup deletion scope; preserve |
| GitHub lc-app-preview and Vercel lc-app-preview | Independent legacy repo/project; no canonical Pages runtime dependency established, unique source not exhaustively reconciled | HOLD; separate deletion approval and export/restore proof |
| Vercel lc-app-review | Canonical Git auto-preview integration, separate from Pages; proposed preview-only setting above | KEEP; configuration approval separate |
| historical branches, detached/dangling objects, release evidence, old ZIPs and 57-file handoff | Rollback, provenance and unique-history value; do not prune/repack/drop refs before off-device snapshot | KEEP; no history cleanup |
| tooling | Add project-owned pinned esbuild/lockfile; external Playwright/Lighthouse remain QA tooling, absent from public ZIP | Dependency correction implemented; no package uninstall |
| older README/checkpoint/release reports | Historical claims superseded by dated section; current README points here. Preserve old evidence; no wholesale strategic rewrite | Only current references corrected |

No unreferenced file is declared safe to delete solely from a text-reference scan. Older source
uniqueness and private/offline backup coverage remain incomplete. Proposed cleanup rollback:
owner-approved encrypted snapshot of both object stores including reflogs/unreachable objects,
all untracked/ignored assets and affected refs; two storage locations, hash manifest and restore
rehearsal; then approve an exact path/branch/project deletion manifest. `git bundle --all` alone
omits unreachable objects. Restore removed assets/refs into a separate directory, verify hashes,
then selectively restore only reviewed content. Do not delete or merge independent business repos.
Cleanup is review-ready as a HOLD proposal; it is not authorised or safe to execute yet.
