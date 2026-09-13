# LC Reveal Sales Progress

## v0.9.2 — Operator-first entry

Branch: `reveal-sales-v1`
Product change commit: `7eceaea06a20f5c4ae366324fc5dd307357974cc`

- The unqualified `showcase-v2/` entry now opens the Industry narrative instead of the product welcome screen.
- Product exploration remains available as the secondary route; direct hash routes are unchanged.
- The rendered gate now tests the bare entrypoint, preventing a prefilled `#/industry` hash from masking routing regressions.
- GitHub Actions run `34783641945`: PASS in WebKit 390×844, WebKit 430×932 and Chromium 1440×900.
- All tested viewports resolved to `industry`; HTTP 200; no horizontal/element overflow, undersized visible targets, console errors or page errors.
- 20/20 repository contract suites: PASS. P0: 0. P1: 0.

Conversion readiness: 9.7/10 (+0.2). Overall working score: 9.60/10.

## v0.9.1 — Factuality / public-demo hardening

Branch: `reveal-sales-v1`
Production `main`: untouched
Product change commit: `f78d694ab6df1d70c3e18712f2cc2b31114df73b`

### Material cleanup

- Removed the public identity/auth gate from reveal navigation. Following, Creator and Profile surfaces are reviewable directly; auth remains outside this public concept scope.
- Removed fabricated viewer/follower/reaction counts from visible product surfaces. Social behavior remains demonstrable without implying real audience traction or usage metrics.
- Browser title aligned to `Live Casino Through People`.

### Why

This removes two trust-breaking contradictions with the reveal brief: the public concept should not behave like an auth product, and illustrative UI should not look like invented traction.

### QA gate

- Scope/factuality patch assertions: PASS in GitHub Actions patch workflow.
- Full rendered QA: required on this exact product state before Freeze Gate.
- P0: 0 known.
- P1: 0 known pending rendered regression QA.

## v0.9 — First Review Candidate

Exact rendered candidate: `63235b3da619937b1fb313784f476d14980c5a38`

### Executive narrative

- `LIVE CASINO THROUGH PEOPLE` and `GAME/TABLE → PERSON` are immediate.
- Player loop: Discover Sofia → Follow → Live → licensed operator → Return.
- Dealer engine: Dealer → Persistent identity → Creator → Content → Followers → Community → Schedule → Live sessions → Operator → Return.
- Influencer engine: Influencer → Existing audience → Live Casino host → Dedicated table/event → Live intent → Licensed operator → Play → Creator relationship → Return.
- Operator/provider payoff, monetization hypotheses and the regulated ownership boundary appear inside the short Industry route.
- Gameplay, wallet, KYC/AML, responsible gaming, wagering and settlement remain with the licensed operator/provider.
- No partnership, pilot, revenue, CAC, GGR, retention or ROI claims are presented as validated.

### Exact-candidate QA evidence

GitHub Actions run: `34728223657` — PASS

- WebKit 390×844: HTTP 200; Industry route and intro visible; 390px document width; no horizontal or element overflow; no undersized visible targets; no console/page errors.
- WebKit 430×932: HTTP 200; Industry route and intro visible; 430px document width; no horizontal or element overflow; no undersized visible targets; no console/page errors.
- Chromium 1440×900: HTTP 200; Industry route and intro visible; 1440px document width; no horizontal or element overflow; no undersized visible targets; no console/page errors.
- Six Industry sections render in order at every tested viewport.
- 20/20 repository contract suites passed on the restored candidate content.
- P0: 0. P1: 0.

### Quality score

Idea clarity: 9.7
0–5 sec comprehension: 9.7
Player loop: 9.5
Creator/Dealer story: 9.6
Influencer engine: 9.6
Operator value: 9.6
Provider value: 9.5
Business & Monetization: 9.6
Regulatory/factual discipline: 9.7
Executive storytelling: 9.6
Premium/cinematic visual quality: 9.4
Mobile quality: 9.3 (WebKit rendered)
Self-guided comprehension: 9.6
Handoff/return loop: 9.6
Overall: 9.57

First Review Candidate: READY
Freeze Gate: NOT READY — native-device Mobile Safari review remains the final external verification. No further narrative or cosmetic churn is justified without evidence from that review.
