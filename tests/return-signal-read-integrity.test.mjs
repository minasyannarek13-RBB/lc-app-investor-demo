import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(
  new URL('../supabase/migrations/202609220039_return_signal_read_integrity.sql', import.meta.url),
  'utf8'
);

test('return signal identity and attribution fields remain immutable', () => {
  for (const field of ['id', 'recipient_id', 'creator_id', 'session_id', 'signal_type', 'created_at']) {
    assert.match(migration, new RegExp(`new\\.${field} is distinct from old\\.${field}`, 'i'));
  }
});

test('read state is monotonic and cannot be cleared or rewritten', () => {
  assert.match(migration, /if old\.read_at is not null[\s\S]*new\.read_at is distinct from old\.read_at[\s\S]*read state is immutable once read/i);
  assert.match(migration, /if new\.read_at is null[\s\S]*update must mark the signal read/i);
});

test('database clock owns response timestamp instead of browser input', () => {
  assert.match(migration, /new\.read_at := now\(\)/i);
  assert.match(migration, /database is authoritative for response timing/i);
});

test('guard function remains unavailable to browser roles', () => {
  assert.match(migration, /revoke all on function public\.protect_return_signal_update\(\) from public, anon, authenticated/i);
});
