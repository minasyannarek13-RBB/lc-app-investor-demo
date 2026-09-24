import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync('supabase/migrations/202609240051_creator_session_handoff_binding.sql', 'utf8');

test('session handoff is manager-configured and tenant scoped', () => {
  assert.match(sql, /create table if not exists public\.industry_creator_session_handoffs/i);
  assert.match(sql, /public\.is_industry_org_manager\(mapping_org_id\)/i);
  assert.match(sql, /m\.organization_id = sh\.organization_id/i);
  assert.match(sql, /m\.creator_id = s\.creator_id/i);
  assert.match(sql, /matching_creator_session_required/i);
});

test('public resolver fails closed unless session and destination are eligible', () => {
  assert.match(sql, /create or replace function public\.resolve_live_session_operator_handoff/i);
  assert.match(sql, /s\.status = 'live'/i);
  assert.match(sql, /s\.visibility = 'public'/i);
  assert.match(sql, /s\.provenance = 'user_generated'/i);
  assert.match(sql, /m\.status = 'active'/i);
  assert.match(sql, /o\.status = 'active'/i);
  assert.match(sql, /d\.status = 'approved'/i);
  assert.match(sql, /d\.approved_at is not null/i);
  assert.match(sql, /d\.destination_url ~ '\^https:\/\/'/i);
  assert.match(sql, /cp\.verification_status = 'verified'/i);
  assert.match(sql, /cp\.profile_status = 'published'/i);
  assert.match(sql, /p\.account_status = 'active'/i);
});

test('anonymous clients can only resolve, never configure session handoffs', () => {
  assert.match(sql, /revoke all on function public\.configure_creator_session_handoff\(uuid, uuid\) from public, anon/i);
  assert.match(sql, /grant execute on function public\.resolve_live_session_operator_handoff\(uuid\) to anon, authenticated/i);
});
