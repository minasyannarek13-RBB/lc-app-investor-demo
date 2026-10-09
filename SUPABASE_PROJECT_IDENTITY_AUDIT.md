# LC App Supabase Project Identity Audit

- Project: LC App
- Supabase project reference: `aspbwgsfkebduvviyeuo`
- Repository: `minasyannarek13-RBB/lc-app-investor-demo`
- Local RC reviewed: `f449a64c185ef3a23c95d7f7332be3d9a1a8f58e`
- Branch: `codex/lc-app-p1-stabilization`
- Audit date: 2026-10-09
- Status: Read-only audit complete; hosted database metadata unavailable
- Owner: Narek / Engineering
- Audience: Founder, release engineer, Supabase administrator

## Classification

- **Classification: PRODUCTION**
- **Confidence: HIGH**
- **Recommendation: CREATE SEPARATE STAGING**

This classification means the project is connected to active public production-facing frontend infrastructure. It does not claim that the database contains paying customers, production integrations or real gameplay data. Positive staging isolation evidence is absent.

## Project identity and evidence

1. Root and nested `auth.js` hardcode `https://aspbwgsfkebduvviyeuo.supabase.co` as the live fallback URL.
2. `.env.example` identifies the same project URL.
3. The project reference entered Git history in commit `e7375c5406ca339cd27668ab2098b6b12ca4f4a1` (`Connect live Supabase auth MVP`, 2026-08-09).
4. GitHub reports a successful public GitHub Pages deployment from `main` commit `3a9d2008689312f4642fa42a1fc8c658e92a42be` to `https://lc.open-gamer.com/`.
5. A fresh read-only fetch of `https://lc.open-gamer.com/auth.js` returned HTTP 200 and contains this exact project reference.
6. Git commit inspection confirms the same project reference in:
   - Production deployment commit `3a9d2008689312f4642fa42a1fc8c658e92a42be`;
   - Preview deployment commit `7695a619b0ef7f3c31039247963fa343683df9db`;
   - Preview deployment commit `9f378e39940a005f38cedd013fb7103fc771d693`.
7. The Supabase host resolves and responds. The unauthenticated base request returned 404 and Auth health returned 401. This proves endpoint presence, not database health, schema state or activity.

These facts are incompatible with treating the project as an isolated staging environment.

## Deployment references

| Surface | Evidence | Result |
|---|---|---|
| GitHub Pages | Public, built, HTTPS enforced, source `main`, custom domain `lc.open-gamer.com` | Production-facing and currently serves this project ref |
| GitHub Production environment | Successful deployment of `3a9d200` to a Vercel URL | Deployment commit contains this project ref |
| GitHub Preview environment | Successful deployments of `7695a61` and `9f378e3` | Both deployment commits contain this project ref |
| Vercel runtime inspection | Deployment protection redirects to Vercel SSO | Runtime bundle could not be inspected anonymously; no bypass attempted |
| Repository secrets | GitHub API reports zero Actions secret names | Does not prove absence of Vercel/Supabase dashboard secrets |

The same Supabase project reference is shared by production and preview code revisions. Environment separation is therefore not demonstrated at the application configuration layer.

## Hosted authorization boundary

No safe authenticated read-only Supabase authorization was available:

- no Supabase/Postgres/database environment variable name was present in the current process;
- no local Supabase CLI configuration or project link exists in the repository;
- no Supabase credential was found in the checked local configuration/keychain locations;
- Supabase CLI has no usable authenticated session in this sandbox;
- no accessible authenticated Supabase browser tab was available.

The public browser publishable key was not extracted or used to enumerate hosted data. No database, Auth, Storage or Management API query was executed with credentials.

## Existing schema and migration findings

Hosted schema, migration history, RLS state, role grants, function definitions and Storage bucket metadata are **not verified**. No claim is made that migrations 001–060 exist in the hosted project.

Expected local chain:

- migrations 001–051;
- no local versions 052–054;
- migrations 055–060;
- 001–006 were recovered from an authoritative local package and hash-pinned by tests;
- 057–058 are explicitly reconstructed foundation migrations;
- 059–060 are later compatibility/security hardening.

### Migrations 052–054

No filenames matching 052, 053 or 054 exist in the working tree or any local Git branch/history inspected. This does not prove they are absent from `supabase_migrations.schema_migrations` in the hosted project. Hosted history comparison remains mandatory.

### Migrations 057–058

Both entered Git in local commit `78132f3e6a3b1ae730d2e67216611c9cee49c62c` on 2026-10-09. They are newer than the inspected production and preview deployment commits. No hosted evidence shows that they were applied. Because they reconstruct documented foundation behavior, applying them over an unknown existing schema without an authoritative drift comparison is unsafe.

## Indicators of real activity

Confirmed indicators:

- a public custom-domain frontend currently loads configuration for this Supabase project;
- the project endpoint is reachable;
- repository history describes earlier live Auth/social QA, but those statements are historical project notes and were not independently revalidated in this audit.

Not available:

- aggregate Auth user count;
- active or recent sessions;
- profile/post/event/notification counts;
- tenant or organisation counts;
- Storage bucket/object counts;
- database size or recent query activity;
- production webhook, SMTP, OAuth or external integration metadata.

The absence of those metrics cannot be interpreted as zero activity.

## Differences from local RC

| Area | Public/deployed evidence | Local RC |
|---|---|---|
| Frontend project ref | Same Supabase project ref on public production domain | Same fallback project ref |
| Deployed commit | Production evidence at `3a9d200`; previews at `7695a61`/`9f378e3` | `f449a64` is local and not pushed/deployed |
| Migration 057–058 | No application evidence | Present locally as reconstructions |
| Migration 059–060 | No application evidence | Present locally; 060 closes suspension/ACL gaps |
| Hosted schema/RLS | Unknown | Clean-room PostgreSQL chain 001–060 and synthetic matrix pass locally |
| Auth/Storage gateway behavior | Unknown | Only local platform simulation exists |

## Risks and blockers

1. Using this project for staging could affect a public production-facing application and any existing users/data.
2. Preview and production revisions reference the same project, so cross-environment data contamination is possible.
3. Hosted migration history may include missing 052–054 or definitions that conflict with reconstructed 057–058.
4. Hosted RLS, ACLs and Storage policies may differ materially from local RC.
5. Real activity cannot be ruled out without authorised read-only metadata access.
6. Vercel deployment protection prevents anonymous runtime inspection; no bypass was attempted.

## Required next action

Create a separate Supabase project dedicated to staging with a distinct project reference, empty synthetic users/data, separate Auth/Storage configuration and no production integrations. Then execute `STAGING_SETUP_RUNBOOK.md` against that project. Do not link or migrate `aspbwgsfkebduvviyeuo` as staging.

If a Supabase administrator later needs deeper confirmation, provide a time-limited read-only audit path for this project and inspect only metadata and aggregate counts. Until then, treat it as production-connected and preserve it unchanged.
