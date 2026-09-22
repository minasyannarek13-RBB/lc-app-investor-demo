import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(
  new URL('../supabase/migrations/202609220036_creator_return_follow_integrity.sql', import.meta.url),
  'utf8'
);

test('return preferences require the player to follow the creator', () => {
  assert.match(migration, /from public\.follows f[\s\S]*f\.follower_id = new\.user_id[\s\S]*f\.following_id = new\.creator_id/i);
  assert.match(migration, /before insert or update on public\.creator_return_preferences/i);
  assert.match(migration, /follow required for creator return preference/i);
});

test('unfollow removes stale return intent through a server-owned trigger', () => {
  assert.match(migration, /security definer/i);
  assert.match(migration, /after delete on public\.follows/i);
  assert.match(migration, /delete from public\.creator_return_preferences[\s\S]*user_id = old\.follower_id[\s\S]*creator_id = old\.following_id/i);
  assert.match(migration, /revoke all on function public\.remove_creator_return_preference_on_unfollow\(\) from public, anon, authenticated/i);
});

test('migration repairs pre-existing orphaned return preferences', () => {
  assert.match(migration, /delete from public\.creator_return_preferences p[\s\S]*where not exists/i);
});
