import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('marketing positioning matches the approved public message', () => {
  assert.match(page, /The Social Discovery Layer <(?:em|span)>for Live Casino/);
  assert.match(page, /LC connects audiences with dealers, creators and live experiences while licensed operators retain gameplay and regulated services/);
});

test('illustrative sessions never appear as unqualified live badges', () => {
  assert.doesNotMatch(page, /data-en="LIVE NOW"|<small class="tag">LIVE<\/small>/);
  assert.match(page, /data-en="SESSION PREVIEW"/);
  assert.match(page, /ILLUSTRATIVE PROFILE/);
  assert.match(page, /Illustrative product experience/);
});

test('website does not route visitors to an unverified app build', () => {
  assert.match(page, /<span class="soon">LC App · Soon<\/span>/);
  assert.doesNotMatch(page, /href="[^"]*(?:token=|share=|github\.io\/[^"#]*app|codex)/i);
});
