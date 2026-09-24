import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../app-product.js', import.meta.url), 'utf8');

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
