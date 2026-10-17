#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,zipfile,os,subprocess,tempfile
root=Path(__file__).resolve().parents[1]
out=Path(os.environ.get('LC_RELEASE_OUTPUT',root/'evidence/performance-v4-2026-10-11'))
app=root/'LC_App_GitHub_Pages_Upload'
PUBLIC_FILES = ['CNAME', 'LC_App_GitHub_Pages_Upload/app-icon-512.png', 'LC_App_GitHub_Pages_Upload/app-icon.svg', 'LC_App_GitHub_Pages_Upload/app-product.js', 'LC_App_GitHub_Pages_Upload/app_prototype_assets/dealers/dealer_lilit_avatar_v1.jpg', 'LC_App_GitHub_Pages_Upload/app_prototype_assets/dealers/dealer_marcus_avatar_v1.jpg', 'LC_App_GitHub_Pages_Upload/app_prototype_assets/dealers/dealer_mia_avatar_v1.jpg', 'LC_App_GitHub_Pages_Upload/app_prototype_assets/dealers/dealer_sofia_avatar_v1.jpg', 'LC_App_GitHub_Pages_Upload/app_prototype_assets/dealers/v2_polish/alex_baccarat.jpg', 'LC_App_GitHub_Pages_Upload/app_prototype_assets/dealers/v2_polish/alex_portrait.jpg', 'LC_App_GitHub_Pages_Upload/app_prototype_assets/dealers/v2_polish/marcus_community.jpg', 'LC_App_GitHub_Pages_Upload/app_prototype_assets/dealers/v2_polish/mia_roulette.jpg', 'LC_App_GitHub_Pages_Upload/app_prototype_assets/dealers/v2_polish/sofia_avatar_public.jpg', 'LC_App_GitHub_Pages_Upload/app_prototype_assets/dealers/v2_polish/sofia_discover_public.jpg', 'LC_App_GitHub_Pages_Upload/app_prototype_assets/dealers/v2_polish/sofia_profile_public.jpg', 'LC_App_GitHub_Pages_Upload/app_prototype_assets/dealers/v2_polish/sofia_welcome_public.jpg', 'LC_App_GitHub_Pages_Upload/business-console-v4.css', 'LC_App_GitHub_Pages_Upload/creator-studio-v4.css', 'LC_App_GitHub_Pages_Upload/index.html', 'LC_App_GitHub_Pages_Upload/investor.html', 'LC_App_GitHub_Pages_Upload/manifest.webmanifest', 'LC_App_GitHub_Pages_Upload/product-shell-v2.css', 'LC_App_GitHub_Pages_Upload/product-shell-v2.js', 'LC_App_GitHub_Pages_Upload/product-shell-v4.css', 'LC_App_GitHub_Pages_Upload/public-demo-bootstrap.js', 'LC_App_GitHub_Pages_Upload/social-account-v4.css', 'LC_App_GitHub_Pages_Upload/social-feed-v4.css', 'LC_App_GitHub_Pages_Upload/social-journey-v4.css', 'LC_App_GitHub_Pages_Upload/social.js', 'LC_App_GitHub_Pages_Upload/sw.js', 'app-icon.svg', 'app_prototype_assets/dealers/dealer_lilit_avatar_v1.jpg', 'app_prototype_assets/dealers/dealer_marcus_avatar_v1.jpg', 'app_prototype_assets/dealers/dealer_mia_avatar_v1.jpg', 'app_prototype_assets/dealers/dealer_sofia_avatar_v1.jpg', 'index.html', 'robots.txt', 'sitemap.xml', 'sw.js']
PUBLIC_FILES += ['LC_App_GitHub_Pages_Upload/public-product-v4.css'] + ['LC_App_GitHub_Pages_Upload/app_prototype_assets/dealers/dealer_lilit_avatar_v1-avatar.webp', 'LC_App_GitHub_Pages_Upload/app_prototype_assets/dealers/dealer_marcus_avatar_v1-avatar.webp', 'LC_App_GitHub_Pages_Upload/app_prototype_assets/dealers/dealer_mia_avatar_v1-avatar.webp', 'LC_App_GitHub_Pages_Upload/app_prototype_assets/dealers/dealer_sofia_avatar_v1-avatar.webp', 'LC_App_GitHub_Pages_Upload/app_prototype_assets/dealers/v2_polish/alex_portrait-avatar.webp', 'LC_App_GitHub_Pages_Upload/app_prototype_assets/dealers/v2_polish/alex_baccarat-avatar.webp']
import re
source=(app/'index.html').read_text()
legacy=re.search(r'<script id="lcLegacyPreview">([\s\S]*?)</script>',source)
assert legacy, 'Preserved legacy source must be available for deferred delivery'
(app/'legacy-preview.js').write_text(legacy.group(1).rstrip()+'\n')
PUBLIC_FILES += ['LC_App_GitHub_Pages_Upload/legacy-preview.js','LC_App_GitHub_Pages_Upload/app_prototype_assets/dealers/dealer_sofia_avatar_v1.avif']
avatar_small=[name.replace('-avatar.webp','-avatar-120.webp') for name in PUBLIC_FILES if name.endswith('-avatar.webp')]
runtime_files=['social.js','app-product.js','public-demo-bootstrap.js','product-shell-v2.js']
(app/'public-runtime-v4.js').write_bytes(b'\n;\n'.join((app/name).read_bytes() for name in runtime_files))
PUBLIC_FILES += avatar_small + ['LC_App_GitHub_Pages_Upload/public-runtime-v4.js']
files=[root/name for name in PUBLIC_FILES]
files=sorted(set(files));assert len(files)==55, 'Performance package preserves 39 paths and adds only derived delivery assets';out.mkdir(parents=True,exist_ok=True)
payload={str(p.relative_to(root)):p.read_bytes() for p in files}
payload['LC_App_GitHub_Pages_Upload/legacy-preview.js']=legacy.group(1).encode()
# Only delivery bytes are specialized; authenticated canonical sources remain intact.
with tempfile.TemporaryDirectory(prefix='lc-public-specialization-') as temporary:
 specialized=Path(temporary)/'app-product.js'
 audit=Path(temporary)/'audit.json'
 subprocess.run([os.environ.get('LC_NODE','node'),str(root/'tools/specialize-public-demo.cjs'),str(app/'app-product.js'),str(specialized),str(audit)],check=True)
 payload['LC_App_GitHub_Pages_Upload/app-product.js']=specialized.read_bytes()
 (out/'public-specialization.json').write_bytes(audit.read_bytes())
