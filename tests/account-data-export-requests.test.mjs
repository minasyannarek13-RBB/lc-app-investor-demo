import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(
  new URL('../supabase/migrations/202609220034_account_data_export_requests.sql', import.meta.url),
  'utf8'
);

test('privacy export requests are private and user-owned', () => {
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /for select to authenticated[\s\S]*auth\.uid\(\) = user_id/i);
  assert.match(migration, /for insert to authenticated[\s\S]*auth\.uid\(\) = user_id/i);
  assert.match(migration, /not public\.is_active_profile\(auth\.uid\(\)\)/i);
});

test('browser clients cannot self-complete or delete export requests', () => {
  assert.doesNotMatch(migration, /for update to authenticated/i);
  assert.doesNotMatch(migration, /for delete to authenticated/i);
  assert.match(migration, /grant select, insert on table public\.account_data_export_requests to authenticated/i);
  assert.match(migration, /completion and expiry are privileged backend data-lifecycle actions/i);
});

test('export requests contain no payload or download secret', () => {
  assert.match(migration, /contains no export payload or download secret/i);
  assert.doesNotMatch(migration, /\b(download_url|signed_url|storage_path|payload|token|secret)\s+(text|jsonb|uuid)/i);
  assert.match(migration, /one_open[\s\S]*status in \('pending','processing'\)/i);
  assert.match(migration, /requested_at > now\(\) - interval '24 hours'[\s\S]*>= 3/i);
});