import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(new URL('../supabase/migrations/202609220030_industry_organizations_rbac.sql', import.meta.url), 'utf8');

test('tenant records are protected by RLS and active caller membership', () => {
  assert.match(migration, /alter table public\.industry_organizations enable row level security/);
  assert.match(migration, /alter table public\.industry_organization_members enable row level security/);
  assert.match(migration, /m\.user_id = auth\.uid\(\)/);
  assert.match(migration, /m\.status = 'active'/);
  assert.match(migration, /o\.status = 'active'/);
  assert.match(migration, /p\.account_status = 'active'/);
});

test('client cannot assign or elevate organization membership', () => {
  assert.doesNotMatch(migration, /create policy [\s\S]*industry_organization_members[\s\S]* for (insert|update|delete)[\s\S]*to authenticated/i);
  assert.match(migration, /Membership roles are authorization data and are never client-editable/);
});

test('organization provisioning requires approved industry access', () => {
  assert.match(migration, /profile_row\.access_status <> 'approved'/);
  assert.match(migration, /approved_industry_access_required/);
  assert.match(migration, /values \(org_id, actor, 'owner'\)/);
});

test('membership helper cannot inspect an arbitrary member id', () => {
  assert.match(migration, /is_industry_org_member\(org_id uuid\)/);
  assert.doesNotMatch(migration, /is_industry_org_member\(org_id uuid, member_id uuid/);
});