payload['LC_App_GitHub_Pages_Upload/social.js']=b'(()=>{"use strict";window.LCAppSocial={mount(){throw new Error("Private social account unavailable in public demo.");},clear(){}};})();\n'
payload['LC_App_GitHub_Pages_Upload/public-runtime-v4.js']=b'\n;\n'.join(payload['LC_App_GitHub_Pages_Upload/'+name] for name in runtime_files)

loader='''<script>if(!(window.LC_APP_MODE==="public_demo"&&location.hash.startsWith("#/product"))){const legacy=document.createElement("script");legacy.src="./legacy-preview.js?v=144";legacy.defer=true;document.head.appendChild(legacy);}</script>'''
payload['LC_App_GitHub_Pages_Upload/index.html']=(source[:legacy.start()]+loader+source[legacy.end():]).encode()
public_html=payload['LC_App_GitHub_Pages_Upload/index.html'].decode()
public_html=public_html.replace('  <link rel="preload" as="style"', '  <link rel="preload" as="script" href="./public-runtime-v4.js?v=144" fetchpriority="high" />\n  <link rel="preload" as="style"',1)
for name in runtime_files:
 public_html=re.sub(r'  <script src="(?:\./)?'+re.escape(name)+r'[^"\n]*"[^>]*></script>\n','',public_html)
