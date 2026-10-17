import hashlib,importlib.util,io,json,os,pathlib,runpy,shutil,subprocess,sys,tempfile,unittest,zipfile
from unittest.mock import patch
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('package_gate',ROOT/'tools/verify-pages-package.py');gate=importlib.util.module_from_spec(spec);spec.loader.exec_module(gate)
class ReleaseInfrastructure(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory(prefix='lc-release-gate-test-');self.base=pathlib.Path(self.temp.name);shutil.copytree(ROOT/'releases/lc-v4',self.base/'artifacts');self.art=self.base/'artifacts';self.contract=json.loads((self.art/'contract.json').read_text())
 def tearDown(self):self.temp.cleanup()
 def verify(self,mode='public',**kw):return gate.verify(mode,self.contract[mode]['zip_sha256'],artifact_root=self.art,**kw)
 def mutate(self,name,content,extra=False,symlink=False):
  mode='public';c=self.contract[mode];zpath=self.art/c['zip'];data={}
  with zipfile.ZipFile(zpath) as z:data={x:z.read(x) for x in z.namelist()}
  data[name]=content
  with zipfile.ZipFile(zpath,'w',zipfile.ZIP_DEFLATED) as z:
   for key,value in data.items():
    info=zipfile.ZipInfo(key)
    if symlink and key==name:info.external_attr=0o120777<<16
    z.writestr(info,value)
  c['zip_sha256']=gate.sha(zpath.read_bytes())
  if not extra:
   mpath=self.art/c['manifest'];m=json.loads(mpath.read_text());row=next((x for x in m['files'] if x['path']==name),None)
   if row:row.update(size=len(content),sha256=gate.sha(content))
   else:m['files'].append({'path':name,'size':len(content),'sha256':gate.sha(content)});c['allowlist']=sorted(data);c['count']=len(data)
   mpath.write_text(json.dumps(m));c['manifest_sha256']=gate.sha(mpath.read_bytes())
  (self.art/'contract.json').write_text(json.dumps(self.contract))
 def test_release_all55_hashes_and_allowlist(self):self.assertEqual(self.verify()['files'],55)
 def test_rollback_all13_immutable(self):self.assertEqual(self.verify('fallback-v145')['files'],13)
 def test_wrong_approved_commit(self):
  with self.assertRaisesRegex(ValueError,'commit'):self.verify(expected_commit='0'*40)
 def test_wrong_approval_zip_sha(self):
  with self.assertRaisesRegex(ValueError,'Approval'):gate.verify('public','0'*64,artifact_root=self.art)
 def test_corrupt_zip(self):
  f=self.art/self.contract['public']['zip'];f.write_bytes(f.read_bytes()+b'tampered')
  with self.assertRaisesRegex(ValueError,'ZIP SHA'):self.verify()
 def test_tampered_manifest(self):
  f=self.art/self.contract['public']['manifest'];f.write_bytes(f.read_bytes()+b' ')
  with self.assertRaisesRegex(ValueError,'manifest SHA'):self.verify()
 def test_extra_file_even_when_zip_sha_reapproved(self):
  self.mutate('unexpected.js',b'alert(1)',extra=True)
  with self.assertRaisesRegex(ValueError,'extra paths'):self.verify()
 def test_private_path_even_when_allowlist_reapproved(self):
  self.mutate('auth.js',b'// private')
  with self.assertRaisesRegex(ValueError,'Forbidden'):self.verify()
 def test_path_traversal(self):
  self.mutate('../escape.js',b'alert(1)')
  with self.assertRaisesRegex(ValueError,'Forbidden'):self.verify()
 def test_symlink(self):
  self.mutate('robots.txt',b'index.html',symlink=True)
  with self.assertRaisesRegex(ValueError,'Forbidden'):self.verify()
 def test_db_path_even_with_reapproved_hashes(self):
  self.mutate('LC_App_GitHub_Pages_Upload/social.js',b'client.from("profiles").delete()')
  with self.assertRaisesRegex(ValueError,'Private DB/Auth'):self.verify()
 def test_domain_guard(self):
  self.mutate('CNAME',b'another.example')
  with self.assertRaisesRegex(ValueError,'domain'):self.verify()
 def test_mixed_output_is_rejected(self):
  d=self.base/'out';d.mkdir();(d/'auth.js').write_text('old private code')
  with self.assertRaisesRegex(ValueError,'mixed'):self.verify(output=d)
 def test_exact_extraction(self):
  d=self.base/'out';self.verify(output=d);self.assertEqual(sorted(x.relative_to(d).as_posix() for x in d.rglob('*') if x.is_file()),self.contract['public']['allowlist'])
 def test_rollback_without_public_zip_npm_or_build(self):
  # Simulate a completely missing main application package/build ecosystem.
  for f in ['public-v144.zip','public-v144.manifest.json']:(self.art/f).unlink()
  self.assertEqual(self.verify('fallback-v145')['files'],13)
  w=(ROOT/'.github/workflows/lc-pages-fail-closed-rollback.yml').read_text()
  self.assertNotIn('npm ',w);self.assertNotIn('setup-node',w);self.assertNotIn('build-public-release',w);self.assertNotIn('node --test',w);self.assertNotIn('needs: build',w)
 def test_rollbacks_cannot_replace_frozen_bytes(self):
  self.contract['fallback-v145']['zip_sha256']='1'*64;(self.art/'contract.json').write_text(json.dumps(self.contract))
  with self.assertRaisesRegex(ValueError,'Frozen'):self.verify('fallback-v145')
 def test_historical_source_writers_are_disabled(self):
  for f in (ROOT/'.github/workflows').glob('*.yml'):
   w=f.read_text()
   if 'git push' in w:
    self.assertNotIn('contents: write',w)
    self.assertIn('if: ${{ false }} # Retired source-mutating',w)
 def test_workflows_explicit_approval_and_shared_deployment_serialization(self):
  for f in ['lc-pages-public-release.yml','lc-pages-fail-closed-rollback.yml']:
   w=(ROOT/'.github/workflows'/f).read_text()
   for token in ['workflow_dispatch:','expected_sha:','expected_zip_sha256:','--expected-commit "$EXPECTED_SHA"','group: lc-app-public-pages','name: github-pages','pages: write','id-token: write','needs: verify','tools/check-pages-target.py','timeout-minutes:']:
    self.assertIn(token,w)
   self.assertNotIn('  push:',w);self.assertNotIn('  pull_request:',w)

class PagesTargetGuard(unittest.TestCase):
 def check(self,mode='public',main='a'*40,source='workflow',domain='lc.open-gamer.com',https=True,worker=118):
  urls=[]
  class Response(io.BytesIO):
   def __init__(self,data,url):super().__init__(data);self.url=url
  def response(request,timeout):
   url=request.full_url;urls.append(url)
   if url.endswith('commits/main'):data=json.dumps({'sha':main}).encode()
   elif url.endswith('/pages'):data=json.dumps({'build_type':source,'cname':domain,'https_enforced':https}).encode()
   elif url=='https://lc.open-gamer.com/sw.js':data=('const NAME="lc-app-investor-demo-v'+str(worker)+'";').encode()
   else:raise AssertionError('Unexpected target '+url)
   return Response(data,url)
  env={'GITHUB_REPOSITORY':'minasyannarek13-RBB/lc-app-investor-demo','GH_TOKEN':'synthetic-test-token'}
  with patch.dict(os.environ,env),patch.object(sys,'argv',['check-pages-target.py','--expected-sha','a'*40,'--mode',mode]),patch('urllib.request.urlopen',response):
   runpy.run_path(str(ROOT/'tools/check-pages-target.py'),run_name='__main__')
  return urls
 def test_current_v118_actions_target(self):self.assertEqual(len(self.check()),3)
 def test_main_moved(self):
  with self.assertRaisesRegex(SystemExit,'Main moved'):self.check(main='b'*40)
 def test_legacy_source_is_blocked(self):
  with self.assertRaisesRegex(SystemExit,'contract mismatch'):self.check(source='legacy')
 def test_wrong_domain_is_blocked(self):
  with self.assertRaisesRegex(SystemExit,'contract mismatch'):self.check(domain='other.example')
 def test_https_disabled_is_blocked(self):
  with self.assertRaisesRegex(SystemExit,'contract mismatch'):self.check(https=False)
 def test_public_downgrade_after_v145_blocked(self):
  with self.assertRaisesRegex(SystemExit,'Refuse v144'):self.check(worker=145)
 def test_rollback_does_not_depend_on_live_site_availability(self):self.assertEqual(len(self.check(mode='fallback-v145')),2)

if __name__=='__main__':unittest.main()
