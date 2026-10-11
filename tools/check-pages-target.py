#!/usr/bin/env python3
"""Read-only deployment guard; never alters Pages, DNS or hosted data."""
import argparse,json,os,re,urllib.request
p=argparse.ArgumentParser(); p.add_argument('--expected-sha',required=True);p.add_argument('--mode',choices=['public','fallback-v145'],required=True);args=p.parse_args()
if not re.fullmatch(r'[0-9a-f]{40}',args.expected_sha):raise SystemExit('Full expected SHA required')
repo=os.environ['GITHUB_REPOSITORY']
if repo!='minasyannarek13-RBB/lc-app-investor-demo':raise SystemExit('Wrong repository')
def get(path):
 request=urllib.request.Request('https://api.github.com/repos/'+repo+'/'+path,headers={'Authorization':'Bearer '+os.environ['GH_TOKEN'],'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'})
 with urllib.request.urlopen(request,timeout=30) as response:return json.load(response)
if get('commits/main')['sha']!=args.expected_sha:raise SystemExit('Main moved; queued deployment rejected')
site=get('pages')
if site.get('build_type')!='workflow' or site.get('cname')!='lc.open-gamer.com' or site.get('https_enforced') is not True:raise SystemExit('Pages source/domain/HTTPS contract mismatch')
if args.mode=='public':
 request=urllib.request.Request('https://lc.open-gamer.com/sw.js',headers={'Cache-Control':'no-cache','Accept-Encoding':'identity'})
 with urllib.request.urlopen(request,timeout=30) as response:
  if response.url!='https://lc.open-gamer.com/sw.js':raise SystemExit('Unexpected SW redirect')
  worker=response.read().decode()
 versions=[int(x) for x in re.findall(r'lc-app-investor-demo-v(\d+)',worker)]
 if not versions:raise SystemExit('Unknown serving cache revision')
 if max(versions)>144:raise SystemExit('Refuse v144 after higher recovery revision; prepare v146+')
print(json.dumps({'main_sha':args.expected_sha,'mode':args.mode,'source':site['build_type'],'domain':site['cname'],'https':site['https_enforced']}))
