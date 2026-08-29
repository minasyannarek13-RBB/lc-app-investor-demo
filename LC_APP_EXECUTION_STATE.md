# LC App Execution State

Date: 2026-08-29
Milestone: External Live-Casino Management Review Readiness
Current status: NOT READY

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

## Known Failures
- Current live GitHub Pages root serves app HTML but does not serve `social.js` successfully: `/social.js` returned 404 before this patch.
- Current local checkout root previously redirected to `/showcase/`; patched locally but not deployed yet.
- Live deployed build does not yet match the locally tested patched build.

## External Blockers
- Live Supabase host `aspbwgsfkebduvviyeuo.supabase.co` could not be resolved from this environment by Node fetch or curl, even after escalation.
- Because of the DNS blocker, live signup/login/onboarding/social/two-user/RLS tests could not be executed in this run.
- Confirmed email inbox or existing two-user test credentials are still required to complete authenticated real-user E2E.

## Next Executable Tasks
1. Restore network/DNS access to Supabase or run from an environment that can resolve the Supabase host.
2. Execute live auth flow with confirmed email or known test credentials.
3. Execute two-user social E2E: discover, follow, post, like, comment, reply, notifications, block/unblock.
4. Execute authenticated RLS checks for blocked pairs and direct insert denial into `notifications` and `activity_events`.
5. Deploy/push only after live E2E and security gates pass, or explicitly accept a staged deployment for the entry/config/social fixes.

## Current Deployment / Commit
- Local branch: `lc-app-industry-demo-v2`.
- Last observed commit: `3ef44d5 Fix LC App V2 desktop showcase layout`.
- Production URL checked: `https://minasyannarek13-rbb.github.io/lc-app-investor-demo/`.
- Production is not yet verified as matching this patched local state.
