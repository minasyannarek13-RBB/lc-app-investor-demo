import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync, existsSync} from 'node:fs';
const auth = readFileSync(new URL('../LC_App_GitHub_Pages_Upload/public-demo-bootstrap.js', import.meta.url),'utf8');
const html = readFileSync(new URL('../LC_App_GitHub_Pages_Upload/index.html', import.meta.url),'utf8');
test('public bootstrap cannot read stored Auth, load SDK, initialize clients or touch network on any event', () => {
  const callbacks = {}, mounts=[];
  const fail=()=>{throw Error('Public demo crossed the Auth/network boundary');};
  const window={LC_APP_MODE:'public_demo', LCAppProduct:{mountDemoEntry:()=>mounts.push('demo')},addEventListener:(type,fn)=>callbacks[type]=fn};
  Object.defineProperty(window,'supabase',{get:fail});
  Object.defineProperty(window,'LC_APP_CONFIG',{get:fail});
  vm.runInNewContext(auth,{window,document:{documentElement:{classList:{remove(){},add(){}}}},localStorage:{getItem:fail,setItem:fail},sessionStorage:{getItem:fail,setItem:fail},fetch:fail,XMLHttpRequest:fail,WebSocket:fail});
  for (const type of ['load','hashchange','popstate']) callbacks[type]();
  assert.equal(mounts.length,3, 'load must not replace an already mounted demo; hash/popstate still route');
});
test('public app mode is fixed before modules and cannot be switched by query or role controls',()=>{
  const window={};
  const bootstrap=html.match(/<script>\s*(Object.defineProperty[\s\S]*?)<\/script>/)[1];
  vm.runInNewContext(bootstrap,{window});
  assert.equal(window.LC_APP_MODE,'public_demo');
  assert.throws(()=>Object.defineProperty(window,'LC_APP_MODE',{value:'authenticated'}));
  assert.ok(html.indexOf('LC_APP_MODE')<html.indexOf('src="./social.js"'));
  assert.doesNotMatch(html,/supabase-js|SUPABASE_PUBLISHABLE_KEY|aspbwgsfkebduvviyeuo/);
});
test('precache is deployable from the canonical app directory and excludes archives',()=>{
  const sw=readFileSync(new URL('../sw.js', import.meta.url),'utf8');
  const files=vm.runInNewContext(sw.slice(0,sw.indexOf('const rootWorker'))+'\nFILES_TO_CACHE');
  for (const file of files) assert.ok(existsSync(new URL('../LC_App_GitHub_Pages_Upload/'+file.split('?')[0],import.meta.url)),file);
  assert.ok(files.every(file=>!file.includes('static_preview')&&!file.endsWith('.pdf')));
});

test('root worker precache paths resolve to the consolidated app rather than absent root CSS',()=>{
  const sw=readFileSync(new URL('../sw.js', import.meta.url),'utf8');
  const files=vm.runInNewContext(sw.slice(0,sw.indexOf('self.addEventListener'))+'\nPRECACHE_FILES',{self:{location:{pathname:'/sw.js'}}});
  for(const file of files) assert.ok(existsSync(new URL('../'+file.split('?')[0],import.meta.url)),file);
});

test('public entry excludes private authorization implementation', () => {
  assert.doesNotMatch(html, /src=["'].*auth\.js/);
  assert.doesNotMatch(auth, /supabase|localStorage|sessionStorage|fetch|XMLHttpRequest|WebSocket|LC_APP_CONFIG/);
});

test('performance assets preserve the original CSS cascade and deferred legacy source', () => {
  const css = ['product-shell-v2.css','product-shell-v4.css','social-feed-v4.css','creator-studio-v4.css','social-account-v4.css','social-journey-v4.css','business-console-v4.css'];
  const expected = css.map(name => '/* '+name+' */\n'+readFileSync(new URL('../LC_App_GitHub_Pages_Upload/'+name,import.meta.url),'utf8')).join('\n');
  assert.equal(readFileSync(new URL('../LC_App_GitHub_Pages_Upload/public-product-v4.css',import.meta.url),'utf8'), expected);
  const legacy = html.match(/<script id="lcLegacyPreview">([\s\S]*?)<\/script>/)[1];
  assert.equal(readFileSync(new URL('../LC_App_GitHub_Pages_Upload/legacy-preview.js',import.meta.url),'utf8'), legacy.trimEnd()+'\n');
  assert.match(html, /src="\.\/app-product\.js\?v=144" defer/);
  assert.ok(html.indexOf('id="lcPublicProductCss"') > html.lastIndexOf('</style>'));
});
