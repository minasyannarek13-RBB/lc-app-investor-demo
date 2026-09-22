import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(
  new URL('../supabase/migrations/202609220035_creator_return_preferences.sql', import.meta.url),
  'utf8'
);

test('creator return preferences are private and player-owned', () => {
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /for select to authenticated[\s\S]*auth\.uid\(\) = user_id/i);
  assert.match(migration, /for insert to authenticated[\s\S]*auth\.uid\(\) = user_id/i);
  assert.match(migration, /for update to authenticated[\s\S]*auth\.uid\(\) = user_id/i);
  assert.match(migration, /for delete to authenticated[\s\S]*auth\.uid\(\) = user_id/i);
  assert.match(migration, /owner cannot change/i);
});

test('suspended players and unapproved creators fail closed', () => {
  assert.match(migration, /not public\.is_active_profile\(auth\.uid\(\)\)/i);
  assert.match(migration, /not public\.is_approved_creator\(new\.creator_id\)/i);
  assert.match(migration, /public\.is_approved_creator\(creator_id\)/i);
});

test('return preferences stay bounded and do not pretend to deliver notifications', () => {
  assert.match(migration, /schedule_lead_minutes between 0 and 1440/i);
  assert.match(migration, /live_alerts boolean not null default true/i);
  assert.match(migration, /schedule_alerts boolean not null default true/i);
  assert.match(migration, /Does not claim or perform message delivery/i);
  assert.doesNotMatch(migration, /\b(push_token|device_token|email_address|phone_number)\b/i);
});
