import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync(new URL('../supabase/migrations/202609240055_product_event_state_integrity.sql', import.meta.url), 'utf8');

test('positive follow evidence requires persisted follow state', () => {
  assert.match(sql, /new\.event_name = 'creator_follow' and not exists/i);
  assert.match(sql, /from public\.follows f[\s\S]*f\.follower_id = new\.user_id[\s\S]*f\.following_id = new\.creator_id/i);
});

test('positive reminder evidence requires persisted reminder state', () => {
  assert.match(sql, /new\.event_name = 'schedule_reminder' and not exists/i);
  assert.match(sql, /from public\.player_session_reminders r[\s\S]*r\.user_id = new\.user_id[\s\S]*r\.session_id = new\.creator_session_id/i);
});

test('measurement guard runs before inserts and relevant updates', () => {
  assert.match(sql, /before insert or update of event_name, creator_id, creator_session_id/i);
  assert.match(sql, /revoke all on function public\.enforce_product_event_state_integrity\(\) from public, anon, authenticated/i);
});
