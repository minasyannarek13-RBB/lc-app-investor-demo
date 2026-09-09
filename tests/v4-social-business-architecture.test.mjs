import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../app-product.js", import.meta.url), "utf8");
const shell = readFileSync(new URL("../LC_App_GitHub_Pages_Upload/product-shell-v2.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../LC_App_GitHub_Pages_Upload/product-shell-v4.css", import.meta.url), "utf8");
const socialFeedCss = readFileSync(new URL("../LC_App_GitHub_Pages_Upload/social-feed-v4.css", import.meta.url), "utf8");
const creatorStudioCss = readFileSync(new URL("../LC_App_GitHub_Pages_Upload/creator-studio-v4.css", import.meta.url), "utf8");
const html = readFileSync(new URL("../LC_App_GitHub_Pages_Upload/index.html", import.meta.url), "utf8");
const sw = readFileSync(new URL("../LC_App_GitHub_Pages_Upload/sw.js", import.meta.url), "utf8");

for (const view of ["home", "explore", "create", "activity", "profile"]) {
  assert.match(shell, new RegExp(`\\[\\"${view}\\"`), `missing social route ${view}`);
}
for (const view of ["overview", "creators", "campaigns", "live", "performance", "integrations", "safety", "settings"]) {
  assert.match(shell, new RegExp(`\\[\\"${view}\\"`), `missing business route ${view}`);
}
assert.match(app, /function renderSocialExplore/);
assert.match(app, /function renderSocialActivity/);
assert.match(app, /function renderSocialCreate/);
assert.match(app, /function socialFeedEntries/);
assert.match(app, /function renderSocialPost/);
assert.match(app, /social_home_feed/);
assert.match(app, /data-lc-form="comment"/);
assert.match(app, /data-lc-home-filter="following"/);
assert.match(app, /interaction: "home_filter"/);
assert.match(app, /function creatorStudioNavigation/);
assert.match(app, /function creatorSessionCard/);
assert.match(app, /\["audience", "Audience"\]/);
assert.match(app, /data-lc-creator-studio="\$\{id\}"/);
assert.match(app, /demoStore\.sessionOverrides/);
assert.match(app, /function renderIndustryHome\(view = state\.businessView\)/);
assert.match(app, /Creator verification and affiliation approval remain server-controlled/);
assert.match(app, /No live connection/);
assert.match(app, /To be validated/);
assert.doesNotMatch(app, /service_role/i);
assert.match(css, /lc-v4-explore-grid/);
assert.match(socialFeedCss, /lc-v4-social-feed/);
assert.match(socialFeedCss, /lc-v4-feed-post/);
assert.match(socialFeedCss, /lc-v4-live-rail/);
assert.match(shell, /social-feed-v4\.css\?v=1/);
assert.match(shell, /creator-studio-v4\.css\?v=1/);
assert.match(creatorStudioCss, /lc-v4-studio-nav/);
assert.match(creatorStudioCss, /lc-v4-live-control/);
assert.match(css, /lc-v4-business-workspace/);
assert.match(html, /app-product\.js\?v=100/);
assert.match(html, /product-shell-v2\.js\?v=9/);
assert.match(shell, /const routePersona = currentRoute\(\)\[0\] === "demo" \? currentRoute\(\)\[1\] : "";/);
assert.ok(
  shell.indexOf("const routePersona") < shell.indexOf("const explicit"),
  "demo route and freshly rendered persona chip must override stale shell dataset state"
);
assert.match(sw, /lc-app-investor-demo-v109/);
assert.match(sw, /creator-studio-v4\.css/);
assert.match(shell, /function syncDemoSwitch\(root\)/);
assert.match(shell, /window\.location\.hash = "#\/product"/);
assert.match(shell, /function handleDemoSwitch\(event\)/);
assert.match(shell, /window\.addEventListener\("click", handleDemoSwitch, true\)/);
assert.match(shell, /event\.stopImmediatePropagation\(\)/);
assert.match(shell, /window\.location\.reload\(\)/);
assert.match(shell, /function primeDemoPersonaRoute\(event\)/);
assert.match(shell, /window\.addEventListener\("click", primeDemoPersonaRoute, true\)/);
assert.match(shell, /`#\/product\/demo\/\$\{persona\}`/);
assert.match(app, /navigate: navigateProduct/);
assert.match(shell, /LCAppProduct\?\.navigate/);
assert.equal(
  (shell.match(/if \(!structureMatches\) \{/g) || []).length,
  2,
  "social and business navigation must preserve stable button nodes between upgrades"
);
assert.doesNotMatch(
  shell,
  /nav\.replaceChildren\([^\n]+\);\n\s+nav\.querySelectorAll/,
  "business navigation must not be rebuilt on every mutation"
);

console.log("LC App v4 social + business architecture contract: PASS");
