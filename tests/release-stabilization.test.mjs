import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const app = readFileSync(new URL("../app-product.js", import.meta.url), "utf8");
const deployed = readFileSync(new URL("../LC_App_GitHub_Pages_Upload/app-product.js", import.meta.url), "utf8");
const opening = readFileSync(new URL("../LC_App_GitHub_Pages_Upload/index.html", import.meta.url), "utf8");

test("future illustrative sessions remain previews rather than live broadcasts", () => {
  assert.equal(deployed, app);
  assert.match(app, /demo-session-sofia[\s\S]+status: "scheduled"/);
  assert.match(app, /demo-session-alex[\s\S]+status: "scheduled"/);
  assert.match(app, /const isPresentedLive = [\s\S]+new Date\(session\.starts_at\)\.getTime\(\) <= Date\.now\(\)/);
  assert.match(app, /if \(isSessionPreview\(session\)\) return "SESSION PREVIEW"/);
  assert.doesNotMatch(app, /Sofia's demo session is live/);
  assert.match(app, /No live broadcast or operator connection is implied/);
});

test("operator handoff has explicit demo available and unavailable states", () => {
  assert.match(app, /PREVIEW HANDOFF/);
  assert.match(app, /OPERATOR DESTINATION UNAVAILABLE/);
  assert.match(app, /resolve_live_session_operator_handoff/);
  assert.match(app, /url\.protocol !== "https:" \|\| url\.username \|\| url\.password/);
  assert.match(app, /rows\.length === 1 \? validateResolvedDestination/);
  assert.match(app, /data-lc-operator-outbound/);
  assert.match(app, /window\.location\.assign\(destination\.url\)/);
});

test("handoff measurement distinguishes views clicks and server-owned intent", () => {
  const handoff = app.slice(app.indexOf("function renderHandoff"), app.indexOf("function renderMissing"));
  const clicks = app.slice(app.indexOf("if (operatorOutbound)"), app.indexOf("if (returnLive)"));
  assert.match(handoff, /trackProductEvent\("product_open"[\s\S]+surface: "handoff"/);
  assert.match(clicks, /dedupeKey: `operator-outbound-click:\$\{id\}`/);
  assert.match(clicks, /surface: "operator_outbound_click"/);
  assert.doesNotMatch(handoff, /trackProductEvent\("handoff_intent"/);
  assert.doesNotMatch(clicks, /trackProductEvent\("handoff_intent"/);
});

test("notification attribution uses trusted loaded context and is deduplicated", () => {
  const notification = app.slice(app.indexOf("async function openNotification"), app.indexOf("function suggestedCreators"));
  assert.match(notification, /creatorId: session\.entry\.profile\.id/);
  assert.match(notification, /creatorId: creator\.profile\.id/);
  assert.match(notification, /dedupeKey: `notification:\$\{notification\.id\}`/);
  assert.doesNotMatch(notification, /creatorId: notification\.creator_id/);
});

test("Lilit uses her own existing visual asset", () => {
  const asset = new URL("../LC_App_GitHub_Pages_Upload/app_prototype_assets/dealers/dealer_lilit_avatar_v1.jpg", import.meta.url);
  assert.equal(existsSync(asset), true);
  assert.match(app, /"demo-lilit": "app_prototype_assets\/dealers\/dealer_lilit_avatar_v1\.jpg"/);
  assert.doesNotMatch(app, /"demo-lilit": "[^"]*sofia/i);
});

test("positive state events are not emitted for removals", () => {
  assert.match(app, /if \(!wasFollowing && state\.follows\.has\(id\)\) void trackProductEvent\("creator_follow"/);
  assert.match(app, /if \(!wasSet && state\.reminders\.has\(id\)\) void trackProductEvent\("schedule_reminder"/);
  assert.doesNotMatch(app, /action: state\.follows\.has\(id\) \? "follow" : "unfollow"/);
  assert.doesNotMatch(app, /action: state\.reminders\.has\(id\) \? "set" : "remove"/);
});

test("legacy opening surfaces identify illustrative sessions and remove unsupported KPI claims", () => {
  assert.match(opening, /Illustrative product preview/);
  assert.match(opening, /People, operators, tables, wallet values, outcomes and metrics are simulated/);
  assert.match(opening, /watching: "Session preview"/);
  assert.match(opening, /operator: "Illustrative operator"/);
  assert.doesNotMatch(opening, /watching: "Live now"/);
  assert.doesNotMatch(opening, /\b\d+ live tables\b/i);
  assert.doesNotMatch(opening, /<strong>31%<\/strong><span>return lift<\/span>/);
  assert.doesNotMatch(opening, /<strong>61%<\/strong><span>return rate<\/span>/);
});
