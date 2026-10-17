## Final consolidation — 2026-10-17 (current)

- Canonical branch/PR19 verified at starting SHA 8e65946797f2fc542b3e97eb471ab4d77c5738d1; local changes committed separately, no push. See RELEASE_READY_CHECKPOINT.md dated consolidation for the authoritative evidence, approvals and FINAL CODEX CLEANUP HANDOFF.
- Fixed project-owned build dependency pinning; clean npm-ci rebuild matches unchanged 55-file public ZIP and frozen 13-file recovery. Prepared participant-scoped block RPC correction, private internal helper, privacy/RLS regression and exact schema/ACL rollback. Hosted SQL remains untouched.
- Fresh 157 regression / 25 infrastructure / 44 DB security gates plus privacy assertions and rollback PASS; Chromium/WebKit 6/6, no backend/Auth-storage access. Prior contrast JSON receipts rehashed without rerunning unchanged measurements. Native iPhone/VoiceOver NOT RUN.
- Public domain/DNS/TLS work. P0 is the old main/root demo entry showing missing Supabase config; the isolated V4 package fixes that route locally. Production helper RPC is anonymously reachable, vulnerable source semantics reproduced on synthetic rows. Legacy Vercel auto-preview and git_info_fail confirmed; project-only preview-disable proposal awaits approval.
- Missing 052–054, reconstructed 057–058 and empty staging remain separate hosted-activation blockers. No DNS/Pages/Vercel/Supabase writes, deployment, messaging or destructive cleanup.
- Next action: founder reviews the local diff and separately authorises the bounded Vercel preview change before feature push/PR19 CI.

## Release infrastructure hardening — 2026-10-11

- Local candidate preparation: manual public release and independent frozen-v145 rollback workflows, required full commit/ZIP SHA inputs, per-file SHA/size and exact allowlist verification, current-main/Pages-domain/HTTPS rechecks, bounded timeouts and shared deployment serialization. Frozen packages live in `releases/lc-v4/`; publication remains separately authorized.
- Public delivery specialization removes database adapter/RPC and private account-route implementations while preserving canonical authenticated sources.55 public paths retained; unchanged frozen v14513-file recovery. Old performance/preflight evidence and site snapshot retained outside Git staging.
- Obsolete shell script URL checks corrected; historical source-mutating automation disabled locally and contents-write permissions retired. Security contracts preserved and negative artifact/privacy tests added. Exact local commit and package receipts are recorded in the owner-only hardening report after verified commit.
- No push/merge/dispatch/deploy/Pages/DNS/hosted writes. Next: owner review of local candidate, then separately authorized feature push, remote CI, source switch before merge, approved main SHA dispatch and production smoke.

### AI_SYNC — consolidated release hardening

Date: 2026-10-11 | AI: Codex | Project: LC App | Task: close local P0 release infrastructure blockers.
Created: independent rollback workflow, pinned artifact contract/manifests/ZIPs, package/target gates, public delivery specializer and negative tests. Updated: manual release workflow, stale CI, retired source-writer workflows, builder, public CSP, staging exclusions and this state.
Decisions: no product/business decision changed; recovery uses frozen v145 bytes without application build/npm; public and authenticated source delivery are separated. Assumptions: local dry-run cannot validate GitHub deployment/OIDC or zero downtime; source repository remains public.
Contradictions resolved: inactive DB/Auth code in public payload; fallback dependency on main build; candidate SHA ambiguity resolved by local commit receipt. Open: remote installation/checks and actual existing-domain V4 acceptance require explicit publication approval.
Recommended next action: review candidate/ZIP hashes and authorize only the feature-branch push when ready.

## Production preflight — 2026-10-11

- Canonical report: `LC_APP_V4_PRODUCTION_PREFLIGHT_2026-10-11.md`. Result: artifact integrity PASS, production PREFLIGHT FAIL / NO-GO; earlier local lab GO remains valid.
- Fresh read-only Pages/API and live byte checks confirm legacy main/root, serving SHA `3a9d2008689312f4642fa42a1fc8c658e92a42be`, existing domain/HTTPS, SW v118. Real Fastly gzip proven for HTML/CSS/JS; br-only replies identity.55/13 ZIP paths, sizes and SHA manifests match; Node156/156 and scanner PASS.
- Blockers: release workflow local only, stale shell-workflow script assertions fail, candidate is uncommitted (no approved release SHA), fallback dispatch depends on full build/tests/npm, approved ZIP SHA not enforced by workflow. Shared inactive database adapter branches remain in public bundle, so strict private-code exclusion is not satisfied despite Auth SDK exclusion/network isolation.
- No push/merge/deploy/settings/DNS/hosted writes/source deletion/messages. Next: repair CI, independent hash-pinned recovery, resolve source-privacy requirement, then freeze reviewed candidate before publication approval.

### AI_SYNC — production preflight

Date: 2026-10-11 | AI: Codex | Project: LC App | Task: read-only production release preflight.
Created: consolidated preflight report and API/DNS/HTTP/package evidence. Updated: this execution state only; product/frozen packages unchanged.
Decisions: no approved product/business decision changed; production remains NO-GO until concrete blockers resolved. Assumptions: no zero-downtime guarantee; current gzip is not proof of deployed V4 performance.
Contradictions found: “Auth excluded” does not mean all authenticated source branches excluded; fallback bytes exist but recovery workflow is build-dependent. Open: final commit SHA, remote CI/recovery, source privacy, real-domain V4 QA.
Recommended next action: prepare a clean candidate with corrected CI and independent verified-artifact recovery before seeking release authorization.

# Current Release Checkpoint — 2026-10-11

Project: LC App | Version: v0.18 | Status: V4 production-like laboratory GO; external publication approval and production serving acceptance required
Owner: Narek / Engineering | Audience: founder and release engineer
Sources: ChatGPT connected Supabase external baseline 2026-10-10 (relayed by Narek), current code, tests, migrations, PR #18 read-only metadata; historical notes below are not current release evidence.

## V4 final performance sprint — current checkpoint, 2026-10-11

- Canonical result: `LC_APP_V4_PERFORMANCE_RELEASE_REPORT_2026-10-11.html`; exact receipts `evidence/performance-v4-2026-10-11/final-verification.json`. Supersedes the mobile performance NO-GO of the historical premium checkpoint below; does not certify hosted/private production readiness.
- Frozen mobile Player RU, Lighthouse13.5.0, same simulated mobile settings, 3 cold + 3 warm runs per plain/Brotli/gzip mode. Cold final Brotli: Performance99 (99–99), LCP median1.934s (1.734–1.934); gzip99 (98–99), LCP2.028s (2.027–2.081). Plain78 (77–78), LCP4.189s remains below target. All compressed cold runs pass both gates; not field Core Web Vitals.
- Delivery changes: responsive120/240 WebP avatars; Sofia AVIF with JPEG fallback and original crop; early critical preload; ordered defer runtime/CSS bundle; preserved legacy JS deferred on legacy route; UTF-8 delivery minification; single initial mount and observer feedback fix; offscreen images load before viewport entry. Original root landing and19 original image bytes unchanged.
- Fresh final Node156/156, secrets and generated-payload scan PASS; PostgreSQL local security40/40 + recovery reapply parity; browser6/6 Chromium/WebKit375/768/1440; premium EN/RU/11scenes/4roles4/4; exact v118→v144 / fail-closed v1454/4; lazy-scroll/crop/no-IO8/8; axe five mobile RU screens zero violations. 160 accepted screenshots /80 pairs, 36 baseline+final LH JSON/traces and12 final performance HAR saved. No critical regression detected.
- New allowlist55 files = previous39 retained +16 derived delivery assets, 7 changed existing paths, no removed paths/Auth. Public SHA256548d88dd4ca24259d865defd7e078cc242d3ff997751b7a7823cd175a29fb736; fail-closed13 files v145 SHA256dac10adb378e71cb8dec62012e3c9f2afd42e6063a887ac1cf5f4a614c01525c. Both deterministic rebuilds match. Baseline ZIP, earlier rollback versions and selected pre-sprint source backup preserved.
- Remaining external gate: verify existing Pages gzip/Brotli and post-publication real serving; physical iPhone/VoiceOver and field CWV unmeasured. Original F08 repetition and historical052–054/hosted-validation gaps remain. Separate approval required for push/merge/deploy/Pages source. No commit, push, merge, deployment, settings/DNS/hosted writes, source deletion or messages performed.
- Next: owner review/authorization for controlled publication to existing domain; switch main/root→Actions before merge, deploy only approved allowlist via manual full-SHA workflow; v145 fail-closed rollback. Recovery after installedv145 requires v146+ and fresh QA, never a lower-cache downgrade.

