import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../app-product.js", import.meta.url), "utf8");
const nested = readFileSync(new URL("../LC_App_GitHub_Pages_Upload/app-product.js", import.meta.url), "utf8");

assert.equal(app, nested, "root and deployed product modules must stay synchronized");

// P0 Growth Engine: discovery -> creator -> follow -> Live/schedule -> handoff -> attributable return.
assert.match(app, /Discover<\/span><span>Creator<\/span><span>Follow<\/span><span>Live<\/span><span>Return<\/span>/);
assert.match(app, /data-lc-follow=/, "Creator surfaces must preserve an explicit Follow action");
assert.match(app, /data-lc-reminder=/, "Upcoming Creator sessions must preserve a return-plan action");
assert.match(app, /session\.status !== "live"[\s\S]+Operator handoff becomes available when this Creator session is Live/);
assert.match(app, /trackProductEvent\("handoff_intent"[\s\S]+confidence: "direct"/);
assert.match(app, /trackProductEvent\("handoff_return"[\s\S]+confidence: "direct"/);
assert.match(app, /trackProductEvent\("creator_impression"[\s\S]+surface: "creator_feed"/);
assert.match(app, /trackProductEvent\("discovery_search"[\s\S]+result_count:/);
assert.match(app, /trackProductEvent\("creator_follow"[\s\S]+action:/);
assert.match(app, /trackProductEvent\("notification_response"/);

// Discovery must remain people-first and personalization must be explainable, not opaque claimed AI.
assert.match(app, /Find the person behind the table\./);
assert.match(app, /creatorDiscoveryScore/);
assert.match(app, /creatorRecommendationReasons/);
assert.match(app, /Matches \$\{matchedGame\}/);

// Product boundary: LC preserves social/discovery context while licensed infrastructure owns regulated operations.
assert.match(app, /licensed operator keeps gameplay, wallet, KYC\/AML, responsible gaming, wagering and settlement/i);
assert.match(app, /No deposits, wagering, KYC, AML, wallet or settlement data passes through LC\./);
assert.doesNotMatch(app, /LC (?:processes|accepts|settles) (?:deposits|bets|wagers)/i);

// Value claims must remain hypotheses until pilot evidence exists.
assert.match(app, /These are product hypotheses to validate through integration and pilot data\./);
assert.match(app, /does not claim proven uplift, revenue or retention/i);

console.log("Growth Engine coherence contract: PASS");
