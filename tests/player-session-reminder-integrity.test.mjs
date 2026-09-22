import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(
  new URL('../supabase/migrations/202609220040_player_session_reminder_integrity.sql', import.meta.url),
  'utf8'
);

test('reminders fail closed to active players and eligible public sessions', () => {
  assert.match(migration, /new\.user_id <> auth\.uid\(\)[\s\S]*not public\.is_active_profile\(auth\.uid\(\)\)/i);
  assert.match(migration, /s\.visibility = 'public'[\s\S]*s\.status in \('scheduled', 'live'\)/i);
  assert.match(migration, /not public\.is_approved_creator\(session_creator\)/i);
  assert.match(migration, /public\.is_blocked_pair\(new\.user_id, session_creator\)/i);
});

test('reminder ownership and session attribution cannot be rewritten', () => {
  for (const field of ['user_id', 'session_id', 'created_at']) {
    assert.match(migration, new RegExp(`new\\.${field} is distinct from old\\.${field}`, 'i'));
  }
  assert.match(migration, /session reminder identity cannot change/i);
});

test('cancelled private completed and blocked relationships clean stale reminders', () => {
  assert.match(migration, /new\.visibility <> 'public' or new\.status not in \('scheduled', 'live'\)[\s\S]*delete from public\.player_session_reminders/i);
  assert.match(migration, /after update of status, visibility on public\.creator_sessions/i);
  assert.match(migration, /after insert on public\.user_blocks/i);
  assert.match(migration, /Repair stale reminders created before the eligibility invariant existed/i);
});

test('privileged cleanup functions are not callable by browser roles', () => {
  assert.match(migration, /revoke all on function public\.cleanup_ineligible_session_reminders\(\) from public, anon, authenticated/i);
  assert.match(migration, /revoke all on function public\.cleanup_blocked_pair_session_reminders\(\) from public, anon, authenticated/i);
});
