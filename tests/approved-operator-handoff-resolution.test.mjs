import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sql = readFileSync(new URL('../supabase/migrations/202609240048_approved_operator_handoff_resolution.sql', import.meta.url), 'utf8');

test('operator handoff resolver stays fail-closed and tenant-bound', () => {
  assert.match(sql, /d\.organization_id\s*=\s*m\.organization_id/i);
  assert.match(sql, /d\.status\s*=\s*'approved'/i);
  assert.match(sql, /d\.approved_at\s+is\s+not\s+null/i);
  assert.match(sql, /d\.destination_url\s*~\s*'\^https:\/\/'/i);
  assert.match(sql, /m\.status\s*=\s*'active'/i);
  assert.match(sql, /o\.status\s*=\s*'active'/i);
  assert.match(sql, /cp\.verification_status\s*=\s*'verified'/i);
  assert.match(sql, /cp\.profile_status\s*=\s*'published'/i);
  assert.match(sql, /cp\.onboarding_completed\s*=\s*true/i);
  assert.match(sql, /p\.account_status\s*=\s*'active'/i);
});

test('client manager cannot approve a destination through handoff assignment', () => {
  assert.match(sql, /is_industry_org_manager\(mapping_org_id\)/i);
  assert.match(sql, /approved_same_org_destination_required/i);
  assert.match(sql, /revoke all on function public\.assign_industry_creator_table_handoff\(uuid, uuid\) from public, anon/i);
});
