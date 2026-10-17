import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../app-product.js', import.meta.url), 'utf8');
const start = source.indexOf('  function renderProductTarget(');
const end = source.indexOf('\n  document.addEventListener', start);
function route(parts) {
  const context = {
    parts, renderMissing: (title) => title,
    renderCreatorDetail: (id) => `creator:${id}`,
    renderLive: (id) => `live:${id}`,
    renderHandoff: (id) => `handoff:${id}`,
    routeHome: () => 'home'
  };
  return vm.runInNewContext(`${source.slice(start, end)}\nrenderProductTarget(parts)`, context);
}
test('malformed creator, live, and handoff links fail safely', () => {
  for (const type of ['creator', 'live', 'handoff']) {
    for (const id of ['%', '%E0%A4%A', '%FF']) assert.equal(route([type, id]), 'Invalid link');
    assert.equal(route([type, 'demo%2Dsofia']), `${type}:demo-sofia`);
  }
  assert.equal(route([]), 'home');
  assert.equal(route(['unknown']), 'Route not found');
});
