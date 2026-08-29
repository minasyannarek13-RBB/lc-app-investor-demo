(() => {
  const cfg = window.LC_APP_CONFIG || {};
  const SUPABASE_URL = cfg.SUPABASE_URL || "https://aspbwgsfkebduvviyeuo.supabase.co";
  const SUPABASE_KEY = cfg.SUPABASE_PUBLISHABLE_KEY || cfg.SUPABASE_ANON_KEY || "";
  const PRODUCTION_COMMIT = cfg.PRODUCTION_COMMIT || "71fd452";
  const RUN_KEY = "lc-app-live-qa:run-id";
  const POST_PREFIX = "[LC_QA_TEMP]";
  const COMMENT_PREFIX = "[LC_QA_TEMP_COMMENT]";
  const REPLY_PREFIX = "[LC_QA_TEMP_REPLY]";

  const runId = localStorage.getItem(RUN_KEY) || crypto.randomUUID();
  localStorage.setItem(RUN_KEY, runId);

  const $ = (id) => document.getElementById(id);
  const els = {
    commit: $("commitLabel"),
    email: $("emailInput"),
    password: $("passwordInput"),
    login: $("loginButton"),
    testConnection: $("testConnectionButton"),
    refresh: $("refreshButton"),
    logout: $("logoutButton"),
    copyUid: $("copyUidButton"),
    notice: $("authNotice"),
    userEmail: $("userEmail"),
    userId: $("userId"),
    username: $("username"),
    accountStatus: $("accountStatus"),
    onboardingStatus: $("onboardingStatus"),
    otherUid: $("otherUidInput"),
    targetPost: $("targetPostInput"),
    targetComment: $("targetCommentInput"),
    runId: $("runIdInput"),
    tests: $("tests"),
    debug: $("debugLog"),
    report: $("reportOutput"),
    copyReport: $("copyReportButton"),
    diagClient: $("diagClient"),
    diagConfig: $("diagConfig"),
    diagUrl: $("diagUrl"),
    diagKey: $("diagKey"),
    diagJs: $("diagJs"),
    diagAuth: $("diagAuth"),
    diagSession: $("diagSession"),
    diagConnection: $("diagConnection"),
    diagLastError: $("diagLastError")
  };

  const testDefs = [
    ["connectivity", "Connectivity"],
    ["p0", "Current User P0"],
    ["logout", "Logout Protection"],
    ["follow", "Follow"],
    ["notification", "Notification Trigger"],
    ["post", "Post"],
    ["like", "Like / Unlike"],
    ["comment", "Comment"],
    ["reply", "Reply Depth"],
    ["block", "Block"],
    ["direct-security", "Direct Security"],
    ["unblock", "Unblock"],
    ["report", "Report"],
    ["cleanup", "Cleanup"]
  ];

  const statuses = Object.fromEntries(testDefs.map(([id]) => [id, { status: "NOT RUN", detail: "" }]));
  const state = {
    client: null,
    session: null,
    user: null,
    profile: null,
    errors: [],
    currentPostId: localStorage.getItem("lc-app-live-qa:post-id") || "",
    currentCommentId: localStorage.getItem("lc-app-live-qa:comment-id") || "",
    currentReplyId: localStorage.getItem("lc-app-live-qa:reply-id") || "",
    currentReportId: localStorage.getItem("lc-app-live-qa:report-id") || ""
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

  function scrub(value) {
    const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
    return (text || "")
      .replace(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, "[JWT_REDACTED]")
      .replace(/sb_secret_[a-zA-Z0-9_-]+/g, "[SECRET_REDACTED]")
      .replace(/access_token["']?\s*[:=]\s*["'][^"']+["']/gi, "access_token: [REDACTED]")
      .replace(/refresh_token["']?\s*[:=]\s*["'][^"']+["']/gi, "refresh_token: [REDACTED]");
  }

  function log(label, payload) {
    const line = `[${new Date().toISOString()}] ${label}\n${scrub(payload)}\n`;
    els.debug.textContent = `${line}\n${els.debug.textContent}`.slice(0, 60000);
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

  function failMessage(error) {
    if (!error) return "";
    return error.message || error.error_description || error.details || String(error);
  }

  function assertOk(result, label) {
    if (result?.error) {
      const err = new Error(`${label}: ${failMessage(result.error)}`);
      err.cause = result.error;
      throw err;
    }
    return result;
  }

  function setStatus(id, status, detail = "") {
    statuses[id] = { status, detail: scrub(detail) };
    renderTests();
    renderReport();
  }

  async function run(id, fn) {
    setStatus(id, "RUNNING", "");
    try {
      const detail = await fn();
      setStatus(id, "PASS", detail || "Passed.");
    } catch (error) {
      const detail = error?.message || String(error);
      state.errors.push(`${id}: ${detail}`);
      setDiag({ lastError: detail });
      log(`FAIL ${id}`, error?.cause || error);
      setStatus(id, "FAIL", detail);
    }
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

  function renderTests() {
    els.tests.innerHTML = testDefs.map(([id, label]) => {
      const current = statuses[id];
      const cls = current.status.toLowerCase().replace(/\s+/g, "-");
      return `<div class="test">
        <strong>${label}</strong>
        <span class="status ${cls}">${current.status}</span>
        <span class="detail">${escapeHtml(current.detail || "")}</span>
        <button class="secondary" type="button" data-run="${id}">Run</button>
      </div>`;
    }).join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
  }

  async function refreshSession() {
    assertClient();
    const { data, error } = await withTimeout(state.client.auth.getSession(), 12000, "Session refresh");
    if (error) throw error;
    state.session = data.session || null;
    state.user = state.session?.user || null;
    if (state.user) {
      const profile = await state.client.from("profiles")
        .select("id,username,display_name,avatar_url,bio,country,languages,onboarding_completed,terms_accepted_at,privacy_accepted_at,age_confirmed,account_status,role")
        .eq("id", state.user.id)
        .maybeSingle();
      if (!profile.error) state.profile = profile.data || null;
      else log("profile refresh failed", profile.error);
    } else {
      state.profile = null;
    }
    renderUser();
    setDiag({ session: state.user ? "SIGNED IN" : "SIGNED OUT" });
    renderReport();
  }

  function renderUser() {
    const user = state.user;
    const profile = state.profile;
    els.userEmail.textContent = user?.email || "Not signed in";
    els.userId.textContent = user?.id || "-";
    els.username.textContent = profile?.username || "-";
    els.accountStatus.textContent = profile?.account_status || "-";
    els.onboardingStatus.textContent = profile ? String(Boolean(profile.onboarding_completed)) : "-";
    els.copyUid.disabled = !user?.id;
  }

  function assertClient() {
    if (!state.client) throw new Error("Supabase client is not initialized.");
    if (!SUPABASE_KEY) throw new Error("SUPABASE_PUBLISHABLE_KEY is missing.");
  }

  async function requireUser() {
    await refreshSession();
    if (!state.user) throw new Error("Login required.");
    return state.user;
  }

  function otherUid() {
    const value = els.otherUid.value.trim();
    if (!value) throw new Error("Paste the other user's UID first.");
    return value;
  }

  function targetPostInput() {
    return els.targetPost.value.trim();
  }

  function targetCommentInput() {
    return els.targetComment.value.trim();
  }

  async function testConnectivity() {
    assertClient();
    setDiag({ connection: "RUNNING" });
    const settings = await withTimeout(fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_KEY } }), 12000, "Supabase connection");
    if (!settings.ok) throw new Error(`Supabase auth endpoint failed: HTTP ${settings.status}`);
    setDiag({ connection: "PASS" });
    const session = await state.client.auth.getSession();
    if (session.error) throw session.error;
    const profileProbe = await state.client.from("profiles").select("id,username").limit(1);
    if (profileProbe.error) throw profileProbe.error;
    const settingsProbe = await state.client.from("user_settings").select("user_id").limit(1);
    if (settingsProbe.error) throw settingsProbe.error;
    await refreshSession();
    return "Endpoint reachable; auth.getSession, profiles query and user_settings query returned without raw runtime failure.";
  }

  async function testSupabaseConnectionButton(event) {
    event?.preventDefault();
    setNotice("", "Testing Supabase connection...");
    try {
      assertClient();
      setDiag({ connection: "RUNNING", lastError: "None" });
      const response = await withTimeout(fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_KEY } }), 12000, "Supabase connection");
      if (!response.ok) throw new Error(`Supabase endpoint returned HTTP ${response.status}.`);
      setDiag({ connection: "PASS" });
      setNotice("success", "Supabase connection PASS.");
      setStatus("connectivity", "PASS", "Supabase endpoint reachable from this browser.");
    } catch (error) {
      const message = humanError(error);
      setDiag({ connection: "FAIL", lastError: message });
      setNotice("error", message);
      setStatus("connectivity", "FAIL", message);
      log("Supabase connection failed", error);
    }
  }

  async function testP0() {
    const user = await requireUser();
    const profileResult = assertOk(await state.client.from("profiles").select("*").eq("id", user.id).single(), "own profile readable");
    const settingsResult = assertOk(await state.client.from("user_settings").select("*").eq("user_id", user.id).single(), "own user_settings readable");
    const profile = profileResult.data;
    const onboardingFields = ["display_name", "username", "age_confirmed", "terms_accepted_at", "privacy_accepted_at"];
    const missing = onboardingFields.filter((field) => !profile[field]);
    if (missing.length) throw new Error(`Required onboarding fields missing/read false: ${missing.join(", ")}`);
    const originalBio = profile.bio || null;
    const tempBio = `${POST_PREFIX} reversible profile edit ${runId}`;
    try {
      assertOk(await state.client.from("profiles").update({ bio: tempBio }).eq("id", user.id), "profile edit test");
      const changed = assertOk(await state.client.from("profiles").select("bio").eq("id", user.id).single(), "profile edit verification");
      if (changed.data.bio !== tempBio) throw new Error("Profile edit did not persist.");
    } finally {
      await state.client.from("profiles").update({ bio: originalBio }).eq("id", user.id);
    }
    const avatarList = await state.client.storage.from("avatars").list(user.id, { limit: 1 });
    if (avatarList.error) throw avatarList.error;
    state.profile = profile;
    renderUser();
    return `Profile, user_settings and onboarding readable. Reversible profile edit restored. Settings rows: ${settingsResult.data ? "yes" : "no"}. Avatar bucket readable.`;
  }

  async function testLogoutProtection() {
    await requireUser();
    await state.client.auth.signOut();
    await refreshSession();
    const probe = await state.client.from("profiles").select("*").limit(1);
    if (!probe.error && (probe.data || []).some((row) => row.id === state.user?.id)) {
      throw new Error("Protected data remained readable after logout.");
    }
    return "Signed out; protected authenticated session unavailable. Login again before continuing other tests.";
  }

  async function testFollow() {
    const user = await requireUser();
    const target = otherUid();
    if (target === user.id) throw new Error("Other UID must be different from current UID.");
    const insert = await state.client.from("follows").insert({ follower_id: user.id, following_id: target });
    if (insert.error && !/duplicate key|already exists/i.test(failMessage(insert.error))) throw insert.error;
    const row = assertOk(await state.client.from("follows").select("*").eq("follower_id", user.id).eq("following_id", target).maybeSingle(), "follow verification");
    if (!row.data) throw new Error("Follow row was not found after insert.");
    return "Current user follows other UID. Run Notification Check in the other browser to verify the generated follower notification.";
  }

  async function testNotification() {
    const user = await requireUser();
    const actor = otherUid();
    const notes = assertOk(await state.client.from("notifications")
      .select("id,type,target_type,target_id,actor_id,recipient_id,created_at")
      .eq("recipient_id", user.id)
      .eq("actor_id", actor)
      .in("type", ["new_follower", "post_like", "comment", "comment_reply"])
      .order("created_at", { ascending: false })
      .limit(10), "notification query");
    if (!notes.data?.length) throw new Error("No notification found from the other UID. Run the source action in the other browser first.");
    return `Found ${notes.data.length} notification(s) generated by trigger for this recipient.`;
  }

  async function testPost() {
    const user = await requireUser();
    const body = `${POST_PREFIX} ${runId} ${user.email || user.id} ${new Date().toISOString()}`;
    const created = assertOk(await state.client.from("posts").insert({ author_id: user.id, body, status: "active" }).select("id,body,created_at").single(), "post insert");
    state.currentPostId = created.data.id;
    localStorage.setItem("lc-app-live-qa:post-id", state.currentPostId);
    els.targetPost.value = state.currentPostId;
    const feed = assertOk(await state.client.from("posts").select("id,author_id,body,created_at").ilike("body", `${POST_PREFIX}%`).order("created_at", { ascending: false }).limit(10), "chronological feed query");
    if (!feed.data.some((row) => row.id === state.currentPostId)) throw new Error("Created QA post is not visible in chronological feed query.");
    return `Created QA post ${state.currentPostId}; chronological feed includes it.`;
  }

  async function findTargetPost() {
    const direct = targetPostInput();
    if (direct) return direct;
    const target = otherUid();
    const result = assertOk(await state.client.from("posts")
      .select("id,author_id,body,created_at")
      .eq("author_id", target)
      .ilike("body", `${POST_PREFIX}%`)
      .order("created_at", { ascending: false })
      .limit(1), "target QA post lookup");
    if (!result.data?.[0]) throw new Error("No target QA post found. Create a post in the other browser or paste target post ID.");
    els.targetPost.value = result.data[0].id;
    return result.data[0].id;
  }

  async function testLike() {
    const user = await requireUser();
    const postId = await findTargetPost();
    const insert = await state.client.from("post_likes").insert({ post_id: postId, user_id: user.id });
    if (insert.error && !/duplicate key|already exists/i.test(failMessage(insert.error))) throw insert.error;
    const row = assertOk(await state.client.from("post_likes").select("*").eq("post_id", postId).eq("user_id", user.id).maybeSingle(), "like verification");
    if (!row.data) throw new Error("Like row was not found after insert.");
    const count = assertOk(await state.client.from("post_likes").select("post_id", { count: "exact", head: true }).eq("post_id", postId), "like count");
    assertOk(await state.client.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id), "unlike");
    const removed = assertOk(await state.client.from("post_likes").select("*").eq("post_id", postId).eq("user_id", user.id).maybeSingle(), "unlike verification");
    if (removed.data) throw new Error("Like row still exists after unlike.");
    return `Like row/count verified and unlike removed it. Count before unlike: ${count.count ?? "available"}. Run Notification Check as post owner.`;
  }

  async function testComment() {
    const user = await requireUser();
    const postId = await findTargetPost();
    const body = `${COMMENT_PREFIX} ${runId} ${user.email || user.id} ${new Date().toISOString()}`;
    const created = assertOk(await state.client.from("comments").insert({ post_id: postId, author_id: user.id, body }).select("id,post_id,body").single(), "comment insert");
    state.currentCommentId = created.data.id;
    localStorage.setItem("lc-app-live-qa:comment-id", state.currentCommentId);
    els.targetComment.value = state.currentCommentId;
    const row = assertOk(await state.client.from("comments").select("id,body").eq("id", state.currentCommentId).single(), "comment verification");
    if (!row.data?.body?.startsWith(COMMENT_PREFIX)) throw new Error("Created QA comment was not readable.");
    return `Created QA comment ${state.currentCommentId}. Run Notification Check as post owner.`;
  }

  async function findTargetComment() {
    const direct = targetCommentInput();
    if (direct) return direct;
    const postId = await findTargetPost();
    const actor = otherUid();
    const result = assertOk(await state.client.from("comments")
      .select("id,post_id,author_id,parent_comment_id,body,created_at")
      .eq("post_id", postId)
      .eq("author_id", actor)
      .is("parent_comment_id", null)
      .ilike("body", `${COMMENT_PREFIX}%`)
      .order("created_at", { ascending: false })
      .limit(1), "target QA comment lookup");
    if (!result.data?.[0]) throw new Error("No target QA top-level comment found. Create a comment in the other browser or paste target comment ID.");
    els.targetComment.value = result.data[0].id;
    return result.data[0].id;
  }

  async function testReplyDepth() {
    const user = await requireUser();
    const postId = await findTargetPost();
    const commentId = await findTargetComment();
    const reply = assertOk(await state.client.from("comments").insert({
      post_id: postId,
      author_id: user.id,
      parent_comment_id: commentId,
      body: `${REPLY_PREFIX} ${runId} ${new Date().toISOString()}`
    }).select("id,parent_comment_id").single(), "top-level reply insert");
    state.currentReplyId = reply.data.id;
    localStorage.setItem("lc-app-live-qa:reply-id", state.currentReplyId);
    const nested = await state.client.from("comments").insert({
      post_id: postId,
      author_id: user.id,
      parent_comment_id: state.currentReplyId,
      body: `${REPLY_PREFIX} nested should be denied ${runId}`
    }).select("id").maybeSingle();
    if (!nested.error) {
      if (nested.data?.id) await state.client.from("comments").update({ deleted_at: new Date().toISOString(), body: "[deleted]" }).eq("id", nested.data.id);
      throw new Error("Reply-to-reply was allowed; expected denial.");
    }
    return `One reply created (${state.currentReplyId}); reply-to-reply denied by database.`;
  }

  async function testBlock() {
    const user = await requireUser();
    const target = otherUid();
    const insert = await state.client.from("user_blocks").insert({ blocker_id: user.id, blocked_id: target });
    if (insert.error && !/duplicate key|already exists/i.test(failMessage(insert.error))) throw insert.error;
    const block = assertOk(await state.client.from("user_blocks").select("*").eq("blocker_id", user.id).eq("blocked_id", target).maybeSingle(), "block verification");
    if (!block.data) throw new Error("Block row was not found after insert.");
    const followRows = assertOk(await state.client.from("follows")
      .select("*")
      .or(`and(follower_id.eq.${user.id},following_id.eq.${target}),and(follower_id.eq.${target},following_id.eq.${user.id})`), "follow cleanup after block");
    if (followRows.data?.length) throw new Error("Follow rows still visible after block cleanup.");
    const blockedFollow = await state.client.from("follows").insert({ follower_id: user.id, following_id: target });
    if (!blockedFollow.error) {
      await state.client.from("follows").delete().eq("follower_id", user.id).eq("following_id", target);
      throw new Error("Follow insert succeeded after block; expected denial.");
    }
    const posts = assertOk(await state.client.from("posts").select("id,author_id").eq("author_id", target).limit(5), "blocked posts visibility");
    if (posts.data?.length) throw new Error("Blocked user's posts are still visible.");
    const comments = assertOk(await state.client.from("comments").select("id,author_id").eq("author_id", target).limit(5), "blocked comments visibility");
    if (comments.data?.length) throw new Error("Blocked user's comments are still visible.");
    return "Block inserted; mutual follows removed; follow retry denied; blocked posts/comments hidden. Run same block-prohibited check in other browser if needed.";
  }

  async function testDirectSecurity() {
    const user = await requireUser();
    const target = otherUid();
    const note = await state.client.from("notifications").insert({
      recipient_id: user.id,
      actor_id: target,
      type: "new_follower",
      target_type: "profile",
      target_id: user.id
    });
    if (!note.error) throw new Error("Direct notifications INSERT succeeded; expected denial.");
    const event = await state.client.from("activity_events").insert({
      actor_id: user.id,
      recipient_id: target,
      verb: "followed",
      target_type: "profile",
      target_id: target
    });
    if (!event.error) throw new Error("Direct activity_events INSERT succeeded; expected denial.");
    return "Direct INSERT into notifications and activity_events denied for normal client.";
  }

  async function testUnblock() {
    const user = await requireUser();
    const target = otherUid();
    assertOk(await state.client.from("user_blocks").delete().eq("blocker_id", user.id).eq("blocked_id", target), "unblock delete");
    const block = assertOk(await state.client.from("user_blocks").select("*").eq("blocker_id", user.id).eq("blocked_id", target).maybeSingle(), "unblock verification");
    if (block.data) throw new Error("Block row still exists after unblock.");
    const follows = assertOk(await state.client.from("follows")
      .select("*")
      .or(`and(follower_id.eq.${user.id},following_id.eq.${target}),and(follower_id.eq.${target},following_id.eq.${user.id})`), "old follows not restored");
    if (follows.data?.length) throw new Error("Old follows were restored after unblock.");
    return "Unblocked; old follows were not restored.";
  }

  async function testReport() {
    const user = await requireUser();
    const targetType = "post";
    const created = assertOk(await state.client.from("posts").insert({
      author_id: user.id,
      body: `${POST_PREFIX} report target ${runId} ${crypto.randomUUID()} ${new Date().toISOString()}`,
      status: "active"
    }).select("id").single(), "report target post create");
    const targetId = created.data.id;
    state.currentPostId = targetId;
    localStorage.setItem("lc-app-live-qa:post-id", targetId);
    els.targetPost.value = targetId;
    const createdReport = await state.client.from("reports").insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason: "other",
      description: `${POST_PREFIX} report ${runId}`
    }).select("id,status").single();
    if (createdReport.error && /duplicate key|already exists/i.test(failMessage(createdReport.error))) {
      const existing = assertOk(await state.client.from("reports")
        .select("id,status")
        .eq("reporter_id", user.id)
        .eq("target_type", targetType)
        .eq("target_id", targetId)
        .single(), "existing report lookup");
      state.currentReportId = existing.data.id;
    } else {
      assertOk(createdReport, "report insert");
      state.currentReportId = createdReport.data.id;
    }
    localStorage.setItem("lc-app-live-qa:report-id", state.currentReportId);
    const update = await state.client.from("reports").update({
      status: "reviewing",
      reviewed_at: new Date().toISOString()
    }).eq("id", state.currentReportId);
    if (!update.error) throw new Error("Normal user modified moderator review fields; expected denial.");
    return `Report readable/created with id ${state.currentReportId}; moderator review field update denied. Reports are retained by policy.`;
  }

  async function testCleanup() {
    const user = await requireUser();
    const now = new Date().toISOString();
    const ownPosts = await state.client.from("posts")
      .update({ deleted_at: now })
      .eq("author_id", user.id)
      .ilike("body", `${POST_PREFIX}%`);
    if (ownPosts.error) log("cleanup own posts warning", ownPosts.error);
    const ownComments = await state.client.from("comments")
      .update({ deleted_at: now, body: "[deleted]" })
      .eq("author_id", user.id)
      .or(`body.ilike.${COMMENT_PREFIX}%,body.ilike.${REPLY_PREFIX}%`);
    if (ownComments.error) log("cleanup own comments warning", ownComments.error);
    if (targetPostInput()) await state.client.from("post_likes").delete().eq("post_id", targetPostInput()).eq("user_id", user.id);
    if (els.otherUid.value.trim()) {
      await state.client.from("follows").delete().eq("follower_id", user.id).eq("following_id", els.otherUid.value.trim());
      await state.client.from("user_blocks").delete().eq("blocker_id", user.id).eq("blocked_id", els.otherUid.value.trim());
    }
    return "Current user's QA posts/comments were soft-deleted where RLS permits; own likes/follows/blocks cleaned. Reports/notifications remain as audit trails.";
  }

  function renderReport() {
    const line = (id) => `${statuses[id].status}${statuses[id].detail ? ` - ${statuses[id].detail}` : ""}`;
    els.report.value = [
      "LC APP LIVE QA REPORT",
      `Timestamp: ${new Date().toISOString()}`,
      `Production commit: ${PRODUCTION_COMMIT}`,
      `Current user: ${state.user?.email || "not signed in"}`,
      `Current UID: ${state.user?.id || "not signed in"}`,
      `Other UID: ${els.otherUid.value.trim() || "not set"}`,
      `P0: ${line("p0")}`,
      `Follow: ${line("follow")}`,
      `Post: ${line("post")}`,
      `Like: ${line("like")}`,
      `Comment: ${line("comment")}`,
      `Reply-depth: ${line("reply")}`,
      `Block cleanup: ${line("block")}`,
      `Blocked RLS visibility: ${line("block")}`,
      `Notification trigger: ${line("notification")}`,
      `Direct notification INSERT denied: ${line("direct-security")}`,
      `Direct activity INSERT denied: ${line("direct-security")}`,
      `Report: ${line("report")}`,
      `Console/runtime errors: ${state.errors.length ? scrub(state.errors.join(" | ")) : "None captured by harness"}`
    ].join("\n");
  }

  async function login() {
    assertClient();
    const email = els.email.value.trim();
    const password = els.password.value;
    if (!email || !password) throw new Error("Email and password are required.");
    const result = await withTimeout(state.client.auth.signInWithPassword({ email, password }), 18000, "Login request");
    if (result.error) throw result.error;
    els.password.value = "";
    await refreshSession();
  }

  function humanError(error) {
    const raw = failMessage(error) || "Unknown error.";
    if (/failed to fetch|networkerror|load failed/i.test(raw)) return "Supabase request failed from this browser. Check network, browser privacy blocking, CORS/origin settings, or Supabase availability.";
    if (/invalid login credentials/i.test(raw)) return "Login failed: email or password is incorrect.";
    if (/email not confirmed/i.test(raw)) return "Login failed: email is not confirmed.";
    if (/timed out/i.test(raw)) return raw;
    return raw;
  }

  async function copy(text) {
    await navigator.clipboard.writeText(text);
  }

  function bind() {
    document.addEventListener("click", async (event) => {
      const runButton = event.target.closest("[data-run]");
      if (runButton) {
        const id = runButton.dataset.run;
        const map = {
          connectivity: testConnectivity,
          p0: testP0,
          logout: testLogoutProtection,
          follow: testFollow,
          notification: testNotification,
          post: testPost,
          like: testLike,
          comment: testComment,
          reply: testReplyDepth,
          block: testBlock,
          "direct-security": testDirectSecurity,
          unblock: testUnblock,
          report: testReport,
          cleanup: testCleanup
        };
        if (map[id]) await run(id, map[id]);
      }
    });
    els.login.addEventListener("click", async (event) => {
      event.preventDefault();
      els.login.disabled = true;
      els.login.textContent = "Signing in...";
      setNotice("", "Signing in...");
      setDiag({ auth: "RUNNING", lastError: "None" });
      setStatus("connectivity", "RUNNING", "Signing in...");
      try {
        await delay(1500);
        await login();
        setDiag({ auth: "SUCCESS", session: "SIGNED IN" });
        setNotice("success", `Signed in as ${state.user?.email || "user"}. UID: ${state.user?.id || "-"}`);
        setStatus("connectivity", "PASS", "Login succeeded and session rendered.");
      } catch (error) {
        const message = humanError(error);
        state.errors.push(`login: ${message}`);
        setDiag({ auth: "FAILED", session: "SIGNED OUT", lastError: message });
        setNotice("error", message);
        setStatus("connectivity", "FAIL", message);
        log("login failed", error?.cause || error);
      } finally {
        els.login.disabled = false;
        els.login.textContent = "Login";
      }
    });
    els.testConnection.addEventListener("click", testSupabaseConnectionButton);
    els.refresh.addEventListener("click", () => refreshSession().catch((error) => {
      state.errors.push(`refresh: ${error.message}`);
      setDiag({ lastError: humanError(error) });
      setNotice("error", humanError(error));
      log("refresh failed", error);
    }));
    els.logout.addEventListener("click", async () => {
      await state.client.auth.signOut();
      await refreshSession();
    });
    els.copyUid.addEventListener("click", () => {
      if (!state.user?.id) return;
      copy(state.user.id);
    });
    els.copyReport.addEventListener("click", () => copy(els.report.value));
    [els.otherUid, els.targetPost, els.targetComment].forEach((input) => input.addEventListener("input", renderReport));
  }

  async function init() {
    setDiag({
      js: "YES",
      config: SUPABASE_URL && SUPABASE_KEY ? "READY" : "FAILED",
      url: SUPABASE_URL ? "configured" : "missing",
      key: SUPABASE_KEY ? "configured" : "missing"
    });
    els.commit.textContent = PRODUCTION_COMMIT;
    els.runId.value = runId;
    renderTests();
    renderDiagnostics();
    renderReport();
    bind();
    if (!window.supabase?.createClient) {
      setDiag({ client: "FAILED", lastError: "Supabase JS library did not load." });
      setNotice("error", "Supabase JS library did not load. Login cannot run until the SDK is available.");
      setStatus("connectivity", "FAIL", "Supabase JS library did not load.");
      return;
    }
    state.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    setDiag({ client: "READY" });
    setNotice("", "Ready. Enter email and password, then click Login.");
    await refreshSession().catch((error) => {
      const message = humanError(error);
      setDiag({ lastError: message });
      log("initial session refresh failed", error);
    });
  }

  window.addEventListener("error", (event) => {
    state.errors.push(`runtime: ${event.message}`);
    setDiag({ lastError: event.message });
    setNotice("error", event.message);
    log("runtime error", { message: event.message, filename: event.filename, lineno: event.lineno });
    renderReport();
  });
  window.addEventListener("unhandledrejection", (event) => {
    state.errors.push(`promise: ${event.reason?.message || event.reason}`);
    setDiag({ lastError: humanError(event.reason) });
    setNotice("error", humanError(event.reason));
    log("unhandled rejection", event.reason);
    renderReport();
  });
  init().catch((error) => {
    state.errors.push(`init: ${error.message}`);
    setDiag({ lastError: humanError(error) });
    setNotice("error", humanError(error));
    log("init failed", error);
    renderReport();
  });
})();
