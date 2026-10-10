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


test('demo reset clears discovery query and stale detail context without creating a backend client', () => {
  const start = app.indexOf('  function setupDemo(');
  const setup = app.slice(start, app.indexOf('  function enterDemo(', start));
  const state = { search: 'Baccarat', selectedCreator: 'old-dealer', selectedSession: 'old-room', handoffDestinations: new Map([['old', 'destination']]) };
  let resets = 0;
  vm.runInNewContext(`${setup}\nsetupDemo('operator', true)`, {
    state, resetDemoStore: () => resets++, refreshDemoData: () => {}, interests: []
  });
  assert.equal(resets, 1);
  assert.equal(state.search, '');
  assert.equal(state.selectedCreator, null);
  assert.equal(state.selectedSession, null);
  assert.equal(state.handoffDestinations.size, 0);
  assert.equal(state.client, null);
});


test('investor primary navigation clears detail URL without remounting demo data', async () => {
  const start = app.indexOf('  async function navigateProduct(');
  const code = app.slice(start, app.indexOf('  async function handleClick(', start));
  const calls = [];
  const state = {demo:true,demoPersona:'player',selectedCreator:'dealer',selectedSession:'room'};
  await vm.runInNewContext(`${code}\nnavigateProduct('home')`, {
    state, investorMode:true, q:()=>null, renderPlayerHome:()=>calls.push('home'),
    window:{location:{hash:'#/product/demo/player/live/room'}, history:{replaceState:(a,b,url)=>calls.push(url)},requestAnimationFrame:fn=>fn()}
  });
  assert.deepEqual(calls,['#/product/demo/player','home']);
  assert.equal(state.selectedCreator,null);
  assert.equal(state.selectedSession,null);
});


test('investor navigation focuses the page heading before the persistent guide heading', async () => {
  const start = app.indexOf('  async function navigateProduct(');
  const code = app.slice(start, app.indexOf('  async function handleClick(', start));
  const calls = [];
  const page = {setAttribute:()=>{},focus:()=>calls.push('page')};
  await vm.runInNewContext(`${code}\nnavigateProduct('home')`, {
    state:{demo:true,demoPersona:'player'}, investorMode:true,
    q: selector => selector === '#lcProductShell h1' ? page : {setAttribute:()=>{},focus:()=>calls.push('guide')},
    renderPlayerHome:()=>{}, window:{location:{hash:'#/product/demo/player'},requestAnimationFrame:fn=>fn()}
  });
  assert.deepEqual(calls,['page']);
});


test('investor rerender restores the same reaction control and scroll position', () => {
  const start = app.indexOf('  function retainInvestorFocus(');
  const code = app.slice(start, app.indexOf('  function shell(',start));
  const attributes = [{name:'data-lc-like',value:'post-one'},{name:'type',value:'button'}];
  const active = {tagName:'BUTTON',textContent:'Like',attributes,matches:()=>true,closest:()=>null};
  const calls=[];
  const replacement = {tagName:'BUTTON',textContent:'Liked',getAttribute:name=>attributes.find(a=>a.name===name)?.value,focus:()=>calls.push('focus')};
  const root={scrollTop:360,contains:()=>true,querySelectorAll:()=>[replacement]};
  let deferred;
  vm.runInNewContext(`${code}\nretainInvestorFocus(root)`,{root,investorMode:true,state:{demo:true},document:{activeElement:active},window:{requestAnimationFrame:fn=>deferred=fn}});
  root.scrollTop=0; deferred();
  assert.equal(root.scrollTop,360);
  assert.deepEqual(calls,['focus']);
});


test('hash navigation restores heading focus even when dealer and room share a title', () => {
  const shell = readFileSync(new URL('../LC_App_GitHub_Pages_Upload/product-shell-v2.js', import.meta.url), 'utf8');
  const start = shell.indexOf('  let lastRouteAnnouncement');
  const code = shell.slice(start, shell.indexOf('  function improveSemantics(', start));
  const calls=[];
  const heading={textContent:'Example dealer',setAttribute:()=>{},focus:()=>calls.push('focus')};
  const root={dataset:{lcInvestor:'true'},querySelector:()=>heading};
  const win={location:{hash:'#/product/demo/player/creator/example'},requestAnimationFrame:fn=>fn()};
  const context=vm.createContext({root,window:win,document:{getElementById:()=>({})},ROUTE_STATUS_ID:'status',productFamily:()=> 'social'});
  vm.runInContext(`${code}\nannounceRoute(root);`,context);
  win.location.hash='#/product/demo/player/live/example';
  vm.runInContext('announceRoute(root);announceRoute(root);',context);
  assert.deepEqual(calls,['focus']);
});
