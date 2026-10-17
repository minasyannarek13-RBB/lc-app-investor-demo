import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../auth.js', import.meta.url),'utf8');
const configCode = source.slice(source.indexOf('  const STAGING_PROJECT'), source.indexOf('\n  function ',source.indexOf('  function config()')+20));
const initCode = source.slice(source.indexOf('  async function initClient()'),source.indexOf('  async function renderAuthState()'));
const staging = 'dnpizrjuxkcnmdgmvnks';
const production = 'aspbwgsfkebduvviyeuo';
const jwt = (ref=staging, role='anon',exp=4102444800) => ['eyJhbGciOiJIUzI1NiJ9',Buffer.from(JSON.stringify({ref,role,exp})).toString('base64url'),'testsignature'].join('.');
const valid = {SUPABASE_URL:`https://${staging}.supabase.co`,SUPABASE_ANON_KEY:jwt()};
function context(config={},search='?environment=staging', approved=false) {
 let calls=0;
 const ctx={URLSearchParams,atob,Date,window:{location:{search},LC_APP_CONFIG:config,supabase:{createClient(){calls++;return {auth:{onAuthStateChange(){}}};}}},localStorage:{getItem(){throw Error('Staging must not read stored credentials');}},STATE:{client:null},setLocked(){},card(){},safe:v=>v,LIVE_SUPABASE_URL:`https://${production}.supabase.co`};
 vm.createContext(ctx);vm.runInContext((approved ? configCode.replace("STAGING_ACTIVATION_APPROVED = false", "STAGING_ACTIVATION_APPROVED = true") : configCode)+initCode,ctx);
 return {ctx,calls:()=>calls};
}
test('disabled staging fails before SDK initialization, even with valid credentials',async()=>{
 const {ctx,calls}=context(valid);assert.equal(await vm.runInContext('initClient()',ctx),false);assert.equal(calls(),0);assert.equal(ctx.STATE.client,null);
});
for (const [name,cfg] of Object.entries({missing:{},missingKey:{SUPABASE_URL:valid.SUPABASE_URL},wrongURL:{...valid,SUPABASE_URL:`https://${production}.supabase.co`},productionJWT:{...valid,SUPABASE_ANON_KEY:jwt(production)},serviceRole:{...valid,SUPABASE_ANON_KEY:jwt(staging,'service_role')},secret:{...valid,SUPABASE_SERVICE_ROLE_KEY:'sb_secret_example'},opaque:{...valid,SUPABASE_PUBLISHABLE_KEY:'sb_publishable_example'},expired:{...valid,SUPABASE_ANON_KEY:jwt(staging,'anon',1)},invalid:{...valid,SUPABASE_ANON_KEY:'bad'},embeddedProduction:{...valid,redirect:`https://${production}.supabase.co`}})) {
 test(`approved runtime rejects ${name} without client creation`,async()=>{const {ctx,calls}=context(cfg,'?environment=staging',true);assert.equal(await vm.runInContext('initClient()',ctx),false);assert.equal(calls(),0);assert.equal(ctx.STATE.client,null);});
}
test('approved validator pins destination and accepts only structurally valid project-bound anon JWT',()=>{const {ctx}=context(valid,'?environment=staging',true);assert.equal(vm.runInContext('stagingConfig(window.LC_APP_CONFIG).url',ctx),valid.SUPABASE_URL);});
test('invalid and conflicting environment fail closed',async()=>{for(const [config,search] of [[valid,'?environment=stagng'],[{...valid,ENVIRONMENT:'staging'},'?environment=production']]){const {ctx,calls}=context(config,search);assert.equal(await vm.runInContext('initClient()',ctx),false);assert.equal(calls(),0);}});
test('staging URL without explicit mode never falls through production defaults',async()=>{const {ctx,calls}=context(valid,'');assert.equal(await vm.runInContext('initClient()',ctx),false);assert.equal(calls(),0);});
test('existing production configuration behavior is preserved',async()=>{const {ctx,calls}=context({SUPABASE_URL:`https://${production}.supabase.co`,SUPABASE_PUBLISHABLE_KEY:'public-existing'},'');assert.equal(await vm.runInContext('initClient()',ctx),true);assert.equal(calls(),1);});
test('auth runtime mirrors remain identical',()=>{assert.equal(source,readFileSync(new URL('../LC_App_GitHub_Pages_Upload/auth.js',import.meta.url),'utf8'));});

test('global and stored staging URL hints cannot initialize the legacy production path',async()=>{for(const stored of [false,true]){const {ctx,calls}=context({},'');ctx.localStorage.getItem=k=>k==='lc-app:supabase-url' && stored ? valid.SUPABASE_URL : '';if(!stored)ctx.window.LC_APP_SUPABASE_URL=valid.SUPABASE_URL;assert.equal(await vm.runInContext('initClient()',ctx),false);assert.equal(calls(),0);}});
