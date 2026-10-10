import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const auth = readFileSync(new URL('../auth.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../app-product.js', import.meta.url), 'utf8');
const render = auth.slice(auth.indexOf('  async function renderAuthState()'), auth.indexOf('\n  document.addEventListener', auth.indexOf('  async function renderAuthState()')));

test('investor entry bypasses Auth initialization and stored hosted credentials', async () => {
  const calls = [];
  const context = {
    URLSearchParams,
    window: { location: { search: '?app=1&demo=investor' }, LCAppProduct: { mountDemoEntry: () => calls.push('demo') } },
    STATE: { booted: false }, route: () => 'product/demo/player', isProductRoute: () => true,
    setLocked: value => calls.push(value), markReady: () => calls.push('ready'),
    initClient: () => { throw new Error('Hosted Auth must never initialize'); }
  };
  await vm.runInNewContext(`${render}\nrenderAuthState()`, context);
  assert.deepEqual(calls, [false, 'demo', 'ready']);
  assert.equal(context.STATE.booted, true);
});

test('same investor seed ignores host clock and keeps Blackjack/Baccarat illustrative', () => {
  const seed = app.slice(app.indexOf('  const investorMode'), app.indexOf('  const visualMedia'));
  const readSeed = () => vm.runInNewContext(`${seed}\nJSON.stringify({profiles:demoProfiles,sessions:demoSessions,posts:demoPosts})`, {
    URLSearchParams, window: { location: { search: '?demo=investor' } }, state: { demo: true }
  });
  assert.equal(readSeed(), readSeed());
  const result = JSON.parse(readSeed());
  assert.equal(result.profiles.length, 5);
  for (const game of ['Blackjack', 'Baccarat']) assert.ok(result.sessions.some(s => s.game === game));
  assert.ok(result.sessions.every(s => s.status === 'scheduled' && s.provenance === 'illustrative_demo_data'));
});

test('scripted table escapes submitted text and never renders casino wagering controls', () => {
  const start = app.indexOf('  function renderDemoTable(');
  const end = app.indexOf('  function shell()', start);
  const output = vm.runInNewContext(`${app.slice(start,end)}\nrenderDemoTable({id:'preview',game:'Baccarat',creator_id:'dealer'})`, {
    state: {demo:true}, demoStore: {roomRounds:new Map(),roomMessages:new Map([['preview',['<script>unsafe</script>']]]),roomReactions:new Set()},
    safe: text => String(text).replaceAll('<','&lt;').replaceAll('>','&gt;'), profileName: p => p.display_name,
    demoProfile: () => ({display_name:'Example dealer'})
  });
  assert.match(output, /SCRIPTED TABLE PREVIEW · NO WAGERS/);
  assert.match(output, /&lt;script&gt;unsafe&lt;\/script&gt;/);
  assert.doesNotMatch(output, /<script>|data-lc-(?:bet|deposit|wager|withdraw)/i);
});

test('container business-view metadata cannot intercept social like clicks after a role switch', async () => {
  const start = app.indexOf('  async function handleClick(');
  const handler = app.slice(start, app.indexOf('  async function mount(',start));
  const calls=[];
  const context={
    investorMode:false, state:{demo:true},
    navigateProduct: value => calls.push(`business:${value}`), likePost:id=>calls.push(`like:${id}`),
    event:{preventDefault(){},target:{closest:selector=>selector==='[data-lc-business-view]'?{dataset:{lcBusinessView:'overview'}}:selector==='[data-lc-like]'?{dataset:{lcLike:'example'}}:null}},
    toast:()=>{},err:e=>{throw e;}
  };
  await vm.runInNewContext(`${handler}\nhandleClick(event)`,context);
  assert.deepEqual(calls,['like:example']);
});

test('seeded reminders stay eligible under the virtual demo clock after the calendar date passes', async () => {
  const start=app.indexOf('  async function toggleReminder(');
  const code=app.slice(start,app.indexOf('  async function likePost(',start));
  const state={demo:true,reminders:new Set()};
  const store={reminders:new Set()};
  await vm.runInNewContext(`${code}\ntoggleReminder('seed-session')`,{
    state,demoStore:store,productNow:()=>Date.UTC(2026,9,10,18),
    Date:class extends Date {static now(){return Date.UTC(2040,0,1);}},
    findSessionEntry:()=>({session:{status:'scheduled',starts_at:'2026-10-10T19:00:00Z'}})
  });
  assert.equal(state.reminders.has('seed-session'),true);
  assert.equal(store.reminders.has('seed-session'),true);
});
