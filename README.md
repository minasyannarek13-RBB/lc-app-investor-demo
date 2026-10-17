# LC App — public site and isolated interactive demo

Project: LC App | Version: v0.11 | Status: locally verified V4 candidate; public funnel repair awaits publication approval
Updated: 2026-10-17 | Owner: Narek / Engineering | Audience: reviewer and release engineer
Sources: RELEASE_READY_CHECKPOINT.md (2026-10-17 consolidation), LC_APP_EXECUTION_STATE.md, source and test evidence.
Confirmed: mn@open-gamer.com; existing Pages source main / root, serving commit 3a9d200. Open: separate external-release approval and post-deployment acceptance.

## Canonical entry and architecture

Serve the repository root: `PORT=4197 ./run-local.sh`, then open `http://127.0.0.1:4197/`.
Root `index.html` preserves the existing EN/RU cinematic story, original portraits and guided journey. All demo CTAs open `LC_App_GitHub_Pages_Upload/?app=1#/product/demo/player`.
The app entry fixes `LC_APP_MODE=public_demo` before any module. No Supabase SDK/config is loaded; Auth returns before reading sessions/storage, registering Auth handlers or creating a client. CSP denies connection requests. Role switches retain public mode; Admin is unavailable publicly. Synthetic state is local to the demo.

Root `?app=1` / product deep links and nested `investor.html` are compatibility routes into that same app. Root and nested Auth/product/SW files are intentional development mirrors; HTML entries have different jobs. Root SW maps precache paths into the app directory; nested SW serves its own scope. Cache v144 excludes legacy preview pages and supports offline versioned JS/CSS without caching Auth/private query strings.

## Reproduce and review

- Node 22+; `npm ci` installs the pinned development-only esbuild 0.25.12 from package-lock.json. No package is added to the public browser payload.
- `npm test` (157 regression tests).
- `./tools/test-db.sh` uses only a disposable local PostgreSQL cluster and a test Supabase shim.
- `LC_RELEASE_OUTPUT=/private/tmp/lc-release-review npm run build:public` builds the allowlisted public ZIP; it checks every file hash and excludes evidence, SQL, tests, private config and legacy preview pages.
- Run `tools/public-demo-e2e.cjs` with an installed Playwright module and Chromium/WebKit executables. Set `LC_PLAYWRIGHT_MODULE`, `LC_CHROMIUM_PATH`, `LC_WEBKIT_PATH`; `LC_CONTROLLED_SERVER=1 LC_BASE_URL=http://127.0.0.1:4198` lets the harness own its loopback server and stop it for true network-failure/offline tests. `LC_STATIC_ROOT` can point to the extracted ZIP. See the exact environment paths and evidence in the report.

Historical V3 verification (superseded by RELEASE_READY_CHECKPOINT.md): 152 Node tests; PostgreSQL 57 available migrations and 40 security checks; Chromium/WebKit 6/6 at 375/768/1440; exact v118→v140 upgrade 4/4 and fail-closed v141 rollback; visual/mobile EN/RU/guided 10/10. Full results and release gates: [LC_APP_V3_RELEASE_REPORT_2026-10-10.md](LC_APP_V3_RELEASE_REPORT_2026-10-10.md).

## Release and recovery

Publish only the allowlisted package after separate approval. Do not upload the entire working repository. Existing `showcase-v2`, static previews and historical documents remain preserved source/history and are excluded from this release.
Request Pilot opens the contact section; Email Narek creates a mailto draft to mn@open-gamer.com, with copy fallback. No contact data is stored and no message is sent by the site.
Restore original sources by extracting `.local-backups/one-pass-before-2026-10-10.tgz` into a separate recovery directory, or clone `.local-backups/repository-before-2026-10-10.bundle`. Verify hashes before selectively restoring. Both backups are local and excluded from Git.
No push, merge, hosted write, deploy, DNS change, publication or source deletion is authorized by this README. Static public V4 candidate is locally verified; publication and hosted acceptance remain pending. Authenticated product/Supabase migration readiness is separate and remains NO.

V3 artifacts: `evidence/v3-release-2026-10-10/LC_APP_V3_PUBLIC_RELEASE_2026-10-10.zip` (39 files), fail-closed rollback v141, manifests and visual-comparison.html. Prepared `.github/workflows/lc-pages-public-release.yml` is main-only/manual; existing Pages legacy source must be switched to Actions only after approval, before merging, to avoid publishing the whole repository.
