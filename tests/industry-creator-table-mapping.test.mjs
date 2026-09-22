import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(
  new URL('../supabase/migrations/202609220043_industry_creator_table_mapping.sql', import.meta.url),
  'utf8'
);

test('creator table mappings are tenant scoped and direct browser mutation is closed', () => {
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /grant select on table public\.industry_creator_table_mappings to authenticated/i);
  assert.doesNotMatch(migration, /grant\s+(insert|update|delete)[\s\S]*industry_creator_table_mappings\s+to\s+authenticated/i);
  assert.match(migration, /m\.organization_id = industry_creator_table_mappings\.organization_id/i);
  assert.match(migration, /m\.user_id = auth\.uid\(\)/i);
  assert.match(migration, /m\.status = 'active'/i);
  assert.match(migration, /o\.status = 'active'/i);
  assert.match(migration, /p\.account_status = 'active'/i);
});

test('only active tenant managers can configure or pause mappings', () => {
  assert.match(migration, /not public\.is_industry_org_manager\(org_id\)/i);
  assert.match(migration, /organization_manager_required/i);
  assert.match(migration, /not public\.is_active_profile\(auth\.uid\(\)\)/i);
  assert.match(migration, /not public\.is_industry_org_manager\(org_id\)[\s\S]*update public\.industry_creator_table_mappings/i);
});

test('mapping fails closed unless creator identity is verified and published', () => {
  assert.match(migration, /cp\.verification_status = 'verified'/i);
  assert.match(migration, /cp\.profile_status = 'published'/i);
  assert.match(migration, /cp\.onboarding_completed = true/i);
  assert.match(migration, /p\.account_status = 'active'/i);
  assert.match(migration, /verified_published_creator_required/i);
});

test('mapping stores bounded configuration metadata without gameplay or financial fields', () => {
  assert.match(migration, /external_table_ref text not null/i);
  assert.match(migration, /char_length\(external_table_ref\) between 1 and 160/i);
  assert.match(migration, /status in \('active','paused'\)/i);
  assert.doesNotMatch(migration, /\b(balance|wallet|deposit|withdrawal|wager|bet_amount|settlement|kyc_status|aml_status)\b/i);
});

test('privileged mapping RPCs expose only intended authenticated boundaries', () => {
  for (const signature of [
    'public.configure_industry_creator_table_mapping(uuid, uuid, text, text)',
    'public.pause_industry_creator_table_mapping(uuid)'
  ]) {
    const escaped = signature.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(migration, new RegExp(`revoke all on function ${escaped} from public, anon`, 'i'));
    assert.match(migration, new RegExp(`grant execute on function ${escaped} to authenticated`, 'i'));
  }
});
