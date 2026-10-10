# LC App investor demo readiness

Project: LC App | Version: v0.11 | Status: Local investor demo ready; hosted release NOT ready
Updated: 2026-10-10 | Owner: Narek / product engineering | Audience: investor-demo reviewer and release engineer
Sources: `LC_App_GitHub_Pages_Upload/index.html`, mirrored `app-product.js` / `auth.js` / `sw.js`, actual Codex in-app browser screenshots and QA JSON in `evidence/investor-demo-2026-10-10/`, fresh Node tests, `STAGING_READINESS_REPORT.md`.
Assumptions: All people, content, session schedules and business records are illustrative. Operator/provider value is a hypothesis requiring pilot validation. No real broadcast, customer or partner is represented.
Open questions: Clean Safari console, physical iPhone, full VoiceOver/reduced-motion QA, approved isolated hosting target and sanitised build; separate hosted release blockers remain unchanged.

## Native Safari and device acceptance — 2026-10-10

**Native Safari functional smoke PASS; final investor device gate NOT COMPLETE.** Actual macOS Safari 26.6.2 was operated through native UI automation. No Chromium results substitute for Safari. Canonical evidence: `evidence/investor-device-acceptance-2026-10-10/acceptance-results.json`, native PNG screenshots, `safari-runtime-all-widths.txt`, `safari-accessibility-final.txt` and fresh `unit-tests.log`.

Verified in native Safari: guest entry, three guided scenarios, skip/Guide restart, lobby (including keyboard activation), Sofia profile, follow/unfollow/refollow, feed Like off/on, profile/feed comments, Blackjack/Baccarat scripted rounds and local chat, primary Home navigation, and seed reset. Operator walkthrough action opens the local back office with explicit unverified integration/value claims. Reset removes local comments and returns the base player route. No wagering, broadcast or production integration claim was added.

Confirmed local defects fixed: hidden prototype Quick actions received the first keyboard focus; demo Like state was absent from AX; feed avatar buttons had generic names and decorative images received redundant alt text; focus outlines were inconsistent; timestamp/comment counts had low contrast; a comment count squeezed the input at 320px; Home left a stale dealer/room hash. Investor-scoped styling and a VM navigation regression preserve local demo isolation. Final runtime: app v122, shell v18, cache v132; mirrored sources remain identical.

Layout coverage: real Safari Responsive Design Mode at nominal **320, 390, 768 and 1440 × 844**, 2x. Screenshots include the size controls. Selected feed, lobby, profile, room and entry screens were inspected; not every screen at every width. Zero observed horizontal page overflow and broken loaded images. Inspector docking at 13% scale rounded measured widths to 321/392/765 for the three smaller nominal widths; 1440 measured exactly, and an earlier 320 inspection measured exactly 320. This is macOS Safari responsive evidence, not iOS or physical iPhone validation.

Accessibility is **PARTIAL**: sampled Option-Tab traversal, visible focus and Return activation passed; native AX exposes labelled inputs/buttons/main region and the Like pressed state. Decorative empty alt remains decorative. Feed metadata now computes to `rgb(182,207,199)` and 12px. Reduced-motion CSS is present and reviewed, but the runtime preference was false; reduce-mode behavior and a complete VoiceOver audio/rotor journey are **NOT VERIFIED**. No WCAG conformance claim.

Safari console gate remains **BLOCKED**: two “Failed to load resource: You do not have permission to access the requested resource” errors appeared before and after fixes. Network includes a Web Translator for DeepL injected stylesheet, but both errors could not be attributed reliably. No JavaScript exception was observed; this is not exhaustive unhandled-rejection instrumentation. Physical iPhone testing is **BLOCKED** because no connected device surface is available.

Regression: **124/124 Node tests PASS**, JavaScript syntax, root/nested runtime parity and `git diff --check` PASS. The new VM test verifies detail-hash clearing without remounting demo data. Earlier browser evidence below remains historical. Hosted baseline PASS and all hosted release blockers remain unchanged. **INVESTOR DEVICE READY: NO.** Next: isolate/resolve Safari resource errors, then complete physical iPhone and VoiceOver/reduced-motion checks.

## Visual acceptance — 2026-10-10

**PASS for the local investor demo in the tested Codex in-app browser.** This does not approve native Safari/iPhone, hosted release or production. Canonical evidence: `evidence/investor-visual-acceptance-2026-10-10/` (`before/`, `after/`, `browser-results.json`, `unit-tests.log`). Screenshots are real browser captures, not generated mockups.

