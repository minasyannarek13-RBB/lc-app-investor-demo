# LC App Execution State

Date: 2026-08-30
Milestone: LC App Presentation Release Pass
Current status: PRESENTATION RELEASE READY ON GITHUB PAGES FALLBACK / CUSTOM DOMAIN BLOCKED

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
- Public QA harness is removed/disabled in the external review build.
