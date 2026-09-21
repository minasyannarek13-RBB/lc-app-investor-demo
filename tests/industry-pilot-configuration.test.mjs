import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(new URL('../supabase/migrations/202609220031_industry_pilot_configuration.sql', import.meta.url), 'utf8');

test('pilot configuration is tenant scoped and protected by RLS', () => {
  assert.match(migration, /alter table public\.industry_creator_mappings enable row level security/);
  assert.match(migration, /alter table public\.industry_handoff_destinations enable row level security/);
  assert.match(migration, /using \(public\.is_industry_org_member\(organization_id\)\)/);
});

test('only active owner or admin can prepare tenant configuration', () => {
  assert.match(migration, /m\.user_id = auth\.uid\(\)/);
  assert.match(migration, /m\.role in \('owner','admin'\)/);
  assert.match(migration, /m\.status = 'active'/);
  assert.match(migration, /o\.status = 'active'/);
  assert.match(migration, /p\.account_status = 'active'/);
});

test('authenticated clients cannot self-approve creator mappings or handoff destinations', () => {
  assert.match(migration, /and status = 'pending'/);
  assert.match(migration, /and status = 'draft'/);
  assert.match(migration, /status in \('pending','removed'\)/);
  assert.match(migration, /status in \('draft','retired'\)/);

  const authenticatedPolicies = migration
    .split(/(?=create policy )/i)
    .filter((block) => /^create policy /i.test(block) && /to authenticated/i.test(block))
    .map((block) => block.split(/;\s*(?:\n|$)/, 1)[0]);
  assert.ok(authenticatedPolicies.length >= 6, 'expected tenant select/write policies');
  for (const policy of authenticatedPolicies) {
    assert.doesNotMatch(policy, /with check[\s\S]*'approved'/i);
  }

  assert.match(migration, /Approval remains outside client control/);
});

test('handoff destinations stay external HTTPS configuration only', () => {
  assert.match(migration, /destination_url ~ '\^https:\/\/'/);
  assert.match(migration, /No gameplay, wallet, wagering, KYC\/AML or settlement capability is introduced/);
});