| Verified defect | Local correction | Evidence |
|---|---|---|
| Demo banner and guide widths diverged from the player content | Align both to the 760px player column; inset mobile guide | Desktop/mobile entry BEFORE/AFTER |
| Lobby headline occupied four desktop lines and displaced discovery | Smaller headline, compact broadcast-state block | `before/desktop-lobby.jpg`, `after/1440-lobby.jpg` |
| Mobile guide copy/actions consumed excessive vertical space | Compact readable copy and controls; skip remains available | `before/390-entry.jpg`, `after/390-entry.jpg` |
| Preview rail used a 7px pink badge resembling live status | Readable mint PREVIEW badge with full accessible status | Entry BEFORE/AFTER |
| Tall profile/feed imagery concealed identity and interactions | Shorter profile hero and responsive feed crops | Dealer and feed captures |
| Profile comments/forms overlaid photography and could exceed a fixed card | Separate image/content blocks; cards grow with comments; wrap long text | Dealer-comments BEFORE/AFTER; long-comment browser check |
| Feed comments were too small and comment submission jumped to the top | Readable comment styling; preserve scroll after local submission | Feed-comments AFTER; measured identical pre/post scroll at both widths |
| Business sidebar said Online despite no integration | Label Local demo | Desktop operator/provider AFTER |
| Reset retained search and stale detail context | Clear query/selected dealer/room during seed reset | Browser reset checks and new VM regression test |

Coverage: 1440×1000 desktop and 390×844 responsive mobile. Inspected initial in-app entry, lobby, dealer profile and updates, feed/comments, Blackjack/Baccarat portraits/table/chat, operator/provider overviews, guided scenarios, skip/restart and primary navigation. The 14 recorded layout checks have zero page/app horizontal overflow and zero observed broken loaded images. The preview rail and mobile business navigation intentionally scroll horizontally. Long comments remain in normal document flow and can be scrolled below the fixed navigation.

Functional browser regression: **49 checks PASS**, zero captured console errors. Checks cover likes, comments, follow/unfollow, both fixed table rounds, local chat/reaction, operator/provider navigation, game discovery, empty search recovery, guest profile, notifications, seed reset, walkthrough and local handoff/return. Evidence was captured incrementally during fixes (app assets v117–v121); final runtime is app-product v121, shell v17, cache v131. Final comment/reset fixes were exercised after loading the updated runtime. Node regression: **123/123 PASS**; syntax, mirrored runtime parity and diff whitespace checks PASS.

Remaining limitations: native Safari/physical iPhone and full accessibility audit NOT VERIFIED; static imagery and scripted cards are intentional; real streams, wagering and integrations are unavailable. Business access status still uses an internal `not_requested` label (minor copy refinement). Hosted 052–054 provenance, Auth/RLS/Storage E2E, integrations, backup/recovery and hosted browser tests remain blocked. No Supabase, production, DNS, environment, push or deployment action occurred.

Next acceptance gate: run the same journey in native Safari and on a physical iPhone before presenting that compatibility as verified. Earlier sprint evidence below is historical and retained for traceability.

## Product entry and execution

- Open **http://localhost:4187/investor.html**. It immediately opens the actual social product at **http://localhost:4187/?app=1&demo=investor#/product/demo/player**.
- Server document root: `LC_App_GitHub_Pages_Upload/`; root `index.html` is a different presentation/marketing surface and is not the product entry.
- Server is a loopback-only Python static development server on port 4187. No build dependencies were added. If stopped: `python3 -m http.server 4187 --bind 127.0.0.1 --directory LC_App_GitHub_Pages_Upload`.
- Dealer route: `#/product/demo/player/creator/demo-sofia`; Blackjack room: `#/product/demo/player/live/demo-session-sofia`; Baccarat room: `#/product/demo/player/live/demo-session-alex`. Keep `?app=1&demo=investor` on every URL.
- Home, Explore, Create, Activity and Profile navigation operate inside the product. Role routes include `#/product/demo/creator`, `#/product/demo/operator`, `#/product/demo/provider`, `#/product/demo/admin`.
- Investor entry bypasses Auth initialisation before config/session access and skips the Supabase SDK download. Four observed scripts are local: social.js, app-product.js, auth.js and product-shell-v2.js. Demo client is null; interactions remain in memory. Existing authenticated paths stay separate.
- Do not remove the investor query flag and call the default app shell an isolated demo: the canonical shell still contains its pre-existing production configuration. This matters for the proposed separate deployment below.

## Feature inventory — actual UI and evidence scope

VERIFIED means exercised or observed in the local browser in the stated demo scope. PARTIAL means present but incompletely verified or backend-dependent. NOT IMPLEMENTED describes intentionally absent capability. BROKEN identifies the discovery defect; repaired rows show the resulting status. Passing unit tests alone does not promote a row to VERIFIED.

