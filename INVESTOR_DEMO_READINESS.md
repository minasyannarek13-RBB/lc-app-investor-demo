# LC App investor demo readiness

Project: LC App | Version: v0.9 | Status: Local investor demo ready; hosted release NOT ready
Updated: 2026-10-10 | Owner: Narek / product engineering | Audience: investor-demo reviewer and release engineer
Sources: `LC_App_GitHub_Pages_Upload/index.html`, mirrored `app-product.js` / `auth.js` / `sw.js`, actual Codex in-app browser screenshots and QA JSON in `evidence/investor-demo-2026-10-10/`, fresh Node tests, `STAGING_READINESS_REPORT.md`.
Assumptions: All people, content, session schedules and business records are illustrative. Operator/provider value is a hypothesis requiring pilot validation. No real broadcast, customer or partner is represented.
Open questions: Native Safari/device QA, approved isolated hosting target and sanitised build; separate hosted release blockers remain unchanged.

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
