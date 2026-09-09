import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../app-product.js", import.meta.url), "utf8");

assert.match(app, /discoveryFilter: "for_you"/);
assert.match(app, /function creatorDiscoveryScore/);
assert.match(app, /function creatorRecommendationReasons/);
assert.match(app, /data-lc-discovery-filter/);
assert.match(app, /\["for_you", "live", "following", "upcoming"\]/);
assert.match(app, /metadata: \{ surface: "creator_feed", position: index \+ 1, filter: state\.discoveryFilter, recommendation_reasons:/);
assert.match(app, /\$\{session \? \(isLive/);
assert.match(app, /data-lc-live="\$\{safe\(session\.id\)\}"/);
assert.doesNotMatch(app, /data-lc-live="\$\{safe\(session\?\.id \|\| ""\)\}"/);

console.log("player discovery feed contract: PASS");
