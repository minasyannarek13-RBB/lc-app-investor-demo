import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(
  new URL('../supabase/migrations/202609220037_creator_return_live_signal_sync.sql', import.meta.url),
  'utf8'
);

test('per-Creator live alert intent controls the existing follow signal flag', () => {
  assert.match(migration, /update public\.follows[\s\S]*set live_alerts_enabled = v_enabled[\s\S]*follower_id = v_user_id[\s\S]*following_id = v_creator_id/i);
  assert.match(migration, /after insert or update of live_alerts or delete on public\.creator_return_preferences/i);
});

test('muting a Creator removes already queued in-app live signals', () => {
  assert.match(migration, /if not v_enabled then[\s\S]*delete from public\.return_signals[\s\S]*recipient_id = v_user_id[\s\S]*creator_id = v_creator_id/i);
});

test('enabling alerts catches up only an eligible current public live session', () => {
  assert.match(migration, /public\.is_active_profile\(v_user_id\)/i);
  assert.match(migration, /public\.is_approved_creator\(v_creator_id\)/i);
  assert.match(migration, /not public\.is_blocked_pair\(v_user_id, v_creator_id\)/i);
  assert.match(migration, /s\.status = 'live'[\s\S]*s\.visibility = 'public'/i);
  assert.match(migration, /on conflict \(recipient_id, session_id, signal_type\) do nothing/i);
});

test('migration repairs existing preference and queued-signal drift', () => {
  assert.match(migration, /update public\.follows f[\s\S]*from public\.creator_return_preferences p/i);
  assert.match(migration, /delete from public\.return_signals s[\s\S]*p\.live_alerts is false/i);
});

test('sync function is not callable by browser roles', () => {
  assert.match(migration, /revoke all on function public\.sync_creator_return_live_alert_preference\(\) from public, anon, authenticated/i);
});
