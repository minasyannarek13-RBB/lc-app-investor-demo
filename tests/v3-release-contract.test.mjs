import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const landing=read('index.html'),original=read('tests/fixtures/lc-live-landing-20260924.html');
test('V3 preserves every original story scene, portrait path and EN/RU content',()=>{
  const scenes=html=>[...html.matchAll(/<section class="scene[^\"]*" id="([^\"]+)"/g)].map(x=>x[1]);
  assert.deepEqual(scenes(landing),scenes(original));assert.equal(scenes(landing).length,11);
  for(const match of original.matchAll(/data-(?:en|ru)="([^\"]+)"/g))assert.ok(landing.includes(match[0]),match[0]);
  for(const match of original.matchAll(/<img[^>]+src="([^\"]+)"/g))assert.ok(landing.includes(match[1]),match[1]);
  for(const script of landing.matchAll(/<script>([\s\S]*?)<\/script>/g))assert.doesNotThrow(()=>new vm.Script(script[1]));
});
test('public landing canonical, pilot mailto and sole demo entry remain on existing domain',()=>{
  assert.match(landing,/rel="canonical" href="https:\/\/lc.open-gamer.com\/"/);
  assert.match(landing,/id="pilot-email" href="mailto:mn@open-gamer.com\?subject=/);
  const demos=[...landing.matchAll(/data-demo-cta href="([^\"]+)"/g)].map(x=>x[1]);
  assert.ok(demos.length>=2);assert.ok(demos.every(x=>x==='./LC_App_GitHub_Pages_Upload/?app=1#/product/demo/player'));
  assert.match(landing,/data-en="Discuss the project" data-ru="Обсудить проект"/);
  assert.doesNotMatch(landing,/Email Narek|Написать Нареку/);
  assert.match(landing,/connect-src 'none'/);assert.doesNotMatch(landing,/supabase-js|SUPABASE_|supabase\.co/);
  assert.match(read('robots.txt'),/Sitemap: https:\/\/lc.open-gamer.com\/sitemap.xml/);
  assert.match(read('sitemap.xml'),/<loc>https:\/\/lc.open-gamer.com\/<\/loc>/);
  assert.match(read('LC_App_GitHub_Pages_Upload/index.html'),/name="robots" content="noindex, follow"/);
});

test('secret gate detects privileged material while allowing reject guards and public tokens',async()=>{
  const {spawnSync}=await import('node:child_process');
  const jwt=role=>Buffer.from(JSON.stringify({alg:'HS256'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({role})).toString('base64url')+'.synthetic';
  const texts=['if (cfg.SUPABASE_SERVICE_ROLE_KEY) throw Error("rejected")',jwt('anon'),jwt('service_role'),'sb_secret_'+'A'.repeat(32),'-----BEGIN '+'PRIVATE KEY-----','postgresql://'+'user:password@example.test/db'];
  const python="import runpy,json,sys;detect=runpy.run_path(sys.argv[1])['detect'];print(json.dumps([detect(x) for x in json.load(sys.stdin)]))";
  const result=spawnSync('python3',['-c',python,fileURLToPath(new URL('../tools/check-public-secrets.py',import.meta.url))],{input:JSON.stringify(texts),encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout),[[],[],['privileged JWT'],['Supabase secret'],['private key'],['database password URL']]);
});

test('Pages publication is manual, main-only and tied to approved commit; recovery is explicit',()=>{
  const workflow=read('.github/workflows/lc-pages-public-release.yml');
  assert.match(workflow,/workflow_dispatch:/);
  assert.doesNotMatch(workflow,/^  (push|pull_request|schedule):/m);
  assert.match(workflow,/github.ref == 'refs\/heads\/main'/);
  assert.match(workflow,/expected_sha:/);
  assert.match(workflow,/test "\$\(git rev-parse HEAD\)" = "\$EXPECTED_SHA"/);
  assert.match(workflow,/python3 tools\/check-public-secrets.py/);
  const rollback=read('.github/workflows/lc-pages-fail-closed-rollback.yml');
  assert.match(workflow,/expected_zip_sha256:/);
  assert.match(workflow,/--expected-zip-sha/);
  assert.match(rollback,/workflow_dispatch:/);
  assert.match(rollback,/fallback-v145/);
  assert.match(rollback,/expected_zip_sha256:/);
  assert.match(rollback,/--expected-commit/);
  assert.doesNotMatch(rollback,/npm install|setup-node|build-public-release|node --test|needs: build/);
  assert.match(rollback,/path: public-release/);
  assert.match(workflow,/path: public-release/);
  assert.match(workflow,/retention-days: 90/);
});