## Premium V4 controlled improvement — historical checkpoint, superseded for performance


- Current canonical result: `LC_APP_V4_PREMIUM_RELEASE_REPORT_2026-10-11.html`. Full V3 audit and 136 screenshots reviewed; 160 new accepted before/after frames (80 pairs), EN/RU desktop/mobile, all 11 scenes and four roles. Historical V3 GO below does not override this V4 premium release gate.
- P0 fixed: consistent Sofia original portrait, EN/RU continuity through roles/Pilot, mobile Operator/Provider navigation and labeled cards, consistent illustrative/not-verified identity, relative sample schedule, unavailable private settings. Original portraits/approved story strings and public_demo boundary preserved.
- P1: first-fold B2B clarity, compact role/demo controls, opt-in guide/manual reading, readable role layouts; distinct local campaign/mapping tasks and cross-role action trace. F08 story repetition remains partial; no invented clients, integrations, real activity or ROI.
- Fresh Node155/155; PostgreSQL local security40/40; Chromium/WebKit browser6/6; EN/RU premium routes4/4; exact v118→v142→fail-closed v143 upgrade/offline4/4; axe five mobile RU screens zero violations. Lighthouse mobile landing90/A11y100/Best100/SEO92; app68/A11y100/Best100, LCP8.5s on uncompressed local server with simulated mobile throttling. Production speed and native accessibility remain unverified.
- Public package unchanged 39 paths; fallback13 files; original image bytes/domain retained, Auth excluded; runtime/SW mirrors match. Frozen SHA/manifests/results: `evidence/premium-v4-2026-10-11/final-verification.json`. V3/v141 artifacts and source backup retained. No push/commit/merge/deploy/Pages settings/DNS/hosted writes/source deletion/messages.
- Next: targeted measured mobile loading pass, then repeat Lighthouse + functional/offline parity before premium production approval. Pages source must switch from main/root to Actions before merge after separate approval; manual SHA-guarded dispatch and post-release acceptance remain external gates.

### AI_SYNC — consolidated Premium V4 pass

Date: 2026-10-11 | AI: Codex | Project: LC App | Task: controlled P0/P1 UX changes and independent local release QA.
Created: canonical visual HTML report, premium QA/visual harnesses, exact V4/v143 ZIP/manifests and test/screenshot evidence.
Updated: root landing, mirrored product/SW, nested locale/layout/public shell, release builder/manual workflow, privacy assertions, execution state and domain plan.
Decisions: no approved business decision changed; public verification stays illustrative, simulated trace never implies commercial outcomes; V4 premium production gate NO-GO based on unresolved loading evidence.
Assumptions: local throttled Lighthouse is not production Core Web Vitals; browser WebKit is not physical iPhone; historical hosted evidence not refreshed.
Contradictions resolved: identity/locale/navigation/private-settings/fixture states. Open: mobile performance, F08 editorial repetition, native-device/VoiceOver and separately authorized publication.
Recommended next action: targeted loading optimization and comparable QA before release authorization.

## Final public release audit — 2026-10-11

- Current decision: LOCAL GO for isolated public static package; production publication unchanged and requires approval. Canonical report: LC_APP_V3_FINAL_RELEASE_AUDIT_2026-10-11.md.
- Private auth.js removed from deployment dependencies only; preserved in source. Dedicated public-demo-bootstrap.js replaces it, fixed 39-path allowlist retained. CTA: Discuss the project / Обсудить проект, email mn@open-gamer.com.
- Node154/154; exact ZIP/hash, secrets and YAML PASS; browser/mobile/offline6/6; upgrade4/4 and fallback2/2. Evidence: evidence/final-release-audit-2026-10-11. Historical package below is superseded by this audit package.
- AI_SYNC: Codex, LC App, final read-only release audit and local corrections. Decisions: public Auth bridge and main-only SHA-guarded manual release/fallback. Assumptions: no hosted/native-device acceptance yet. Next: separately approved source switch BEFORE merge and controlled Actions publication. No external writes or deletion.

## Latest V3 static public release preparation — 2026-10-10

- Existing EN/RU cinematic landing restored with all 11 scenes, exact four root portrait files, guided autoplay/pause/resume. Sole isolated demo retained with four roles; no active production SDK/Auth bootstrap. Confirmed Pilot email mn@open-gamer.com, bilingual mailto draft + copy fallback. Canonical/OG/robots/sitemap added; demo noindex.
- Fresh Node 152/152, local migration replay 57 and DB security matrix40/40; Chromium/WebKit browser/offline6/6, exact serving-v118→v140 PWA upgrade4/4, tested v141 fail-closed rollback in both engines, EN/RU/mobile visual/guided10/10. Ten HAR files contain zero external/Supabase requests. Four runtime mirrors match.
- gh read-only Pages settings: legacy main / root, HTTPS enforced, serving3a9d200. Original deployment artifacts unavailable; source archive saved under ignored backups, safe rollback ZIP prepared. Manual/main-only allowlist Pages workflow prepared locally; obsolete CI revision and secret-identifier false positives corrected.
- 39-file public ZIP and 13-file safe fallback with SHA256 manifests. Sources preserved, no push/merge/commit/deploy/Pages-settings/DNS/hosted writes or deletion. Existing untracked STAGING_HANDOFF.zip and package-lock.json retained.
- LOCAL STATIC RELEASE READY YES; externally published/production verified NO. Separate approved Pages-source switch to Actions BEFORE merge, workflow execution and post-deploy acceptance required. Authenticated product/SQL provenance and hosted recovery remain separate NO gates, not part of this static release.
- Canonical current report: LC_APP_V3_RELEASE_REPORT_2026-10-10.md; visual comparison and all evidence in evidence/v3-release-2026-10-10.

### AI_SYNC — consolidated V3 preparation
Date: 2026-10-10. AI: Codex. Project: LC App. Task: preserve public visual baseline, integrate isolated demo, SEO/contact, PWA migration/fallback, tests and existing-domain release plan. Updated runtime shell/SW, release builder, CI checks and control/readme; added SEO, contracts, secret scanner, upgrade harness and manual Pages workflow. Approved input: Narek supplied mn@open-gamer.com. No business/financial decisions changed; no external action performed. Confirmed serving source and local static readiness. Open: external publication authorization and post-deployment verification. Next: review exact 39-file package and approve existing-Pages release sequence.

## Latest one-pass A–D checkpoint — 2026-10-10

- Local branch `codex/lc-one-pass-2026-10-10`, base `924361a`; no commit/push/merge/deploy. Canonical root B2B site and a single nested app entry prepared. Immutable public_demo mode precedes modules; SDK/production config removed from public HTML; Auth returns before session/storage/bootstrap. Four public roles, no public Admin.
- SW v140 removes legacy preview dependencies, supports versioned JS/CSS offline, maps root/nested paths correctly, and preserves private/Auth cache exclusions. Public release ZIP contains 33 allowlisted files with verified SHA-256 parity; sources remain intact.
- Fresh Node 149/149 PASS. Local PostgreSQL 57 available migrations replayed; 057–060 replay parity, catalog and security matrix 40/40 PASS. Missing 052–054 remain UNKNOWN. Chromium/WebKit package E2E at 375/768/1440, HAR/screenshots, real loopback server outage and offline roles recorded in `evidence/one-pass-2026-10-10`.
- Remote trees/branch comparison and local dependency/duplicate inventory completed. 16 local archive candidates prepared; none deleted/moved. Verified local tar + Git bundle retain rollback. Pre-existing untracked STAGING_HANDOFF.zip and package-lock.json preserved.
- Public contact destination and Pages serving-source confirmation remain open; copied pilot introduction is the current honest contact action. Hosted migration/runtime/recovery gates remain unresolved. Native iPhone/VoiceOver and hosted performance are not acceptance evidence from this run.
- Canonical execution/audit/release/rollback report: `ONE_PASS_REPORT_2026-10-10.md`. Earlier entries below are historical.

