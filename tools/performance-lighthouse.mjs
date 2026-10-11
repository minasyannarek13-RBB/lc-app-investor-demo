import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import lighthouse from '/private/tmp/lc-v4-quality/node_modules/lighthouse/core/index.js';
import * as chromeLauncher from '/private/tmp/lc-v4-quality/node_modules/chrome-launcher/dist/index.js';
const out=process.env.LC_EVIDENCE_DIR;if(!out)throw Error('LC_EVIDENCE_DIR required');await fs.mkdir(out,{recursive:true});
const versions=(process.env.LC_PERF_VERSIONS||'before,after').split(',');
const modes=(process.env.LC_PERF_MODES||'plain,compressed').split(',');
const repeats=Number(process.env.LC_PERF_RUNS||3);
const zipHash=async()=>process.env.LC_PERF_ZIP?createHash('sha256').update(await fs.readFile(process.env.LC_PERF_ZIP)).digest('hex'):null;
const buildHash=await zipHash();
const results=[];
for(const version of versions)for(const mode of modes)for(let run=1;run<=repeats;run++){
 const port=version==='before'?(mode==='plain'?4210:mode==='gzip'?4215:4211):(mode==='plain'?4212:mode==='gzip'?4214:4213);
 const url=`http://127.0.0.1:${port}/LC_App_GitHub_Pages_Upload/?app=1&lang=ru#/product/demo/player`;
 const chrome=await chromeLauncher.launch({chromePath:process.env.LC_CHROME_PATH,chromeFlags:['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-extensions']});
 try{for(const cache of ['cold','warm']){
  const name=`${version}-${mode}-${cache}-${run}`,dir=path.join(out,name);await fs.mkdir(dir,{recursive:true});
  const options={port:chrome.port,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices'],disableStorageReset:cache==='warm'};
  const {lhr,artifacts,report}=await lighthouse(url,options);
  if(await zipHash()!==buildHash)throw Error('Measured artifact changed during Lighthouse; discard run');
  await fs.writeFile(path.join(dir,'lighthouse.json'),report);
  await fs.writeFile(path.join(dir,'trace.json'),JSON.stringify(artifacts.Trace));
  await fs.writeFile(path.join(dir,'devtools-log.json'),JSON.stringify(artifacts.DevtoolsLog));
  const breakdown=lhr.audits['lcp-breakdown-insight']?.details,metric=id=>lhr.audits[id]?.numericValue;
  const row={version,mode,cache,run,status:lhr.runtimeError?'ERROR':'PASS',buildHash,lighthouseVersion:lhr.lighthouseVersion,userAgent:lhr.userAgent,performance:Math.round(lhr.categories.performance.score*100),accessibility:Math.round(lhr.categories.accessibility.score*100),bestPractices:Math.round(lhr.categories['best-practices'].score*100),fcp:metric('first-contentful-paint'),lcp:metric('largest-contentful-paint'),tbt:metric('total-blocking-time'),cls:metric('cumulative-layout-shift'),breakdown,settings:lhr.configSettings,directory:name};
  results.push(row);await fs.writeFile(path.join(out,'runs.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({...row,breakdown:undefined,settings:undefined}));
 }}finally{await chrome.kill();}
}
const med=a=>a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)];const summary=[];
for(const version of versions)for(const mode of modes)for(const cache of ['cold','warm']){
 const r=results.filter(x=>x.version===version&&x.mode===mode&&x.cache===cache),p=r.map(x=>x.performance),l=r.map(x=>x.lcp);
 summary.push({version,mode,cache,count:r.length,performance:{median:med(p),min:Math.min(...p),max:Math.max(...p)},lcp_ms:{median:med(l),min:Math.min(...l),max:Math.max(...l)},go:p.every(v=>v>=90)&&l.every(v=>v<=2500)});
}
await fs.writeFile(path.join(out,'summary.json'),JSON.stringify(summary,null,2));console.log('SUMMARY',JSON.stringify(summary));
