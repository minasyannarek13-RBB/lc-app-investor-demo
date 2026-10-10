# LC App External Review MVP

Public review build for LC App.

## Open

For the actual social application, serve `LC_App_GitHub_Pages_Upload/` on loopback and open `http://localhost:4187/investor.html`:

```bash
python3 -m http.server 4187 --bind 127.0.0.1 --directory LC_App_GitHub_Pages_Upload
```

The investor entry resolves to `/?app=1&demo=investor#/product/demo/player`. It uses isolated local demo state, skips Supabase Auth initialisation and requires no registration. Feature inventory, actual browser evidence, screenshots, limitations and the unexecuted isolated deployment proposal are in [INVESTOR_DEMO_READINESS.md](INVESTOR_DEMO_READINESS.md).

`showcase-v2/index.html` remains a separate historical management-review surface.

## GitHub Pages

Historical repository settings (not an instruction or approval to publish the new investor demo):

- Pages source: `Deploy from a branch`
- Branch: `main`
- Folder: `/root`

Expected URL:

`https://<github-username>.github.io/<repo-name>/`

## Included

- Premium product showcase
- Discover -> Dealer/Creator -> Live Table -> Social -> Operator/provider handoff -> Follow -> Return journey
- Operator/provider-safe handoff concept
- Static fallback preview
- PWA manifest and service worker

## Important

This is a product concept review build. It does not process gambling transactions. Gambling-account and transaction controls remain outside LC App with the licensed operator/provider. Demo personas, content, activity and business outcomes are illustrative/to be validated.