### AI_SYNC — consolidated one-pass public-demo release candidate

Date: 2026-10-10 | AI: Codex | Project: LC App
Task: A–D local inventory, isolation, site/demo consolidation, QA and prepared cleanup.
Created: report; public-demo bootstrap tests; public-release builder; browser E2E harness; inventory, network, screenshots, SQL, backup and release-package evidence.
Updated: root/app entries, mirrored Auth/product/SW, manifests, launcher, tests, README/hosting notes and execution state.
Decisions: use one existing investor-descendant codebase; public Auth unavailable; retain all old sources and diverged security branches; deploy only the allowlist after separate approval.
Assumptions introduced: none concerning partners, demand, legal compliance or commercial results.
Contradictions found: older handoff missed existing investor bypass; default app still allowed production bootstrap; precache retained legacy previews and missed revisioned offline assets; older hosting notes required obsolete files.
Open questions: contact endpoint, Pages build source, authoritative 052–054 history and separately authorized hosted QA/recovery.
Recommended next action: founder review of the local package and confirmation of contact/release destination before any publication.

## Latest local replay acceptance — 2026-10-10

- Starting 0a98c3c; 57/57 available SQL migrations replayed into a fresh temporary PostgreSQL 17.11 cluster using test-only Supabase primitives. 057–060 reapplication schema+ACL parity PASS; schema audit and catalog integrity PASS; DB security matrix 40/40 PASS.
- Public schema: 34 tables, all RLS enabled. Full local object catalog and schema-only dump retained under evidence/local-replay-2026-10-10; no fixture data exported. All 001–060 dependency slots mapped; 052–054 UNKNOWN. No errors attributable to the missing migrations reproduced. Historical completeness remains blocked.
- Full Node suite 144/144 PASS after repairing two stale static assertions introduced by the preceding guard/cache update. No application behavior or migration SQL changed. Local runner isolates inherited PostgreSQL connection/password settings and can export repeatable evidence.
- Staging/production/hosted Auth/secrets/DNS/site unchanged; staging activation disabled. No new forensic search, merge/push/deploy or hosted user creation. Remaining gates: provenance decision/original source, real Supabase runtime acceptance, Dashboard/integration isolation, hosted E2E and recovery rehearsal.

### AI_SYNC — reproducible local migration chain

Date: 2026-10-10. AI: Codex. Project: LC App. Updated local replay runner, two stale test assertions, dependency/provenance map and staging/execution reports. Added dependency analyzer, catalog audit and local schema/catalog/replay evidence. Decision: present chain is executable locally; no corrective migration is justified. Missing 052–054 remain UNKNOWN; production is not a full-schema reference. Next: authoritative provenance resolution and separately authorized disposable Supabase rehearsal.

## Latest checkpoint — migration recovery and runtime safety

- Starting 279c5e2; no 052–054 original recovered from branches/history, 18 reflog trees, unreachable blobs, 126 local SQL files and 12 ZIP archives. No SQL changed; provenance gate remains BLOCKED. 057–058 reconstructions and hashes unchanged.
- Mirrored Auth runtime now rejects staging before client creation with code activation disabled. Approved-path tests reject missing/invalid/expired, production and service credentials; staging URL is pinned. Production config preserved; investor isolation preserved. Prepared `.env.example` requires explicit staging mode and public project-bound anon JWT; opaque publishable keys rejected.
- Targeted regression 42/42 PASS, Auth/SW syntax and mirror parity PASS. Cache revision v135 / Auth asset v75 invalidates stale runtime. No Safari/accessibility rerun, hosted connection/write/user creation, push, merge or deployment.
- STAGING READY NO: provenance, disabled activation, settings/isolation review, hosted E2E/integrations and backup/recovery remain unresolved.

### AI_SYNC — migration recovery/runtime guard

Date: 2026-10-10. AI: Codex. Project: LC App. Updated mirrored Auth/SW, nested application Auth asset revision, prepared template, staging reports/plan and migration forensics; created staging runtime safety tests. Decision: keep activation disabled; recover originals only, reject opaque staging credentials lacking project binding. No new product feature or active credential. Next: obtain authoritative 052–054 source before authorizing staging activation or remote execution. Earlier entries below are historical.

## Staging configuration and migration gate — latest follow-up

- Continue from ce40223; application runtime unchanged. No Safari/regression rerun and no hosted connection, user creation, SQL/config write, merge/push/deployment.
- Complete local production project-ref inventory recorded in `STAGING_READINESS_REPORT.md`: sample env, two Auth fallbacks, inline entry, two defensive test-runner constants. Dynamic external config/localStorage sources also require isolation checks.
- `.env.example` now prepares staging URL with blank publishable-key placeholder. Static app does not load dotenv; inline production config/fallbacks remain an activation blocker. No actual environment/credential changed.
- Detailed 052–054 source gap and 057–058 dependency/overwrite/rollback audit added to existing migration plan. Ordered immutable 57-file chain stays 001–051, 055–060; no migration file changed or placeholder invented.
- Existing security matrix extended with synthetic fixtures and Auth/RLS/Storage/tenant/Admin/cleanup positive/negative E2E scenarios, all NOT RUN. Manual Dashboard Auth redirects/providers/SMTP/hooks/integration evidence checklist prepared.
- STAGING READY NO. Accepted hosted baseline remains PASS with its original evidence attribution; configuration/provenance, recovery and hosted acceptance still block execution.

### AI_SYNC — staging configuration and migration gate
Date: 2026-10-10 | AI: Codex | Project: LC App
Task: Local reference inventory, staging environment template, dependency/rollback review and synthetic E2E/manual settings gates.
Files created: None; existing canonical files reused.
Files updated: .env.example, STAGING_MIGRATION_EXECUTION_PLAN.md, RELEASE_SECURITY_MATRIX.md, STAGING_READINESS_REPORT.md, LC_APP_EXECUTION_STATE.md.
Decisions: template prepared only; full-product runtime not activated; denylist production refs retained.
Assumptions: independently confirmed empty staging baseline is accepted without repeat audit.
Contradictions found: production sample config corrected; actual inline/default targeting still unresolved.
Open questions: 052–054 provenance, settings evidence, staging-only credential/mapping activation, hosted E2E and recovery authorization.
Recommended next action: collect Dashboard evidence and resolve provenance decision before approving exact staging activation/execution scope.

## Final QA and staging preparation — latest 2026-10-10

- Application code baseline 146b166 unchanged; previous 127/127 remains valid, no regression rerun.
- Native clean Safari profile LC QA isolated: both extensions off; zero observed permission errors on Inspector open/reload/reopen. Browser-environment dependence confirmed; exact source-map request attribution remains unverified. Primary remaining keyboard cycles completed (216 records). VoiceOver process access timed out; retries stopped. Physical iPhone BLOCKED. Investor Device Ready NO.
- Current read-only staging connector refresh PASS: ACTIVE_HEALTHY, PostgreSQL 17.11, all listed application counts zero, no migration ledger/Edge Functions/advisor findings. Receipt `evidence/staging-readonly-2026-10-10.json`; historical ChatGPT source remains separately identified.
- At the earlier ce40223 checkpoint, full-product config targeted production in inline entry, mirrored Auth fallback and `.env.example`; current template change is recorded above. No environment/secret/config modification. Auth URL/provider/SMTP/hooks settings unavailable through connector; dashboard requires login. Storage buckets/objects/policies and custom Auth-user triggers absent.
- Present 57 migration hashes match; 052–054 provenance unresolved; 057–058 still verified local reconstructions, not hosted acceptance. Ordered application/recovery/environment requirements updated in canonical plan. Staging Ready NO; Full Product Ready NO.

