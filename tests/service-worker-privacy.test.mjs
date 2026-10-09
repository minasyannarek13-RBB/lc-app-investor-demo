import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
function harness(response = new Response('public')) {
  const handlers = {}, writes = [], deleted = [], pending = [];
  vm.runInNewContext(source, {
    URL, Promise,
    self: {
      location: { origin: 'https://lc.test' },
      registration: { scope: 'https://lc.test/app/' },
      addEventListener: (name, fn) => { handlers[name] = fn; },
      clients: { claim: async () => {} }
    },
    fetch: async () => response,
    caches: {
      open: async () => ({ put: async (request) => writes.push(request.url) }),
      match: async () => undefined,
      keys: async () => ['other-app-cache', 'lc-app-investor-demo-v122', 'lc-app-investor-demo-v123'],
      delete: async (key) => { deleted.push(key); }
    }
  });
  return {
    writes, deleted,
    async request(path, options) {
      let intercepted = false;
      handlers.fetch({
        request: new Request(`https://lc.test${path}`, options),
        respondWith: (value) => { intercepted = true; pending.push(value); },
        waitUntil: (value) => pending.push(value)
      });
      for (let i = 0; i < pending.length; i++) await pending[i];
      return intercepted;
    },
    async activate() {
      handlers.activate({ waitUntil: (value) => pending.push(value) });
      await Promise.all(pending);
    }
  };
}

test('private endpoints and auth callback URLs bypass service worker caching', async () => {
  for (const path of ['/app/api/me', '/app/rest/v1/profiles', '/app/index.html?code=secret', '/app/?access_token=secret', '/other/index.html', '/app/qa-live.html']) {
    const h = harness();
    assert.equal(await h.request(path), false, path);
    assert.equal(h.writes.length, 0);
  }
});

test('authenticated and no-store requests bypass cache even for shell assets', async () => {
  for (const options of [{ headers: { authorization: 'Bearer test' } }, { cache: 'no-store' }]) {
    const h = harness();
    assert.equal(await h.request('/app/index.html', options), false);
  }
});

test('private, no-store, and identity-varying responses never persist', async () => {
  for (const headers of [{ 'cache-control': 'private' }, { 'cache-control': 'no-store' }, { vary: 'Cookie' }, { vary: '*' }, { vary: 'Accept, Authorization' }]) {
    const h = harness(new Response('sensitive', { headers }));
    assert.equal(await h.request('/app/index.html'), true);
    assert.equal(h.writes.length, 0);
  }
  const redirect = new Response('redirected');
  Object.defineProperty(redirect, 'redirected', { value: true });
  const h = harness(redirect);
  await h.request('/app/index.html');
  assert.equal(h.writes.length, 0);
});

test('public shell and creator assets remain cacheable', async () => {
  for (const path of ['/app/', '/app/?app=1', '/app/app-product.js', '/app/app_prototype_assets/dealers/portrait.webp']) {
    const h = harness();
    assert.equal(await h.request(path), true, path);
    assert.equal(h.writes.length, 1, path);
  }
});

test('activation preserves unrelated applications caches and synchronized copies', async () => {
  const h = harness();
  await h.activate();
  assert.deepEqual(h.deleted, ['lc-app-investor-demo-v122']);
  assert.equal(source, readFileSync(new URL('../LC_App_GitHub_Pages_Upload/sw.js', import.meta.url), 'utf8'));
});
