import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(new URL('../supabase/migrations/202609210029_handoff_intent_server_boundary.sql', import.meta.url), 'utf8');
const app = await readFile(new URL('../app-product.js', import.meta.url), 'utf8');

test('authenticated browser cannot record handoff intent', () => {
  assert.match(migration, /auth\.role\(\) = 'authenticated'/);
  assert.match(migration, /new\.event_name = 'handoff_intent'/);
  assert.match(migration, /raise exception 'handoff_intent_requires_server_boundary'/);
  assert.match(migration, /before insert or update of event_name/);
});

test('client resolves an approved destination but does not forge handoff intent', () => {
  assert.match(app, /resolve_live_session_operator_handoff/);
  assert.match(app, /OPERATOR DESTINATION UNAVAILABLE/);
  assert.match(app, /data-lc-operator-outbound/);
  assert.doesNotMatch(app, /trackProductEvent\("handoff_intent"/);
  assert.match(app, /metadata: \{ surface: "operator_outbound_click" \}/);
});

test('handoff boundary remains outside LC regulated operations', () => {
  assert.match(app, /The licensed operator remains responsible for gameplay, wallet, KYC\/AML, wagering, settlement and responsible-gaming operations\./);
});
