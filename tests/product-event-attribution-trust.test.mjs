import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
  new URL('../supabase/migrations/202609210028_product_event_attribution_trust.sql', import.meta.url),
  'utf8'
);

test('authenticated clients cannot self-certify direct attribution', () => {
  assert.match(migration, /auth\.role\(\) = 'authenticated'/);
  assert.match(migration, /new\.attribution_confidence = 'direct'/);
  assert.match(migration, /new\.attribution_confidence := 'contextual'/);
});

test('trust boundary is enforced before inserts and confidence updates', () => {
  assert.match(migration, /before insert or update of attribution_confidence/i);
  assert.match(migration, /product_events_attribution_trust/);
});

test('client cannot execute the guard function directly', () => {
  assert.match(
    migration,
    /revoke all on function public\.enforce_product_event_attribution_trust\(\) from public, anon, authenticated/i
  );
});
