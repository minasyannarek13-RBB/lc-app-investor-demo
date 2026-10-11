const {chromium, webkit} = require(process.env.LC_PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = process.env.LC_BASE_URL || 'http://127.0.0.1:4197';
const out = process.env.LC_EVIDENCE_DIR || path.join(__dirname, '../evidence/one-pass-2026-10-10');
fs.mkdirSync(out,{recursive:true});
const results=[];
const controlled = process.env.LC_CONTROLLED_SERVER === '1';
let server;
async function startServer(){
  if(!controlled || server?.listening)return;
  const http=require('node:http');const root=path.resolve(process.env.LC_STATIC_ROOT || path.join(__dirname,'..'));
  server=http.createServer((req,res)=>{
    const pathname=decodeURIComponent(new URL(req.url,base).pathname);
    let file=path.resolve(root,'.'+pathname);
    if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
    if(pathname.split('/').some(part=>part.startsWith('.'))){res.writeHead(403).end();return;}
    try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.webmanifest':'application/manifest+json'}[path.extname(file)]||'application/octet-stream';res.writeHead(200,{'Content-Type':mime,'Connection':'close'});res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(Number(new URL(base).port),'127.0.0.1',resolve);});
}
async function stopServer(){if(controlled&&server?.listening){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}}

async function visible(page,selector){return page.locator(selector+':visible').first();}
async function click(page,selector){if(selector.includes("data-lc-demo-persona") && !(await page.locator(selector).first().isVisible())) await page.locator(".lc-demo-controls summary").click();await (await visible(page,selector)).click(); await page.waitForTimeout(80);}
async function checkLayout(page){await page.waitForFunction(()=>[...document.querySelectorAll('link[rel="stylesheet"]')].every(link=>Boolean(link.sheet)));await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'Document overflow');assert.equal(await page.locator('#lcProductShell').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true,'Demo overflow');assert.equal(await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>i.complete&&i.naturalWidth===0&&i.getClientRects().length&&(!i.hasAttribute("data-lc-feed-src")||(i.getBoundingClientRect().top<innerHeight&&i.getBoundingClientRect().bottom>0))).length),0,'Broken visible images');}
(async()=>{
  await startServer();
  for(const [engine,type,executablePath] of [['chromium',chromium,process.env.LC_CHROMIUM_PATH],['webkit',webkit,process.env.LC_WEBKIT_PATH]]){
    let browser;
    try{browser=await type.launch({headless:true,...(executablePath?{executablePath}:{})});}
    catch(error){results.push({engine,status:'BLOCKED',error:error.message});continue;}
    for(const width of [375,768,1440]){
      const label=`${engine}-${width}`; console.log('START',label);
      const context=await browser.newContext({viewport:{width,height:900},...(engine==='chromium'?{permissions:['clipboard-read','clipboard-write']}:{}),reducedMotion:'reduce',recordHar:{path:path.join(out,label+'.har'),content:'omit'},serviceWorkers:'allow'});
      const network=[],errors=[],boundaryEvents=[];await context.exposeBinding('__lcAudit',(_,event)=>boundaryEvents.push(event));
      context.on('request',r=>network.push({url:r.url(),method:r.method(),type:r.resourceType()}));
      await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
      await context.addInitScript(()=>{
        const forbidden=url=>/supabase\.co|supabase-js|\/auth\/v1|\/rest\/v1/.test(String(url));
        window.__boundaryAttempts=[];window.__authStorage=[];
        const fail=(kind,url)=>{window.__boundaryAttempts.push({kind,url:String(url)});window.__lcAudit?.({kind,url:String(url)});throw Error('Forbidden public-demo request: '+url);};
        const fetchOriginal=window.fetch;window.fetch=function(input,...args){const url=input?.url||input;if(forbidden(url))return fail('fetch',url);return fetchOriginal.call(this,input,...args);};
        const open=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(method,url,...args){if(forbidden(url))return fail('xhr',url);return open.call(this,method,url,...args);};
        const WS=window.WebSocket;window.WebSocket=class extends WS{constructor(url,...args){if(forbidden(url))fail('websocket',url);super(url,...args);}};
        const get=Storage.prototype.getItem,set=Storage.prototype.setItem,remove=Storage.prototype.removeItem;
        set.call(localStorage,'sb-aspbwgsfkebduvviyeuo-auth-token','synthetic-existing-session-must-stay-untouched');
        for(const [name,original] of [['getItem',get],['setItem',set],['removeItem',remove]])Storage.prototype[name]=function(key,...args){if(/^sb-|auth-token|supabase|pending-email|auth-return/.test(String(key))){window.__authStorage.push({operation:name,key});window.__lcAudit?.({kind:'auth-storage',operation:name,key});}return original.call(this,key,...args);};
      });
      const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
      try{
        await page.goto(base+'/');await page.locator('#startBtn').click();await page.evaluate(async()=>{await caches.open('lc-app-investor-demo-v100');await caches.open('another-app-cache');});await page.getByRole('link',{name:'Request Pilot',exact:true}).first().click();assert.match(await page.locator('#pilot-email').getAttribute('href'),/^mailto:mn@open-gamer\.com\?subject=/);await page.locator('[data-lang=ru]').click();assert.equal(await page.locator('html').getAttribute('lang'),'ru');assert.match(await page.locator('#intro').inputValue(),/Здравствуйте/);await page.locator('[data-lang=en]').click();await page.locator('#copy').click();await page.waitForFunction(()=>/copied|manually/.test(document.getElementById('copy-status').textContent));assert.match(await page.locator('#copy-status').innerText(),/copied|manually/);await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(100);await page.screenshot({path:path.join(out,label+'-landing.png'),fullPage:true});await page.screenshot({path:path.join(out,label+'-hero.png')});
        await page.getByRole('link',{name:'Explore Live Demo',exact:true}).first().click();await page.waitForSelector('#lcProductShell .lc-product-demo-banner');assert.match(page.url(),/#\/product\/demo\/player$/);await checkLayout(page);
        assert.equal(await page.evaluate(()=>window.LC_APP_MODE),'public_demo');assert.equal(await page.locator('script[src*="supabase"]').count(),0);
        for(const role of ['creator','operator','provider','player']){await click(page,`[data-lc-demo-persona="${role}"]`);assert.match(page.url(),new RegExp('#/product/demo/'+role+'$'));await checkLayout(page);if(width===375)await page.screenshot({path:path.join(out,label+'-'+role+'.png'),fullPage:true});}
        await page.screenshot({path:path.join(out,label+'-player.png'),fullPage:true});
        await click(page,'[data-lc-follow="demo-alex"]');assert.match(await (await visible(page,'[data-lc-follow="demo-alex"]')).innerText(),/Following/);
        await click(page,'[data-lc-like]');assert.equal(await (await visible(page,'[data-lc-like]')).getAttribute('aria-pressed'),'true');
        await click(page,'[data-lc-open-creator="demo-sofia"]');assert.match(page.url(),/creator\/demo-sofia$/);await checkLayout(page);
        await click(page,'[data-lc-reminder="demo-session-sofia"]');assert.match(await (await visible(page,'[data-lc-reminder="demo-session-sofia"]')).innerText(),/SET|Saved|set/);
        await click(page,'[data-lc-live="demo-session-sofia"]');await page.waitForSelector('.lc-demo-table');await checkLayout(page);
        await click(page,'[data-lc-demo-round]');assert.match(await page.locator('.lc-demo-table').innerText(),/round 2/);
        await click(page,'[data-lc-demo-react]');assert.equal(await page.locator('[data-lc-demo-react]').getAttribute('aria-pressed'),'true');
        await page.getByRole('textbox',{name:'Message the demo room',exact:true}).fill('Synthetic QA message');await page.locator('[data-lc-form="room-chat"] button[type="submit"]').click();await page.waitForTimeout(100);assert.match(await page.locator('.lc-demo-chat').innerText(),/Synthetic QA message/);
        await click(page,'[data-lc-product="handoff"]');assert.match(await page.locator('#lcProductShell').innerText(),/No external destination is configured/);assert.equal(await page.locator('[data-lc-operator-outbound]').count(),0);
        await page.screenshot({path:path.join(out,label+'-handoff.png'),fullPage:true});await click(page,'[data-lc-return-live]');assert.match(page.url(),/live\/demo-session-sofia$/);
        await page.reload();await page.waitForSelector('.lc-demo-table');await checkLayout(page);
        let reached=0;if (!(await page.locator('[data-lc-demo-persona=player]').isVisible())) await page.locator('.lc-demo-controls summary').click();await page.locator('[data-lc-demo-persona=player]').focus();for(let i=0;i<12;i++){await page.keyboard.press(engine==='webkit'?'Alt+Tab':'Tab');const focused=await page.evaluate(()=>({body:document.activeElement===document.body,visible:document.activeElement.getClientRects().length>0}));if(!focused.body){reached++;assert.equal(focused.visible,true,'Keyboard focus invisible');}}assert.ok(reached>=5,'Too few keyboard targets');
        assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);
        console.log('SW',label);await page.evaluate(()=>Promise.race([navigator.serviceWorker.ready.then(()=>{}),new Promise((_,reject)=>setTimeout(()=>reject(Error('SW activation timeout')),8000))]));await page.reload();await page.waitForSelector('.lc-demo-table');await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/LC_App_GitHub_Pages_Upload/sw.js'));const keys=await page.evaluate(()=>caches.keys());assert.ok(keys.includes('another-app-cache'));assert.ok(!keys.includes('lc-app-investor-demo-v100'));assert.ok(keys.includes('lc-app-investor-demo-v144'));
        await page.evaluate(()=>location.hash='#/product/demo/player');await page.waitForSelector('[data-lc-follow="demo-alex"]');
        console.log('OFFLINE',label);if(controlled)await stopServer();else await context.setOffline(true);await page.reload();await page.waitForSelector('#lcProductShell .lc-product-demo-banner');await click(page,'[data-lc-demo-persona="creator"]');await checkLayout(page);await click(page,'[data-lc-demo-persona="player"]');await checkLayout(page);await page.goto(base+'/');await page.locator('#startBtn').click();await page.getByRole('link',{name:'Explore Live Demo',exact:true}).first().click();await page.waitForSelector('.lc-product-demo-banner');if(controlled)await startServer();else await context.setOffline(false);
        await page.goto(base+'/LC_App_GitHub_Pages_Upload/?environment=staging&mode=authenticated&app=1#/product/demo/provider');await page.waitForSelector('.lc-product-demo-banner');assert.equal(await page.evaluate(()=>window.LC_APP_MODE),'public_demo');
        await page.goto(base+'/LC_App_GitHub_Pages_Upload/investor.html');await page.waitForSelector('.lc-product-demo-banner');await page.goto(base+'/?app=1#/product/demo/player/creator/demo-alex');await page.waitForSelector('.lc-v4-creator-page');assert.match(page.url(),/creator\/demo-alex$/);await page.getByRole('link',{name:'Request Pilot',exact:true}).click();assert.equal(new URL(page.url()).hash,'#contact');assert.match(await page.locator('#contact h2').innerText(),/Discuss a pilot/);assert.deepEqual(boundaryEvents,[]);assert.deepEqual(await page.evaluate(()=>window.__boundaryAttempts),[]);assert.deepEqual(await page.evaluate(()=>window.__authStorage),[]);
        const external=network.filter(r=>new URL(r.url).hostname!=='127.0.0.1');assert.deepEqual(external,[],'Unexpected external requests');assert.deepEqual(errors,[],'Browser errors');
        results.push({engine,width,status:'PASS',supabaseRequests:0,externalRequests:0,authStorageAccess:0,requests:network.length,scenarios:['EN/RU landing/mailto/copy CTA','four roles','follow/feed','dealer/reminder','scripted round/chat/reaction','handoff/return','deep refresh','keyboard/reduced motion','SW install/update/offline roles','authenticated query denied','legacy aliases/deep link']});
      }catch(error){await startServer();await page.screenshot({path:path.join(out,label+'-failure.png'),fullPage:true}).catch(()=>{});results.push({engine,width,status:'FAIL',error:error.message,errors});}
      await context.close();
    }
    await browser.close();
  }
  await stopServer();fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));if(results.some(r=>r.status!=='PASS'))process.exitCode=1;
})();
