# LC App Execution State

Date: 2026-08-30
Milestone: LC App External Review MVP
Current status: IN PROGRESS

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

## Known Failures
- None currently confirmed after Social MVP live E2E pass.

## External Blockers
- None currently confirmed.

## Next Executable Tasks
1. Harden `/showcase-v2/` as the public external review URL.
2. Remove public QA harness from the review build.
3. Run mobile, desktop, console, asset and service-worker smoke checks.
4. Deploy only confirmed review-surface fixes.

## Current Deployment / Commit
- Local branch: `main`.
- Last deployed QA/security commit: `f2c641c Add profiles privileged field guard`.
- External review URL target: `https://minasyannarek13-rbb.github.io/lc-app-investor-demo/showcase-v2/`.
- Public QA harness must remain removed/disabled in the external review build.
