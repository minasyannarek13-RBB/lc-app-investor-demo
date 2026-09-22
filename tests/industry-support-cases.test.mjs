import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(
  new URL('../supabase/migrations/202609220032_industry_support_cases.sql', import.meta.url),
  'utf8'
);

test('pilot support cases are tenant scoped and RLS protected', () => {
  assert.match(migration, /create table if not exists public\.industry_support_cases/i);
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /using \(public\.is_industry_org_member\(organization_id\)\)/i);
  assert.match(migration, /opened_by = auth\.uid\(\)/i);
  assert.match(migration, /public\.is_industry_org_manager\(organization_id\)/i);
});

test('support ownership is immutable and client delete is not granted', () => {
  assert.match(migration, /guard_industry_support_case_identity/i);
  assert.match(migration, /new\.organization_id is distinct from old\.organization_id/i);
  assert.match(migration, /new\.opened_by is distinct from old\.opened_by/i);
  assert.doesNotMatch(migration, /for delete to authenticated/i);
});

test('support surface preserves LC product boundary', () => {
  assert.match(migration, /category in \('access','creator_mapping','handoff','analytics','configuration','other'\)/i);
  assert.match(migration, /Excludes operator-owned gambling, funds, KYC\/AML and settlement operations/i);
  assert.doesNotMatch(migration, /category in \([^\n]*(deposit|withdrawal|wager|settlement|kyc|aml)/i);
});
