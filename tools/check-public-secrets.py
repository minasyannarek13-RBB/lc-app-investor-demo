#!/usr/bin/env python3
from pathlib import Path
import base64,json,re,sys

def detect(text):
 issues=[]
 for kind,pattern in [('private key',r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),('Supabase secret',r'\bsb_secret_[A-Za-z0-9_-]{20,}\b'),('database password URL',r'postgres(?:ql)?://[^\s/"\']+:[^\s@"\']+@')]:
  if re.search(pattern,text):issues.append(kind)
 for match in re.finditer(r'eyJ[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+',text):
  try:claims=json.loads(base64.urlsafe_b64decode(match[1]+'='*((-len(match[1]))%4)))
  except (ValueError,UnicodeError):continue
  if claims.get('role')=='service_role':issues.append('privileged JWT')
 return issues

if __name__=='__main__':
 root=Path(__file__).resolve().parents[1];issues=[]
 for file in root.rglob('*'):
  if not file.is_file() or any(part in {'.git','.local-backups','evidence','node_modules','.vercel'} for part in file.relative_to(root).parts):continue
  if file.suffix not in {'.js','.mjs','.cjs','.html','.py','.json','.yml','.yaml','.sql','.env'} and not file.name.startswith('.env'):continue
  for kind in detect(file.read_text(errors='replace')):issues.append((str(file.relative_to(root)),kind))
 if issues:
  for file,kind in issues:print(f'{file}: blocked {kind}; value redacted')
  sys.exit(1)
 print('Secret scan PASS: no private PEM, real sb_secret key, privileged JWT or password URL. Guard identifiers and synthetic fixtures are not credentials.')