### Safe branch reconciliation plan

`codex/final-product-build` = 9f378e39940a005f38cedd013fb7103fc771d693; investor branch baseline = 146b166. Merge base equals the full-product tip. Ahead/behind is **0 full-product-only / 12 investor-only**: no divergent commits and no merge conflict to resolve. 54 non-evidence files differ, including 001–006/056–060 migration recovery, Auth, demo isolation/accessibility, cache/entry and tests/documentation. No merge, cherry-pick, ref movement or push was performed.

After founder release-direction approval: create an isolated integration checkout from the tested investor descendant; review the 12 commits by concern, preserve mirrored runtime parity and isolated demo entry, and prepare a staging-only configuration separately. Do not revert/cherry-pick older Auth/cache code over security hardening. If the historical full-product branch must be updated, a reviewed fast-forward is possible locally; ancestry alone does not verify full-product behavior. Do not include marketing branch/worktree. Validate only affected full-product authenticated paths when backend access/authorization exists, then complete hosted security/integration/recovery gates before any release decision. Existing `STAGING_HANDOFF.zip` and `package-lock.json` remain unrelated untracked files, untouched.

### AI_SYNC — final QA and staging readiness
Date: 2026-10-10 | AI: Codex | Project: LC App
Task: Clean-profile Safari follow-up, read-only staging audit, safe branch integration preparation.
Files created: Clean-profile console/extensions/keyboard evidence and staging connector receipt.
Files updated: canonical investor/staging readiness, migration plan, execution state; historical forensics supersession note.
Decisions: environmental Safari pair confirmed by clean-profile control; no application fix needed; all release readiness remains NO.
Assumptions: source-map per-error attribution remains probable; no remote secret-isolation assumption accepted.
Contradictions found: full-product config still targets production despite staging availability; historical hosted-access blockers now partly superseded.
Open questions: Auth settings/redirect and integration access, 052–054, VoiceOver, physical device, hosted E2E/recovery.
Recommended next action: obtain read-only management settings evidence and approve an isolated staging configuration/provenance decision before remote execution.

## Final device gate — latest 2026-10-10
- Native Safari investor journey exercised; final app v124 / shell v20 / cache v134 verified. Focus restoration, route-heading focus, toggle semantics, comment validation and inactive Following contrast fixed locally.
- 127/127 Node tests PASS. Canonical findings and evidence: `INVESTOR_DEMO_READINESS.md`, `evidence/safari-accessibility-closure-2026-10-10/`.
- Both resource-permission errors reproduce without LC JavaScript on static CSS and upon Inspector reopening. Extension source maps are likely; exact per-error request/initiator is unresolved. Private session retained DeepL and is not an extension-free control. No suppression applied.
- Reduced-motion sampled native runtime PASS; preferences restored. Keyboard/contrast/text-scaling acceptance PARTIAL. VoiceOver walkthrough BLOCKED by inaccessible speech/cursor automation. Physical iPhone BLOCKED: no connected inspectable device.
- INVESTOR DEVICE READY: NO. Earlier Safari RDM and in-app results below are historical; hosted baseline PASS and hosted release blockers remain unchanged.

## AI_SYNC — Safari accessibility closure 2026-10-10
Date: 2026-10-10 | AI: Codex | Project: LC App
Task: Diagnose Safari permission errors and close confirmed accessibility defects without scope expansion.
Files created: Native screenshots, AX/runtime/journey records and test log in safari-accessibility-closure evidence directory.
Files updated: mirrored app/service worker, nested shell/entry, regression tests, readiness and execution checkpoint.
Decisions: no error suppression; device gate remains NO; native Safari and physical iPhone evidence remain separate.
Assumptions: extension source-map attribution is probable, not confirmed per error.
Contradictions found: lost interaction focus, wrong heading focus, missing toggle states and low-contrast Following; corrected locally.
Open questions: exact error request attribution, full VoiceOver/accessibility acceptance, physical iPhone.
Recommended next action: native acceptance in an extension-free Safari profile with manual VoiceOver and connected iPhone.

## Local investor-demo checkpoint — 2026-10-10
- Actual application: `http://localhost:4187/investor.html` → `/?app=1&demo=investor#/product/demo/player`; loopback server serves `LC_App_GitHub_Pages_Upload/`.
- Local self-guided demo ready in the tested Codex in-app browser: three scenarios, Blackjack/Baccarat lobby, profiles/follows, visible likes/comments, example notifications/reminders, scripted card room, local chat/reactions, handoff/return and safe reset.
- Investor mode bypasses Auth bootstrap/config/session reads and skips Supabase SDK. Five-profile/session seed uses a fixed virtual clock. No real game engine, stream, partner destination or wagering is implied.
- Fixed actual browser defects: stale business metadata intercepted social actions after role switch; Like lacked a visible update; comments showed only counts; demo sticky CTA overlapped chat; guide skip could leave the selected room.
- Previous visual acceptance: local PASS at 1440×1000 and 390×844 in Codex in-app browser. Evidence: `INVESTOR_DEMO_READINESS.md` and `evidence/investor-visual-acceptance-2026-10-10/`; BEFORE/AFTER screenshots, 14 layout checks, 49 functional browser checks PASS, console errors 0; Node suite 123/123 PASS. Native Safari/iPhone and full accessibility NOT VERIFIED. Earlier investor-sprint evidence retained separately.
- Cache v132, app-product asset v122, product shell v18; root/nested auth.js, app-product.js and sw.js remain identical. Marketing files unchanged.
- LOCAL INVESTOR DEMO READY: YES; STAGING MIGRATION READY / PRODUCTION READY: NO. Prior external hosted baseline PASS and 052–054/Auth/RLS/Storage/integration/recovery/browser blockers remain intact.
- Isolated static deployment proposal prepared only. No hosted writes, production change, push, deployment, DNS or environment change. Pre-existing untracked package-lock.json and STAGING_HANDOFF.zip excluded from this work.

## AI_SYNC — visual acceptance 2026-10-10
Date: 2026-10-10 | AI: Codex | Project: LC App
Task: Final visual and functional acceptance of the actual local investor app.
Files created: BEFORE/AFTER screenshot evidence, browser-results.json and unit-tests.log in the visual acceptance evidence directory.
Files updated: mirrored product/service-worker sources, nested product shell/entry versions, affected regression tests, INVESTOR_DEMO_READINESS.md and this checkpoint.
Decisions: local visual acceptance PASS for tested browser/viewports; no hosted or native-device readiness upgrade.
Assumptions: all seed people/content and cards remain illustrative; business benefits require pilot evidence.
Contradictions found: Online label implied connectivity; fixed to Local demo. Profile comments overlaid images; reset retained search; fixed locally.
Open questions: native Safari/iPhone acceptance and existing hosted blockers.
Recommended next action: repeat this journey in native Safari and a physical iPhone.

## AI_SYNC — investor sprint 2026-10-10
Date: 2026-10-10 | AI: Codex | Project: LC App
Task: Complete and browser-verify the local self-guided investor product demo.
Files created: investor.html entry; investor isolation/regression tests; INVESTOR_DEMO_READINESS.md; screenshot and QA evidence package.
Files updated: mirrored product/auth/service-worker runtimes, nested app shell, affected tests, README and this checkpoint.
Decisions: local illustrative investor demo ready; hosted release remains blocked; publication requires a reviewed sanitised isolated artifact and separate approval.
Assumptions: illustrative seed/virtual schedule; benefits remain pilot hypotheses. No production capability or integration invented.
Contradictions found: business-view metadata acted like navigation controls after persona switch; fixed and regression-tested.
Open questions: native Safari/device acceptance, isolated publication target; pre-existing hosted blockers unchanged.
Next action: validate the investor journey in native Safari on the intended device.

