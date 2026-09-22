import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(
  new URL('../supabase/migrations/202609220033_industry_integration_health.sql', import.meta.url),
  'utf8'
);

test('integration health is tenant scoped and member-readable', () => {
  assert.match(migration, /create table if not exists public\.industry_integration_health/i);
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /for select to authenticated[\s\S]*public\.is_industry_org_member\(organization_id\)/i);
});

test('authenticated clients cannot forge integration health', () => {
  assert.doesNotMatch(migration, /for insert to authenticated/i);
  assert.doesNotMatch(migration, /for update to authenticated/i);
  assert.doesNotMatch(migration, /for delete to authenticated/i);
  assert.match(migration, /privileged backend processes own writes/i);
});

test('health vocabulary stays inside LC pilot operations boundary', () => {
  assert.match(migration, /component in \('creator_mapping','handoff','event_delivery','catalog','support'\)/i);
  assert.match(migration, /status in \('unknown','healthy','degraded','unavailable','disabled'\)/i);
  assert.match(migration, /Excludes credentials and regulated gambling data/i);
  assert.doesNotMatch(migration, /component in \([^\n]*(deposit|withdrawal|wager|settlement|kyc|aml)/i);
});