public_html=public_html.replace('  <link id="lcPublicProductCss"', '<script src="./public-runtime-v4.js?v=144" defer fetchpriority="high"></script>\n  <link id="lcPublicProductCss"')
payload['LC_App_GitHub_Pages_Upload/index.html']=public_html.encode()
import subprocess
minifier=os.environ.get('LC_ESBUILD_MODULE','esbuild')
transform='''const esbuild=require(process.argv[1]);if(esbuild.version!=="0.25.12")throw Error("Pinned esbuild 0.25.12 required");let input="";process.stdin.setEncoding("utf8");process.stdin.on("data",x=>input+=x);process.stdin.on("end",async()=>{const data=JSON.parse(input);const results=await Promise.all([esbuild.transform(data.js,{loader:"js",charset:"utf8",minify:true,target:["es2020"],legalComments:"inline"}),esbuild.transform(data.css,{loader:"css",charset:"utf8",minify:true,target:["chrome100","safari15"],legalComments:"inline"})]);process.stdout.write(JSON.stringify(results.map(x=>x.code)));});'''
result=subprocess.run([os.environ.get('LC_NODE','node'),'-e',transform,minifier],input=json.dumps({'js':payload['LC_App_GitHub_Pages_Upload/public-runtime-v4.js'].decode(),'css':payload['LC_App_GitHub_Pages_Upload/public-product-v4.css'].decode()}),text=True,capture_output=True,check=True)
runtime,css=json.loads(result.stdout)
payload['LC_App_GitHub_Pages_Upload/public-runtime-v4.js']=runtime.encode()
payload['LC_App_GitHub_Pages_Upload/public-product-v4.css']=css.encode()
manifest=[{'path':name,'sha256':hashlib.sha256(data).hexdigest(),'size':len(data)} for name,data in sorted(payload.items())]
(out/'public-release-manifest.json').write_text(json.dumps({'status':'LOCAL REVIEW ONLY; deployment requires separate approval','entry':'index.html','demo':'LC_App_GitHub_Pages_Upload/?app=1#/product/demo/player','files':manifest},indent=2)+'\n')
def write_zip(destination, payload):
 with zipfile.ZipFile(destination,'w',zipfile.ZIP_DEFLATED) as z:
  for name,data in sorted(payload.items()):
   info=zipfile.ZipInfo(name,(2026,10,10,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED
   z.writestr(info,data)
write_zip(out/'LC_APP_V4_PUBLIC_RELEASE_2026-10-11.zip',payload)
with zipfile.ZipFile(out/'LC_APP_V4_PUBLIC_RELEASE_2026-10-11.zip') as z:
 assert z.testzip() is None
 for entry in manifest:assert hashlib.sha256(z.read(entry['path'])).hexdigest()==entry['sha256']
 forbidden=['static_preview/','showcase-v2/','supabase/','.env','tests/','evidence/','README','auth.js']
 assert not any(any(term in name for term in forbidden) for name in z.namelist())
print(f'Public release: {len(files)} allowlisted files; ZIP integrity and SHA-256 parity PASS')

fallback={str(p.relative_to(root)):p.read_bytes() for p in files if str(p.relative_to(root)) in ['index.html','CNAME','app-icon.svg','robots.txt','sitemap.xml'] or str(p.relative_to(root)).startswith('app_prototype_assets/')}
landing=fallback['index.html'].decode().replace('./LC_App_GitHub_Pages_Upload/?app=1#/product/demo/player','#contact').replace('Explore Live Demo','Discuss LC App').replace('Открыть демо','Обсудить LC App')
import re
landing=re.sub(r'(?:\./)?LC_App_GitHub_Pages_Upload/\?app=1(?:&(?:amp;)?lang=[a-z]+)?#/product/demo/[a-z]+(?:/(?:creator|live)/[a-z0-9-]+)?', '#contact', landing)
landing=landing.replace('<div id="contact">','<div id="contact"><p class="v3-note" data-en="The interactive demo is temporarily unavailable. Contact Narek to discuss LC App." data-ru="Интерактивное демо временно недоступно. Свяжитесь с Нареком, чтобы обсудить LC App.">The interactive demo is temporarily unavailable. Contact Narek to discuss LC App.</p>')
landing=re.sub(r"a.href='\./LC_App_GitHub_Pages_Upload/\?app=1&lang='\+l\+'#/product/demo/player'", "a.href='#contact'", landing)
landing=re.sub(r"a.href='\./LC_App_GitHub_Pages_Upload/\?app=1&lang='\+l\+'#/product/demo/player/creator/demo-sofia'", "a.href='#contact'", landing)
landing=re.sub(r"a.href='\./LC_App_GitHub_Pages_Upload/\?app=1&lang='\+l\+'#/product/demo/'\+a.dataset.roleEntry", "a.href='#contact'", landing)
fallback['index.html']=landing.encode()
fallback['LC_App_GitHub_Pages_Upload/index.html']='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, follow"><meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; form-action 'none'"><title>LC App demo temporarily unavailable</title><style>body{background:#020303;color:#d7fff7;font:18px/1.6 system-ui;padding:8vw}a{color:#59e8c7}</style></head><body><h1>Demo temporarily unavailable</h1><p>The interactive demo is paused. / Demo vremenno nedostupno.</p><a href="../#contact">Discuss a pilot / Обсудить пилот</a><script>navigator.serviceWorker?.register('./sw.js',{updateViaCache:'none'}).catch(()=>{});</script></body></html>'''.replace('Demo vremenno nedostupno.','Демо временно недоступно.').encode()
fallback['LC_App_GitHub_Pages_Upload/investor.html']=fallback['LC_App_GitHub_Pages_Upload/index.html']
safe_paths=['/'+name for name in fallback]+['/sw.js','/LC_App_GitHub_Pages_Upload/sw.js','/','/LC_App_GitHub_Pages_Upload/']
worker=('const NAME="lc-app-investor-demo-v145";const FILES='+json.dumps(safe_paths)+';'+'''self.addEventListener('install',e=>e.waitUntil(caches.open(NAME).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('lc-app-investor-demo-')&&k!==NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||!FILES.includes(u.pathname)||e.request.headers.has('authorization')||e.request.cache==='no-store'||(u.search&&!['?app=1','?demo=investor','?app=1&demo=investor','?lang=en','?lang=ru','?app=1&lang=en','?app=1&lang=ru'].includes(u.search)))return;e.respondWith(fetch(e.request).catch(()=>caches.open(NAME).then(c=>c.match(u.origin+u.pathname))));});''').encode()
fallback['sw.js']=worker;fallback['LC_App_GitHub_Pages_Upload/sw.js']=worker
write_zip(out/'LC_APP_V4_FAIL_CLOSED_ROLLBACK_v145.zip',fallback)
(out/'fallback-manifest.json').write_text(json.dumps({'status':'LOCAL FAIL-CLOSED RECOVERY; separate deployment approval required','cache':'v145','files':[{'path':name,'sha256':hashlib.sha256(data).hexdigest(),'size':len(data)} for name,data in sorted(fallback.items())]},indent=2)+'\n')
with zipfile.ZipFile(out/'LC_APP_V4_FAIL_CLOSED_ROLLBACK_v145.zip') as z:
 assert z.testzip() is None
 assert not any(name.endswith('auth.js') or name.endswith('app-product.js') for name in z.namelist())
print(f'Fail-closed rollback: {len(fallback)} files, v145; no Auth/product module')
