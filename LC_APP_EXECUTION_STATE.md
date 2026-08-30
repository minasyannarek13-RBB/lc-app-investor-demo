# LC App Execution State

Date: 2026-08-30
Milestone: LC App External Review MVP
Current status: PRESENTATION MVP READY ON GITHUB PAGES / CUSTOM DOMAIN PENDING

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
- Service worker cache bumped to `lc-app-investor-demo-v55`.
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
- `CNAME` prepared for `demo.open-gamer.com`; DNS/HTTPS custom-domain verification remains external.

## Known Failures
- None currently confirmed after Social MVP live E2E pass.

## External Blockers
- None currently confirmed.

## Next Executable Tasks
1. Verify and enable `demo.open-gamer.com` DNS/HTTPS before using it as the final branded public URL.
2. Use the current GitHub Pages URL only as an interim verified fallback.

## Current Deployment / Commit
- Local branch: `main`.
- Last deployed QA/security commit: `f2c641c Add profiles privileged field guard`.
- External review URL: `https://minasyannarek13-rbb.github.io/lc-app-investor-demo/showcase-v2/`.
- Self-explanatory review implementation commit: `82f0ffd Make showcase self explanatory`.
- Presentation quality implementation commit: pending deployment.
- Public QA harness is removed/disabled in the external review build.
