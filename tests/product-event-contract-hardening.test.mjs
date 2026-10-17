import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sql = readFileSync(new URL("../supabase/migrations/202610090056_product_event_contract_hardening.sql", import.meta.url), "utf8");

test("notification responses support trusted Creator-only or matching public session context", () => {
  const sessionRequirement = sql.match(/if new\.event_name in \([\s\S]+?\) and new\.creator_session_id is null then/gi).at(-1)[0];
  assert.match(sql, /new\.event_name = 'notification_response' and session_visibility <> 'public'/i);
  assert.match(sql, /'live_session_open', 'schedule_reminder', 'handoff_intent', 'handoff_return'[\s\S]+new\.creator_session_id is null/i);
  assert.doesNotMatch(sessionRequirement, /notification_response/i);
  assert.match(sql, /session_creator <> new\.creator_id/i);
});

test("metadata is restricted by a per-event allowlist", () => {
  assert.match(sql, /allowed_keys := case new\.event_name/i);
  assert.match(sql, /when 'creator_impression' then array\['surface','position','filter','recommendation_reasons','experience'\]/i);
  assert.match(sql, /when 'notification_response' then array\['notification_type'\]/i);
  assert.match(sql, /jsonb_object_keys\(new\.metadata\)/i);
  assert.match(sql, /metadata contains an unexpected key/i);
});

test("nested values and unbounded metadata types fail closed", () => {
  assert.match(sql, /jsonb_typeof\(metadata_value\) = 'object'/i);
  assert.match(sql, /nested product event metadata is not allowed/i);
  assert.match(sql, /jsonb_array_length\(metadata_value\) > 4/i);
  assert.match(sql, /char_length\(items\.item #>> '\{\}'\) not between 1 and 80/i);
  assert.match(sql, /scalar_value::numeric not between 0 and 10000/i);
});

test("metadata guard cannot be called or bypassed directly by browser roles", () => {
  assert.match(sql, /revoke all on function public\.enforce_product_event_metadata_allowlist\(\) from public, anon, authenticated/i);
  assert.match(sql, /before insert or update of event_name, metadata[\s\S]+execute function public\.enforce_product_event_metadata_allowlist\(\)/i);
});
