const {chromium}=require(process.env.LC_PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.LC_BASE_URL || 'http://127.0.0.1:4203',out=process.env.LC_EVIDENCE_DIR || path.join(__dirname,'../evidence/premium-v4-2026-10-11');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.LC_CHROMIUM_PATH});let results=[],untranslated=new Set();
 for(const width of [390,1440])for(const lang of ['en','ru']){
  const context=await browser.newContext({viewport:{width,height:width===390?844:1000},reducedMotion:'reduce',serviceWorkers:'block'}),requests=[],errors=[];
  await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());context.on('request',r=>requests.push(r.url()));const p=await context.newPage();p.setDefaultTimeout(8000);p.on('pageerror',e=>errors.push(e.message));let checks=[],axe=[];
  const audit=async(name)=>{console.log(width,lang,name);await p.waitForFunction(()=>{const root=document.getElementById("lcProductShell");return !root || Boolean(root.dataset.lcV2Layout);});await p.waitForFunction(()=>[...document.querySelectorAll('link[rel="stylesheet"]')].every(l=>Boolean(l.sheet)));await p.waitForTimeout(80);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,name+' document overflow');
   const geometry=await p.locator('#lcProductShell').count() ? await p.locator('#lcProductShell').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth,overflow:[...el.querySelectorAll('*')].filter(n=>n.getClientRects().length&&n.getBoundingClientRect().right>el.getBoundingClientRect().right+2).slice(0,8).map(n=>n.className)})):null;
   if(geometry)assert.ok(geometry.scroll<=geometry.width+1,name+' shell overflow '+JSON.stringify(geometry));
   if(lang==='ru')for(const t of await p.evaluate(()=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),a=[];while(w.nextNode()){let n=w.currentNode,s=n.textContent.trim();if(s&&/[A-Za-z]{3}/.test(s)&&!/[А-Яа-я]/.test(s)&&n.parentElement.getClientRects().length&&!n.parentElement.closest('script,style,[data-lc-user-content]'))a.push(s);}return a;}))untranslated.add(t);
   if(process.env.LC_AXE_PATH && (name.endsWith("-entry") || ["scene-hero","sofia-profile","scripted-room","local-evidence"].includes(name))){await p.addScriptTag({path:process.env.LC_AXE_PATH});const data=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','best-practice']}}));axe.push({screen:name,violations:data.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:data.incomplete.map(v=>v.id)});}
   checks.push(name);
  };
  try{
   await p.goto(base+'/?lang='+lang+'#hero');assert.equal(await p.locator('html').getAttribute('lang'),lang);
   for(const scene of ['hero','why','people','journey','proof','business','difference','operator-proof','pilot','fit','final']){await p.locator('#'+scene).evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));await audit('scene-'+scene);}
   await p.locator('[data-demo-cta]').first().click();await p.waitForSelector('.lc-product-demo-banner');assert.equal(await p.locator('html').getAttribute('lang'),lang);assert.equal(await p.evaluate(()=>window.LC_APP_MODE),'public_demo');checks.push('locale-continuity');
   for(const role of ['player','creator','operator','provider']){
    await p.goto(base+'/LC_App_GitHub_Pages_Upload/?app=1&lang='+lang+'#/product/demo/'+role);await p.waitForSelector('.lc-product-demo-banner');await audit(role+'-entry');
    if(['operator','provider'].includes(role))for(const section of ['overview','creators','campaigns','live','performance','integrations','safety','settings']){
     if(width===390){assert.ok(await p.locator('.lc-business-mobile select').isVisible());await p.locator('.lc-business-mobile select').selectOption(section);}else await p.locator('#lcProductV2Rail [data-lc-business-view='+section+']').click();await audit(role+'-'+section);
    }
    if(role==='creator')for(const section of ['create','posts','schedule','live','audience']){const target=p.locator('.lc-v4-studio-nav button').nth(['create','posts','schedule','live','audience'].indexOf(section));if(await target.count()){await target.click();await audit('creator-'+section);}}
   }
   await p.goto(base+'/LC_App_GitHub_Pages_Upload/?app=1&lang='+lang+'#/product/demo/creator');await p.waitForSelector('.lc-v4-studio-nav');await p.locator('.lc-v4-studio-nav [data-lc-creator-studio=post]').click();await p.locator('[data-lc-form=post] [name=body]').fill('Home');await p.locator('[data-lc-form=post] button[type=submit]').click();if(!(await p.locator('[data-lc-demo-persona=player]').isVisible()))await p.locator('.lc-demo-controls summary').click();await p.locator('[data-lc-demo-persona=player]').click();assert.equal(await p.locator('.lc-v4-feed-caption [data-lc-user-content]').first().innerText(),'Home');checks.push('creator-post-local-and-user-text-preserved');await p.goto(base+'/LC_App_GitHub_Pages_Upload/?app=1&lang='+lang+'#/product/demo/player/creator/demo-sofia');await p.waitForSelector('.lc-v4-creator-page');assert.ok((await p.locator('.lc-v4-creator-hero img').first().getAttribute('src')).includes('dealer_sofia_avatar_v1'));await audit('sofia-profile');
   await p.goto(base+'/LC_App_GitHub_Pages_Upload/?app=1&lang='+lang+'#/product/demo/player/live/demo-session-sofia');await p.waitForSelector('.lc-demo-table');await audit('scripted-room');
   await p.goto(base+'/LC_App_GitHub_Pages_Upload/?app=1&lang='+lang+'#/product/demo/player');await p.waitForSelector('.lc-product-demo-banner');await p.locator('[data-lc-follow=demo-alex]').click();
   if(!(await p.locator('[data-lc-demo-persona=operator]').isVisible()))await p.locator('.lc-demo-controls summary').click();await p.locator('[data-lc-demo-persona=operator]').click();await p.locator('#local-context').fill('Synthetic QA campaign');await p.locator('[data-lc-form=demo-campaign] button[type=submit]').click();assert.match(await p.locator('.lc-local-trace').innerText(),/Alex Moreau/);assert.match(await p.locator('.lc-local-trace').innerText(),/Sofia Laurent/);await audit('local-evidence');await p.screenshot({path:path.join(out,'local-trace-'+width+'-'+lang+'.png'),fullPage:true});checks.push('trace-preserved-across-roles');await p.locator('.lc-product-demo-banner a[href*="#contact"]').click();assert.equal(await p.locator('html').getAttribute('lang'),lang);checks.push('pilot-return-locale');
   assert.deepEqual(requests.filter(u=>new URL(u).origin!==base),[]);assert.deepEqual(requests.filter(u=>/supabase|auth\.js|\/auth\/v1|\/rest\/v1/.test(u)),[]);assert.deepEqual(errors,[]);
   results.push({width,lang,status:'PASS',checks,requests:requests.length,externalRequests:0,authRequests:0,axe});
  }catch(e){results.push({width,lang,status:'FAIL',error:e.message,checks,errors,axe});}
  await context.close();
 }
 await browser.close();fs.writeFileSync(path.join(out,'premium-qa.json'),JSON.stringify(results,null,2));fs.writeFileSync(path.join(out,'ru-review-strings.json'),JSON.stringify([...untranslated].sort(),null,2));console.log(JSON.stringify(results.map(({axe,...r})=>({...r,axeViolations:axe.reduce((n,x)=>n+x.violations.length,0)})),null,2));if(results.some(r=>r.status!=='PASS'))process.exitCode=1;
})();
