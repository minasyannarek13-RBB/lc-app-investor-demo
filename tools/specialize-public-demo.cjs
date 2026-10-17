const fs = require('node:fs');
const esbuild = require(process.env.LC_ESBUILD_MODULE || 'esbuild');
if (esbuild.version !== '0.25.12') throw new Error('Pinned esbuild 0.25.12 required');
const privateOnly = new Set(['resolveHandoffDestination','loadState','loadOwnCreatorData','setCurrentPersona','completeCurrentPersona','toggleLiveSignals','submitCreatorReport','blockCreator','unblockCreator','mount','renderAccountDenied']);
const views = new Set(['renderSocialSafety','renderAccount']);
async function specialize(source) {
  const findings = [];
  source = source.replace(/^  (async )?function (\w+)\([^\n]*\) \{[\s\S]*?^  \}/gm, (body, async, name) => {
    const database = /state\.client\.(?:from|rpc)\(/.test(body);
    if (privateOnly.has(name)) {
      findings.push({name,action:'exclude authenticated implementation'});
      return body.slice(0, body.indexOf('\n')) + '\n    throw new Error("Private account functionality is unavailable in public demo.");\n  }';
    }
    if (database || views.has(name)) {
      if (database && !body.includes('state.demo')) throw new Error('Unreviewed database function: ' + name);
      findings.push({name,action:'retain only synthetic demo branch'});
      if (name === 'savePilotBrief') {
        const privateStart = body.indexOf('\n    let id = existing?.id;');
        if (privateStart < 0) throw new Error('Pilot brief boundary changed');
        body = body.slice(0,privateStart) + '\n  }';
      }
      return body.replace(/state\.demo\b/g, 'true');
    }
    return body;
  });
  const result = await esbuild.transform(source, {loader:'js',charset:'utf8',minifySyntax:true,treeShaking:true,target:'es2020',legalComments:'inline'});
  if (/\.(?:from|rpc)\(["']|data-auth-route|supabase|\.auth\.|\/rest\/v1|\/auth\/v1/i.test(result.code)) throw new Error('Private path survived public specialization: ' + result.code.match(/.{0,70}(?:\.(?:from|rpc)\(["']|data-auth-route|supabase|\.auth\.|\/rest\/v1|\/auth\/v1).{0,70}/gi)?.join(' | '));
  return {code:result.code,findings};
}
(async () => {
  const source=fs.readFileSync(process.argv[2],'utf8');
  const result=await specialize(source);
  fs.writeFileSync(process.argv[3],result.code);
  fs.writeFileSync(process.argv[4],JSON.stringify(result.findings,null,2)+'\n');
})();
