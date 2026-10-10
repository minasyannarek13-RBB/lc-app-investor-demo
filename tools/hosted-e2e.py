#!/usr/bin/env python3
"""Prepared hosted Auth/RLS/Storage smoke; requires separate write authorization."""
import base64
import json
import os
import secrets
import sys
import urllib.error
import urllib.request

STAGING = 'dnpizrjuxkcnmdgmvnks'
PRODUCTION = 'aspbwgsfkebduvviyeuo'


def main():
    ref = os.environ['LC_TEST_PROJECT_REF']
    if not (len(ref) == 20 and ref.isalpha() and ref.islower()):
        raise RuntimeError('Invalid project ref')
    if ref == PRODUCTION or os.environ.get('LC_HOSTED_WRITE_APPROVAL') != ref:
        raise RuntimeError('Protected target or missing target-specific authorization')
    if os.environ.get('LC_SYNTHETIC_FIXTURE_APPROVAL') != ref:
        raise RuntimeError('Synthetic fixture creation/cleanup authorization required')
    if ref == STAGING and os.environ.get('LC_STAGING_E2E_APPROVAL') != ref:
        raise RuntimeError('Staging needs separate E2E authorization')
    url = f'https://{ref}.supabase.co'
    anon = os.environ['LC_TEST_ANON_KEY']
    service = os.environ['LC_TEST_SERVICE_KEY']
    users, objects = [], []

    def request(method, path, token=None, body=None, raw=False):
        key = service if token == service else anon
        headers = {'apikey': key, 'Content-Type': 'image/png' if raw else 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        data = body if raw else (json.dumps(body).encode() if body is not None else None)
        req = urllib.request.Request(url + path, data=data, headers=headers, method=method)
        # No retries for mutations; uncertain timeout requires fixture audit/recovery.
        class NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, *args, **kwargs):
                return None
        try:
            with urllib.request.build_opener(NoRedirect).open(req, timeout=20) as response:
                value = response.read()
                return response.status, value if raw else (json.loads(value) if value else None)
        except urllib.error.HTTPError as error:
            value = error.read()
            try:
                value = json.loads(value)
            except ValueError:
                value = None
            return error.code, value

    def check(label, result, predicate):
        status, body = result
        if not predicate(status, body):
            raise RuntimeError(f'FAIL {label} (HTTP {status}; response redacted)')
        print(f'PASS {label}')
        return body

    denied = lambda status, body: status in (401, 403) or (
        status == 400 and isinstance(body, dict) and
        (str(body.get('statusCode')) in ('401', '403') or body.get('code') == '42501'))
    png = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=')
    cleanup_failed = False
    try:
        actors = []
        for _ in range(2):
            password = secrets.token_urlsafe(32)
            email = f'lc-e2e-{secrets.token_hex(12)}@example.test'
            user = check('create synthetic user', request('POST', '/auth/v1/admin/users', service,
                {'email': email, 'password': password, 'email_confirm': True}),
                lambda s, b: s in (200, 201) and bool(b.get('id')))
            users.append(user['id'])
            session = check('password sign-in', request('POST', '/auth/v1/token?grant_type=password', body={
                'email': email, 'password': password}), lambda s, b: s == 200 and bool(b.get('access_token')))
            actors.append((user['id'], session))
        a, session = actors[0]
        b, second = actors[1]
        token = session['access_token']
        check('Auth user identity', request('GET', '/auth/v1/user', token), lambda s, v: s == 200 and v['id'] == a)
        check('owner profile RPC', request('POST', '/rest/v1/rpc/get_own_profile', token, {}),
              lambda s, v: s == 200 and isinstance(v, dict) and v.get('id') == a)
        check('private profile column denied', request('GET', '/rest/v1/profiles?select=age_confirmed', token), denied)
        check('anonymous profile denied', request('GET', '/rest/v1/profiles?select=id'), denied)
        check('positive report insert', request('POST', '/rest/v1/reports', token,
            {'reporter_id': a, 'target_type': 'profile', 'target_id': b, 'reason': 'other'}), lambda s, v: s == 201)
        check('cross-user reports hidden', request('GET', f'/rest/v1/reports?reporter_id=eq.{a}&select=id', second['access_token']),
              lambda s, v: s == 200 and v == [])
        path = f'{a}/lc-e2e-{secrets.token_hex(8)}.png'
        objects.append(path)
        check('owner avatar upload', request('POST', '/storage/v1/object/avatars/' + path, token, png, True), lambda s, v: s == 200)
        check('owner avatar update', request('PUT', '/storage/v1/object/avatars/' + path, token, png, True), lambda s, v: s == 200)
        check('public avatar read', request('GET', '/storage/v1/object/public/avatars/' + path, raw=True), lambda s, v: s == 200 and v == png)
        check('cross-user avatar update denied', request('PUT', '/storage/v1/object/avatars/' + path, second['access_token'], png, True), denied)
        foreign = f'{b}/lc-e2e-{secrets.token_hex(8)}.png'
        objects.append(foreign)
        check('foreign-folder upload denied', request('POST', '/storage/v1/object/avatars/' + foreign, token, png, True), denied)
        check('suspend synthetic player', request('POST', '/rest/v1/rpc/admin_set_profile_account_status', service,
              {'p_user_id': a, 'p_account_status': 'suspended'}), lambda s, v: 200 <= s < 300)
        check('suspended avatar update denied', request('PUT', '/storage/v1/object/avatars/' + path, token, png, True), denied)
        refreshed = check('refresh session', request('POST', '/auth/v1/token?grant_type=refresh_token', body={
            'refresh_token': session['refresh_token']}), lambda s, v: s == 200 and bool(v.get('access_token')))
        check('logout', request('POST', '/auth/v1/logout?scope=global', refreshed['access_token']), lambda s, v: s == 204)
        check('logout revokes refresh', request('POST', '/auth/v1/token?grant_type=refresh_token', body={
            'refresh_token': refreshed['refresh_token']}), lambda s, v: s in (400, 401) and isinstance(v, dict) and
            v.get('error_code') in ('refresh_token_not_found', 'refresh_token_already_used', 'session_not_found'))
        print('SMOKE PASS; full role/tenant/email/integration/browser/recovery gates remain pending')
    finally:
        if objects:
            status, _ = request('DELETE', '/storage/v1/object/avatars', service, {'prefixes': objects})
            cleanup_failed |= not 200 <= status < 300
        for user_id in users:
            status, _ = request('DELETE', '/auth/v1/admin/users/' + user_id, service)
            cleanup_failed |= not 200 <= status < 300
        if cleanup_failed:
            raise RuntimeError('Fixture cleanup incomplete; stop and audit disposable project')


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        # Never print credentials, URL request details or server response bodies.
        print('BLOCKED/FAIL ' + (str(error) if isinstance(error, RuntimeError) else type(error).__name__), file=sys.stderr)
        sys.exit(1)