| Feature | Discovery → final | Working scope / dependency | Browser evidence |
|---|---|---|---|
| Immediate guest product entry | PARTIAL → VERIFIED | Dedicated investor.html and early demo Auth bypass; no registration | Direct entry and walkthrough |
| Live Casino lobby | PARTIAL → VERIFIED | Blackjack/Baccarat cards search supported dealer games; cards do not imply available operator tables | Lobby and Blackjack search; Baccarat profile/room |
| Dealer profiles and avatar/details | VERIFIED → VERIFIED | Five fixed illustrative profiles and existing local imagery | Dealer at all tested widths |
| Follow/unfollow | VERIFIED → VERIFIED | Session-memory relationship state | Explicit final dealer toggle checks |
| Feed likes | BROKEN → VERIFIED | Reversible like state with visible update; no real engagement count | Feed and dealer post interactions |
| Feed/dealer comments | PARTIAL → VERIFIED | Escaped visible comments instead of count-only confirmation; max 500 characters | Feed comment and dealer profile comment |
| Notifications and reminders | VERIFIED → VERIFIED | Local in-app example signals, mark-read and virtual-clock reminders; no email/SMS/push delivery | Activity/read state, reminder and reset |
| Guest user profile | VERIFIED → VERIFIED | Demo Reviewer identity/preferences/follows/saved cues | Profile navigation and layouts |
| Blackjack/Baccarat game room | PARTIAL → VERIFIED | Static dealer stage, three scripted card rounds, local chat/reaction and handoff preview | Both room round flows; mobile interaction capture |
| Genuine wagering/game engine | NOT IMPLEMENTED → NOT IMPLEMENTED | Intentionally external to LC; no deposits, wagering controls, RNG/certification or financial outcomes | Scripted table disclosure and unit boundary checks |
| Video/streaming | NOT IMPLEMENTED → NOT IMPLEMENTED | Static local dealer images; no connected broadcast | Preview labels; no live activity claimed |
| Three investor scenarios | NOT IMPLEMENTED → VERIFIED | Non-blocking guide, direct scenario choice, skip, finish and restart | Three scenarios; deep-link skip; final restart |
| Social/business role switching | BROKEN (revealed by scenario QA) → VERIFIED | Root business-view metadata no longer intercepts social actions | Browser regression and executable regression test |
| Operator/provider workspaces | PARTIAL → PARTIAL | Presentation/configuration surfaces observed; no real tenants, integration, campaign execution or performance data | Operator/provider layouts; operator scenario |
| Creator publishing/scheduling workflow | PARTIAL → PARTIAL | Existing demo/backend implementation; not fully exercised in this sprint | Existing contract tests only; no browser completeness claim |
| Account signup/reset/verification | PARTIAL → PARTIAL | Existing Supabase-dependent code; guest demo does not use it | Not verified hosted |
| RLS/Storage/tenant permissions | PARTIAL → PARTIAL | Prior local SQL simulation and contracts; hosted staging remains empty | Unit/local evidence only, not hosted E2E |
| Mobile/desktop layout | PARTIAL → VERIFIED | 320/390/430/768/1440 px app layout smoke, not physical-device certification | 40 checks, zero overflow or broken loaded images |
| Error and empty-result recovery | PARTIAL → VERIFIED | Unknown session, malformed route and empty search recover to lobby/results | Recovery checks |
| Full accessibility/Safari certification | PARTIAL → PARTIAL | Named controls and readable layout; broader accessibility and native Safari remain unverified | Not verified comprehensively |

## Three self-guided scenarios

1. **Discover:** read what LC App is in the app, open the lobby, choose Blackjack or Baccarat and open a dealer profile. Supporting dealer games and available example sessions are distinct; select Alex for the Baccarat room.
2. **Social:** follow/unfollow, like and comment on an update, save a reminder, open the room, advance a scripted round, add a local message/reaction, preview the licensed-operator boundary and simulate return. No outbound operator destination exists.
3. **Business:** inspect the operator workspace. LC owns discovery/identity/social/return context; licensed infrastructure owns gameplay, wallet, KYC/AML, wagering, settlement and responsible gaming. Provider workspace illustrates a distribution use case. No uplift, GGR, integration or pilot success is claimed.

Skip keeps the current linked screen. Guide restarts the walkthrough in Player mode with a clean seed; Reset resets the current demo persona's state. Page reload starts a clean demo. No visitor login is required.

## Reliability and defects fixed

- Deterministic five-profile/five-session seed with virtual epoch `2026-10-10T18:00:00Z`. Seed schedules are examples, not current availability. Interaction timestamps may use actual local time; seeded scheduling eligibility uses virtual time.
- Fixed Like's missing visible state update and provided unlike. Comments now render escaped text on feed and dealer profile.
- Added explicitly scripted tables, max 20 room messages of 240 characters each, reversible room reaction and safe reset. Nothing represents connected players or a real casino engine.
- Restricted business-view event handling to actual buttons; deleted stale business metadata in social mode. This prevents operator-to-player clicks returning to a business screen.
- Preserved linked room when skipping the guide; room updates change only table/chat content rather than rebuilding the whole application screen.
- Shortened mobile guide, replaced empty dealer rail with labelled session previews, reduced static demo stage height and removed sticky handoff CTA from demo-room content flow to avoid chat-input obstruction.
- Updated scoped service-worker cache to v126 and product asset to v116. Root/nested runtime files match; no marketing source was edited.