## Migration forensics checkpoint
- Starting checkpoint `433b6f9378f0402866d81391507a8a9324808a86` verified on `codex/lc-app-p1-stabilization` with a clean worktree.
- Full branch/tag/reflog/object audit found 57 SQL files: 001–051 and 055–060. Versions 052–054 are MISSING with no authoritative SQL; no placeholders were created.
- 057–058 are VERIFIED RECONSTRUCTIONS from the documented foundation contract and application usage; hosted equivalence remains unverified.
- Previous 2026-10-09 local run: Node 117/117 PASS; PostgreSQL clean-room chain PASS; recovery replay 057–060 PASS; schema audit PASS; DB security matrix 40/40 PASS.
- HOSTED BASELINE INSPECTION: PASS for `dnpizrjuxkcnmdgmvnks`, independently verified externally by ChatGPT connected Supabase on 2026-10-10; local Codex only records the supplied result. PostgreSQL 17.11; public tables/policies/views/functions, Auth users, Storage buckets/objects, recorded migrations, Edge Functions and Security Advisor findings all zero; `supabase_migrations.schema_migrations` absent. No hosted migration ran. Canonical baseline: `STAGING_READINESS_REPORT.md`. Protected production `aspbwgsfkebduvviyeuo` untouched.
- Canonical evidence: `MIGRATION_FORENSICS_REPORT.md`, `MIGRATION_PROVENANCE_MATRIX.md`, `STAGING_MIGRATION_EXECUTION_PLAN.md`.

## Current RC and verified fixes
- Branch: `codex/lc-app-p1-stabilization`; preserved starting SHA `501c3f1fdfc2073ba896e991ef0ea7680003b42e` and cache/route checkpoint `1ec4618ab4315c76efdc77200abc97e6780c5fda`. Current review SHA: `git rev-parse HEAD` after the local checkpoint commit.
- Service worker v132 permits only scoped public assets and the explicit `?app=1` shell. API paths, auth callback queries, Authorization/no-store requests bypass caching; private/no-store, redirected and identity-varying responses cannot be stored. Activation preserves unrelated applications' caches; cache writes extend worker lifetime.
- Malformed creator/live/handoff route identifiers now render Invalid link instead of throwing URIError and retaining a stale screen.
- Launcher is executable and binds to loopback. `.gitignore` excludes local secrets, Vercel state and test artifacts; `.env.example` remains shareable.
- Root/nested app-product.js and sw.js remain identical. Existing stabilization and all existing tests preserved.
- Original migrations 001–006 were recovered byte-for-byte from the authoritative local `LC_App_GitHub_Pages_Upload` package identified by its API contract. Git history and unreachable-object inspection contained no copies; these are classified as recovered local source files, not Git originals.
- Migrations 057–059 reconstruct the documented auth/profile/avatar foundation, keep sensitive profile columns outside direct browser SELECT, expose owner-only full-profile RPC access, and make dependent RLS policies compatible with the restricted grants. Root/nested `auth.js` now uses the owner RPC.
- Migration 060 closes confirmed suspension gaps: inactive moderators lose moderation access, suspended users cannot create reports or mutate avatars, foundation ACLs are explicit, browser roles cannot create objects in `public`, and the account-status admin function is explicitly service-role-only.
- Staging handoff is defined in `STAGING_READINESS_REPORT.md`, `STAGING_SETUP_RUNBOOK.md` and `RELEASE_SECURITY_MATRIX.md`; these documents distinguish local simulation from required hosted evidence.

## Prior release validation — 2026-10-09 (historical)
- `node --test tests/*.test.mjs`: 117/117 PASS (baseline: 108/108). Recovery-integrity tests pin authoritative 001–006 hashes, require reconstruction labels and assert migration-060 suspension controls.
- PostgreSQL 17 clean-room execution: ordered migrations 001–060 applied successfully to a fresh temporary loopback cluster. Schema ACL audit PASS. Authenticated RLS/adversarial matrix: 40/40 PASS across profile privacy, moderation, Creator approval, tenant isolation/audit, handoff ambiguity and attribution, avatar ownership, event metadata/rate limit, notifications, replay protection and suspended Player/Admin behavior. Test-only Supabase platform primitives are isolated in `tests/db/supabase-platform-shim.sql`.
- `node --check` on all 9 JavaScript files; `bash -n run-local.sh`; `git diff --check`: PASS.
- Installed Chrome via Playwright: 63 route/viewport checks across player, creator, operator, provider, creator profile, live preview and handoff preview at 320/375/390/430/768/1024/1440/1920/2560 px. No document horizontal overflow, broken visible images or page JS errors after the route fix. This is structural smoke, not full visual/a11y signoff.
- Chrome interactions: demo follow, schedule reminder, handoff without external outbound CTA, simulated return, browser back, service-worker offline shell and online recovery: PASS. Demo state is simulated; these results do not verify persisted authenticated data.
- Playwright WebKit 26.5: 21 route/viewport checks at 320/768/1440 px, no overflow, broken visible images or page errors; first keyboard focus is visible, outlined and labelled. This is focused keyboard smoke, not a WCAG audit.
- Scoped privileged-credential pattern scan of JS/HTML/SQL/JSON: zero matches; not an exhaustive secrets audit.
- Migration filenames/ordering unique; the full chain was parsed and executed by PostgreSQL 17. Versions 052–054 are absent locally and in local Git history. This proves the isolated reconstructed contract, not schema compatibility with a hosted Supabase project.
- Local review: `PORT=4187 ./run-local.sh`, http://localhost:4187/?app=1#/product/demo/player . Default 4173 already in use during QA; no existing service was stopped.

## External release blockers and gate status
- Gate 1 LOCAL PASS: Chrome/WebKit demo smoke, isolated schema audit and authenticated database matrix pass. Hosted Auth/PostgREST/Storage/browser journeys and comprehensive accessibility verification remain staging work.
- Gate 2 BASELINE PASS / EXECUTION BLOCKED: accepted external baseline identifies an empty hosted staging project. 052–054 source provenance, integration/configuration isolation, hosted Auth/RLS/Storage E2E, backup/recovery and authenticated browser tests remain unresolved. Credentials and execution authorization are not supplied. `.env.example` is not staging authority. No hosted writes, production changes, push or Vercel deployment occurred.
- Migration 012 changes existing unverified published creator profiles to draft and user-generated public sessions to private. Snapshot those rows before staging application; do not auto-restore public visibility on rollback. Depends on existing personas, creator profiles/sessions, auth and active-profile contracts.
- Migration 056 replaces two trigger functions, revokes browser execution and recreates the metadata trigger. Existing event rows are not rewritten. Depends on the prior event schema/context/state/return migrations and creator/block contracts. Trigger behavior and existing metadata compatibility require a real staging database.
- Migration recovery: compare 001–006 and reconstructed 057–059 with a verified staging schema snapshot before applying anything. Capture function/trigger/policy definitions and affected 012 row states; apply transactionally to isolated staging and rerun the authenticated role matrix. On failure, rollback the transaction. After commit, prefer a reviewed forward repair. Reopening unapproved public rows is not an acceptable rollback. No hosted rollback is claimed.
- PR #18 OPEN at `edb98dd1fc3c3e65ca703399ccde6f0646c2f5e0` on `rc/session-handoff-binding`; regression and static-release-gate CI SUCCESS from 2026-10-07. Those checks do not cover this local branch.
- GitHub deployments metadata lists recent Preview deployments at `7695a61` and `9f378e3`, and Production at `3a9d200`. Vercel project linkage/settings absent locally; automatic deployment risk is unresolved. No push, merge, deployment, domain/marketing edit or production migration performed.
- Gate 3 NOT PASSED; Gate 4 founder approval required. PRODUCTION READY: NO.

