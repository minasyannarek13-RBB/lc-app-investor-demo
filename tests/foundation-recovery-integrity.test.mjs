import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const recovered = new Map([
  ['202608080001_auth_profiles_storage.sql', '77e6bb38e1c60aa6f478564cfa5ac422562cba2b01ee2205dc9556a82309e913'],
  ['202608080002_profiles_role_and_moderation_helper.sql', 'aa356b306ace1fd96bc1886c7f6bb53dc48c0c319cf0058015038b8978919b6f'],
  ['202608080003_social_graph.sql', '17bbb3e4e67818c265e87ba97842231cf209170f1d7f11fb4304185cbacbe8e1'],
  ['202608080004_posts_engagement.sql', 'a0236c2437de9c362975722346831e25be6ad09823fc93141455d54bfe203d1c'],
  ['202608080005_activity_notifications.sql', 'fac4816ac4fd24bf543dd9e69dbf47998640ad58948edd70b527292a27a8b8a0'],
  ['202608080006_reports.sql', '394b69364bd6046dd9ab96c93c5d30d40a73cf7e52aff98496b72b6056d3b273']
]);

const migration = (name) => readFileSync(new URL(`supabase/migrations/${name}`, root));

test('recovered migrations 001-006 retain their authoritative local hashes', () => {
  for (const [name, expected] of recovered) {
    assert.equal(createHash('sha256').update(migration(name)).digest('hex'), expected, name);
  }
});

test('reconstructed foundation migrations remain explicitly classified', () => {
  for (const name of [
    '202610090057_foundation_contract_recovery.sql',
    '202610090058_avatar_storage_contract_recovery.sql'
  ]) {
    assert.match(migration(name).toString(), /Reconstructed from the authoritative LC Frontend\/Supabase API Contract/);
  }
});

test('foundation hardening removes suspended moderation and mutation paths', () => {
  const sql = migration('202610090060_foundation_privilege_and_suspension_hardening.sql').toString();
  assert.match(sql, /account_status = 'active'[\s\S]*role in \('moderator', 'admin'\)/);
  assert.match(sql, /reports_insert_own[\s\S]*is_active_profile\(reporter_id\)/);
  assert.match(sql, /avatar_owner_insert[\s\S]*is_active_profile\(auth\.uid\(\)\)/);
  assert.match(sql, /revoke create on schema public from public, anon, authenticated/);
});