## QA evidence

| Category | Result | Limits |
|---|---|---|
| Browser responsive layouts | **40/40 PASS**, 8 screens × 5 widths | Document/product horizontal overflow and broken completed images; inner rails intentionally scroll |
| Browser interactions | **24 PASS**, **0 console errors** | Codex in-app browser, no real backend or physical-device coverage |
| Fresh Node suite | **122/122 PASS** | Includes demo Auth bypass, fixed seed, escaped table text, role-switch interception and virtual reminder tests |
| Syntax / runtime mirror parity / diff hygiene | PASS | Static/local checks |
| Hosted Auth/RLS/Storage/integrations | NOT RUN | No hosted writes or migrations authorised |
| Native Safari/WebKit / actual iPhone / full a11y | NOT VERIFIED | Prior browser evidence is historical, not this sprint's signoff |

Raw local results: `evidence/investor-demo-2026-10-10/browser-layout-results.json`, `browser-interaction-results.json`, `unit-tests.log`. Layout capture used v115; final v116 changes only reminder-clock eligibility and is covered by the added unit test and final browser reminder check. No layout change followed the 40-screen capture.

Accepted actual-app screenshots (captured and visually inspected):

![Desktop product entry](evidence/investor-demo-2026-10-10/desktop-entry.jpg)
![Desktop lobby](evidence/investor-demo-2026-10-10/desktop-lobby.jpg)
![Mobile product entry](evidence/investor-demo-2026-10-10/mobile-entry.jpg)
![Mobile scripted room](evidence/investor-demo-2026-10-10/mobile-blackjack-room.jpg)

## Local investor-demo release checklist

- [x] Actual app opens directly, guest mode works without registration.
- [x] What LC is, social loop, operator/provider rationale and working demo scope are visible in-app.
- [x] Lobby, profiles, follows, feed interactions, notifications and both table previews exercised.
- [x] Guide choice/skip/restart, state reset and invalid/empty recovery checked.
- [x] Deterministic seed, null demo client, skipped Supabase SDK, no privileged secret added.
- [x] Responsive browser evidence, screenshots, fresh tests and mirrored runtime parity recorded.
- [ ] Native Safari/physical iPhone investor acceptance.
- [ ] Review and produce an isolated, sanitised static deployment artifact; this source tree is not that artifact.
- [ ] Separate approval for any external hosting publication.

**INVESTOR DEMO READY: YES for local, illustrative product presentation in the tested browser. STAGING MIGRATION READY: NO. PRODUCTION READY: NO.** No hosted migration, Supabase production change, push, deployment, DNS or environment modification occurred.

## Isolated deployment proposal — prepared, not executed

Use a dedicated static demo project/origin with no Supabase, API secrets, database, SMTP, webhooks, production sessions or automatic production deployment linkage. Keep it separate from the current public app and OpenGamer marketing site.

Before publication, build a curated artifact from reviewed local assets/app styles and demo renderer. Replace the canonical Auth driver with a minimal demo-only driver, omit production config/SDK/auth/admin backend client code and enforce demo-only routes so deleting a query flag cannot activate production Auth. Retain labelled demo controls, disclosures and static images. Pin the exact reviewed commit, hash the artifact and inspect all generated files.

Apply a reviewed CSP limited to self-hosted scripts/styles/images and no external API connections; verify the allowlist and inline-code handling against the built artifact. Use a unique service-worker/cache scope and explicit noindex. Test the full guest journey, network requests, reset, deep links, mobile/Safari, unavailable-asset fallback and rollback to the prior immutable static artifact on the separate preview origin. Record what was tested before requesting publication approval.

Not performed: artifact sanitation, target creation, preview deployment, DNS linkage or hosted verification. Do not deploy the repository wholesale or use the historical STAGING_HANDOFF.zip as this artifact. Founder approval is required for the final reviewed publication target/artifact.

## Separate hosted release blockers

052–054 source provenance, hosted Auth/RLS/Storage E2E, integration isolation, backup/recovery and authenticated browser tests remain open. The accepted empty hosted baseline PASS is sourced to ChatGPT connected Supabase on 2026-10-10; local demo readiness does not alter those gates. See `STAGING_READINESS_REPORT.md` and `DISPOSABLE_SUPABASE_RECOVERY_RUNBOOK.md`.

Next best action: run the local investor journey in native Safari on the intended investor device and record acceptance before preparing the isolated publication artifact.
