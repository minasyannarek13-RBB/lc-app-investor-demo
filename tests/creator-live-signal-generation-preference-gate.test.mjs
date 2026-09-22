import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(
  new URL('../supabase/migrations/202609220038_creator_live_signal_generation_preference_gate.sql', import.meta.url),
  'utf8'
);

test('live signal generation consumes the persisted per-Creator alert gate', () => {
  assert.match(migration, /from public\.follows f[\s\S]*f\.following_id = new\.creator_id[\s\S]*f\.live_alerts_enabled is true/i);
});

test('global live preference remains an independent fail-closed gate', () => {
  assert.match(migration, /left join public\.return_signal_preferences pref[\s\S]*coalesce\(pref\.creator_live_enabled, true\)/i);
});

test('signal generation still requires active follower, verified published Creator and no block', () => {
  assert.match(migration, /cp\.verification_status = 'verified'[\s\S]*cp\.profile_status = 'published'/i);
  assert.match(migration, /public\.is_active_profile\(f\.follower_id\)/i);
  assert.match(migration, /not public\.is_blocked_pair\(f\.follower_id, new\.creator_id\)/i);
});

test('privileged signal generator is not callable by browser roles', () => {
  assert.match(migration, /revoke all on function public\.create_creator_live_return_signals\(\) from public, anon, authenticated/i);
});
