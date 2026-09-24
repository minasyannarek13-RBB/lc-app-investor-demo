import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const reveal = readFileSync(new URL("../showcase-v2/index.html", import.meta.url), "utf8");

assert.match(reveal, /seeking one licensed operator or provider partner/i);
assert.match(reveal, /DISCUSS A CONTROLLED PILOT/);
assert.match(reveal, /mailto:mn@open-gamer\.com\?subject=LC%20App%20controlled%20pilot/);

for (const responsibility of [
  "Gameplay",
  "streaming infrastructure",
  "wallet",
  "wagering",
  "settlement",
  "KYC / AML",
  "responsible gaming",
  "jurisdictional approval",
]) {
  assert.ok(reveal.includes(responsibility), `missing partner responsibility: ${responsibility}`);
}

for (const lcCapability of [
  "Creator identity",
  "discovery",
  "follow",
  "content",
  "schedule",
  "reminders",
  "live-intent context",
  "handoff",
  "pilot measurement",
]) {
  assert.ok(reveal.includes(lcCapability), `missing LC capability: ${lcCapability}`);
}

assert.match(reveal, /No performance outcome is claimed\./);

console.log("Reveal pilot offer contract: PASS");
