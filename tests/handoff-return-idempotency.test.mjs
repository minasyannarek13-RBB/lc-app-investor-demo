import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync(new URL('../supabase/migrations/202609240050_handoff_return_idempotency.sql', import.meta.url), 'utf8');

test('attributable handoff return is idempotent per user journey Creator and session', () => {
  assert.match(sql, /create unique index if not exists product_events_handoff_return_once_idx/i);
  assert.match(sql, /on public\.product_events \(user_id, journey_id, creator_id, creator_session_id\)/i);
  assert.match(sql, /where event_name = 'handoff_return'/i);
});
