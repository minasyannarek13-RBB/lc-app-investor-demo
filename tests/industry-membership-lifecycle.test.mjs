import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(
  new URL('../supabase/migrations/202609220046_industry_membership_lifecycle.sql', import.meta.url),
  'utf8'
);
const serializationHardening = fs.readFileSync(
  new URL('../supabase/migrations/202609220047_serialize_industry_owner_lifecycle.sql', import.meta.url),
  'utf8'
);

test('tenant membership lifecycle is owner-only and active-account gated', () => {
  assert.match(migration, /not public\.is_active_profile\(actor\)/i);
  assert.match(migration, /actor_role <> 'owner'/i);
  assert.match(migration, /organization_owner_required/i);
});

test('membership lifecycle prevents last active owner lockout', () => {
  assert.match(migration, /target_role = 'owner'/i);
  assert.match(migration, /active_owner_count <= 1/i);
  assert.match(migration, /last_active_owner_required/i);
});

test('owner lifecycle serializes concurrent membership changes on the tenant row', () => {
  assert.match(serializationHardening, /from public\.industry_organizations o[\s\S]*where o\.id = org_id[\s\S]*for update/i);
  assert.match(serializationHardening, /active_organization_required/i);
  assert.match(serializationHardening, /select count\(\*\) into active_owner_count[\s\S]*active_owner_count <= 1/i);
});

test('membership lifecycle validates role and status and closes anonymous execution', () => {
  assert.match(serializationHardening, /next_role not in \('owner','admin','analyst','viewer'\)/i);
  assert.match(serializationHardening, /next_status not in \('active','suspended','removed'\)/i);
  assert.match(serializationHardening, /revoke all on function public\.manage_industry_org_member\(uuid, uuid, text, text\) from public, anon/i);
  assert.match(serializationHardening, /grant execute on function public\.manage_industry_org_member\(uuid, uuid, text, text\) to authenticated/i);
});
