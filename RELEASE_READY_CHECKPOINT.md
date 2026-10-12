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

Previous PARTIAL contrast gate superseded in the audited scope. Existing53 unmeasured Chromium375 elements:42 text PASS,1 essential icon-only control PASS under non-text contrast,8 redundant/decorative glyphs,2 empty inputs with no text. None remains unmeasured. Expanded EN/RU375/1440 Chromium/WebKit:40 page/role cases,1432 measured text instances PASS,8 non-text profile-control instances PASS,136 decorative instances,16 logotypes exempt from text contrast,16 empty inputs.0 measured failures/0 unmeasured after merged full pass + targeted robust recheck. Minimum ordinary-text ratio4.935:1; large-text minimum5.2005:1.0 axe supported-rule violations/ARIA incomplete/overflow; this is scoped automated acceptance, not full WCAG certification or physical-device acceptance.

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
