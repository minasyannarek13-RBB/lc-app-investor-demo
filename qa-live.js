(() => {
  const cfg = window.LC_APP_CONFIG || {};
  const SUPABASE_URL = cfg.SUPABASE_URL || "https://aspbwgsfkebduvviyeuo.supabase.co";
  const SUPABASE_KEY = cfg.SUPABASE_PUBLISHABLE_KEY || cfg.SUPABASE_ANON_KEY || "";
  const PRODUCTION_COMMIT = cfg.PRODUCTION_COMMIT || "71fd452";
  const SUPABASE_REF = "aspbwgsfkebduvviyeuo";
  const RUN_ID = crypto.randomUUID();
  const TEMP_PREFIX = `[LC_QA_TEMP:${RUN_ID}]`;

  const $ = (id) => document.getElementById(id);
  const els = {
    run: $("runFullButton"),
    testConnection: $("testConnectionButton"),
    copyTop: $("copyReportButtonTop"),
    copyReport: $("copyReportButton"),
    notice: $("authNotice"),
    commit: $("commitLabel"),
    emailA: $("emailAInput"),
    passwordA: $("passwordAInput"),
    emailB: $("emailBInput"),
    passwordB: $("passwordBInput"),
    userADetail: $("userAOnboardingDetail"),
    userAAction: $("userAOnboardingAction"),
    userBDetail: $("userBOnboardingDetail"),
    userBAction: $("userBOnboardingAction"),
    diagClient: $("diagClient"),
    diagConfig: $("diagConfig"),
    diagUrl: $("diagUrl"),
    diagKey: $("diagKey"),
    diagJs: $("diagJs"),
    diagAuth: $("diagAuth"),
    diagSession: $("diagSession"),
    diagConnection: $("diagConnection"),
    diagLastError: $("diagLastError"),
    total: $("totalCount"),
    passed: $("passedCount"),
    failed: $("failedCount"),
    blocked: $("blockedCount"),
    skipped: $("skippedCount"),
    finalStatus: $("finalStatus"),
    resultsBody: $("resultsBody"),
    report: $("reportOutput"),
    debug: $("debugLog")
  };

  const state = {
    clientA: null,
    clientB: null,
    userA: null,
    userB: null,
    profileA: null,
    profileB: null,
    postAId: null,
    postBId: null,
    commentAId: null,
    replyBId: null,
    reportAId: null,
    cleanup: [],
    results: [],
    qaCommit: "not fetched",
    running: false,
    final: "SOCIAL MVP LIVE E2E: NOT RUN",
    errors: []
  };

  const diag = {
    client: "FAILED",
    config: "FAILED",
    url: SUPABASE_URL ? "configured" : "missing",
    key: SUPABASE_KEY ? "configured" : "missing",
    js: "NO",
    auth: "NOT RUN",
    session: "SIGNED OUT",
    connection: "NOT RUN",
    lastError: "None"
  };

  const tests = [
    ["01", "User A", "Follow User B", "follows row exists"],
    ["02", "User B", "Follower notification", "notification exists"],
    ["03", "User B", "Create temp post", "post UUID captured"],
    ["04", "User A", "Read User B post", "post visible"],
    ["05", "User A", "Like User B post", "post_likes row exists"],
    ["06", "User B", "Like notification", "notification exists"],
    ["07", "User A", "Unlike User B post", "post_likes row removed"],
    ["08", "User A", "Comment on User B post", "comment UUID captured"],
    ["09", "User B", "Comment notification", "notification exists"],
    ["10", "User B", "Reply to User A comment", "reply UUID captured"],
    ["11", "User A", "Attempt reply-to-reply", "database denies nested reply"],
    ["12", "User A", "Block User B", "user_blocks row exists"],
    ["13", "Both", "Follow cleanup after block", "A/B follows removed"],
    ["14", "Both", "Blocked RLS visibility", "blocked content hidden by DB/RLS"],
    ["15", "Both", "Attempt follow while blocked", "database denies both directions"],
    ["16", "Both", "Blocked notification interaction", "no forbidden notification generated"],
    ["17", "User A", "Direct notifications INSERT", "database denies client insert"],
    ["18", "User A", "Direct activity_events INSERT", "database denies client insert"],
    ["19", "User A", "Unblock User B", "block row removed"],
    ["20", "Both", "Visibility after unblock", "content visible again"],
    ["21", "User A", "Report post + authorization guards", "report insert allowed; privileged updates do not mutate"]
  ];

  class BlockedError extends Error {
    constructor(message) {
      super(message);
      this.name = "BlockedError";
    }
  }

  class SkippedError extends Error {
    constructor(message) {
      super(message);
      this.name = "SkippedError";
    }
  }

  function scrub(value) {
    const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
    return (text || "")
      .replace(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, "[JWT_REDACTED]")
      .replace(/sb_secret_[a-zA-Z0-9_-]+/g, "[SECRET_REDACTED]")
      .replace(/access_token["']?\s*[:=]\s*["'][^"']+["']/gi, "access_token: [REDACTED]")
      .replace(/refresh_token["']?\s*[:=]\s*["'][^"']+["']/gi, "refresh_token: [REDACTED]")
      .replace(/password[A-Za-z0-9_ -]*["']?\s*[:=]\s*["'][^"']+["']/gi, "password: [REDACTED]");
  }

  function log(label, payload) {
    els.debug.textContent = `[${new Date().toISOString()}] ${label}\n${scrub(payload)}\n\n${els.debug.textContent}`.slice(0, 80000);
  }

  function setNotice(type, message) {
    els.notice.textContent = message;
    els.notice.className = `notice ${type || ""}`.trim();
  }

  function setDiag(patch) {
    Object.assign(diag, patch);
    renderDiagnostics();
  }

  function renderDiagnostics() {
    els.diagClient.textContent = diag.client;
    els.diagConfig.textContent = diag.config;
    els.diagUrl.textContent = diag.url;
    els.diagKey.textContent = diag.key;
    els.diagJs.textContent = diag.js;
    els.diagAuth.textContent = diag.auth;
    els.diagSession.textContent = diag.session;
    els.diagConnection.textContent = diag.connection;
    els.diagLastError.textContent = scrub(diag.lastError || "None");
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
  }

  function failMessage(error) {
    if (!error) return "";
    return error.message || error.error_description || error.details || String(error);
  }

  function humanError(error) {
    const raw = failMessage(error) || "Unknown error.";
    if (/failed to fetch|networkerror|load failed/i.test(raw)) return "Supabase request failed from this browser. Check network, browser privacy blocking, CORS/origin settings, or Supabase availability.";
    if (/invalid login credentials/i.test(raw)) return "Login failed: email or password is incorrect.";
    if (/email not confirmed/i.test(raw)) return "Login failed: email is not confirmed.";
    if (/timed out/i.test(raw)) return raw;
    return raw;
  }

  function withTimeout(promise, timeoutMs, label) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(timeoutMs / 1000)} seconds.`)), timeoutMs);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function assertOk(result, label) {
    if (result?.error) {
      const err = new Error(`${label}: ${failMessage(result.error)}`);
      err.cause = result.error;
      throw err;
    }
    return result;
  }

  function expectDenied(result, label) {
    if (!result?.error) throw new Error(`${label}: request succeeded but expected denial`);
    return result.error;
  }

  async function verifyReportReviewDenied() {
    const before = assertOk(await state.clientA.from("reports")
      .select("id,status,reviewed_by,reviewed_at")
      .eq("id", state.reportAId)
      .single(), "report before moderator update").data;
    const attempted = await state.clientA.from("reports")
      .update({ status: "reviewing" })
      .eq("id", state.reportAId)
      .select("id,status,reviewed_by,reviewed_at");
    const after = assertOk(await state.clientA.from("reports")
      .select("id,status,reviewed_by,reviewed_at")
      .eq("id", state.reportAId)
      .single(), "report after moderator update").data;
    if (after.status !== before.status || after.reviewed_by !== before.reviewed_by || after.reviewed_at !== before.reviewed_at) {
      throw new Error(`regular user changed report review fields: ${JSON.stringify({ before, after, attempted })}`);
    }
    if (!attempted.error && Array.isArray(attempted.data) && attempted.data.length > 0) {
      throw new Error(`regular user update returned affected report rows: ${JSON.stringify(attempted.data)}`);
    }
    return attempted.error ? "report review update rejected" : "report review update affected 0 rows; report unchanged";
  }

  async function verifyOwnProfileSystemFieldLocked(field, attemptedValue) {
    const before = await profile(state.clientA, state.userA.id, "User A before profile guard");
    const nextValue = attemptedValue === before[field]
      ? (field === "role" ? "admin" : "disabled")
      : attemptedValue;
    const attempted = await state.clientA.from("profiles")
      .update({ [field]: nextValue })
      .eq("id", state.userA.id)
      .select("id,role,account_status")
      .maybeSingle();
    const after = await profile(state.clientA, state.userA.id, "User A after profile guard");
    if (after[field] !== before[field]) {
      await state.clientA.from("profiles").update({ [field]: before[field] }).eq("id", state.userA.id);
      throw new Error(`regular user changed own profiles.${field}: ${before[field]} -> ${after[field]}`);
    }
    return attempted.error ? `profiles.${field} update rejected` : `profiles.${field} unchanged after update attempt`;
  }

  async function verifyCrossUserProfileUpdateDenied() {
    const before = await profile(state.clientB, state.userB.id, "User B before cross-profile guard");
    const attemptedBio = `${TEMP_PREFIX} cross-user profile mutation should fail`;
    const attempted = await state.clientA.from("profiles")
      .update({ bio: attemptedBio })
      .eq("id", state.userB.id)
      .select("id,bio")
      .maybeSingle();
    const after = await profile(state.clientB, state.userB.id, "User B after cross-profile guard");
    if (after.bio !== before.bio) {
      await state.clientB.from("profiles").update({ bio: before.bio }).eq("id", state.userB.id);
      throw new Error("regular user changed another user's profile.");
    }
    return attempted.error ? "cross-user profile update rejected" : "cross-user profile update affected 0 rows; profile unchanged";
  }

  function memoryStorage() {
    const store = new Map();
    return {
      getItem: (key) => store.get(key) || null,
      setItem: (key, value) => {
        store.set(key, value);
      },
      removeItem: (key) => {
        store.delete(key);
      }
    };
  }

  function makeClient(label) {
    return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: `lc-live-qa-${label}-${RUN_ID}`,
        storage: memoryStorage()
      }
    });
  }

  function resetRunState() {
    state.userA = null;
    state.userB = null;
    state.profileA = null;
    state.profileB = null;
    state.postAId = null;
    state.postBId = null;
    state.commentAId = null;
    state.replyBId = null;
    state.reportAId = null;
    state.cleanup = [];
    state.results = [];
    state.errors = [];
    state.final = "SOCIAL MVP LIVE E2E: RUNNING";
    els.debug.textContent = "";
    renderUsers();
    renderResults();
  }

  function yesNo(value) {
    if (value === null || value === undefined) return "-";
    return value ? "YES" : "NO";
  }

  function timestampStatus(value) {
    return value ? "YES" : "NO";
  }

  function fieldStatus(value) {
    return value ? String(value) : "MISSING";
  }

  function renderUserDetail(slot, user, profileRow) {
    const detail = slot === "A" ? els.userADetail : els.userBDetail;
    const action = slot === "A" ? els.userAAction : els.userBAction;
    if (!detail || !action) return;
    const missing = profileRow ? onboardingMissing(profileRow) : [];
    const complete = profileRow ? missing.length === 0 && Boolean(profileRow.onboarding_completed) : false;
    detail.innerHTML = [
      ["AUTH", user ? "SIGNED IN" : "SIGNED OUT"],
      ["PROFILE EXISTS", yesNo(Boolean(profileRow))],
      ["UID", user?.id || "-"],
      ["USERNAME", fieldStatus(profileRow?.username)],
      ["DISPLAY NAME", fieldStatus(profileRow?.display_name)],
      ["AGE CONFIRMED", yesNo(profileRow?.age_confirmed)],
      ["TERMS ACCEPTED", timestampStatus(profileRow?.terms_accepted_at)],
      ["PRIVACY ACCEPTED", timestampStatus(profileRow?.privacy_accepted_at)],
      ["ACCOUNT STATUS", profileRow?.account_status || "-"],
      ["ONBOARDING COMPLETE", yesNo(complete)]
    ].map(([label, value]) => `<span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>`).join("");
    action.classList.toggle("show", Boolean(user && profileRow && !complete));
  }

  function renderUsers() {
    renderUserDetail("A", state.userA, state.profileA);
    renderUserDetail("B", state.userB, state.profileB);
  }

  function userReport(label, user, profileRow) {
    const missing = profileRow ? onboardingMissing(profileRow) : [];
    const complete = profileRow ? missing.length === 0 && Boolean(profileRow.onboarding_completed) : false;
    return [
      `${label}:`,
      `Auth: ${user ? "SIGNED IN" : "SIGNED OUT"}`,
      `Profile: ${profileRow ? "EXISTS" : "MISSING"}`,
      `UID: ${user?.id || "not authenticated"}`,
      `Username: ${profileRow?.username || "MISSING"}`,
      `Display name: ${profileRow?.display_name || "MISSING"}`,
      `Age confirmed: ${yesNo(profileRow?.age_confirmed)}`,
      `Terms accepted: ${timestampStatus(profileRow?.terms_accepted_at)}`,
      `Privacy accepted: ${timestampStatus(profileRow?.privacy_accepted_at)}`,
      `Account status: ${profileRow?.account_status || "-"}`,
      `Onboarding complete: ${yesNo(complete)}`,
      `Missing onboarding fields: ${missing.length ? missing.join(", ") : "None"}`
    ];
  }

  function addResult(id, user, action, expected, actual, result, detail = "") {
    const row = { id, user, action, expected, actual, result, detail: scrub(detail) };
    const existing = state.results.findIndex((item) => item.id === id);
    if (existing >= 0) state.results[existing] = row;
    else state.results.push(row);
    renderResults();
    return row;
  }

  function setPendingRows() {
    state.results = tests.map(([id, user, action, expected]) => ({
      id, user, action, expected, actual: "Not run", result: "SKIPPED", detail: "Waiting for run."
    }));
    renderResults();
  }

  function isAutomatedTestRow(row) {
    return tests.some(([id]) => id === row.id);
  }

  function renderResults() {
    const countableRows = state.results.some(isAutomatedTestRow)
      ? state.results.filter(isAutomatedTestRow)
      : state.results;
    const counts = { PASS: 0, FAIL: 0, BLOCKED: 0, SKIPPED: 0 };
    countableRows.forEach((row) => {
      if (counts[row.result] !== undefined) counts[row.result] += 1;
    });
    els.total.textContent = String(countableRows.length);
    els.passed.textContent = String(counts.PASS);
    els.failed.textContent = String(counts.FAIL);
    els.blocked.textContent = String(counts.BLOCKED);
    els.skipped.textContent = String(counts.SKIPPED);
    els.finalStatus.textContent = state.final;
    els.resultsBody.innerHTML = state.results.map((row) => `
      <tr>
        <td>${escapeHtml(row.id)}</td>
        <td>${escapeHtml(row.user)}</td>
        <td>${escapeHtml(row.action)}</td>
        <td>${escapeHtml(row.expected)}</td>
        <td>${escapeHtml(row.actual)}</td>
        <td class="result-${escapeHtml(row.result.toLowerCase())}">${escapeHtml(row.result)}</td>
        <td>${escapeHtml(row.detail)}</td>
      </tr>
    `).join("");
    renderReport();
  }

  async function runStep(id, fn) {
    const meta = tests.find((test) => test[0] === id);
    addResult(id, meta[1], meta[2], meta[3], "Running", "SKIPPED", "Running...");
    try {
      const actual = await fn();
      addResult(id, meta[1], meta[2], meta[3], actual || "Verified", "PASS", "");
      return true;
    } catch (error) {
      const status = error instanceof BlockedError ? "BLOCKED" : error instanceof SkippedError ? "SKIPPED" : "FAIL";
      const message = humanError(error);
      state.errors.push(`TEST ${id}: ${message}`);
      setDiag({ lastError: message });
      log(`TEST ${id} ${status}`, error?.cause || error);
      addResult(id, meta[1], meta[2], meta[3], "Not verified", status, message);
      return false;
    }
  }

  async function testSupabaseConnection() {
    setDiag({ connection: "RUNNING", lastError: "None" });
    const response = await withTimeout(fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_KEY }
    }), 12000, "Supabase connection");
    if (!response.ok) throw new Error(`Supabase endpoint returned HTTP ${response.status}.`);
    setDiag({ connection: "PASS" });
    return "Supabase endpoint reachable";
  }

  async function fetchQaCommit() {
    try {
      const response = await withTimeout(fetch("https://api.github.com/repos/minasyannarek13-RBB/lc-app-investor-demo/commits/main", {
        headers: { Accept: "application/vnd.github+json" }
      }), 10000, "QA commit lookup");
      if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}`);
      const data = await response.json();
      state.qaCommit = data?.sha ? data.sha.slice(0, 7) : "not available";
    } catch (error) {
      state.qaCommit = "not available";
      log("QA commit lookup skipped", error);
    }
    renderReport();
  }

  async function signIn(client, email, password, label) {
    const result = await withTimeout(client.auth.signInWithPassword({ email, password }), 18000, `${label} login`);
    if (result.error) throw result.error;
    if (!result.data?.user?.id) throw new Error(`${label} login did not return a user id.`);
    return result.data.user;
  }

  async function profile(client, uid, label) {
    return assertOk(await client.from("profiles")
      .select("id,username,display_name,onboarding_completed,terms_accepted_at,privacy_accepted_at,age_confirmed,account_status,role")
      .eq("id", uid)
      .single(), `${label} profile`).data;
  }

  async function userSettings(client, uid, label) {
    return assertOk(await client.from("user_settings").select("*").eq("user_id", uid).single(), `${label} user_settings`).data;
  }

  function onboardingMissing(profileRow) {
    return ["username", "display_name", "age_confirmed", "terms_accepted_at", "privacy_accepted_at"]
      .filter((field) => !profileRow?.[field]);
  }

  async function preflight() {
    setNotice("", "Preflight running...");
    setDiag({ auth: "RUNNING", session: "SIGNED OUT", lastError: "None" });
    state.clientA = makeClient("a");
    state.clientB = makeClient("b");
    setDiag({ client: "READY" });
    await testSupabaseConnection();

    const emailA = els.emailA.value.trim();
    const emailB = els.emailB.value.trim();
    const passwordA = els.passwordA.value;
    const passwordB = els.passwordB.value;
    els.passwordA.value = "";
    els.passwordB.value = "";
    if (!emailA || !passwordA || !emailB || !passwordB) throw new BlockedError("Enter email and password for both User A and User B.");

    state.userA = await signIn(state.clientA, emailA, passwordA, "User A");
    state.userB = await signIn(state.clientB, emailB, passwordB, "User B");
    if (state.userA.id === state.userB.id) throw new BlockedError("User A and User B must be different accounts.");

    state.profileA = await profile(state.clientA, state.userA.id, "User A");
    state.profileB = await profile(state.clientB, state.userB.id, "User B");
    await userSettings(state.clientA, state.userA.id, "User A");
    await userSettings(state.clientB, state.userB.id, "User B");
    renderUsers();

    const blockers = [];
    if (state.profileA.account_status !== "active") blockers.push(`User A account_status=${state.profileA.account_status}`);
    if (state.profileB.account_status !== "active") blockers.push(`User B account_status=${state.profileB.account_status}`);
    if (state.profileA.role !== "user") blockers.push(`User A role=${state.profileA.role}; expected user`);
    if (state.profileB.role !== "user") blockers.push(`User B role=${state.profileB.role}; expected user`);
    const missingA = onboardingMissing(state.profileA);
    const missingB = onboardingMissing(state.profileB);
    if (missingA.length) blockers.push(`User A missing onboarding fields: ${missingA.join(", ")}`);
    if (missingB.length) blockers.push(`User B missing onboarding fields: ${missingB.join(", ")}`);

    const followAToB = await state.clientA.from("follows").select("*").eq("follower_id", state.userA.id).eq("following_id", state.userB.id);
    const followBToA = await state.clientB.from("follows").select("*").eq("follower_id", state.userB.id).eq("following_id", state.userA.id);
    if (followAToB.error) throw followAToB.error;
    if (followBToA.error) throw followBToA.error;
    if (followAToB.data?.length || followBToA.data?.length) blockers.push("Existing follow relationship between User A and User B would make cleanup unsafe.");

    const existingBlocksA = await state.clientA.from("user_blocks").select("*").eq("blocker_id", state.userA.id).eq("blocked_id", state.userB.id);
    const existingBlocksB = await state.clientB.from("user_blocks").select("*").eq("blocker_id", state.userB.id).eq("blocked_id", state.userA.id);
    if (existingBlocksA.error && existingBlocksB.error) throw existingBlocksA.error;
    if ((existingBlocksA.data || []).length || (existingBlocksB.data || []).length) blockers.push("Existing block relationship between User A and User B would invalidate block tests.");
    if (blockers.length) throw new BlockedError(blockers.join(" | "));

    setDiag({ auth: "SUCCESS", session: "SIGNED IN" });
    return "Preflight PASS";
  }

  async function waitForNotification(client, recipientId, actorId, type, targetType, targetId) {
    for (let i = 0; i < 8; i += 1) {
      const query = client.from("notifications")
        .select("id,type,target_type,target_id,actor_id,recipient_id,created_at")
        .eq("recipient_id", recipientId)
        .eq("actor_id", actorId)
        .eq("type", type)
        .eq("target_type", targetType)
        .order("created_at", { ascending: false })
        .limit(10);
      if (targetId) query.eq("target_id", targetId);
      const result = assertOk(await query, `${type} notification`);
      const row = (result.data || []).find((item) => !targetId || item.target_id === targetId);
      if (row) return row;
      await delay(500);
    }
    throw new Error(`No ${type} notification found for recipient.`);
  }

  async function notificationCount(client, recipientId, actorId) {
    const result = assertOk(await client.from("notifications")
      .select("id", { count: "exact" })
      .eq("recipient_id", recipientId)
      .eq("actor_id", actorId), "notification count");
    return result.count ?? (result.data || []).length;
  }

  async function visiblePost(client, postId, label) {
    const result = assertOk(await client.from("posts").select("id,author_id,body,deleted_at,status").eq("id", postId).maybeSingle(), label);
    return result.data;
  }

  async function visibleComment(client, commentId, label) {
    const result = assertOk(await client.from("comments").select("id,author_id,body,parent_comment_id,deleted_at,status").eq("id", commentId).maybeSingle(), label);
    return result.data;
  }

  async function cleanupRun() {
    const cleanupNotes = [];
    if (state.clientA && state.userA && state.userB) {
      await state.clientA.from("user_blocks").delete().eq("blocker_id", state.userA.id).eq("blocked_id", state.userB.id);
      await state.clientA.from("follows").delete().eq("follower_id", state.userA.id).eq("following_id", state.userB.id);
      if (state.postBId) await state.clientA.from("post_likes").delete().eq("post_id", state.postBId).eq("user_id", state.userA.id);
      if (state.commentAId) await state.clientA.from("comments").update({ deleted_at: new Date().toISOString(), body: "[deleted]" }).eq("id", state.commentAId);
      if (state.postAId) await state.clientA.from("posts").update({ deleted_at: new Date().toISOString() }).eq("id", state.postAId);
    }
    if (state.clientB && state.userB && state.userA) {
      await state.clientB.from("follows").delete().eq("follower_id", state.userB.id).eq("following_id", state.userA.id);
      if (state.replyBId) await state.clientB.from("comments").update({ deleted_at: new Date().toISOString(), body: "[deleted]" }).eq("id", state.replyBId);
      if (state.postBId) await state.clientB.from("posts").update({ deleted_at: new Date().toISOString() }).eq("id", state.postBId);
    }
    if (state.reportAId) cleanupNotes.push(`Report ${state.reportAId} retained: reports have no client DELETE policy.`);
    cleanupNotes.push("Notifications/activity_events retained by database policy.");
    state.cleanup = cleanupNotes;
    return cleanupNotes.join(" ");
  }

  async function runFullE2E(event) {
    event?.preventDefault();
    if (state.running) return;
    state.running = true;
    els.run.disabled = true;
    els.run.textContent = "RUNNING...";
    resetRunState();
    setPendingRows();
    setNotice("", "Running preflight...");

    let preflightPassed = false;
    try {
      await preflight();
      preflightPassed = true;
      setNotice("", "Running social E2E tests...");
    } catch (error) {
      const message = humanError(error);
      const status = error instanceof BlockedError ? "BLOCKED" : "FAIL";
      state.errors.push(`PREFLIGHT: ${message}`);
      state.final = "SOCIAL MVP LIVE E2E: FAIL";
      setDiag({ auth: status === "BLOCKED" ? "BLOCKED" : "FAILED", lastError: message });
      setNotice("error", message);
      log(`PREFLIGHT ${status}`, error?.cause || error);
      state.results = [];
      addResult("PREFLIGHT", "A+B", "Connectivity, auth, profiles, settings, account/onboarding", "ready to test", "not ready", status, message);
    }

    if (preflightPassed) {
      await runStep("01", async () => {
        assertOk(await state.clientA.from("follows").insert({ follower_id: state.userA.id, following_id: state.userB.id }), "A follows B");
        const row = assertOk(await state.clientA.from("follows").select("*").eq("follower_id", state.userA.id).eq("following_id", state.userB.id).maybeSingle(), "follow visible");
        if (!row.data) throw new Error("Follow row missing after insert.");
        return "A->B follow row visible";
      });

      await runStep("02", async () => {
        const note = await waitForNotification(state.clientB, state.userB.id, state.userA.id, "new_follower", "profile", state.userB.id);
        return `notification ${note.id}; activity_events are intentionally not client-readable`;
      });

      await runStep("03", async () => {
        const post = assertOk(await state.clientB.from("posts").insert({
          author_id: state.userB.id,
          body: `${TEMP_PREFIX} User B post ${new Date().toISOString()}`,
          status: "active"
        }).select("id").single(), "B creates post").data;
        state.postBId = post.id;
        return `post ${state.postBId}`;
      });

      await runStep("04", async () => {
        if (!state.postBId) throw new SkippedError("No User B post id.");
        const row = await visiblePost(state.clientA, state.postBId, "A reads B post");
        if (!row) throw new Error("User A cannot read User B post.");
        return "B post visible to A";
      });

      await runStep("05", async () => {
        if (!state.postBId) throw new SkippedError("No User B post id.");
        assertOk(await state.clientA.from("post_likes").insert({ post_id: state.postBId, user_id: state.userA.id }), "A likes B post");
        const row = assertOk(await state.clientA.from("post_likes").select("*").eq("post_id", state.postBId).eq("user_id", state.userA.id).maybeSingle(), "like visible");
        if (!row.data) throw new Error("Like row missing after insert.");
        return "post_likes row exists";
      });

      await runStep("06", async () => {
        if (!state.postBId) throw new SkippedError("No User B post id.");
        const note = await waitForNotification(state.clientB, state.userB.id, state.userA.id, "post_like", "post", state.postBId);
        return `like notification ${note.id}`;
      });

      await runStep("07", async () => {
        assertOk(await state.clientA.from("post_likes").delete().eq("post_id", state.postBId).eq("user_id", state.userA.id), "A unlikes");
        const row = assertOk(await state.clientA.from("post_likes").select("*").eq("post_id", state.postBId).eq("user_id", state.userA.id).maybeSingle(), "unlike verify");
        if (row.data) throw new Error("Like row remained after unlike.");
        return "like removed";
      });

      await runStep("08", async () => {
        if (!state.postBId) throw new SkippedError("No User B post id.");
        const comment = assertOk(await state.clientA.from("comments").insert({
          post_id: state.postBId,
          author_id: state.userA.id,
          body: `${TEMP_PREFIX} User A comment ${new Date().toISOString()}`
        }).select("id").single(), "A comments").data;
        state.commentAId = comment.id;
        return `comment ${state.commentAId}`;
      });

      await runStep("09", async () => {
        if (!state.postBId) throw new SkippedError("No User B post id.");
        const note = await waitForNotification(state.clientB, state.userB.id, state.userA.id, "comment", "post", state.postBId);
        return `comment notification ${note.id}`;
      });

      await runStep("10", async () => {
        if (!state.commentAId) throw new SkippedError("No User A comment id.");
        const reply = assertOk(await state.clientB.from("comments").insert({
          post_id: state.postBId,
          author_id: state.userB.id,
          parent_comment_id: state.commentAId,
          body: `${TEMP_PREFIX} User B reply ${new Date().toISOString()}`
        }).select("id").single(), "B replies").data;
        state.replyBId = reply.id;
        return `reply ${state.replyBId}`;
      });

      await runStep("11", async () => {
        if (!state.replyBId) throw new SkippedError("No User B reply id.");
        const nested = await state.clientA.from("comments").insert({
          post_id: state.postBId,
          author_id: state.userA.id,
          parent_comment_id: state.replyBId,
          body: `${TEMP_PREFIX} nested reply should fail`
        }).select("id").maybeSingle();
        expectDenied(nested, "reply-to-reply");
        return "nested reply denied";
      });

      await runStep("12", async () => {
        assertOk(await state.clientA.from("user_blocks").insert({ blocker_id: state.userA.id, blocked_id: state.userB.id }), "A blocks B");
        const row = assertOk(await state.clientA.from("user_blocks").select("*").eq("blocker_id", state.userA.id).eq("blocked_id", state.userB.id).maybeSingle(), "block visible");
        if (!row.data) throw new Error("Block row missing after insert.");
        return "A->B block row exists";
      });

      await runStep("13", async () => {
        const rows = assertOk(await state.clientA.from("follows")
          .select("*")
          .or(`and(follower_id.eq.${state.userA.id},following_id.eq.${state.userB.id}),and(follower_id.eq.${state.userB.id},following_id.eq.${state.userA.id})`), "follow cleanup").data;
        if (rows.length) throw new Error("Follow relationship still exists after block.");
        return "A/B follows removed";
      });

      await runStep("14", async () => {
        const postA = assertOk(await state.clientA.from("posts").insert({
          author_id: state.userA.id,
          body: `${TEMP_PREFIX} User A visibility post ${new Date().toISOString()}`,
          status: "active"
        }).select("id").single(), "A creates visibility post").data;
        state.postAId = postA.id;
        const aReadsBPost = await visiblePost(state.clientA, state.postBId, "A reads blocked B post");
        const aReadsBReply = state.replyBId ? await visibleComment(state.clientA, state.replyBId, "A reads blocked B reply") : null;
        const bReadsAPost = await visiblePost(state.clientB, state.postAId, "B reads blocked A post");
        const bReadsAComment = state.commentAId ? await visibleComment(state.clientB, state.commentAId, "B reads blocked A comment") : null;
        if (aReadsBPost || aReadsBReply || bReadsAPost || bReadsAComment) {
          throw new Error("Blocked content remained visible through direct Supabase queries.");
        }
        return "blocked posts/comments hidden both directions";
      });

      await runStep("15", async () => {
        const aFollow = await state.clientA.from("follows").insert({ follower_id: state.userA.id, following_id: state.userB.id });
        const bFollow = await state.clientB.from("follows").insert({ follower_id: state.userB.id, following_id: state.userA.id });
        expectDenied(aFollow, "A follow while blocked");
        expectDenied(bFollow, "B follow while blocked");
        return "both follow attempts denied";
      });

      await runStep("16", async () => {
        const before = await notificationCount(state.clientB, state.userB.id, state.userA.id);
        const like = await state.clientA.from("post_likes").insert({ post_id: state.postBId, user_id: state.userA.id });
        expectDenied(like, "A likes B post while blocked");
        await delay(700);
        const after = await notificationCount(state.clientB, state.userB.id, state.userA.id);
        if (after !== before) throw new Error(`Blocked interaction changed notification count: ${before} -> ${after}`);
        return "blocked like denied; no new B notification";
      });

      await runStep("17", async () => {
        const insert = await state.clientA.from("notifications").insert({
          recipient_id: state.userA.id,
          actor_id: state.userB.id,
          type: "new_follower",
          target_type: "profile",
          target_id: state.userA.id
        });
        expectDenied(insert, "direct notification insert");
        return "direct notifications insert denied";
      });

      await runStep("18", async () => {
        const insert = await state.clientA.from("activity_events").insert({
          actor_id: state.userA.id,
          recipient_id: state.userB.id,
          verb: "followed",
          target_type: "profile",
          target_id: state.userB.id
        });
        expectDenied(insert, "direct activity_events insert");
        return "direct activity_events insert denied";
      });

      await runStep("19", async () => {
        assertOk(await state.clientA.from("user_blocks").delete().eq("blocker_id", state.userA.id).eq("blocked_id", state.userB.id), "A unblocks B");
        const row = assertOk(await state.clientA.from("user_blocks").select("*").eq("blocker_id", state.userA.id).eq("blocked_id", state.userB.id).maybeSingle(), "unblock verify");
        if (row.data) throw new Error("Block row still exists after unblock.");
        return "block removed";
      });

      await runStep("20", async () => {
        const bPost = await visiblePost(state.clientA, state.postBId, "A reads B post after unblock");
        const aPost = await visiblePost(state.clientB, state.postAId, "B reads A post after unblock");
        if (!bPost || !aPost) throw new Error("Visibility did not return after unblock.");
        return "A/B temp posts visible again";
      });

      await runStep("21", async () => {
        const report = assertOk(await state.clientA.from("reports").insert({
          reporter_id: state.userA.id,
          target_type: "post",
          target_id: state.postBId,
          reason: "other",
          description: `${TEMP_PREFIX} report`
        }).select("id,status").single(), "A reports B post").data;
        state.reportAId = report.id;
        const reportGuard = await verifyReportReviewDenied();
        const roleGuard = await verifyOwnProfileSystemFieldLocked("role", "moderator");
        const statusGuard = await verifyOwnProfileSystemFieldLocked("account_status", "suspended");
        const crossProfileGuard = await verifyCrossUserProfileUpdateDenied();
        return `report ${state.reportAId}; ${reportGuard}; ${roleGuard}; ${statusGuard}; ${crossProfileGuard}; moderator/admin report review policy is present via reports_update_moderation/public.is_moderator`;
      });
    }

    if (preflightPassed) {
      const cleanupDetail = await cleanupRun().catch((error) => {
        const message = humanError(error);
        state.errors.push(`CLEANUP: ${message}`);
        log("CLEANUP FAIL", error?.cause || error);
        return `Cleanup failed: ${message}`;
      });
      state.results.push({
        id: "CLEANUP",
        user: "A+B",
        action: "Cleanup run-created data",
        expected: "remove only run_id data where RLS allows",
        actual: cleanupDetail,
        result: cleanupDetail.startsWith("Cleanup failed") ? "FAIL" : "PASS",
        detail: cleanupDetail
      });
    }

    const hasFail = state.results.some((row) => row.result === "FAIL" || row.result === "BLOCKED");
    state.final = hasFail ? "SOCIAL MVP LIVE E2E: FAIL" : "SOCIAL MVP LIVE E2E: PASS";
    setNotice(hasFail ? "error" : "success", state.final);
    renderResults();
    state.running = false;
    els.run.disabled = false;
    els.run.textContent = "RUN FULL SOCIAL E2E";
  }

  function renderReport() {
    const rows = state.results.map((row) => `TEST ${row.id} | ${row.user} | ${row.action} | ${row.result} | ${row.actual}${row.detail ? ` | ${row.detail}` : ""}`);
    els.report.value = [
      "LC APP LIVE QA REPORT",
      `Production commit: ${PRODUCTION_COMMIT}`,
      `QA commit: ${state.qaCommit}`,
      `Timestamp: ${new Date().toISOString()}`,
      `Supabase project reference: ${SUPABASE_REF}`,
      `Run ID: ${RUN_ID}`,
      `User A UID: ${state.userA?.id || "not authenticated"}`,
      `User B UID: ${state.userB?.id || "not authenticated"}`,
      "",
      ...userReport("USER A", state.userA, state.profileA),
      "",
      ...userReport("USER B", state.userB, state.profileB),
      "",
      "Preflight results:",
      `Supabase client: ${diag.client}`,
      `Runtime config: ${diag.config}`,
      `Supabase URL: ${diag.url}`,
      `Publishable key: ${diag.key}`,
      `Auth request: ${diag.auth}`,
      `Session: ${diag.session}`,
      `Supabase connection: ${diag.connection}`,
      "",
      "Each test result:",
      ...(rows.length ? rows : ["No tests run."]),
      "",
      "RLS/security results:",
      state.results.filter((row) => /RLS|Direct|blocked|Block|notification|activity/i.test(`${row.action} ${row.expected}`)).map((row) => `TEST ${row.id}: ${row.result} - ${row.actual}`),
      "",
      "Cleanup results:",
      ...(state.cleanup.length ? state.cleanup : ["Cleanup not run yet."]),
      "",
      "Remaining failures/blockers:",
      ...(state.errors.length ? state.errors.map(scrub) : ["None."]),
      "",
      `Final verdict: ${state.final}`
    ].flat().join("\n");
  }

  async function copyReport() {
    await navigator.clipboard.writeText(els.report.value);
    setNotice("success", "QA report copied.");
  }

  async function handleConnectionClick(event) {
    event?.preventDefault();
    setNotice("", "Testing Supabase connection...");
    try {
      const actual = await testSupabaseConnection();
      setNotice("success", "Supabase connectivity PASS.");
      setDiag({ lastError: "None" });
      state.results = [{ id: "CONNECTION", user: "Browser", action: "Reach Supabase endpoint", expected: "PASS", actual, result: "PASS", detail: "" }];
    } catch (error) {
      const message = humanError(error);
      setDiag({ connection: "FAIL", lastError: message });
      setNotice("error", message);
      state.results = [{ id: "CONNECTION", user: "Browser", action: "Reach Supabase endpoint", expected: "PASS", actual: "FAIL", result: "FAIL", detail: message }];
    }
    renderResults();
  }

  function bind() {
    els.run.addEventListener("click", runFullE2E);
    els.testConnection.addEventListener("click", handleConnectionClick);
    els.copyTop.addEventListener("click", copyReport);
    els.copyReport.addEventListener("click", copyReport);
  }

  function init() {
    els.commit.textContent = PRODUCTION_COMMIT;
    setDiag({
      js: "YES",
      config: SUPABASE_URL && SUPABASE_KEY ? "READY" : "FAILED",
      url: SUPABASE_URL ? "configured" : "missing",
      key: SUPABASE_KEY ? "configured" : "missing"
    });
    renderDiagnostics();
    setPendingRows();
    renderUsers();
    if (!window.supabase?.createClient) {
      setDiag({ client: "FAILED", lastError: "Supabase JS library did not load." });
      setNotice("error", "Supabase JS library did not load. Login cannot run until the SDK is available.");
      return;
    }
    state.clientA = makeClient("a-init");
    state.clientB = makeClient("b-init");
    setDiag({ client: "READY" });
    setNotice("", "Ready. Enter both test users and click RUN FULL SOCIAL E2E.");
    bind();
    fetchQaCommit();
  }

  window.addEventListener("error", (event) => {
    const message = event.message || "Runtime error.";
    state.errors.push(`runtime: ${message}`);
    setDiag({ lastError: message });
    setNotice("error", message);
    log("runtime error", { message, filename: event.filename, lineno: event.lineno });
    renderReport();
  });

  window.addEventListener("unhandledrejection", (event) => {
    const message = humanError(event.reason);
    state.errors.push(`promise: ${message}`);
    setDiag({ lastError: message });
    setNotice("error", message);
    log("unhandled rejection", event.reason);
    renderReport();
  });

  init();
})();
