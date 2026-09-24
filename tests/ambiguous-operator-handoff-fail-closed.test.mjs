import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync(new URL('../supabase/migrations/202609240049_fail_closed_ambiguous_operator_handoff.sql', import.meta.url), 'utf8');

test('public operator handoff fails closed when more than one eligible mapping matches', () => {
  assert.match(sql, /with eligible as/i);
  assert.match(sql, /having count\(\*\) = 1/i);
  assert.doesNotMatch(sql, /order by m\.updated_at desc\s+limit 1/i);
});

test('handoff still requires approved HTTPS destination and eligible creator/account', () => {
  assert.match(sql, /d\.status = 'approved'/i);
  assert.match(sql, /d\.approved_at is not null/i);
  assert.match(sql, /d\.destination_url ~ '\^https:\/\/'/i);
  assert.match(sql, /cp\.verification_status = 'verified'/i);
  assert.match(sql, /cp\.profile_status = 'published'/i);
  assert.match(sql, /cp\.onboarding_completed = true/i);
  assert.match(sql, /p\.account_status = 'active'/i);
});

test('resolver remains read-only public capability with no direct table exposure change', () => {
  assert.match(sql, /security definer/i);
  assert.match(sql, /revoke all on function public\.resolve_licensed_operator_handoff\(uuid, text\) from public/i);
  assert.match(sql, /grant execute on function public\.resolve_licensed_operator_handoff\(uuid, text\) to anon, authenticated/i);
  assert.doesNotMatch(sql, /grant\s+(insert|update|delete)/i);
});