## Release/rollback procedure and next action
1. Review the disposable runbook and prepared scripts; resolve 052–054 provenance or record explicit experimental-chain approval, then separately authorise a fresh disposable project. Refresh the accepted baseline and verify integrations/credentials before later staging execution.
2. Snapshot and apply only the verified missing migrations, then execute real auth/RLS/tenant/approval/notifications/handoff/return/adversarial integration tests using approved staging destinations.
3. Complete hosted authenticated Chrome/WebKit journeys, account lifecycle, monitoring and fuller accessibility validation. Do not treat the local matrix as production security certification.
4. Review exact local SHA and deploy policy before requesting push/deployment authorization. Preserve immutable prior frontend artifact; rollback frontend to the prior reviewed artifact only after checking schema compatibility. These local changes can be reverted by a new local git revert commit; never reset the preserved RC or automatically roll back production.

## Validation — documentation checkpoint 2026-10-10
- Fresh local Node suite: 117/117 PASS. Python AST and Bash syntax PASS; prepared hosted scripts were not executed.
- All 57 migration manifest paths/order/SHA-256 values verified against current SQL files; 052–054 remain absent, no SQL changed.
- Runtime mirror parity and `git diff --check` PASS; links, protected refs, source attribution and unresolved gates checked across updated docs.
- No fresh hosted/browser/PostgreSQL matrix run is claimed. Earlier local evidence above remains dated 2026-10-09.
- Pre-existing untracked `STAGING_HANDOFF.zip` left untouched and excluded from this commit; use committed files for this checkpoint.

## AI_SYNC — 2026-10-10
Date: 2026-10-10 | AI: Codex | Project: LC App
Task: Record independently verified external hosted baseline and prepare unexecuted hosted tests/recovery.
Files created: `tools/hosted-e2e.py`, `tools/disposable-migration.sh`, `DISPOSABLE_SUPABASE_RECOVERY_RUNBOOK.md`.
Files updated: `STAGING_READINESS_REPORT.md`, `STAGING_MIGRATION_EXECUTION_PLAN.md`, this checkpoint; targeted empty-baseline correction in `STAGING_SETUP_RUNBOOK.md`.
Decisions: hosted baseline inspection PASS, sourced to ChatGPT connected Supabase; staging migration/release and production readiness remain NO.
Assumptions: supplied external summary accepted; raw connector output not stored locally. No new readiness assumptions.
Contradictions: superseded current statements that hosted baseline was unverified; historical logs below remain dated historical evidence.
Open questions: 052–054 provenance, Auth/RLS/Storage E2E, integration isolation, backup/recovery, browser testing and execution authorization.
Next action: review and authorise the separate disposable-project rehearsal after the provenance decision. Prepared scripts have not been run.

## Consolidated AI_SYNC entry
Date: 2026-10-09 | AI: Codex | Project: LC App
Task: Audit the local RC for isolated Supabase staging readiness and close confirmed release-security gaps.
Files created: migration 060; executable schema audit and foundation-integrity test; staging readiness report, setup runbook and release security matrix.
Files updated: DB test runner; this checkpoint.
Decisions: staging remains blocked until project isolation, schema drift, hosted authenticated journeys, observability and recovery rehearsal have evidence.
Assumptions introduced: none about hosted schema, credentials or readiness.
Contradictions: prior local matrix allowed suspended moderation/report/avatar paths; migration 060 closes them. Recovered 001 documents live objects it does not define; 057–058 remain reconstructions requiring drift review.
Open questions: authorised isolated staging identity/schema/access and approved synthetic handoff destination.
Next action: execute `STAGING_SETUP_RUNBOOK.md` against a newly isolated Supabase staging project. Historical log follows for traceability.

---

# LC App Execution State

Date: 2026-08-31
Milestone: LC App v1.0 Product Depth + Full UI/UX Refinement Sprint
Current status: v1.0 EXPERIENCE BOOST READY ON GITHUB PAGES FALLBACK / CUSTOM DOMAIN BLOCKED

## Locked Baseline
- Social MVP live E2E confirmed by founder report: 21/21 PASS, 0 failures/blockers.
- Production commit verified by QA: `71fd452`.
- QA commit verified by QA: `f2c641c`.
- Migration 007 verified live: regular users cannot persist `profiles.role` or `profiles.account_status` escalation.
- Social/auth/RLS functionality is locked and must not be modified unless a confirmed regression requires it.

## Last Completed Work
- Root `index.html` restored to the real LC App shell instead of redirect-only showcase entry.
- Runtime Supabase config added with public `SUPABASE_PUBLISHABLE_KEY`; no service-role key added.
- `auth.js` now accepts `SUPABASE_PUBLISHABLE_KEY` from `window.LC_APP_CONFIG`.
- `social.js` is included in the real app shell and service worker cache list.
- Service worker cache bumped to `lc-app-investor-demo-v52`.
- HTML/JS/CSS requests are network-first with cache fallback to avoid stale review builds.
- Social module now clears on logout.
- Search results now support opening a public profile view.
- Public profile view shows profile data, follower/following counts, recent posts, follow/block/report actions.
- Profile reporting added for user-behavior review surface.
- Empty login validation now stays client-side and shows safe copy.
- Production GitHub Pages entry/social/config fixes deployed in commit `40a852c`.
- Root and nested `LC_App_GitHub_Pages_Upload/` copies are synchronized for `index.html`, `auth.js`, `social.js`, and `sw.js`.

