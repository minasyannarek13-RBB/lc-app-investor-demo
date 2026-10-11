# LC App — canonical public-demo runtime

Project: LC App | Version: v0.9 | Status: local release candidate | Updated: 2026-10-10
Owner: Narek / Engineering | Audience: reviewer/release engineer
Source: ../README.md and ../ONE_PASS_REPORT_2026-10-10.md
Open question: founder-approved public contact endpoint and release scope.

This folder contains the sole interactive app. Public mode is immutable and uses synthetic data, with no hosted Auth/SDK/session/network access. Entry: `?app=1#/product/demo/player`; `investor.html` is an alias.
Serve the repository root to review the complete site + demo. Use the root README for tests, release packaging and rollback. Do not upload this folder alone as the combined B2B site, and do not upload preserved static previews.
Auth/product/SW mirrors are checked against root copies. Static preview files remain retained historical source; they are not app or PWA dependencies in the new release.
