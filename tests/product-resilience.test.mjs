import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const app = await readFile(new URL("../app-product.js", import.meta.url), "utf8");
const nested = await readFile(new URL("../LC_App_GitHub_Pages_Upload/app-product.js", import.meta.url), "utf8");
const shell = await readFile(new URL("../LC_App_GitHub_Pages_Upload/product-shell-v2.js", import.meta.url), "utf8");
const css = await readFile(new URL("../LC_App_GitHub_Pages_Upload/product-shell-v2.css", import.meta.url), "utf8");
const sw = await readFile(new URL("../LC_App_GitHub_Pages_Upload/sw.js", import.meta.url), "utf8");

assert.equal(app, nested, "root and deployed product modules must stay synchronized");
assert.match(app, /data-lc-retry/);
assert.match(app, /async function retryLoad[\s\S]+await loadState\(\)[\s\S]+renderProductTarget/);
assert.match(app, /window\.addEventListener\("online"[\s\S]+if \(state\.loadError\) retryLoad/);
assert.match(app, /window\.addEventListener\("offline", syncConnectivity\)/);
assert.match(app, /root\.setAttribute\("aria-busy", "true"\)/);
assert.match(app, /role="alert" aria-live="assertive"/);
assert.match(app, /heading\.focus\(\{ preventScroll: true \}\)/);
assert.match(shell, /const ROUTE_STATUS_ID = "lcProductRouteStatus"/);
assert.match(shell, /function announceRoute\(root\)/);
assert.match(shell, /root\.getAttribute\("aria-busy"\) === "true"/);
assert.match(shell, /if \(!root \|\| !isProductRoute\(\)\)[\s\S]+status\.textContent = ""/, "route announcements must clear outside the product shell");
assert.match(shell, /\.lc-v4-creator-hero,\.lc-v4-live-stage,\.lc-v4-handoff-hero[\s\S]+critical \? "eager" : "lazy"/, "critical journey media must load eagerly");
assert.doesNotMatch(shell, /button:disabled:not\(/, "disabled empty-state actions must not trigger the global loading bar");
assert.match(css, /lc-product-connectivity\.is-online/);
assert.match(css, /lc-product-spinner/);
assert.match(sw, /acceptsHtml \? caches\.match\("\.\/index\.html"\)/);
assert.match(sw, /if \(response\.ok\)/);
assert.match(app, /loading="lazy" decoding="async"/, "offscreen demo media must use deferred decoding");

const demoMedia = [...app.matchAll(/app_prototype_assets\/dealers\/v2_polish\/[A-Za-z0-9_.-]+/g)]
  .map(([path]) => path);
assert.ok(demoMedia.length > 0, "the investor demo must declare its premium media assets");
for (const relativePath of new Set(demoMedia)) {
  await access(new URL(`../${relativePath}`, import.meta.url));
  await access(new URL(`../LC_App_GitHub_Pages_Upload/${relativePath}`, import.meta.url));
}

const follow = app.match(/async function toggleFollow[\s\S]+?async function toggleReminder/)[0];
assert.match(follow, /state\.follows\.add\(id\);[\s\S]+throw error/);
assert.match(follow, /state\.follows\.delete\(id\);[\s\S]+throw error/);

const reminder = app.match(/async function toggleReminder[\s\S]+?async function likePost/)[0];
assert.match(reminder, /state\.reminders\.add\(id\);[\s\S]+throw error/);
assert.match(reminder, /state\.reminders\.delete\(id\);[\s\S]+throw error/);

console.log("product resilience contract: PASS");