## Verified Tests
- `node --check` passed for `auth.js`.
- `node --check` passed for `social.js`.
- `node --check` passed for `sw.js`.
- Root/nested file sync passed for `index.html`, `auth.js`, `social.js`, and `sw.js`.
- Local HTTP root loads the real LC App auth shell.
- Local HTTP root loads `auth.js` 200.
- Local HTTP root loads `social.js` 200.
- Local HTTP root loads Supabase JS CDN 200.
- Runtime config exists in browser and key prefix is `sb_publishable_`.
- Responsive smoke passed without horizontal overflow at 390, 393, 430, 1024, 1280, 1366, 1440, 1920 widths.
- Auth route smoke passed for login, signup, forgot password, reset invalid, verification, privacy, terms.
- Empty login validation returns safe message: `Invalid email or password.`
- Active browser-file security scan found no service-role key, JWT anon token, database URL, or private secret.
- Live GitHub Pages root loads the LC App auth shell.
- Live GitHub Pages `social.js` returns HTTP 200.
- Live browser smoke confirms `auth.js`, `social.js`, and Supabase JS CDN load successfully.
- External review `/showcase-v2/` live smoke passed on mobile 390x844 and desktop 1440x900.
- External review journey verified live: Discover, Dealer/Profile, Live Table, social chat surface, operator/provider handoff, Following and Return.
- Operator/provider handoff is labeled as concept vision and confirms LC App does not process gambling transactions.
- External review UI scan passed: no wallet, balance, deposit, withdrawal, cashier, KYC, AML, settlement, wager or betting layer shown inside LC App.
- Public QA harness removed from deployed review build: `/qa-live.html` and `/qa-live.js` return HTTP 404.
- Service worker cache bumped to `lc-app-investor-demo-v56`.
- Root/auth shell live smoke passed after review changes without console errors or QA controls.
- Self-explanatory mobile UX pass added to `/showcase-v2/`: first screen explains what LC App is and How It Works explains player, dealer, operator and provider value.
- Local smoke passed on 390x844, 430x844 and 1440x900 for welcome, how-it-works, discover, dealer, live and following routes.
- Core journey regression passed locally: How It Works, Explore Live, Dealer/Profile to Live, operator/provider handoff.
- Auth regression smoke passed locally after showcase changes; social/auth/RLS files were not modified.
- Production smoke passed on 390x844, 430x844 and 1440x900 for the same review routes.
- Production core journey regression passed: How It Works, Explore Live, Dealer/Profile to Live and operator/provider handoff.
- Production root/auth shell smoke passed without QA controls.
- Presentation quality pass added: first screen states LC App as the social discovery layer for Live Casino and keeps Live Casino through people as the emotional frame.
- Why LC App view now separates player, dealer, operator and provider value with short mechanism flows.
- Product Info sheet added with real-money, funds, KYC/AML, responsible-gaming and settlement boundary.
- Lightweight privacy-safe local demo analytics added for presentation funnel events; no external analytics dependency.
- Image fallback handler added to avoid blank visual states if an image fails.
- Custom-domain CNAME was tested but removed before final deploy because GitHub Pages redirected the current working URL before DNS/HTTPS was verified.
- Current GitHub Pages review URL restored and verified after CNAME removal.
- Final production presentation QA passed on 360x800, 375x812, 390x844, 393x852, 430x932 and 1440x900.
- Final production interaction QA passed: Product Info, Why LC App, Explore Live, Dealer/Profile to Live and operator/provider handoff.
- Final production root/auth shell regression passed; QA harness remains removed.
- Final release/performance pass completed on 2026-08-30.
- Live Room now uses optimized `sofia_live_table_public.jpg` instead of the 2.0 MB PNG; production asset is 348,427 bytes.
- First-screen hero image is preloaded and marked high priority.
- Demo analytics are privacy-safe local events and now fire once per event per session; no email, token, password or key fields are stored.
- Service worker cache bumped to `lc-app-investor-demo-v57`.
- Local release QA passed on 360x800, 375x812, 390x844, 430x932, 1024x768, 1440x900 and 1920x1080.
- Production release QA passed on 360x800, 375x812, 390x844, 430x932, 1024x768, 1440x900 and 1920x1080.
- Production release interaction QA passed: How It Works, Explore Live, Dealer/Profile, Follow, Live Table, operator/provider handoff and Product Info.
- Production QA harness remains removed: `/qa-live.html` and `/qa-live.js` return HTTP 404.
- Production optimized Live Room JPEG returns HTTP 200.
- Final quick-win product pass completed on 2026-08-30.
- Quick wins implemented in `/showcase-v2/`: dealer profile Share/Copy link, public dealer deep links, Discover filters, real Search results, stronger dealer schedule/return loop and fixed Live Room profile routing.
- Direct dealer links verified for Sofia, Mia, Alex and Marcus: `#/dealer/sofia`, `#/dealer/mia`, `#/dealer/alex`, `#/dealer/marcus`.
- Search sheet verified with real dealer/profile results and mobile-readable solid overlay.
- Discover filters verified: All, Live Now, Following, Blackjack and Roulette.
- Production quick-win QA passed on 360x800, 390x844, 430x932 and 1440x900.
- Production quick-win interaction QA passed: How It Works, Explore Live, Discover filters, Search, dealer deep link reload, Share/Copy, Follow, Live Table, operator/provider handoff and Product Info.
- Quick-win analytics verified as unique local demo events only; no email, token, password or key fields stored.
- Service worker cache bumped to `lc-app-investor-demo-v58`.
- Product maturity pass completed on 2026-08-31.
- Shared UI tokens added for spacing, touch targets, control radius and card radius; key buttons/tabs/icon actions normalized for mobile use.
- Product loop strengthened in `/showcase-v2/`: Discover status strip, saved schedule/return cues, notification read state, content detail sheet, recent search continuation and calendar reminder download.
- Dealer profile schedule now supports save state, return reminder and lightweight `.ics` calendar export using illustrative demo data only.
- Following now shows followed creators, saved return cues and notification state to make the return loop explicit.
- Global preload warning removed for direct-route entry; welcome image still uses `fetchpriority="high"` on the actual welcome image.
- Service worker cache bumped to `lc-app-investor-demo-v59`.
- Local maturity QA passed on 360x800, 375x812, 390x844, 393x852, 430x932, 768x1024, 1024x768, 1440x900 and 1920x1080.
- Production maturity QA passed on the same viewport set with no console errors, no failed requests, no horizontal overflow and no broken loaded images.
- Production maturity interaction QA passed: browser back, Discover, dealer profile, schedule save, return save, calendar download, Following, notifications read state, Search recent, content detail, Live, chat, operator/provider handoff and image fallback.
- Public QA harness remains removed: `/qa-live.html` and `/qa-live.js` return HTTP 404.

## Known Failures
- None currently confirmed after Social MVP live E2E pass.

## External Blockers
- Custom domain `demo.open-gamer.com` is not live/resolving from this environment yet (`curl` DNS/resolve failure, exit code 6); DNS/GitHub Pages custom-domain setup is required before replacing the current GitHub Pages URL.

## Next Executable Tasks
1. Configure `demo.open-gamer.com` DNS and GitHub Pages custom domain in one controlled step, then add `CNAME` after verification.
2. Use the current GitHub Pages URL only as an interim verified fallback.

