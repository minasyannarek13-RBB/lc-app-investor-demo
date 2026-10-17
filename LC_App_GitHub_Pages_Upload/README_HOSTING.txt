LC App V4 — local performance release candidate, 2026-10-11
Canonical report: LC_APP_V4_PERFORMANCE_RELEASE_REPORT_2026-10-11.html.
Public release is the generated55-file allowlist ZIP; never upload the whole repository.
Original landing/assets/EN-RU/11scenes/4roles preserved. Public worker144; fail-closed rollback145.
Build prerequisite: Node + pinned esbuild0.25.12 (npm install --prefix /private/tmp/lc-performance-build esbuild@0.25.12 --no-audit --no-fund).
Build from repository root: LC_NODE=/absolute/path/to/node python3 tools/build-public-release.py.
Override LC_ESBUILD_MODULE for another host/CI; workflow installs pinned minifier in RUNNER_TEMP.
Artifacts/manifests: evidence/performance-v4-2026-10-11/. Deterministic SHA parity verified.
Performance claims require serving extracted ZIP, not raw source HTML from run-local.sh.
Reproduce same cold/warm lab using tools/performance-server.cjs and tools/performance-lighthouse.mjs; exact settings/commands in report.
GO applies to compressed local lab; production Content-Encoding/TTFB/field CWV and physical-device acceptance remain external.
Existing domain only. Separate permission required for push, merge, deployment and main/root→Actions switch (before merge).
No publication, Pages/DNS changes, hosted writes or source deletion performed.
