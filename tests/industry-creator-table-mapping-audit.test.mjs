import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(
  new URL('../supabase/migrations/202609220045_creator_table_mapping_audit.sql', import.meta.url),
  'utf8'
);

test('mapping audit is append-only to browser roles and tenant scoped for reads', () => {
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /revoke all on table public\.industry_creator_table_mapping_audit from public, anon, authenticated/i);
  assert.match(migration, /grant select on table public\.industry_creator_table_mapping_audit to authenticated/i);
  assert.match(migration, /m\.user_id = auth\.uid\(\)/i);
  assert.match(migration, /m\.status = 'active'/i);
  assert.match(migration, /o\.status = 'active'/i);
  assert.match(migration, /p\.account_status = 'active'/i);
  assert.doesNotMatch(migration, /grant (insert|update|delete) on table public\.industry_creator_table_mapping_audit to authenticated/i);
});

test('audit rows are produced by a server trigger and capture actor plus configuration state', () => {
  assert.match(migration, /security definer/i);
  assert.match(migration, /after insert or update on public\.industry_creator_table_mappings/i);
  assert.match(migration, /actor_id[\s\S]*auth\.uid\(\)/i);
  assert.match(migration, /action in \('created','updated','paused'\)/i);
  assert.match(migration, /external_table_ref/i);
  assert.match(migration, /mapping_status/i);
  assert.match(migration, /revoke all on function public\.audit_industry_creator_table_mapping\(\) from public, anon, authenticated/i);
});

test('audit remains configuration-only and does not cross the operator gameplay boundary', () => {
  assert.doesNotMatch(migration, /\b(wallet|deposit|withdrawal|wager|bet_amount|settlement|kyc|aml)\b/i);
});
