(() => {
  "use strict";

  const state = {
    client: null,
    profile: null,
    personas: [],
    current: null,
    player: null,
    creator: null,
    industry: null,
    sessions: [],
    creators: [],
    posts: [],
    follows: new Set(),
    reminders: new Set(),
    accessRequests: [],
    selectedCreator: null,
    selectedSession: null,
    demo: false,
    demoPersona: null,
    busy: false,
    ready: false
  };

  const games = ["Blackjack", "Baccarat", "Roulette", "Game Show"];
  const languages = ["English", "French", "Italian", "Spanish", "Armenian"];
  const interests = ["creator network", "player discovery", "retention/engagement", "live discovery", "integration", "attribution"];
  const demoStore = { follows: new Set(), reminders: new Set(), likes: new Set(), comments: [], posts: [], sessions: [], requests: new Set() };
  const demoProfiles = [
    { id: "demo-sofia", username: "sofia_live", display_name: "Sofia Laurent", avatar_url: "app_prototype_assets/dealers/v2_polish/sofia_avatar.jpg", bio: "Blackjack dealer building a followable Live Casino audience.", country: "Malta", languages: ["English", "French"] },
    { id: "demo-mia", username: "mia_tables", display_name: "Mia Novak", avatar_url: "app_prototype_assets/dealers/dealer_mia_avatar_v1.jpg", bio: "Roulette and baccarat sessions with a calm table style.", country: "Latvia", languages: ["English", "Italian"] },
    { id: "demo-marcus", username: "marcus_live", display_name: "Marcus Reed", avatar_url: "app_prototype_assets/dealers/dealer_marcus_avatar_v1.jpg", bio: "Game-show host focused on community return visits.", country: "UK", languages: ["English", "Spanish"] }
  ];
  const demoCreators = [
    { user_id: "demo-sofia", headline: "Featured Blackjack creator", games: ["Blackjack", "Baccarat"], languages: ["English", "French"], affiliation_name: "Demo Casino", affiliation_verification_status: "unverified", verification_status: "unverified", profile_status: "published" },
    { user_id: "demo-mia", headline: "Roulette table personality", games: ["Roulette", "Baccarat"], languages: ["English", "Italian"], affiliation_name: "Demo Studio", affiliation_verification_status: "unverified", verification_status: "unverified", profile_status: "published" },
    { user_id: "demo-marcus", headline: "Game Show host", games: ["Game Show"], languages: ["English", "Spanish"], affiliation_name: "Demo Provider", affiliation_verification_status: "unverified", verification_status: "unverified", profile_status: "published" }
  ];
  const demoSessions = [
    { id: "demo-session-sofia", creator_id: "demo-sofia", title: "Evening Blackjack table", game: "Blackjack", operator_name: "Demo Casino", starts_at: new Date(Date.now() + 3600000).toISOString(), status: "live", visibility: "public", provenance: "illustrative_demo_data" },
    { id: "demo-session-mia", creator_id: "demo-mia", title: "Roulette community hour", game: "Roulette", operator_name: "Demo Casino", starts_at: new Date(Date.now() + 7200000).toISOString(), status: "scheduled", visibility: "public", provenance: "illustrative_demo_data" },
    { id: "demo-session-marcus", creator_id: "demo-marcus", title: "Game Show warm-up", game: "Game Show", operator_name: "Demo Provider", starts_at: new Date(Date.now() + 10800000).toISOString(), status: "scheduled", visibility: "public", provenance: "illustrative_demo_data" }
  ];
  const demoPosts = [
    { id: "demo-post-sofia", author_id: "demo-sofia", body: "Tonight's Blackjack table is live. Follow the session and come back when the seat opens.", created_at: new Date(Date.now() - 900000).toISOString(), status: "active", deleted_at: null },
    { id: "demo-post-mia", author_id: "demo-mia", body: "Roulette players asked for a slower table pace today. I added it to the next session.", created_at: new Date(Date.now() - 3600000).toISOString(), status: "active", deleted_at: null },
    { id: "demo-post-marcus", author_id: "demo-marcus", body: "Game Show preview: new community challenge format for returning players.", created_at: new Date(Date.now() - 5400000).toISOString(), status: "active", deleted_at: null }
  ];

  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const safe = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
  const profileName = (profile) => profile?.display_name || profile?.username || "LC App user";
  const avatar = (profile) => profile?.avatar_url || "app-icon-512.png";
  const toast = (text) => {
    if (typeof window.showToast === "function") window.showToast(text);
    const node = q("#toast");
    if (!node) return;
    node.textContent = text;
    node.classList.add("show");
    window.setTimeout(() => node.classList.remove("show"), 1400);
  };
  const err = (error) => {
    const raw = `${error?.code || ""} ${error?.message || ""}`.toLowerCase();
    if (/duplicate|23505/.test(raw)) return "Already saved.";
    if (/permission|policy|rls|42501|not authorized/.test(raw)) return "This action is not available.";
    if (/network|fetch|failed/.test(raw)) return "Connection issue. Try again.";
    return "Something went wrong. Please try again.";
  };

  function injectStyles() {
    if (q("#lcProductStyles")) return;
    const style = document.createElement("style");
    style.id = "lcProductStyles";
    style.textContent = `
      #screen.lc-product-mode #homeView,#screen.lc-product-mode #accountPage,#screen.lc-product-mode>.bottom-nav,#screen.lc-product-mode #lcAuthShell{display:none!important}
      #lcProductShell{position:absolute;inset:0;z-index:74;overflow:auto;padding:18px 14px calc(94px + env(safe-area-inset-bottom));background:radial-gradient(circle at 85% 0,rgba(46,230,206,.13),transparent 35%),linear-gradient(180deg,#071012,#050708 72%);color:var(--text);scrollbar-width:none}
      #lcProductShell[hidden]{display:none!important}.lc-product-stack{display:grid;gap:12px}.lc-product-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.lc-product-brand{display:flex;align-items:center;gap:10px}.lc-product-logo{width:38px;height:38px;border-radius:14px;background:linear-gradient(135deg,var(--teal),#a7fff4);color:#031412;display:grid;place-items:center;font-weight:950}.lc-product-brand strong{display:block;font-size:14px}.lc-product-brand span,.lc-product-muted{display:block;color:var(--muted);font-size:11px;line-height:1.35}
      .lc-product-card{border:1px solid rgba(46,230,206,.15);border-radius:20px;background:rgba(8,13,16,.82);box-shadow:0 20px 52px rgba(0,0,0,.28);padding:14px;overflow:hidden}.lc-product-hero{padding:18px;background:linear-gradient(145deg,rgba(46,230,206,.14),rgba(255,255,255,.04));border-color:rgba(46,230,206,.32)}
      .lc-product-card h1,.lc-product-card h2,.lc-product-card h3{margin:0 0 8px;letter-spacing:0}.lc-product-card h1{font-size:28px;line-height:1.02}.lc-product-card h2{font-size:20px}.lc-product-card h3{font-size:15px}.lc-product-card p{margin:0;color:var(--soft);font-size:13px;line-height:1.42}.lc-product-label{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(46,230,206,.28);border-radius:999px;padding:5px 9px;color:#a7fff4;background:rgba(46,230,206,.1);font-size:9px;font-weight:900;text-transform:uppercase;margin-bottom:9px}
      .lc-product-grid{display:grid;gap:10px}.lc-product-grid.two{grid-template-columns:1fr 1fr}.lc-product-choice{min-height:94px;text-align:left;border:1px solid rgba(255,255,255,.09);border-radius:18px;background:rgba(255,255,255,.05);color:var(--text);padding:13px}.lc-product-choice b{display:block;font-size:15px;margin-bottom:6px}.lc-product-choice span{color:var(--muted);font-size:11px;line-height:1.3}.lc-product-choice.active{border-color:rgba(46,230,206,.58);background:rgba(46,230,206,.13)}
      .lc-product-form{display:grid;gap:10px}.lc-product-input,.lc-product-select,.lc-product-textarea{width:100%;border:1px solid rgba(255,255,255,.1);border-radius:15px;background:rgba(255,255,255,.06);color:var(--text);padding:11px 12px;font:inherit;font-size:13px;outline:none}.lc-product-textarea{min-height:76px;resize:vertical}.lc-product-input:focus,.lc-product-select:focus,.lc-product-textarea:focus{border-color:rgba(46,230,206,.62);box-shadow:0 0 0 3px rgba(46,230,206,.08)}
      .lc-product-actions{display:flex;gap:8px;flex-wrap:wrap}.lc-product-btn{min-height:38px;border:0;border-radius:999px;background:linear-gradient(135deg,var(--teal),#a7fff4);color:#031412;padding:0 14px;font-size:11px;font-weight:900}.lc-product-btn.secondary{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:var(--text)}.lc-product-btn:disabled{opacity:.55}.lc-product-chip{min-height:32px;border:1px solid rgba(255,255,255,.1);border-radius:999px;background:rgba(255,255,255,.06);color:var(--soft);padding:0 10px;font-size:10px;font-weight:850}.lc-product-chip.active{border-color:rgba(46,230,206,.58);background:rgba(46,230,206,.14);color:#a7fff4}
      .lc-product-row{display:flex;align-items:center;gap:10px;padding:11px 0;border-top:1px solid rgba(255,255,255,.08)}.lc-product-row:first-child{border-top:0}.lc-product-row img{width:48px;height:48px;border-radius:16px;object-fit:cover}.lc-product-row-main{min-width:0;flex:1}.lc-product-row-main b{display:block;font-size:13px}.lc-product-row-main span{display:block;color:var(--muted);font-size:10px;line-height:1.35}.lc-product-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.lc-product-stat{padding:10px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(255,255,255,.04)}.lc-product-stat b{display:block;font-size:16px}.lc-product-stat span{color:var(--muted);font-size:9px;text-transform:uppercase;font-weight:850}
      .lc-product-tabs{position:sticky;bottom:8px;z-index:3;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:7px;border:1px solid rgba(46,230,206,.16);border-radius:20px;background:rgba(5,8,9,.92);backdrop-filter:blur(18px);margin-top:12px}.lc-product-tabs button{min-height:40px;border:0;border-radius:14px;background:transparent;color:var(--muted);font-size:10px;font-weight:900}.lc-product-tabs button.active{background:rgba(46,230,206,.14);color:#a7fff4}.lc-product-note{display:block;margin-top:9px;color:var(--muted);font-size:10px;line-height:1.35}.lc-product-empty{padding:22px;text-align:center;color:var(--muted)}
      .lc-product-demo-banner{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:-4px 0 12px;padding:8px 10px;border:1px solid rgba(46,230,206,.2);border-radius:16px;background:rgba(46,230,206,.08)}.lc-product-demo-banner strong{font-size:10px;color:#a7fff4;text-transform:uppercase}.lc-product-demo-banner span{font-size:10px;color:var(--muted)}.lc-product-demo-banner .lc-product-actions{margin-left:auto}
      @media(min-width:720px){#lcProductShell{padding:24px 18px 104px}.lc-product-card h1{font-size:32px}.lc-product-grid.desktop-two{grid-template-columns:1fr 1fr}}@media(max-width:390px){#lcProductShell{padding-left:10px;padding-right:10px}.lc-product-card{padding:12px}.lc-product-card h1{font-size:25px}.lc-product-grid.two{grid-template-columns:1fr}.lc-product-actions{gap:6px}.lc-product-btn{padding:0 11px}}
    `;
    document.head.appendChild(style);
  }

  function shell() {
    injectStyles();
    let node = q("#lcProductShell");
    if (!node) {
      node = document.createElement("section");
      node.id = "lcProductShell";
      node.setAttribute("aria-label", "LC App product experience");
      q("#screen")?.appendChild(node);
    }
    q("#screen")?.classList.add("lc-product-mode");
    node.hidden = false;
    return node;
  }

  function hide() {
    q("#lcProductShell")?.setAttribute("hidden", "");
    q("#screen")?.classList.remove("lc-product-mode");
  }

  function setBusy(button, busy = true) {
    state.busy = busy;
    if (button) button.disabled = busy;
  }

  function values(form, name) {
    return qa(`[name="${name}"]:checked`, form).map((input) => input.value);
  }

  async function loadState() {
    const userId = state.profile.id;
    const [personas, player, creator, industry, reminders, follows, accessRequests] = await Promise.all([
      state.client.from("account_personas").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
      state.client.from("player_preferences").select("*").eq("user_id", userId).maybeSingle(),
      state.client.from("creator_profiles").select("*").eq("user_id", userId).maybeSingle(),
      state.client.from("industry_profiles").select("*").eq("user_id", userId).maybeSingle(),
      state.client.from("player_session_reminders").select("session_id").eq("user_id", userId),
      state.client.from("follows").select("following_id").eq("follower_id", userId),
      state.client.from("partnership_access_requests").select("industry_subtype,status,created_at").eq("user_id", userId).order("created_at", { ascending: false })
    ]);
    [personas, player, creator, industry, reminders, follows, accessRequests].forEach((res) => { if (res.error) throw res.error; });
    state.personas = personas.data || [];
    state.current = state.personas.find((p) => p.is_current) || state.personas[0] || null;
    state.player = player.data || null;
    state.creator = creator.data || null;
    state.industry = industry.data || null;
    state.reminders = new Set((reminders.data || []).map((row) => row.session_id));
    state.follows = new Set((follows.data || []).map((row) => row.following_id));
    state.accessRequests = accessRequests.data || [];
    if (state.creator) await loadOwnCreatorData();
    if (state.current?.persona === "player") await loadCreators();
  }

  async function loadOwnCreatorData() {
    const [sessions, posts] = await Promise.all([
      state.client.from("creator_sessions").select("*").eq("creator_id", state.profile.id).order("starts_at", { ascending: true }),
      state.client.from("posts").select("id,author_id,body,created_at,status,deleted_at").eq("author_id", state.profile.id).is("deleted_at", null).order("created_at", { ascending: false }).limit(20)
    ]);
    if (sessions.error) throw sessions.error;
    if (posts.error) throw posts.error;
    state.sessions = sessions.data || [];
    state.posts = posts.data || [];
  }

  async function loadCreators() {
    if (state.demo) {
      setDemoCreators();
      return;
    }
    const { data: creatorRows, error } = await state.client
      .from("creator_profiles")
      .select("*")
      .eq("profile_status", "published")
      .order("updated_at", { ascending: false })
      .limit(30);
    if (error) throw error;
    const ids = (creatorRows || []).map((row) => row.user_id).filter((id) => id !== state.profile.id);
    if (!ids.length) {
      state.creators = [];
      return;
    }
    const [profiles, sessions, posts] = await Promise.all([
      state.client.from("profiles").select("id,username,display_name,avatar_url,bio,country,languages,last_seen_at").in("id", ids),
      state.client.from("creator_sessions").select("*").in("creator_id", ids).in("status", ["scheduled", "live"]).eq("visibility", "public").order("starts_at", { ascending: true }),
      state.client.from("posts").select("id,author_id,body,created_at,status,deleted_at").in("author_id", ids).eq("status", "active").is("deleted_at", null).order("created_at", { ascending: false }).limit(60)
    ]);
    if (profiles.error) throw profiles.error;
    if (sessions.error) throw sessions.error;
    if (posts.error) throw posts.error;
    const profileMap = new Map((profiles.data || []).map((profile) => [profile.id, profile]));
    state.creators = (creatorRows || []).map((creator) => ({
      creator,
      profile: profileMap.get(creator.user_id),
      sessions: (sessions.data || []).filter((session) => session.creator_id === creator.user_id),
      posts: (posts.data || []).filter((post) => post.author_id === creator.user_id)
    })).filter((item) => item.profile);
  }

  async function setCurrentPersona(persona, industrySubtype = null) {
    const existing = state.personas.find((row) => row.persona === persona && (persona !== "industry" || row.industry_subtype === industrySubtype));
    await state.client.from("account_personas").update({ is_current: false }).eq("user_id", state.profile.id);
    if (existing) {
      const { error } = await state.client.from("account_personas").update({ is_current: true }).eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await state.client.from("account_personas").insert({
        user_id: state.profile.id,
        persona,
        industry_subtype: industrySubtype,
        onboarding_status: "started",
        is_current: true
      });
      if (error) throw error;
    }
    await loadState();
  }

  async function completeCurrentPersona() {
    if (!state.current) return;
    const { error } = await state.client.from("account_personas").update({ onboarding_status: "completed", is_current: true }).eq("id", state.current.id);
    if (error) throw error;
    await loadState();
  }

  function top(title = "LC App", subtitle = "Live Casino. Social Experience.") {
    return `
      <div class="lc-product-top">
        <div class="lc-product-brand"><span class="lc-product-logo">LC</span><div><strong>${safe(title)}</strong><span>${safe(subtitle)}</span></div></div>
        <button class="lc-product-chip" type="button" data-lc-product="account">${safe(state.current?.persona || "persona")}</button>
      </div>
      ${state.demo ? `<div class="lc-product-demo-banner"><div><strong>DEMO MODE · ${safe(state.demoPersona || "preview")}</strong><span>Illustrative demo data. No account, partner approval or integration implied.</span></div><div class="lc-product-actions"><button class="lc-product-chip" type="button" data-lc-demo-exit>Exit demo</button><button class="lc-product-chip active" type="button" data-auth-route="signup">Create your account</button></div></div>` : ""}
    `;
  }

  function tabs(active) {
    const current = state.current?.persona || "start";
    const creatorReady = Boolean(state.creator?.onboarding_completed);
    const playerReady = Boolean(state.player?.onboarding_completed);
    const items = [
      ["home", current === "creator" ? "Creator" : current === "industry" ? "Industry" : "Discover"],
      ["discover", "Creators"],
      ["creator", "Create"],
      ["account", "Account"]
    ];
    return `<div class="lc-product-tabs">${items.map(([id, label]) => {
      const disabled = (id === "creator" && !creatorReady) || (id === "discover" && !playerReady && current === "player");
      return `<button class="${active === id ? "active" : ""}" type="button" data-lc-product="${id}" ${disabled ? "disabled" : ""}>${label}</button>`;
    }).join("")}</div>`;
  }

  function checks(name, list, selected = []) {
    const set = new Set(selected || []);
    return `<div class="lc-product-actions">${list.map((item) => `<label class="lc-product-chip ${set.has(item) ? "active" : ""}"><input style="display:none" type="checkbox" name="${safe(name)}" value="${safe(item)}" ${set.has(item) ? "checked" : ""}>${safe(item)}</label>`).join("")}</div>`;
  }

  function renderLoading() {
    shell().innerHTML = `${top()}<div class="lc-product-card lc-product-empty">Loading product experience...</div>`;
  }

  function demoProfile(id) {
    return demoProfiles.find((profile) => profile.id === id) || demoProfiles[0];
  }

  function setDemoCreators() {
    state.creators = demoCreators.map((creator) => ({
      creator,
      profile: demoProfile(creator.user_id),
      sessions: [...demoSessions, ...demoStore.sessions].filter((session) => session.creator_id === creator.user_id),
      posts: [...demoStore.posts, ...demoPosts].filter((post) => post.author_id === creator.user_id)
    }));
  }

  function refreshDemoData() {
    setDemoCreators();
    state.follows = new Set(demoStore.follows);
    state.reminders = new Set(demoStore.reminders);
    state.accessRequests = [...demoStore.requests].map((industry_subtype) => ({ industry_subtype, status: "submitted", created_at: new Date().toISOString() }));
    state.sessions = [...demoSessions, ...demoStore.sessions].filter((session) => session.creator_id === state.profile?.id);
    state.posts = [...demoStore.posts, ...demoPosts].filter((post) => post.author_id === state.profile?.id);
  }

  function enterDemo(persona) {
    const industrySubtype = persona === "provider" ? "provider" : persona === "operator" ? "operator" : null;
    const currentPersona = industrySubtype ? "industry" : persona;
    state.client = null;
    state.demo = true;
    state.demoPersona = persona;
    state.current = { id: `demo-${persona}`, persona: currentPersona, industry_subtype: industrySubtype, onboarding_status: "completed", is_current: true };
    state.profile = persona === "creator" ? demoProfile("demo-sofia") : { id: "demo-reviewer", username: "demo_reviewer", display_name: "Demo Reviewer", avatar_url: "app-icon-512.png", role: "user", account_status: "active", onboarding_completed: true };
    state.player = currentPersona === "player" ? { user_id: state.profile.id, favorite_games: ["Blackjack", "Roulette"], preferred_languages: ["English"], onboarding_completed: true } : null;
    state.creator = currentPersona === "creator" ? { ...demoCreators[0], onboarding_completed: true } : null;
    state.industry = currentPersona === "industry" ? { user_id: state.profile.id, subtype: industrySubtype, company_name: "Demo Company", job_title: "Industry reviewer", work_email: "demo@example.com", interests, access_status: "not_requested", onboarding_completed: true } : null;
    refreshDemoData();
    routeHome();
  }

  function renderDemoEntry() {
    shell().innerHTML = `${top("LC App", "Live Casino. Social Experience.")}
      <div class="lc-product-stack">
        <section class="lc-product-card lc-product-hero"><span class="lc-product-label">Public demo</span><h1>Explore LC App as</h1><p>Enter a complete multi-sided product journey in seconds, or create a real account for persisted Supabase flows.</p></section>
        <section class="lc-product-grid">
          <button class="lc-product-choice" type="button" data-lc-demo-persona="player"><b>Player</b><span>Discover dealers, follow creators and join live-table context.</span></button>
          <button class="lc-product-choice" type="button" data-lc-demo-persona="creator"><b>Creator / Dealer</b><span>See profile, content, schedule and audience loop.</span></button>
          <button class="lc-product-choice" type="button" data-lc-demo-persona="operator"><b>Operator</b><span>Explore re-engagement and handoff concept without claimed integration.</span></button>
          <button class="lc-product-choice" type="button" data-lc-demo-persona="provider"><b>Provider</b><span>Explore games, creators and live distribution without claimed integration.</span></button>
        </section>
        <section class="lc-product-card"><span class="lc-product-label">Real account</span><h2>Use real persisted flows</h2><p>Signup, login, persona onboarding and Player-Creator interactions remain backed by live Supabase.</p><div class="lc-product-actions"><button class="lc-product-btn" type="button" data-auth-route="signup">CREATE ACCOUNT</button><button class="lc-product-btn secondary" type="button" data-auth-route="login">SIGN IN</button></div></section>
      </div>`;
  }

  function renderPersonaChoice() {
    shell().innerHTML = `${top("How will you use LC App?", "Choose a product experience. This is not a security role.")}
      <div class="lc-product-stack">
        <section class="lc-product-card lc-product-hero"><span class="lc-product-label">Product persona</span><h1>Start with your role in Live Casino.</h1><p>You can add another experience later without changing account permissions.</p></section>
        <section class="lc-product-grid">
          <button class="lc-product-choice" type="button" data-lc-persona="player"><b>Player</b><span>Discover creators, follow sessions and return to live tables.</span></button>
          <button class="lc-product-choice" type="button" data-lc-persona="creator"><b>Creator / Dealer</b><span>Build a public profile, post updates and publish session schedules.</span></button>
          <button class="lc-product-choice" type="button" data-lc-persona="industry"><b>Industry</b><span>Evaluate the operator/provider fit and request access.</span></button>
        </section>
      </div>`;
  }

  function renderIndustrySubtype() {
    shell().innerHTML = `${top("Industry experience", "Select company context.")}
      <div class="lc-product-stack">
        <section class="lc-product-card"><h2>What type of company are you evaluating from?</h2><p>This is an unverified product context, not account approval.</p></section>
        <section class="lc-product-grid">
          ${["operator", "provider", "aggregator", "other"].map((item) => `<button class="lc-product-choice" type="button" data-lc-industry="${item}"><b>${safe(item.replace(/^./, (m) => m.toUpperCase()))}</b><span>${item === "provider" ? "Game distribution through creators and live tables." : item === "operator" ? "Player discovery, follow and handoff journey." : "Integration and distribution evaluation."}</span></button>`).join("")}
        </section>
      </div>`;
  }

  function renderPlayerOnboarding() {
    shell().innerHTML = `${top("Player setup", "Personalize discovery.")}
      <form class="lc-product-stack lc-product-form" data-lc-form="player">
        <section class="lc-product-card lc-product-hero"><span class="lc-product-label">Player</span><h1>Find who you want to play with.</h1><p>Choose games and languages so LC App can suggest creators deterministically.</p></section>
        <section class="lc-product-card"><h2>Favorite games</h2>${checks("games", games, state.player?.favorite_games)}</section>
        <section class="lc-product-card"><h2>Preferred languages</h2>${checks("languages", languages, state.player?.preferred_languages)}</section>
        <button class="lc-product-btn" type="submit">START EXPLORING</button>
      </form>`;
  }

  function renderCreatorOnboarding() {
    const c = state.creator || {};
    shell().innerHTML = `${top("Creator setup", "Dealer identity becomes followable.")}
      <form class="lc-product-stack lc-product-form" data-lc-form="creator">
        <section class="lc-product-card lc-product-hero"><span class="lc-product-label">Creator / Dealer</span><h1>From dealer to creator.</h1><p>Create a public profile, publish sessions and let players follow your live presence.</p></section>
        <section class="lc-product-card"><h2>Identity</h2><input class="lc-product-input" name="headline" maxlength="120" placeholder="Headline" value="${safe(c.headline || "Live Casino creator")}"><textarea class="lc-product-textarea" name="bio" maxlength="280" placeholder="Short bio">${safe(state.profile.bio || "")}</textarea></section>
        <section class="lc-product-card"><h2>Games</h2>${checks("games", games, c.games)}</section>
        <section class="lc-product-card"><h2>Languages</h2>${checks("languages", languages, c.languages || state.profile.languages)}</section>
        <section class="lc-product-card"><h2>Affiliation</h2><select class="lc-product-select" name="affiliation_type"><option value="unlisted">Not listed</option><option value="independent">Independent</option><option value="operator">Operator</option><option value="studio">Studio</option><option value="provider">Provider</option></select><input class="lc-product-input" name="affiliation_name" maxlength="120" placeholder="Company, studio or provider (optional)" value="${safe(c.affiliation_name || "")}"><span class="lc-product-note">Affiliation is user claimed and unverified until reviewed.</span></section>
        <section class="lc-product-card"><h2>Preview</h2><div class="lc-product-row"><img src="${safe(avatar(state.profile))}" alt=""><div class="lc-product-row-main"><b>${safe(profileName(state.profile))}</b><span>${safe(c.headline || "Live Casino creator")} · Unverified affiliation</span></div></div></section>
        <button class="lc-product-btn" type="submit">CREATE CREATOR PROFILE</button>
      </form>`;
    const select = q('[name="affiliation_type"]');
    if (select) select.value = c.affiliation_type || "unlisted";
  }

  function creatorCard(item) {
    const p = item.profile;
    const c = item.creator;
    const next = item.sessions[0];
    const post = item.posts[0];
    const following = state.follows.has(p.id);
    return `<section class="lc-product-card" data-creator-id="${safe(p.id)}">
      <div class="lc-product-row"><img src="${safe(avatar(p))}" alt=""><div class="lc-product-row-main"><b>${safe(profileName(p))}</b><span>${safe(c.headline || "Live Casino creator")} · ${safe((c.games || []).join(", ") || "Live Casino")}</span></div><button class="lc-product-chip ${following ? "active" : ""}" type="button" data-lc-follow="${safe(p.id)}">${following ? "Following" : "Follow"}</button></div>
      ${post ? `<p>${safe(post.body)}</p>` : `<p class="lc-product-muted">No public posts yet.</p>`}
      ${next ? `<div class="lc-product-row"><div class="lc-product-row-main"><b>${safe(next.game)} · ${safe(next.title || "Live session")}</b><span>${safe(next.operator_name || "Operator to be confirmed")} · ${new Date(next.starts_at).toLocaleString()}</span></div><button class="lc-product-chip ${state.reminders.has(next.id) ? "active" : ""}" type="button" data-lc-reminder="${safe(next.id)}">${state.reminders.has(next.id) ? "Reminder set" : "Remind me"}</button></div>` : `<div class="lc-product-empty">No public sessions yet.</div>`}
      <div class="lc-product-actions"><button class="lc-product-btn secondary" type="button" data-lc-open-creator="${safe(p.id)}">Open</button>${next ? `<button class="lc-product-btn" type="button" data-lc-live="${safe(next.id)}">Live / Handoff</button>` : ""}</div>
      <span class="lc-product-note">${safe(c.affiliation_name || "Affiliation")} · ${safe(c.affiliation_verification_status || "unverified")}. No operator/provider integration implied.</span>
    </section>`;
  }

  function suggestedCreators() {
    if (!state.player?.favorite_games?.length) return state.creators;
    const prefs = new Set(state.player.favorite_games);
    return [...state.creators].sort((a, b) => Number((b.creator.games || []).some((g) => prefs.has(g))) - Number((a.creator.games || []).some((g) => prefs.has(g))));
  }

  function renderPlayerHome() {
    const creators = suggestedCreators();
    shell().innerHTML = `${top("Your LC App is ready", "Discover, follow and return.")}
      <div class="lc-product-stack">
        <section class="lc-product-card lc-product-hero"><span class="lc-product-label">Player</span><h1>Discover creators. Join live tables.</h1><p>Follow people, save sessions and continue to the licensed operator when you are ready to play.</p></section>
        <section class="lc-product-card"><div class="lc-product-stats"><div class="lc-product-stat"><b>${state.follows.size}</b><span>Following</span></div><div class="lc-product-stat"><b>${state.reminders.size}</b><span>Reminders</span></div><div class="lc-product-stat"><b>${creators.length}</b><span>Creators</span></div></div></section>
        ${creators.length ? creators.map(creatorCard).join("") : `<section class="lc-product-card lc-product-empty">No real creators yet. A creator account can publish the first profile, post and session.</section>`}
      </div>${tabs("home")}`;
  }

  function renderCreatorHome() {
    const c = state.creator;
    shell().innerHTML = `${top("Creator home", "Public creator profile and sessions.")}
      <div class="lc-product-stack">
        <section class="lc-product-card lc-product-hero"><span class="lc-product-label">Creator / Dealer</span><h1>${safe(profileName(state.profile))}</h1><p>${safe(c.headline || "Live Casino creator")} · Verification ${safe(c.verification_status)} · Affiliation ${safe(c.affiliation_verification_status)}</p><span class="lc-product-note">Verification and affiliation approval are protected. Creator cannot self-verify.</span></section>
        <section class="lc-product-card"><h2>Create post</h2><form class="lc-product-form" data-lc-form="post"><textarea class="lc-product-textarea" name="body" maxlength="2000" placeholder="Share a table note or session update"></textarea><button class="lc-product-btn" type="submit">PUBLISH POST</button></form></section>
        <section class="lc-product-card"><h2>Add session</h2><form class="lc-product-form" data-lc-form="session"><input class="lc-product-input" name="title" maxlength="120" placeholder="Session title" value="Live table session"><select class="lc-product-select" name="game">${games.map((g) => `<option>${safe(g)}</option>`).join("")}</select><input class="lc-product-input" name="operator_name" maxlength="120" placeholder="Operator or studio (user claimed / optional)"><input class="lc-product-input" name="starts_at" type="datetime-local" required><button class="lc-product-btn" type="submit">ADD SESSION</button></form><span class="lc-product-note">Operator/provider context is user claimed or demo unless verified by partner integration.</span></section>
        <section class="lc-product-card"><h2>Public sessions</h2>${state.sessions.length ? state.sessions.map((s) => `<div class="lc-product-row"><div class="lc-product-row-main"><b>${safe(s.game)} · ${safe(s.title || "Live session")}</b><span>${safe(s.operator_name || "Operator to be confirmed")} · ${new Date(s.starts_at).toLocaleString()}</span></div></div>`).join("") : `<div class="lc-product-empty">No sessions yet. Add your first session.</div>`}</section>
        <section class="lc-product-card"><h2>Posts</h2>${state.posts.length ? state.posts.map((p) => `<div class="lc-product-row"><div class="lc-product-row-main"><b>${new Date(p.created_at).toLocaleString()}</b><span>${safe(p.body)}</span></div></div>`).join("") : `<div class="lc-product-empty">No posts yet.</div>`}</section>
      </div>${tabs("creator")}`;
    const dt = q('[name="starts_at"]');
    if (dt && !dt.value) dt.value = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
  }

  function renderIndustryOnboarding() {
    const subtype = state.current?.industry_subtype || "operator";
    shell().innerHTML = `${top(`${subtype} setup`, "Industry profile")}
      <form class="lc-product-stack lc-product-form" data-lc-form="industry">
        <section class="lc-product-card lc-product-hero"><span class="lc-product-label">Industry</span><h1>${subtype === "provider" ? "Distribution through people." : "Evaluate the Live Casino social layer."}</h1><p>Registration does not mean company verification, partner approval or active integration.</p></section>
        <section class="lc-product-card"><input class="lc-product-input" name="company_name" maxlength="120" required placeholder="Company"><input class="lc-product-input" name="job_title" maxlength="120" required placeholder="Job title"><input class="lc-product-input" name="work_email" maxlength="254" required placeholder="Work email"><input class="lc-product-input" name="website_url" maxlength="300" placeholder="Website (optional)"></section>
        <section class="lc-product-card"><h2>Interests</h2>${checks("interests", interests, state.industry?.interests)}</section>
        <button class="lc-product-btn" type="submit">OPEN INDUSTRY VIEW</button>
      </form>`;
  }

  function renderIndustryHome() {
    const subtype = state.industry?.subtype || state.current?.industry_subtype || "operator";
    const request = state.accessRequests.find((row) => row.industry_subtype === subtype);
    shell().innerHTML = `${top(`${subtype} workspace`, "Concept evaluation")}
      <div class="lc-product-stack">
        <section class="lc-product-card lc-product-hero"><span class="lc-product-label">Demo / unverified</span><h1>${subtype === "provider" ? "Providers distribute games. LC App adds distribution through people." : "Turn live traffic into relationships and return visits."}</h1><p>Discovery -> Creator -> Follow -> Content / Schedule -> Live -> Operator handoff -> Return.</p></section>
        <section class="lc-product-card"><h2>Integration concept</h2><p>Environment: Demo. Adapter: Not configured for a real partner. Handoff passes context only, not wallet, KYC, AML, settlement or wagering data.</p></section>
        <section class="lc-product-card"><h2>Partnership access</h2><p>Status: ${safe(request?.status || state.industry?.access_status || "not_requested")}</p><button class="lc-product-btn" type="button" data-lc-request-access="${safe(subtype)}">REQUEST PARTNERSHIP ACCESS</button><span class="lc-product-note">Request submission is persisted. Client cannot approve itself.</span></section>
      </div>${tabs("home")}`;
  }

  function renderCreatorDetail(id) {
    const item = state.creators.find((entry) => entry.profile.id === id);
    if (!item) return renderPlayerHome();
    state.selectedCreator = id;
    const post = item.posts[0];
    const next = item.sessions[0];
    shell().innerHTML = `${top(profileName(item.profile), "Creator profile")}
      <div class="lc-product-stack">
        ${creatorCard(item)}
        <section class="lc-product-card"><h2>Content</h2>${item.posts.length ? item.posts.map((p) => `<div class="lc-product-row"><div class="lc-product-row-main"><b>${new Date(p.created_at).toLocaleString()}</b><span>${safe(p.body)}</span></div><button class="lc-product-chip" type="button" data-lc-like="${safe(p.id)}">React</button></div>`).join("") : `<div class="lc-product-empty">No posts yet.</div>`}${post ? `<form class="lc-product-form" data-lc-form="comment" data-post-id="${safe(post.id)}"><input class="lc-product-input" name="body" maxlength="1000" placeholder="Comment on latest post"><button class="lc-product-btn secondary" type="submit">COMMENT</button></form>` : ""}</section>
        <section class="lc-product-card"><h2>Sessions</h2>${item.sessions.length ? item.sessions.map((s) => `<div class="lc-product-row"><div class="lc-product-row-main"><b>${safe(s.game)} · ${safe(s.title || "Live session")}</b><span>${safe(s.operator_name || "Operator to be confirmed")} · ${new Date(s.starts_at).toLocaleString()}</span></div><button class="lc-product-chip ${state.reminders.has(s.id) ? "active" : ""}" type="button" data-lc-reminder="${safe(s.id)}">${state.reminders.has(s.id) ? "Reminder set" : "Remind me"}</button></div>`).join("") : `<div class="lc-product-empty">No sessions yet.</div>`}</section>
        ${next ? `<section class="lc-product-card"><h2>Live / handoff</h2><p>LC App keeps the social context. Real-money play remains with the licensed operator/provider.</p><button class="lc-product-btn" type="button" data-lc-live="${safe(next.id)}">CONTINUE TO LIVE CONTEXT</button></section>` : ""}
      </div>${tabs("discover")}`;
  }

  function renderLive(sessionId) {
    const item = state.creators.find((entry) => entry.sessions.some((session) => session.id === sessionId));
    const session = item?.sessions.find((row) => row.id === sessionId);
    if (!item || !session) return renderPlayerHome();
    shell().innerHTML = `${top("Live context", "Social layer before handoff")}
      <div class="lc-product-stack">
        <section class="lc-product-card lc-product-hero"><span class="lc-product-label">${safe(session.status)}</span><h1>${safe(session.game)} with ${safe(profileName(item.profile))}</h1><p>${safe(session.title || "Live session")} · ${safe(session.operator_name || "Operator to be confirmed")}</p></section>
        <section class="lc-product-card"><h2>What LC App owns</h2><p>Creator identity, follow relationship, session reminder and return context.</p></section>
        <section class="lc-product-card"><h2>External operator/provider step</h2><p>Handoff can pass source, creator, game, session and table context. It does not pass password, private profile, chat history, wallet, KYC, AML or settlement data.</p><button class="lc-product-btn" type="button" data-lc-product="handoff">CONTINUE TO OPERATOR</button><span class="lc-product-note">Demo handoff only. No confirmed operator/provider integration.</span></section>
      </div>${tabs("discover")}`;
  }

  function renderAccount() {
    shell().innerHTML = `${top("Account", "Experience and profile")}
      <div class="lc-product-stack">
        <section class="lc-product-card"><div class="lc-product-row"><img src="${safe(avatar(state.profile))}" alt=""><div class="lc-product-row-main"><b>${safe(profileName(state.profile))}</b><span>${safe(state.profile.username ? "@" + state.profile.username : state.profile.id)}</span></div></div></section>
        <section class="lc-product-card"><h2>Current experience</h2><p>${safe(state.current?.persona || "none")} ${state.current?.industry_subtype ? "· " + safe(state.current.industry_subtype) : ""}</p><div class="lc-product-actions"><button class="lc-product-chip" type="button" data-lc-persona="player">Player</button><button class="lc-product-chip" type="button" data-lc-persona="creator">Creator</button><button class="lc-product-chip" type="button" data-lc-persona="industry">Industry</button></div></section>
        <section class="lc-product-card"><h2>Security role</h2><p>${safe(state.profile.role || "user")} stays separate from product persona.</p></section>
      </div>${tabs("account")}`;
  }

  function routeHome() {
    if (!state.current) return renderPersonaChoice();
    if (state.current.persona === "player") return state.player?.onboarding_completed ? renderPlayerHome() : renderPlayerOnboarding();
    if (state.current.persona === "creator") return state.creator?.onboarding_completed ? renderCreatorHome() : renderCreatorOnboarding();
    if (state.current.persona === "industry") return state.industry?.onboarding_completed ? renderIndustryHome() : renderIndustryOnboarding();
    return renderPersonaChoice();
  }

  async function savePlayer(form) {
    const favorite_games = values(form, "games");
    const preferred_languages = values(form, "languages");
    if (!favorite_games.length || !preferred_languages.length) throw new Error("validation");
    if (state.demo) {
      state.player = { user_id: state.profile.id, favorite_games, preferred_languages, onboarding_completed: true };
      return;
    }
    const { error } = await state.client.from("player_preferences").upsert({
      user_id: state.profile.id,
      favorite_games,
      preferred_languages,
      onboarding_completed: true
    }, { onConflict: "user_id" });
    if (error) throw error;
    await completeCurrentPersona();
  }

  async function saveCreator(form) {
    const data = new FormData(form);
    const headline = String(data.get("headline") || "").trim().slice(0, 120);
    const bio = String(data.get("bio") || "").trim().slice(0, 280);
    const selectedGames = values(form, "games");
    const selectedLanguages = values(form, "languages");
    if (!headline || !selectedGames.length || !selectedLanguages.length) throw new Error("validation");
    if (state.demo) {
      state.creator = { ...state.creator, headline, games: selectedGames, languages: selectedLanguages, affiliation_type: String(data.get("affiliation_type") || "unlisted"), affiliation_name: String(data.get("affiliation_name") || "").trim().slice(0, 120) || null, profile_status: "published", onboarding_completed: true };
      return;
    }
    if (bio && bio !== state.profile.bio) {
      const { error: bioError } = await state.client.from("profiles").update({ bio }).eq("id", state.profile.id);
      if (bioError) throw bioError;
    }
    const { error } = await state.client.from("creator_profiles").upsert({
      user_id: state.profile.id,
      headline,
      games: selectedGames,
      languages: selectedLanguages,
      affiliation_type: String(data.get("affiliation_type") || "unlisted"),
      affiliation_name: String(data.get("affiliation_name") || "").trim().slice(0, 120) || null,
      profile_status: "published",
      onboarding_completed: true
    }, { onConflict: "user_id" });
    if (error) throw error;
    await completeCurrentPersona();
  }

  async function saveIndustry(form) {
    const data = new FormData(form);
    const subtype = state.current?.industry_subtype || "operator";
    const payload = {
      user_id: state.profile.id,
      subtype,
      company_name: String(data.get("company_name") || "").trim().slice(0, 120),
      job_title: String(data.get("job_title") || "").trim().slice(0, 120),
      work_email: String(data.get("work_email") || "").trim().slice(0, 254),
      website_url: String(data.get("website_url") || "").trim().slice(0, 300) || null,
      interests: values(form, "interests"),
      onboarding_completed: true
    };
    if (!payload.company_name || !payload.job_title || !payload.work_email.includes("@")) throw new Error("validation");
    if (state.demo) {
      state.industry = { ...state.industry, ...payload, onboarding_completed: true };
      return;
    }
    const { error } = await state.client.from("industry_profiles").upsert(payload, { onConflict: "user_id" });
    if (error) throw error;
    await completeCurrentPersona();
  }

  async function createPost(form) {
    const body = String(new FormData(form).get("body") || "").trim();
    if (!body) throw new Error("validation");
    if (state.demo) {
      demoStore.posts.unshift({ id: `demo-post-${Date.now()}`, author_id: state.profile.id, body, created_at: new Date().toISOString(), status: "active", deleted_at: null });
      return;
    }
    const { error } = await state.client.from("posts").insert({ author_id: state.profile.id, body, status: "active" });
    if (error) throw error;
    await loadOwnCreatorData();
  }

  async function createSession(form) {
    const data = new FormData(form);
    const starts = String(data.get("starts_at") || "");
    if (!starts) throw new Error("validation");
    if (state.demo) {
      demoStore.sessions.unshift({
        id: `demo-session-${Date.now()}`,
        creator_id: state.profile.id,
        title: String(data.get("title") || "").trim().slice(0, 120) || "Live session",
        game: String(data.get("game") || "Blackjack"),
        operator_name: String(data.get("operator_name") || "").trim().slice(0, 120) || "Demo Casino",
        starts_at: new Date(starts).toISOString(),
        status: "scheduled",
        visibility: "public",
        provenance: "illustrative_demo_data"
      });
      return;
    }
    const { error } = await state.client.from("creator_sessions").insert({
      creator_id: state.profile.id,
      title: String(data.get("title") || "").trim().slice(0, 120) || "Live session",
      game: String(data.get("game") || "Blackjack"),
      operator_name: String(data.get("operator_name") || "").trim().slice(0, 120) || null,
      starts_at: new Date(starts).toISOString(),
      status: "scheduled",
      visibility: "public",
      provenance: "user_generated"
    });
    if (error) throw error;
    await loadOwnCreatorData();
  }

  async function toggleFollow(id) {
    if (state.follows.has(id)) {
      state.follows.delete(id);
      if (state.demo) {
        demoStore.follows.delete(id);
        return;
      }
      const { error } = await state.client.from("follows").delete().eq("follower_id", state.profile.id).eq("following_id", id);
      if (error) throw error;
    } else {
      state.follows.add(id);
      if (state.demo) {
        demoStore.follows.add(id);
        return;
      }
      const { error } = await state.client.from("follows").insert({ follower_id: state.profile.id, following_id: id });
      if (error && !/23505|duplicate/i.test(`${error.code} ${error.message}`)) throw error;
    }
  }

  async function toggleReminder(id) {
    if (state.reminders.has(id)) {
      state.reminders.delete(id);
      if (state.demo) {
        demoStore.reminders.delete(id);
        return;
      }
      const { error } = await state.client.from("player_session_reminders").delete().eq("user_id", state.profile.id).eq("session_id", id);
      if (error) throw error;
    } else {
      state.reminders.add(id);
      if (state.demo) {
        demoStore.reminders.add(id);
        return;
      }
      const { error } = await state.client.from("player_session_reminders").insert({ user_id: state.profile.id, session_id: id });
      if (error && !/23505|duplicate/i.test(`${error.code} ${error.message}`)) throw error;
    }
  }

  async function likePost(id) {
    if (state.demo) {
      demoStore.likes.add(id);
      toast("Demo reaction saved");
      return;
    }
    const { error } = await state.client.from("post_likes").insert({ post_id: id, user_id: state.profile.id });
    if (error && !/23505|duplicate/i.test(`${error.code} ${error.message}`)) throw error;
    toast("Reaction saved");
  }

  async function commentPost(form) {
    const body = String(new FormData(form).get("body") || "").trim();
    const postId = form.dataset.postId;
    if (!body || !postId) throw new Error("validation");
    if (state.demo) {
      demoStore.comments.push({ post_id: postId, body, created_at: new Date().toISOString() });
      form.reset();
      toast("Demo comment saved");
      return;
    }
    const { error } = await state.client.from("comments").insert({ post_id: postId, author_id: state.profile.id, body, status: "active" });
    if (error) throw error;
    form.reset();
    toast("Comment saved");
  }

  async function requestAccess(subtype) {
    if (state.demo) {
      demoStore.requests.add(subtype);
      state.accessRequests = [...demoStore.requests].map((industry_subtype) => ({ industry_subtype, status: "submitted", created_at: new Date().toISOString() }));
      toast("Demo request saved");
      return;
    }
    const { error } = await state.client.from("partnership_access_requests").insert({
      user_id: state.profile.id,
      industry_subtype: subtype,
      status: "submitted"
    });
    if (error && !/23505|duplicate/i.test(`${error.code} ${error.message}`)) throw error;
    toast("Request submitted");
  }

  async function handleSubmit(event) {
    const form = event.target.closest("[data-lc-form]");
    if (!form || state.busy) return;
    event.preventDefault();
    const button = form.querySelector("button[type='submit']");
    setBusy(button, true);
    try {
      const type = form.dataset.lcForm;
      if (type === "player") await savePlayer(form);
      if (type === "creator") await saveCreator(form);
      if (type === "industry") await saveIndustry(form);
      if (type === "post") await createPost(form);
      if (type === "session") await createSession(form);
      if (type === "comment") await commentPost(form);
      if (state.demo) {
        refreshDemoData();
        routeHome();
        toast("Demo action saved");
        return;
      }
      await loadState();
      routeHome();
      toast("Saved");
    } catch (error) {
      toast(error.message === "validation" ? "Check the required fields." : err(error));
    } finally {
      setBusy(button, false);
    }
  }

  async function handleClick(event) {
    const target = event.target;
    const persona = target.closest("[data-lc-persona]");
    const industry = target.closest("[data-lc-industry]");
    const nav = target.closest("[data-lc-product]");
    const openCreator = target.closest("[data-lc-open-creator]");
    const live = target.closest("[data-lc-live]");
    const follow = target.closest("[data-lc-follow]");
    const reminder = target.closest("[data-lc-reminder]");
    const like = target.closest("[data-lc-like]");
    const access = target.closest("[data-lc-request-access]");
    const demoPersona = target.closest("[data-lc-demo-persona]");
    const demoExit = target.closest("[data-lc-demo-exit]");
    try {
      if (demoPersona) {
        event.preventDefault();
        return enterDemo(demoPersona.dataset.lcDemoPersona);
      }
      if (demoExit) {
        event.preventDefault();
        clear();
        return renderDemoEntry();
      }
      if (persona) {
        event.preventDefault();
        const value = persona.dataset.lcPersona;
        if (state.demo) {
          if (value === "industry") return renderIndustrySubtype();
          return enterDemo(value);
        }
        if (value === "industry") return renderIndustrySubtype();
        await setCurrentPersona(value);
        return routeHome();
      }
      if (industry) {
        event.preventDefault();
        if (state.demo) return enterDemo(industry.dataset.lcIndustry);
        await setCurrentPersona("industry", industry.dataset.lcIndustry);
        return routeHome();
      }
      if (nav) {
        event.preventDefault();
        const value = nav.dataset.lcProduct;
        if (value === "account") return renderAccount();
        if (value === "discover") {
          await loadCreators();
          return renderPlayerHome();
        }
        if (value === "creator") return state.creator?.onboarding_completed ? renderCreatorHome() : renderCreatorOnboarding();
        if (value === "handoff") return toast("Demo handoff only. External operator integration is not configured.");
        return routeHome();
      }
      if (openCreator) return renderCreatorDetail(openCreator.dataset.lcOpenCreator);
      if (live) return renderLive(live.dataset.lcLive);
      if (follow) {
        await toggleFollow(follow.dataset.lcFollow);
        await loadCreators();
        return state.selectedCreator ? renderCreatorDetail(state.selectedCreator) : renderPlayerHome();
      }
      if (reminder) {
        await toggleReminder(reminder.dataset.lcReminder);
        await loadCreators();
        return state.selectedCreator ? renderCreatorDetail(state.selectedCreator) : renderPlayerHome();
      }
      if (like) return likePost(like.dataset.lcLike);
      if (access) {
        await requestAccess(access.dataset.lcRequestAccess);
        await loadState();
        return renderIndustryHome();
      }
    } catch (error) {
      toast(err(error));
      await loadState().catch(() => {});
      routeHome();
    }
  }

  async function mount({ client, profile }) {
    state.demo = false;
    state.demoPersona = null;
    state.client = client;
    state.profile = profile;
    state.ready = true;
    renderLoading();
    try {
      await loadState();
      routeHome();
    } catch (error) {
      shell().innerHTML = `${top()}<section class="lc-product-card lc-product-empty">Product experience unavailable. ${safe(err(error))}</section>`;
    }
  }

  function clear() {
    state.client = null;
    state.profile = null;
    state.demo = false;
    state.demoPersona = null;
    state.personas = [];
    state.current = null;
    state.player = null;
    state.creator = null;
    state.industry = null;
    state.sessions = [];
    state.creators = [];
    state.posts = [];
    state.follows = new Set();
    state.reminders = new Set();
    state.accessRequests = [];
    hide();
  }

  function mountDemoEntry() {
    clear();
    state.ready = true;
    renderDemoEntry();
  }

  document.addEventListener("submit", handleSubmit, true);
  document.addEventListener("click", handleClick, true);
  window.LCAppProduct = { mount, mountDemoEntry, clear };
})();