## Current Deployment / Commit
- Local branch: `main`.
- Last deployed QA/security commit: `f2c641c Add profiles privileged field guard`.
- External review URL: `https://minasyannarek13-rbb.github.io/lc-app-investor-demo/showcase-v2/`.
- Self-explanatory review implementation commit: `82f0ffd Make showcase self explanatory`.
- Presentation quality implementation commit: `b89fe60 Polish presentation quality showcase`.
- Current production commit after CNAME rollback: `80007d0 Keep GitHub Pages URL active before custom domain`.
- Final release/performance implementation commit: `d15693d`.
- Final quick-win product implementation commit: `17f13f8`.
- Product maturity implementation commit: `1bd3fdc`.
- Public QA harness is removed/disabled in the external review build.
- v1.0 candidate engagement/creator loop completed on 2026-08-31.
- Lightweight Creator View added to `/showcase-v2/` as a demo-only consumer-adjacent creator surface: public profile preview, profile sharing, table note, saved session and creator content.
- Return loop now verifies Discover → Dealer → Schedule/Save → Following → Notification → Live → Operator/Provider handoff → Creator content.
- Local v1.0 candidate QA passed on 360x800, 375x812, 390x844, 430x932, 768x1024, 1024x768, 1440x900 and 1920x1080.
- Local v1.0 interaction QA passed: Discover filters, schedule save, return cue save, calendar export, notification read state, search recent, content detail, Live chat, operator/provider handoff, Creator View, creator table note, creator session save, profile share and image fallback.
- Production v1.0 candidate QA passed on the live GitHub Pages URL with the same viewport and interaction set.
- Public QA harness remains removed: `/qa-live.html` and `/qa-live.js` return HTTP 404 in production.
- v1.0 candidate implementation commit: `b4a11cb`.
- Service worker cache bumped to `lc-app-investor-demo-v60`.
- Consumer-first/professional-depth guardrail accepted on 2026-08-31: LC App must stay simple for players and deep for professionals without becoming an operator dashboard or casino-management interface.
- Dealer/session/schedule depth implemented through consumer-readable session cards and schedule rows: dealer, live/upcoming status, game, table/session, demo operator context, time, follow/play/save/share actions.
- Cross-operator concept is shown only as illustrative demo schedule data using `Demo Casino`, `Demo Casino A` and `Demo Casino B`; no real integration or commercial relationship is implied.
- Auth/Social/RLS remain locked and were not modified in this pass.
- Service worker cache bumped to `lc-app-investor-demo-v61`.
- Final v1.0 browser/device regression completed on 2026-08-31 after continuation from saved state.
- Production v1.0 QA passed on 360x800, 375x667, 375x812, 390x844, 393x852, 402x874, 414x896, 428x926, 430x932, 768x1024, 1024x768, 1440x900 and 1920x1080.
- Production v1.0 QA covered welcome, discover, dealer, live, following, creator and industry routes with no console errors, no failed requests, no broken images and no horizontal overflow.
- Production v1.0 performance remained in baseline range: DCL 136ms, load 225ms, transfer 125,927 bytes.
- Original v1.0 scope reconciled: Returning User, Following, LIVE NOW/Upcoming/Latest from Following, dealer content loop, Creator View/functions, player personalization, notification value, empty states and Quick-Win Feature Audit all verified through production interaction QA.
- v1.0 product-depth/UI refinement sprint completed locally on 2026-08-31.
- Demo universe expanded from 4 to 10 illustrative Live Casino creators across Blackjack, Baccarat, Roulette and Game Show categories using Demo Casino, Demo Casino A and Demo Casino B only.
- Discover now includes richer network sections: creators for you, live now, popular tonight, starting soon and from people you follow.
- Search now has a real input for dealers, games and live rooms with useful no-result behavior.
- Dealer profile was simplified toward consumer-first identity, live/upcoming status, follow/play, content and schedule.
- Live Room now supports selected creator live routes and shows community presence, reactions, follow/return and explicit operator/provider handoff boundary.
- Following now behaves as a returning-player home with live followed creators, upcoming sessions, saved sessions and latest content.
- Player Profile is now separate from public dealer profiles and links to Following, notifications, settings and Creator View.
- Creator View now has Today, quick actions, Create Post, Add Session, public profile preview, share profile, schedule and content surfaces.
- Create Post writes real local demo state and appears in Creator View, Sofia public profile content and follower-facing surfaces.
- Creator schedule Add Session writes real local demo state and preserves the schedule/reminder loop.
- Local depth QA passed on 120 route/viewport checks: 360x800, 375x812, 390x844, 393x852, 412x915, 430x932, 768x1024, 1024x768, 1280x800, 1366x768, 1440x900 and 1920x1080 across welcome, discover, dealer profiles, live, following, creator, player and industry routes.
- Local sprint interaction QA passed: search input/results, follow to Following, create post, profile content propagation, creator schedule add, live handoff, Player Profile and QA harness 404.
- Local sprint performance remained stable: DCL 58ms, load 58ms, transfer 126,494 bytes.
- Service worker cache bumped to `lc-app-investor-demo-v62`.
- Production sprint QA passed on 120 route/viewport checks with cache-busted commit `4eb2d64`: 360x800, 375x812, 390x844, 393x852, 412x915, 430x932, 768x1024, 1024x768, 1280x800, 1366x768, 1440x900 and 1920x1080.
- Production sprint interaction QA passed: Search, Follow to Following, Create Post, profile content propagation, Creator schedule add, Live Room handoff, Player Profile and public QA harness 404.
- Production sprint performance stayed in baseline range: DCL 132ms, load 219ms, transfer 125,927 bytes.
- Final release freeze pass completed on 2026-08-31.
- Consumer-facing developer/demo wording reduced in `/showcase-v2/`: removed controlled-demo chat language, demo-post publish wording, demo operator label and generic external operator step copy.
- Operator/provider handoff now works as a product conversion moment: Continue to Casino, game, dealer, table and illustrative operator context, with secondary factual disclosure.
- Anonymous exploration remains open for Welcome, Discover, Dealer, Live and Industry routes.
- Identity/personalization actions now show a lightweight auth gate in the showcase before Follow, Save/Reminder, Notifications, Chat, Player Profile, Following and Creator View.
- Direct protected showcase routes `#/following`, `#/player` and `#/creator` now show the auth gate instead of exposing personalized areas to anonymous users.
- Share/deep-link fallback now opens a visible public profile link sheet after clipboard fallback; native share remains supported where available.
- Native share now shows immediate visible feedback before opening the platform share sheet.
- Route changes now close stale sheets to prevent overlay carryover after browser hash/back navigation.
- Service worker cache bumped to `lc-app-investor-demo-v63`.
- Local final release QA passed: 132 route/viewport checks across 360x800, 375x812, 390x844, 393x852, 412x915, 430x932, 768x1024, 1024x768, 1280x800, 1366x768, 1440x900 and 1920x1080.
- Local final release interaction QA passed: Welcome, Discover, Search, Dealer, Follow auth gate, signed-in preview, Content CTA, Schedule, Reminder, calendar export, Live, Chat, Continue to Casino handoff, Following, Notifications, Creator View, Create Post, public profile propagation, Share fallback and anonymous direct profile auth gate.
- Local final release QA result: 0 failures, average DCL 67ms, load 68ms.
- Experience Boost sprint completed on 2026-08-31.
- Live Room now includes lightweight viewer avatar stack, live activity events, quick reactions with visible feedback, and normal room-message composer.
- Recently viewed / Continue exploring added using privacy-safe local state for creator, live room, content and schedule interactions.
- Rules-based For You added using followed creators, saved sessions and recent game interest; no AI/model/backend dependency added.
- Returning-user surfaces now show Continue exploring in Discover, Following and Player Profile.
- Anonymous exploration remains open for public routes, while Follow, Save, Chat, Reactions, Notifications, Following, Player Profile and Creator View remain identity-gated in the showcase.
- Live chat composer spacing fixed so the sticky handoff CTA and bottom nav do not block mobile send interaction.
- Service worker cache bumped to `lc-app-investor-demo-v64`.
- Local Experience Boost QA passed: 132 route/viewport checks across 360x800, 375x812, 390x844, 393x852, 412x915, 430x932, 768x1024, 1024x768, 1280x800, 1366x768, 1440x900 and 1920x1080.
- Local Experience Boost interaction QA passed: Player, Creator, Returning User and Anonymous flows including reaction, chat, recently viewed, Continue exploring, For You, handoff and auth gate.
- Local Experience Boost performance: average DCL 78ms, load 80ms, transfer 865 bytes in local static QA.

## Sync Entry — 2026-10-11 · independent premium UX audit
- Project: LC App V3. AI: Codex. Task: independent visual/content audit, no implementation or production changes.
- Canonical output: `LC_APP_V3_PREMIUM_UX_AUDIT_2026-10-11.html`; evidence: `evidence/premium-ux-audit-2026-10-11/`.
- Audited exact 39-file final ZIP SHA-256 d68e2ee709a61d542d226d30ed94d2d0fbe02c588e011370556fe26a6abb498d on loopback 4201; 136 accepted unique screenshots including official visual references.
- Findings: design NO-GO for premium public launch; P0 persona/portrait continuity, RU-to-app continuity, mobile business navigation. This does not replace the previous technical release assessment.
- Proposed changes only; no approved product decisions replaced, no new commercial claims. Full VoiceOver/contrast/physical-device validation remains open.
- Next action: local P0 pass, then trust/scenario polish and repeat visual gate. Public release still requires separate owner authorization.

## AI_SYNC — Sync Entry · 2026-10-11 · final performance sprint
Date: 2026-10-11; AI: Codex; Project: LC App; Owner: Narek.
Task: preserve approved V4 UX while resolving mobile delivery LCP; local only.
Files created: performance report, pinned-delivery bundles/image derivatives, reproducible performance tools, evidence/allowlist/fail-closed packages.
Files updated: product rendering/bootstrap/observer delivery, CSS picture selector, worker144, allowlist builder/manual workflow, test harnesses, hosting instructions and this state/domain plan.
Decisions: compressed laboratory gate GO; source/domain/UX/claims unchanged; no public or hosted action authorized.
Assumptions: loopback gzip/Brotli laboratory is not real GitHub Pages CWV; final performance belongs to generated55-file ZIP, not raw repository serving.
Contradictions found: picture wrapper bypassed crop selector; fixed and remeasured. Harness dynamic locator/prefetch-count errors corrected. Plain transfer still fails target.
Open questions: production Content-Encoding/TTFB/field CWV, physical native accessibility and existing hosted/history gaps.
Recommended next action: review frozen package and authorize controlled existing-domain release separately.

## AI_SYNC — 2026-10-12
Project: LC App. Task: finish release candidate and prepare non-destructive cleanup.
Preserved f5672a9 public55/rollback13 bytes and all181 QA receipts; refreshed remote main/Pages and staging read-only. Discovered/reproduced NULL tenant-manager invitation bypass, added CLI-created corrective migration and DB regression gates44 PASS. Baseline migration files unchanged; hosted extension NOT AUTHORISED. Cleanup proposal/inventory prepared; no cleanup, push, PR, deploy, settings, production DB or messaging. Canonical checkpoint: RELEASE_READY_CHECKPOINT.md; owner-only receipts: evidence/release-ready-2026-10-12/.
