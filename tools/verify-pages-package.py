#!/usr/bin/env python3
"""Verify pinned static bytes before extracting a Pages artifact; standard library only."""
import argparse, hashlib, json, pathlib, re, stat, subprocess, zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
FROZEN_ROLLBACK_SHA = 'dac10adb378e71cb8dec62012e3c9f2afd42e6063a887ac1cf5f4a614c01525c'
PRIVATE_PATH = re.compile(r'(?:^|/)(?:auth\.js|\.env(?:\..*)?|supabase|tests|evidence|node_modules|README[^/]*)(?:/|$)', re.I)
PRIVATE_CODE = re.compile(r'\.(?:from|rpc)\s*\(\s*["\']|\.auth\s*\.|supabase(?:\.co|-js)|createClient\s*\(|data-auth-route|/(?:rest|auth)/v1|sb_secret_|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY', re.I)

def sha(data):
    return hashlib.sha256(data).hexdigest()

def verify(mode, expected_zip_sha, expected_commit=None, output=None, artifact_root=None):
    if not re.fullmatch(r'[0-9a-f]{64}', expected_zip_sha):
        raise ValueError('Expected full SHA-256 required')
    if expected_commit is not None:
        if not re.fullmatch(r'[0-9a-f]{40}', expected_commit):
            raise ValueError('Expected full commit SHA required')
        try:
            actual = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True, stderr=subprocess.PIPE).strip()
        except subprocess.CalledProcessError as error:
            raise ValueError('Unable to verify checkout commit') from error
        if actual != expected_commit:
            raise ValueError('Checkout commit differs from approved commit')
    base = pathlib.Path(artifact_root) if artifact_root else ROOT/'releases/lc-v4'
    contract = json.loads((base/'contract.json').read_text())
    release = contract[mode]
    if release['zip_sha256'] != expected_zip_sha:
        raise ValueError('Approval ZIP SHA differs from pinned contract')
    if mode == 'fallback-v145' and expected_zip_sha != FROZEN_ROLLBACK_SHA:
        raise ValueError('Frozen v145 bytes cannot be replaced')
    packed = (base/release['zip']).read_bytes()
    if sha(packed) != expected_zip_sha:
        raise ValueError('ZIP SHA-256 mismatch')
    manifest_bytes = (base/release['manifest']).read_bytes()
    if sha(manifest_bytes) != release['manifest_sha256']:
        raise ValueError('Pinned manifest SHA-256 mismatch')
    rows = json.loads(manifest_bytes)['files']
    names = [x['path'] for x in rows]
    if len(names) != release['count'] or len(set(names)) != len(names) or sorted(names) != release['allowlist']:
        raise ValueError('Manifest differs from exact independent allowlist')
    payload = {}
    with zipfile.ZipFile(base/release['zip']) as z:
        if z.testzip() is not None or len(z.namelist()) != len(names) or sorted(z.namelist()) != sorted(names):
            raise ValueError('ZIP contains missing, duplicate, corrupt or extra paths')
        for row in rows:
            name = row['path']
            info = z.getinfo(name)
            if name.startswith('/') or '\\' in name or '..' in pathlib.PurePosixPath(name).parts or PRIVATE_PATH.search(name) or info.is_dir() or stat.S_ISLNK(info.external_attr >> 16):
                raise ValueError('Forbidden artifact path: '+name)
            data = z.read(name)
            if len(data) != row['size'] or sha(data) != row['sha256']:
                raise ValueError('File size/SHA mismatch: '+name)
            if name.endswith(('.js','.html')) and PRIVATE_CODE.search(data.decode('utf-8')):
                raise ValueError('Private DB/Auth code in public artifact: '+name)
            payload[name] = data
    if payload['CNAME'] != b'lc.open-gamer.com':
        raise ValueError('Custom domain mismatch')
    if payload['sw.js'] != payload['LC_App_GitHub_Pages_Upload/sw.js']:
        raise ValueError('Worker scope parity mismatch')
    revision = release['cache_revision']
    if f'lc-app-investor-demo-v{revision}'.encode() not in payload['sw.js']:
        raise ValueError('Cache revision mismatch')
    if mode == 'fallback-v145' and any(x.endswith(('.js','.css','.webmanifest')) and not x.endswith('/sw.js') and x != 'sw.js' for x in names):
        raise ValueError('Rollback contains application runtime')
    if output:
        destination = pathlib.Path(output)
        if destination.is_symlink() or (destination.exists() and any(destination.iterdir())):
            raise ValueError('Output must be absent or empty; refusing mixed artifact')
        destination.mkdir(parents=True, exist_ok=True)
        for name,data in payload.items():
            target = destination/name
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open('xb') as stream:
                stream.write(data)
        extracted = sorted(x.relative_to(destination).as_posix() for x in destination.rglob('*') if x.is_file())
        if extracted != sorted(names):
            raise ValueError('Extracted allowlist mismatch')
    return {'mode':mode,'commit':expected_commit,'zip_sha256':expected_zip_sha,'files':len(payload),'bytes':sum(map(len,payload.values())),'cache_revision':revision,'privacy':'PASS','allowlist':'PASS'}

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--mode',required=True,choices=['public','fallback-v145'])
    parser.add_argument('--expected-zip-sha',required=True)
    parser.add_argument('--expected-commit')
    parser.add_argument('--output')
    args = parser.parse_args()
    print(json.dumps(verify(args.mode,args.expected_zip_sha,args.expected_commit,args.output),indent=2))
