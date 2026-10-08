import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../app-product.js', import.meta.url), 'utf8');
const deployedSource = readFileSync(new URL('../LC_App_GitHub_Pages_Upload/app-product.js', import.meta.url), 'utf8');

test('player product keeps wagering and settlement outside LC', () => {
  const forbiddenInteractiveClaims = [
    /data-lc-(?:bet|wager|deposit|withdraw|settle|payout)/i,
    /\b(?:place bet|bet locked|side bet|deposit now|withdraw|pot settles|payout)\b/i,
  ];

  for (const pattern of forbiddenInteractiveClaims) {
    assert.equal(pattern.test(source), false, `LC product UI crossed operator gameplay boundary: ${pattern}`);
  }

  assert.match(source, /CONTINUE TO LICENSED OPERATOR/);
  assert.match(source, /licensed operator remains responsible for gameplay, wallet, KYC\/AML, wagering, settlement and responsible-gaming operations/i);
  assert.match(source, /No operator integration, license, approval or production availability is claimed/i);
});

test('demo content is explicit without changing real-session labels', () => {
  assert.equal(deployedSource, source, 'deployed and contract-tested product sources must stay aligned');
  assert.match(source, /isIllustrativeSession\(session\) \? "DEMO LIVE" : "LIVE NOW"/);
  assert.match(source, /isIllustrativeSession\(session\) \? "SESSION PREVIEW" : "UPCOMING"/);
  assert.match(source, /DEMO EXPERIENCE · \$\{safe\(\(state\.demoPersona/);
  assert.match(source, /Illustrative profile/);
  assert.match(source, /ILLUSTRATIVE PROFILE/);
  assert.match(source, /Discover the People<br>Behind the Tables/);
  assert.match(source, /Explore creators, follow your favorites, discover upcoming sessions/);
});

test('viewer handoff copy avoids internal instrumentation language', () => {
  const start = source.indexOf('function renderHandoff');
  const end = source.indexOf('function renderMissing', start);
  const handoffView = source.slice(start, end);

  assert.ok(start >= 0 && end > start, 'handoff view must be present');
  assert.doesNotMatch(handoffView, /LC records intent|handoff intent|attributable inside LC/i);
  assert.match(handoffView, /Your session context stays connected/);
  assert.match(source, /"handoff_intent"/);
});
