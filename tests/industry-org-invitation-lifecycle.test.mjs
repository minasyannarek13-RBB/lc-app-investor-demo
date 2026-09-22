import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const lifecycle = fs.readFileSync(
  new URL('../supabase/migrations/202609220041_industry_org_invitation_lifecycle.sql', import.meta.url),
  'utf8'
);
const guard = fs.readFileSync(
  new URL('../supabase/migrations/202609220042_industry_org_invitation_membership_guard.sql', import.meta.url),
  'utf8'
);

test('team invitations are tenant scoped and browser clients cannot mutate invitation rows', () => {
  assert.match(lifecycle, /enable row level security/i);
  assert.match(lifecycle, /grant select on table public\.industry_organization_invitations to authenticated/i);
  assert.doesNotMatch(lifecycle, /grant\s+(insert|update|delete)[\s\S]*industry_organization_invitations\s+to\s+authenticated/i);
  assert.match(lifecycle, /using \(public\.is_industry_org_manager\(organization_id\)\)/i);
});

test('raw invitation tokens are one-time secrets and only hashes are stored', () => {
  assert.match(lifecycle, /raw_token := encode\(gen_random_bytes\(32\), 'hex'\)/i);
  assert.match(lifecycle, /token_hash[\s\S]*encode\(digest\(raw_token, 'sha256'\), 'hex'\)/i);
  assert.doesNotMatch(lifecycle, /\btoken\s+text\s+not\s+null/i);
});

test('only managers can invite and admins cannot create peer admins', () => {
  assert.match(lifecycle, /actor_role not in \('owner','admin'\)/i);
  assert.match(lifecycle, /actor_role = 'admin' and invited_role = 'admin'/i);
  assert.match(lifecycle, /owner_required_for_admin_invite/i);
  assert.match(lifecycle, /invited_role not in \('admin','analyst','viewer'\)/i);
});

test('acceptance is fail closed and cannot rewrite an existing membership role', () => {
  assert.match(guard, /invite\.status <> 'pending' or invite\.expires_at <= now\(\)/i);
  assert.match(guard, /already_organization_member/i);
  assert.match(guard, /insert into public\.industry_organization_members[\s\S]*values \(invite\.organization_id, auth\.uid\(\), invite\.role, 'active'\)/i);
  assert.doesNotMatch(guard, /on conflict[\s\S]*do update/i);
});

test('privileged invitation functions expose only intended RPC boundaries', () => {
  for (const signature of [
    'public.create_industry_org_invitation(uuid, text)',
    'public.accept_industry_org_invitation(text)',
    'public.revoke_industry_org_invitation(uuid)'
  ]) {
    const escaped = signature.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(lifecycle + '\n' + guard, new RegExp(`revoke all on function ${escaped} from public, anon`, 'i'));
    assert.match(lifecycle + '\n' + guard, new RegExp(`grant execute on function ${escaped} to authenticated`, 'i'));
  }
});
