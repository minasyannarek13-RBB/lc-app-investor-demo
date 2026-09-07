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
    notifications: [],
    accessRequests: [],
    selectedCreator: null,
    selectedSession: null,
    search: "",
    demo: false,
    demoPersona: null,
    busy: false,
    ready: false
  };

  const games = ["Blackjack", "Baccarat", "Roulette", "Poker", "Game Show"];
  const languages = ["English", "French", "Italian", "Spanish", "Armenian"];
  const interests = ["creator network", "player discovery", "retention/engagement", "live discovery", "integration", "attribution"];
  const demoStore = { follows: new Set(), reminders: new Set(), likes: new Set(), comments: [], posts: [], sessions: [], notifications: [], requests: new Set() };
  const demoProfiles = [
    { id: "demo-sofia", username: "sofia_live", display_name: "Sofia Laurent", avatar_url: "app_prototype_assets/dealers/v2_polish/sofia_avatar_public.jpg", bio: "Blackjack dealer building a followable Live Casino audience.", country: "Malta", languages: ["English", "French"] },
    { id: "demo-mia", username: "mia_tables", display_name: "Mia Novak", avatar_url: "app_prototype_assets/dealers/dealer_mia_avatar_v1.jpg", bio: "Roulette and baccarat sessions with a calm table style.", country: "Latvia", languages: ["English", "Italian"] },
    { id: "demo-marcus", username: "marcus_live", display_name: "Marcus Reed", avatar_url: "app_prototype_assets/dealers/dealer_marcus_avatar_v1.jpg", bio: "Game-show host focused on community return visits.", country: "UK", languages: ["English", "Spanish"] },
    { id: "demo-alex", username: "alex_baccarat", display_name: "Alex Moreau", avatar_url: "app_prototype_assets/dealers/v2_polish/alex_portrait.jpg", bio: "Baccarat host connecting premium table rhythm with repeat players.", country: "France", languages: ["English", "French"] },
    { id: "demo-lilit", username: "lilit_cards", display_name: "Lilit Aram", avatar_url: "app_prototype_assets/dealers/dealer_lilit_avatar_v1.jpg", bio: "Blackjack and poker creator focused on clear table explainers.", country: "Armenia", languages: ["English", "Armenian"] }
  ];
  const demoCreators = [
    { user_id: "demo-sofia", headline: "Featured Blackjack creator", games: ["Blackjack", "Baccarat"], languages: ["English", "French"], affiliation_name: "Demo Casino", affiliation_verification_status: "unverified", verification_status: "unverified", profile_status: "published" },
    { user_id: "demo-mia", headline: "Roulette table personality", games: ["Roulette", "Baccarat"], languages: ["English", "Italian"], affiliation_name: "Demo Studio", affiliation_verification_status: "unverified", verification_status: "unverified", profile_status: "published" },
    { user_id: "demo-marcus", headline: "Game Show host", games: ["Game Show"], languages: ["English", "Spanish"], affiliation_name: "Demo Provider", affiliation_verification_status: "unverified", verification_status: "unverified", profile_status: "published" },
    { user_id: "demo-alex", headline: "Baccarat creator for premium sessions", games: ["Baccarat"], languages: ["English", "French"], affiliation_name: "Demo Casino", affiliation_verification_status: "unverified", verification_status: "unverified", profile_status: "published" },
    { user_id: "demo-lilit", headline: "Blackjack and poker table explainer", games: ["Blackjack", "Poker"], languages: ["English", "Armenian"], affiliation_name: "Demo Studio", affiliation_verification_status: "unverified", verification_status: "unverified", profile_status: "published" }
  ];
  const demoSessions = [
    { id: "demo-session-sofia", creator_id: "demo-sofia", title: "Evening Blackjack table", game: "Blackjack", operator_name: "Demo Casino", starts_at: new Date(Date.now() + 3600000).toISOString(), status: "live", visibility: "public", provenance: "illustrative_demo_data" },
    { id: "demo-session-mia", creator_id: "demo-mia", title: "Roulette community hour", game: "Roulette", operator_name: "Demo Casino", starts_at: new Date(Date.now() + 7200000).toISOString(), status: "scheduled", visibility: "public", provenance: "illustrative_demo_data" },
    { id: "demo-session-marcus", creator_id: "demo-marcus", title: "Game Show warm-up", game: "Game Show", operator_name: "Demo Provider", starts_at: new Date(Date.now() + 10800000).toISOString(), status: "scheduled", visibility: "public", provenance: "illustrative_demo_data" },
    { id: "demo-session-alex", creator_id: "demo-alex", title: "Premium Baccarat room", game: "Baccarat", operator_name: "Demo Casino", starts_at: new Date(Date.now() + 1800000).toISOString(), status: "live", visibility: "public", provenance: "illustrative_demo_data" },
    { id: "demo-session-lilit", creator_id: "demo-lilit", title: "Blackjack strategy table", game: "Blackjack", operator_name: "Demo Studio", starts_at: new Date(Date.now() + 14400000).toISOString(), status: "scheduled", visibility: "public", provenance: "illustrative_demo_data" }
  ];
  const demoPosts = [
    { id: "demo-post-sofia", author_id: "demo-sofia", body: "Tonight's Blackjack table is live. Follow the session and come back when the seat opens.", created_at: new Date(Date.now() - 900000).toISOString(), status: "active", deleted_at: null },
    { id: "demo-post-mia", author_id: "demo-mia", body: "Roulette players asked for a slower table pace today. I added it to the next session.", created_at: new Date(Date.now() - 3600000).toISOString(), status: "active", deleted_at: null },
    { id: "demo-post-marcus", author_id: "demo-marcus", body: "Game Show preview: new community challenge format for returning players.", created_at: new Date(Date.now() - 5400000).toISOString(), status: "active", deleted_at: null },
    { id: "demo-post-alex", author_id: "demo-alex", body: "Baccarat table is live soon. I will host the slower premium room tonight.", created_at: new Date(Date.now() - 2700000).toISOString(), status: "active", deleted_at: null },
    { id: "demo-post-lilit", author_id: "demo-lilit", body: "Posted a quick Blackjack note for players joining my next session.", created_at: new Date(Date.now() - 7200000).toISOString(), status: "active", deleted_at: null }
  ];
  const visualMedia = {
    "demo-sofia": "app_prototype_assets/dealers/v2_polish/sofia_profile_public.jpg",
    "demo-mia": "app_prototype_assets/dealers/v2_polish/mia_roulette.jpg",
    "demo-marcus": "app_prototype_assets/dealers/v2_polish/marcus_community.jpg",
    "demo-alex": "app_prototype_assets/dealers/v2_polish/alex_baccarat.jpg",
    "demo-lilit": "app_prototype_assets/dealers/v2_polish/sofia_discover_public.jpg",
    fallback: "app_prototype_assets/dealers/v2_polish/sofia_welcome_public.jpg"
  };

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
  const validDemoPersonas = new Set(["player", "creator", "operator", "provider"]);
  const productParts = (target = "") => {
    const clean = (target || window.location.hash.replace(/^#\/?/, "")).split("?")[0].split("&")[0];
    const parts = clean.split("/").filter(Boolean);
    return parts[0] === "product" ? parts.slice(1) : [];
  };
  const setProductHash = (parts = []) => {
    const next = `#/product${parts.length ? "/" + parts.map(encodeURIComponent).join("/") : ""}`;
    if (window.location.hash === next) return false;
    window.location.hash = next;
    return true;
  };
  const resetDemoStore = () => {
    demoStore.follows.clear();
    demoStore.reminders.clear();
    demoStore.likes.clear();
    demoStore.comments = [];
    demoStore.posts = [];
    demoStore.sessions = [];
    demoStore.notifications = [];
    demoStore.requests.clear();
  };
  const sessionStatusLabel = (session) => {
    if (!session) return "NO SESSION";
    if (session?.status === "live") return "LIVE NOW";
    if (session?.status === "scheduled") return "UPCOMING";
    return "ENDED";
  };
  const sessionLine = (session) => `${sessionStatusLabel(session)} · ${new Date(session.starts_at).toLocaleString()}`;
  const findSessionEntry = (sessionId) => {
    for (const entry of state.creators) {
      const session = entry.sessions.find((row) => row.id === sessionId);
      if (session) return { entry, session };
    }
    return null;
  };
  const addDemoNotification = (text, targetId = null) => {
    demoStore.notifications.unshift({ id: `demo-note-${Date.now()}`, text, target_id: targetId, created_at: new Date().toISOString() });
    demoStore.notifications = demoStore.notifications.slice(0, 6);
  };

  function injectStyles() {
    if (q("#lcProductStyles")) return;
    const style = document.createElement("style");
    style.id = "lcProductStyles";
    style.textContent = `
      #screen.lc-product-mode #homeView,#screen.lc-product-mode #accountPage,#screen.lc-product-mode>.bottom-nav,#screen.lc-product-mode #lcAuthShell{display:none!important}
      #lcProductShell{position:absolute;inset:0;z-index:74;overflow:auto;padding:18px max(14px,env(safe-area-inset-left)) calc(96px + env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-right));background:radial-gradient(circle at 85% 0,rgba(46,230,206,.13),transparent 35%),linear-gradient(180deg,#071012,#050708 72%);color:var(--text);scrollbar-width:none;-webkit-overflow-scrolling:touch}
      #lcProductShell[hidden]{display:none!important}.lc-product-stack{display:grid;gap:12px;width:100%;max-width:980px;margin:0 auto}.lc-product-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 auto 12px;width:100%;max-width:980px}.lc-product-brand{display:flex;align-items:center;gap:10px;min-width:0}.lc-product-logo{flex:0 0 auto;width:38px;height:38px;border-radius:14px;background:linear-gradient(135deg,var(--teal),#a7fff4);color:#031412;display:grid;place-items:center;font-weight:950}.lc-product-brand strong{display:block;font-size:14px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lc-product-brand span,.lc-product-muted{display:block;color:var(--muted);font-size:12px;line-height:1.35}
      .lc-product-card{border:1px solid rgba(46,230,206,.15);border-radius:18px;background:rgba(8,13,16,.84);box-shadow:0 20px 52px rgba(0,0,0,.28);padding:14px;overflow:hidden}.lc-product-hero{padding:18px;background:linear-gradient(145deg,rgba(46,230,206,.14),rgba(255,255,255,.04));border-color:rgba(46,230,206,.32)}
      .lc-product-card h1,.lc-product-card h2,.lc-product-card h3{margin:0 0 8px;letter-spacing:0;text-wrap:balance}.lc-product-card h1{font-size:clamp(26px,7vw,36px);line-height:1.05}.lc-product-card h2{font-size:clamp(18px,4.5vw,22px);line-height:1.15}.lc-product-card h3{font-size:15px;line-height:1.2}.lc-product-card p{margin:0;color:var(--soft);font-size:14px;line-height:1.45;overflow-wrap:anywhere}.lc-product-label{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(46,230,206,.28);border-radius:999px;padding:6px 10px;color:#a7fff4;background:rgba(46,230,206,.1);font-size:10px;line-height:1;font-weight:900;text-transform:uppercase;margin-bottom:10px}.lc-product-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:6px}.lc-product-section-head span{color:var(--muted);font-size:11px;line-height:1.3}.lc-product-flow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}.lc-product-flow span{min-height:44px;display:grid;place-items:center;border:1px solid rgba(46,230,206,.14);border-radius:13px;background:rgba(255,255,255,.045);color:var(--soft);font-size:10px;line-height:1.1;font-weight:900;text-align:center;text-transform:uppercase;padding:6px}
      .lc-product-grid{display:grid;gap:10px}.lc-product-grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}.lc-product-choice{min-height:98px;text-align:left;border:1px solid rgba(255,255,255,.1);border-radius:18px;background:rgba(255,255,255,.05);color:var(--text);padding:14px;cursor:pointer}.lc-product-choice b{display:block;font-size:15px;line-height:1.2;margin-bottom:7px}.lc-product-choice span{color:var(--muted);font-size:12px;line-height:1.35}.lc-product-choice.active{border-color:rgba(46,230,206,.58);background:rgba(46,230,206,.13)}
      .lc-product-form{display:grid;gap:10px}.lc-product-input,.lc-product-select,.lc-product-textarea{width:100%;min-height:46px;border:1px solid rgba(255,255,255,.11);border-radius:15px;background:rgba(255,255,255,.06);color:var(--text);padding:12px 13px;font:inherit;font-size:16px;line-height:1.35;outline:none}.lc-product-textarea{min-height:88px;resize:vertical}.lc-product-input:focus,.lc-product-select:focus,.lc-product-textarea:focus{border-color:rgba(46,230,206,.65);box-shadow:0 0 0 3px rgba(46,230,206,.1)}
      .lc-product-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.lc-product-btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;border:0;border-radius:999px;background:linear-gradient(135deg,var(--teal),#a7fff4);color:#031412;padding:0 16px;font-size:12px;line-height:1.1;font-weight:900;cursor:pointer;text-align:center;white-space:normal}.lc-product-btn.secondary{border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.06);color:var(--text)}.lc-product-btn:disabled{opacity:.55;cursor:not-allowed}.lc-product-chip{display:inline-flex;align-items:center;justify-content:center;min-height:36px;border:1px solid rgba(255,255,255,.11);border-radius:999px;background:rgba(255,255,255,.06);color:var(--soft);padding:0 11px;font-size:11px;line-height:1.1;font-weight:850;cursor:pointer;text-align:center}.lc-product-chip.active{border-color:rgba(46,230,206,.58);background:rgba(46,230,206,.14);color:#a7fff4}
      .lc-product-row{display:flex;align-items:center;gap:10px;padding:12px 0;border-top:1px solid rgba(255,255,255,.08)}.lc-product-row:first-child{border-top:0}.lc-product-row img{flex:0 0 auto;width:50px;height:50px;border-radius:16px;object-fit:cover}.lc-product-row-main{min-width:0;flex:1}.lc-product-row-main b{display:block;font-size:14px;line-height:1.25;overflow-wrap:anywhere}.lc-product-row-main span{display:block;color:var(--muted);font-size:12px;line-height:1.35;overflow-wrap:anywhere}.lc-product-status-dot{width:8px;height:8px;border-radius:50%;background:#778287;box-shadow:0 0 0 3px rgba(255,255,255,.04);flex:0 0 auto}.lc-product-status-dot.live{background:#5dffce;box-shadow:0 0 18px rgba(93,255,206,.45)}.lc-product-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.lc-product-stat{padding:11px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(255,255,255,.04);min-width:0}.lc-product-stat b{display:block;font-size:17px;line-height:1.15;overflow-wrap:anywhere}.lc-product-stat span{display:block;color:var(--muted);font-size:10px;line-height:1.2;text-transform:uppercase;font-weight:850}
      .lc-product-tabs{position:sticky;bottom:8px;z-index:3;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;padding:7px;border:1px solid rgba(46,230,206,.16);border-radius:20px;background:rgba(5,8,9,.92);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);margin:12px auto 0;width:100%;max-width:980px}.lc-product-tabs button{min-height:44px;border:0;border-radius:14px;background:transparent;color:var(--muted);font-size:11px;line-height:1.05;font-weight:900;cursor:pointer}.lc-product-tabs button.active{background:rgba(46,230,206,.14);color:#a7fff4}.lc-product-note{display:block;margin-top:9px;color:var(--muted);font-size:11px;line-height:1.4;overflow-wrap:anywhere}.lc-product-empty{padding:24px 14px;text-align:center;color:var(--muted);font-size:14px;line-height:1.4}
      .lc-product-demo-banner{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 auto 10px;padding:7px 8px;border:1px solid rgba(46,230,206,.16);border-radius:14px;background:rgba(255,255,255,.04);width:100%;max-width:980px}.lc-product-demo-banner strong{font-size:10px;line-height:1.1;color:#a7fff4;text-transform:uppercase;white-space:nowrap}.lc-product-demo-banner .lc-product-actions{margin-left:auto;justify-content:flex-end}
      .lc-product-entry{min-height:100%;display:flex;flex-direction:column;gap:12px;width:100%;max-width:980px;margin:0 auto}.lc-product-entry-hero{padding:18px 4px 4px}.lc-product-entry-hero .lc-product-label{margin-bottom:12px}.lc-product-entry-hero h1{margin:0 0 8px;font-size:clamp(30px,8vw,46px);line-height:1.04;letter-spacing:0;color:var(--text);text-wrap:balance}.lc-product-entry-hero p{margin:0;color:var(--muted);font-size:13px;line-height:1.25;font-weight:850;text-transform:uppercase}.lc-product-entry-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:2px}.lc-product-entry-title strong{font-size:12px;line-height:1.2;text-transform:uppercase;color:var(--soft)}.lc-product-personas{display:grid;gap:10px}.lc-product-persona{position:relative;min-height:96px;border:1px solid rgba(255,255,255,.1);border-radius:18px;background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.035));color:var(--text);padding:14px;text-align:left;overflow:hidden;cursor:pointer}.lc-product-persona:after{content:"";position:absolute;right:-24px;top:-26px;width:80px;height:80px;border-radius:999px;background:rgba(46,230,206,.1);filter:blur(8px)}.lc-product-persona b{display:block;font-size:15px;line-height:1.2;margin-bottom:7px}.lc-product-persona span{display:block;max-width:32ch;color:var(--muted);font-size:12px;line-height:1.35}.lc-product-entry-auth{display:flex;gap:8px;margin-top:2px}.lc-product-entry-auth .lc-product-btn{flex:1}
      .lc-product-btn:focus-visible,.lc-product-chip:focus-visible,.lc-product-choice:focus-visible,.lc-product-persona:focus-visible,.lc-product-tabs button:focus-visible{outline:2px solid rgba(167,255,244,.9);outline-offset:2px}
      .lc-product-cinema{position:relative;min-height:520px;display:grid;align-content:end;overflow:hidden;border-radius:24px;border:1px solid rgba(167,255,244,.14);background:#020504;box-shadow:0 30px 90px rgba(0,0,0,.36),inset 0 0 0 1px rgba(255,255,255,.035)}.lc-product-cinema.compact{min-height:360px}.lc-product-cinema.copy-top{align-content:start}.lc-product-cinema img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.05) contrast(1.04) brightness(.68)}.lc-product-cinema:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,5,4,.04),rgba(2,5,4,.12) 34%,rgba(2,5,4,.9)),linear-gradient(90deg,rgba(2,5,4,.58),transparent 54%);z-index:1}.lc-product-cinema.copy-top:after{background:linear-gradient(180deg,rgba(2,5,4,.88),rgba(2,5,4,.18) 46%,rgba(2,5,4,.86)),linear-gradient(90deg,rgba(2,5,4,.56),transparent 54%)}.lc-product-cinema-copy{position:relative;z-index:2;display:grid;justify-items:start;gap:10px;padding:18px}.lc-product-cinema-copy h1{margin:0;max-width:12ch;font-size:clamp(36px,9vw,58px);line-height:.92;font-weight:870;color:#f7fffb}.lc-product-cinema-copy p{max-width:31ch;color:#f7fffb;font-size:14px}.lc-product-cinema .lc-product-actions{position:relative;z-index:2}.lc-product-media-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.lc-product-media-tile{position:relative;min-height:176px;overflow:hidden;border-radius:18px;border:1px solid rgba(255,255,255,.08);background:#07100e}.lc-product-media-tile.large{grid-column:1/-1;min-height:260px}.lc-product-media-tile img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.04) brightness(.72)}.lc-product-media-tile:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.04),rgba(2,5,4,.86));z-index:1}.lc-product-media-copy{position:absolute;left:12px;right:12px;bottom:12px;z-index:2;display:grid;gap:7px;justify-items:start}.lc-product-card{border-color:rgba(167,255,244,.12);background:rgba(5,9,8,.72);box-shadow:0 24px 70px rgba(0,0,0,.26);backdrop-filter:blur(18px)}.lc-product-hero{background:linear-gradient(145deg,rgba(31,216,196,.1),rgba(255,255,255,.035));border-color:rgba(167,255,244,.2)}.lc-product-tabs{border-color:rgba(167,255,244,.13);background:rgba(2,6,5,.9)}@media(prefers-reduced-motion:reduce){.screen,.lc-product-cinema,.lc-product-card{animation:none!important;transition:none!important}}@media(max-width:430px){.lc-product-cinema{min-height:calc(var(--app-height) - 168px)}.lc-product-cinema.compact{min-height:390px}.lc-product-cinema-copy{padding:16px}.lc-product-cinema-copy h1{font-size:40px}.lc-product-media-grid{grid-template-columns:1fr}.lc-product-media-tile.large{min-height:260px}}
      @media(min-width:720px){#lcProductShell{padding:24px 18px 104px}.lc-product-grid.desktop-two{grid-template-columns:repeat(2,minmax(0,1fr))}.lc-product-personas{grid-template-columns:repeat(2,minmax(0,1fr))}.lc-product-card{padding:16px}.lc-product-hero{padding:20px}.lc-product-entry{max-width:min(920px,92vw)}}@media(min-width:1180px){#lcProductShell{padding:30px 28px 112px}.lc-product-stack,.lc-product-top,.lc-product-tabs,.lc-product-demo-banner{max-width:1040px}.lc-product-entry{max-width:960px}.lc-product-persona{min-height:112px;padding:18px}}@media(max-width:430px){#lcProductShell{padding-left:12px;padding-right:12px}.lc-product-card{padding:13px;border-radius:17px}.lc-product-card h1{font-size:26px}.lc-product-grid.two{grid-template-columns:1fr}.lc-product-flow{grid-template-columns:repeat(3,minmax(0,1fr))}.lc-product-row{align-items:flex-start}.lc-product-row .lc-product-chip{margin-left:auto}.lc-product-actions{gap:7px}.lc-product-btn{min-height:44px;padding:0 13px;font-size:11px}.lc-product-chip{min-height:35px;font-size:10.5px}.lc-product-entry-hero h1{font-size:30px}.lc-product-persona{min-height:92px;padding:13px}.lc-product-demo-banner{align-items:flex-start;flex-direction:column}.lc-product-demo-banner .lc-product-actions{width:100%;margin-left:0}.lc-product-demo-banner .lc-product-chip{flex:1}.lc-product-entry-auth{position:sticky;bottom:8px;z-index:3;padding:7px;border:1px solid rgba(46,230,206,.16);border-radius:20px;background:rgba(5,8,9,.92);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px)}}
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
    node.scrollTop = 0;
    window.scrollTo(0, 0);
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
    const [personas, player, creator, industry, reminders, follows, accessRequests, notifications] = await Promise.all([
      state.client.from("account_personas").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
      state.client.from("player_preferences").select("*").eq("user_id", userId).maybeSingle(),
      state.client.from("creator_profiles").select("*").eq("user_id", userId).maybeSingle(),
      state.client.from("industry_profiles").select("*").eq("user_id", userId).maybeSingle(),
      state.client.from("player_session_reminders").select("session_id").eq("user_id", userId),
      state.client.from("follows").select("following_id").eq("follower_id", userId),
      state.client.from("partnership_access_requests").select("industry_subtype,status,created_at").eq("user_id", userId).order("created_at", { ascending: false }),
      state.client.from("notifications").select("id,type,target_type,target_id,read_at,created_at").eq("recipient_id", userId).order("created_at", { ascending: false }).limit(8)
    ]);
    [personas, player, creator, industry, reminders, follows, accessRequests, notifications].forEach((res) => { if (res.error) throw res.error; });
    state.personas = personas.data || [];
    state.current = state.personas.find((p) => p.is_current) || state.personas[0] || null;
    state.player = player.data || null;
    state.creator = creator.data || null;
    state.industry = industry.data || null;
    state.reminders = new Set((reminders.data || []).map((row) => row.session_id));
    state.follows = new Set((follows.data || []).map((row) => row.following_id));
    state.accessRequests = accessRequests.data || [];
    state.notifications = notifications.data || [];
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
      ${state.demo ? `<div class="lc-product-demo-banner"><strong>INTERACTIVE REVEAL · ${safe(state.demoPersona || "preview")}</strong><div class="lc-product-actions"><button class="lc-product-chip" type="button" data-lc-demo-switch>Switch perspective</button><button class="lc-product-chip" type="button" data-lc-demo-reset>Reset journey</button><button class="lc-product-chip" type="button" data-lc-demo-exit>Back to opening</button></div></div>` : ""}
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

  const visualImage = (profile) => visualMedia[profile?.id] || visualMedia.fallback;
  const visualHero = (label, title, body, image, actions = "", mode = "") => `<section class="lc-product-cinema ${mode}"><img src="${safe(image || visualMedia.fallback)}" alt=""><div class="lc-product-cinema-copy"><span class="lc-product-label">${safe(label)}</span><h1>${safe(title)}</h1><p>${safe(body)}</p>${actions ? `<div class="lc-product-actions">${actions}</div>` : ""}</div></section>`;
  const visualTile = (image, label, title, body, large = false) => `<article class="lc-product-media-tile ${large ? "large" : ""}"><img src="${safe(image || visualMedia.fallback)}" alt=""><div class="lc-product-media-copy"><span class="lc-product-label">${safe(label)}</span><h3>${safe(title)}</h3><p>${safe(body)}</p></div></article>`;

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
    state.notifications = demoStore.notifications;
    state.sessions = [...demoSessions, ...demoStore.sessions].filter((session) => session.creator_id === state.profile?.id);
    state.posts = [...demoStore.posts, ...demoPosts].filter((post) => post.author_id === state.profile?.id);
  }

  function setupDemo(persona, shouldReset = false) {
    if (shouldReset) resetDemoStore();
    if (shouldReset && persona === "player") {
      demoStore.follows.add("demo-sofia");
      demoStore.reminders.add("demo-session-mia");
      addDemoNotification("Sofia is live now. Your followed creator is ready to play.", "demo-session-sofia");
    }
    if (shouldReset && persona === "creator") {
      addDemoNotification("Demo reviewer followed Sofia and saved the next session.", "demo-sofia");
    }
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
  }

  function enterDemo(persona) {
    setupDemo(persona, true);
    if (setProductHash(["demo", persona])) return;
    routeHome();
  }

  function renderDemoEntry() {
    shell().innerHTML = `${top("LC App", "The social discovery layer for Live Casino")}
      <div class="lc-product-entry">
        ${visualHero("The social discovery layer for Live Casino", "Live Casino through people.", "Live Casino has always had personalities. LC App makes them discoverable, followable and able to bring audiences back to the live moment.", visualMedia.fallback, '<button class="lc-product-btn" type="button" data-lc-demo-persona="player">Start with the player</button><button class="lc-product-btn secondary" type="button" data-lc-demo-persona="operator">See the business layer</button>')}
        <section class="lc-product-card"><div class="lc-product-section-head"><h2>The discovery model changes</h2><span>Game-first → people-first</span></div><p style="margin-bottom:10px">Traditional Live Casino discovery starts with the lobby. LC starts with the person.</p><div class="lc-product-flow"><span>Casino</span><span>Lobby</span><span>Game</span><span>Table</span><span>Seat</span></div><div class="lc-product-flow" style="margin-top:8px"><span>Discover</span><span>Creator</span><span>Follow</span><span>Live</span><span>Return</span></div></section>
        <section class="lc-product-media-grid">
          ${visualTile(visualMedia["demo-sofia"], "Discover", "The person becomes the entry point.", "A player can discover a host before choosing the table.", true)}
          ${visualTile(visualMedia["demo-alex"], "Live intent", "Follow the moment, not only the game.", "Creator identity turns attention into a reason to return.")}
          ${visualTile(visualMedia["demo-marcus"], "Continuity", "The table is temporary. The relationship can continue.", "Content, schedules and follows connect one live session to the next.")}
        </section>
        <section class="lc-product-card"><div class="lc-product-section-head"><h2>One layer. Four sides.</h2><span>Explore the thesis</span></div><p>Start with the player journey, then switch perspective to see why creators, operators and providers can all participate without LC becoming the casino.</p></section>
        <section class="lc-product-personas">
          <button class="lc-product-persona" type="button" data-lc-demo-persona="player"><b>PLAYER</b><span>Discover → Creator → Follow → Live → Handoff → Return.</span></button>
          <button class="lc-product-persona" type="button" data-lc-demo-persona="creator"><b>CREATOR / DEALER</b><span>Dealer → Persona → Creator → Audience → Live intent.</span></button>
          <button class="lc-product-persona" type="button" data-lc-demo-persona="operator"><b>OPERATOR</b><span>The operator keeps the game. LC creates another path to it.</span></button>
          <button class="lc-product-persona" type="button" data-lc-demo-persona="provider"><b>PROVIDER</b><span>Distribution can start with a person, not only a game tile.</span></button>
        </section>
        <section class="lc-product-card"><h2>Clear operating boundary</h2><p>LC App owns discovery, creator identity, social context, schedules and return intent. Licensed operators/providers keep gameplay, wallet, deposits and withdrawals, KYC/AML, responsible gaming, wagering and settlement.</p></section>
        <section class="lc-product-card lc-product-hero"><span class="lc-product-label">The thesis</span><h1>Casino was built around games. LC is built around people.</h1><p>Live Casino through people.</p></section>
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
    return `<section class="lc-product-cinema compact" data-creator-id="${safe(p.id)}">
      <img src="${safe(visualImage(p))}" alt="">
      <div class="lc-product-cinema-copy">
        <span class="lc-product-label">${safe(sessionStatusLabel(next))}</span>
        <h1>${safe(profileName(p))}</h1>
        <p>${safe(c.headline || "Live Casino creator")} · ${safe((c.games || []).join(", ") || "Live Casino")}</p>
        <div class="lc-product-actions"><button class="lc-product-btn secondary ${following ? "active" : ""}" type="button" data-lc-follow="${safe(p.id)}">${following ? "Following" : "Follow"}</button><button class="lc-product-btn secondary" type="button" data-lc-open-creator="${safe(p.id)}">Open</button>${next ? `<button class="lc-product-btn" type="button" data-lc-live="${safe(next.id)}">Live / Handoff</button>` : ""}</div>
        <span class="lc-product-note">${safe(c.affiliation_name || "Affiliation")} · ${safe(c.affiliation_verification_status || "unverified")}. No operator/provider integration implied.</span>
      </div>
    </section>`;
  }

  function compactCreatorRows(items, emptyText) {
    if (!items.length) return `<div class="lc-product-empty">${safe(emptyText)}</div>`;
    return items.map((item) => {
      const next = item.sessions[0];
      return `<div class="lc-product-row"><img src="${safe(avatar(item.profile))}" alt=""><span class="lc-product-status-dot ${next?.status === "live" ? "live" : ""}"></span><div class="lc-product-row-main"><b>${safe(profileName(item.profile))}</b><span>${safe(sessionStatusLabel(next))} · ${safe((item.creator.games || []).join(", "))} · ${safe(next?.operator_name || "Operator to be confirmed")}</span></div><button class="lc-product-chip" type="button" data-lc-open-creator="${safe(item.profile.id)}">Open</button></div>`;
    }).join("");
  }

  function notificationText(row) {
    if (row.text) return row.text;
    if (row.type === "new_follower") return "New follower on your creator profile.";
    if (row.type === "post_like") return "Someone reacted to your content.";
    if (row.type === "comment") return "New comment on your content.";
    if (row.type === "comment_reply") return "New reply in a creator conversation.";
    return "Product activity updated.";
  }

  function renderNotifications(emptyText = "No notifications yet. Follow creators, react to content or save sessions.") {
    return `<section class="lc-product-card"><div class="lc-product-section-head"><h2>Notifications</h2><span>${state.notifications.length ? "Latest activity" : "Empty"}</span></div>${state.notifications.length ? state.notifications.map((n) => `<div class="lc-product-row"><div class="lc-product-row-main"><b>${safe(notificationText(n))}</b><span>${safe(new Date(n.created_at).toLocaleString())}</span></div></div>`).join("") : `<div class="lc-product-empty">${safe(emptyText)}</div>`}</section>`;
  }

  function suggestedCreators() {
    const query = state.search.trim().toLowerCase();
    const base = !query ? state.creators : state.creators.filter((item) => {
      const text = [profileName(item.profile), item.profile.username, item.profile.bio, item.creator.headline, ...(item.creator.games || []), ...(item.creator.languages || [])].join(" ").toLowerCase();
      return text.includes(query);
    });
    if (!state.player?.favorite_games?.length) return base;
    const prefs = new Set(state.player.favorite_games);
    return [...base].sort((a, b) => Number((b.creator.games || []).some((g) => prefs.has(g))) - Number((a.creator.games || []).some((g) => prefs.has(g))));
  }

  function renderPlayerHome() {
    const creators = suggestedCreators();
    const liveNow = creators.filter((item) => item.sessions[0]?.status === "live");
    const startingSoon = creators.filter((item) => item.sessions[0]?.status === "scheduled");
    const following = creators.filter((item) => state.follows.has(item.profile.id));
    const lead = liveNow[0] || creators[0];
    shell().innerHTML = `${top("Discover", "Creator-first Live Casino")}
      <div class="lc-product-stack">
        ${visualHero("Discover", lead ? "Find the person behind the table." : "Discover creators.", "Casino was built around games. LC is built around people.", visualImage(lead?.profile), lead ? `<button class="lc-product-btn" type="button" data-lc-open-creator="${safe(lead.profile.id)}">Open creator</button><button class="lc-product-btn secondary" type="button" data-lc-live="${safe(lead.sessions[0]?.id || "")}">Live now</button>` : "", "compact")}
        <section class="lc-product-card"><div class="lc-product-flow"><span>Discover</span><span>Creator</span><span>Follow</span><span>Live</span><span>Return</span></div></section>
        <form class="lc-product-card lc-product-form" data-lc-form="search"><input class="lc-product-input" name="search" maxlength="80" placeholder="Search creators, games, live rooms..." value="${safe(state.search)}"><div class="lc-product-actions"><button class="lc-product-btn secondary" type="submit">SEARCH</button>${state.search ? `<button class="lc-product-chip" type="button" data-lc-clear-search>Clear</button>` : ""}</div></form>
        <section class="lc-product-card"><div class="lc-product-section-head"><h2>Live now</h2><span>Join through operator</span></div>${compactCreatorRows(liveNow, "No live creators right now. Browse starting soon or follow creators for updates.")}</section>
        <section class="lc-product-card"><div class="lc-product-section-head"><h2>Following</h2><span>Return path</span></div>${compactCreatorRows(following, "No followed creators in this search. Open a creator and tap Follow.")}</section>
        <section class="lc-product-media-grid">${creators.slice(0, 3).map((item, index) => visualTile(visualImage(item.profile), sessionStatusLabel(item.sessions[0]), profileName(item.profile), (item.creator.games || []).join(", ") || "Live Casino", index === 0)).join("")}</section>
        <section class="lc-product-card"><div class="lc-product-section-head"><h2>Starting soon</h2><span>Save reminders</span></div>${compactCreatorRows(startingSoon, "No upcoming sessions in this view.")}</section>
        ${renderNotifications()}
        ${creators.slice(0, 4).map(creatorCard).join("")}
      </div>${tabs("home")}`;
  }

  function renderCreatorHome() {
    const c = state.creator;
    shell().innerHTML = `${top("Creator Home", "Profile, content, schedule")}
      <div class="lc-product-stack">
        ${visualHero("Creator Home", "From dealer to creator.", "A persistent identity turns a dealer into a persona players can discover, follow and return to across sessions.", visualImage(state.profile), "", "compact")}
        <section class="lc-product-card"><div class="lc-product-section-head"><h2>Identity becomes distribution</h2><span>Dealer → Creator</span></div><div class="lc-product-flow"><span>Dealer</span><span>Persona</span><span>Content</span><span>Audience</span><span>Live intent</span></div><span class="lc-product-note">Verification and affiliation approval are protected. Creator cannot self-verify.</span></section>
        <section class="lc-product-card"><div class="lc-product-stats"><div class="lc-product-stat"><b>${state.sessions.length}</b><span>Sessions</span></div><div class="lc-product-stat"><b>${state.posts.length}</b><span>Posts</span></div><div class="lc-product-stat"><b>${safe(c.profile_status || "draft")}</b><span>Status</span></div></div></section>
        <section class="lc-product-card"><h2>Create post</h2><form class="lc-product-form" data-lc-form="post"><textarea class="lc-product-textarea" name="body" maxlength="2000" placeholder="Share a table note or session update"></textarea><button class="lc-product-btn" type="submit">PUBLISH POST</button></form></section>
        <section class="lc-product-card"><h2>Add session</h2><form class="lc-product-form" data-lc-form="session"><input class="lc-product-input" name="title" maxlength="120" placeholder="Session title" value="Live table session"><select class="lc-product-select" name="game">${games.map((g) => `<option>${safe(g)}</option>`).join("")}</select><input class="lc-product-input" name="operator_name" maxlength="120" placeholder="Operator or studio (user claimed / optional)"><input class="lc-product-input" name="starts_at" type="datetime-local" required><button class="lc-product-btn" type="submit">ADD SESSION</button></form><span class="lc-product-note">Operator/provider context is user claimed or demo unless verified by partner integration.</span></section>
        <section class="lc-product-card"><h2>Public sessions</h2>${state.sessions.length ? state.sessions.map((s) => `<div class="lc-product-row"><div class="lc-product-row-main"><b>${safe(s.game)} · ${safe(s.title || "Live session")}</b><span>${safe(s.operator_name || "Operator to be confirmed")} · ${safe(sessionLine(s))}</span></div></div>`).join("") : `<div class="lc-product-empty">No sessions yet. Add your next Live table so followers know when to return.</div>`}</section>
        <section class="lc-product-card"><h2>Posts</h2>${state.posts.length ? state.posts.map((p) => `<div class="lc-product-row"><div class="lc-product-row-main"><b>${new Date(p.created_at).toLocaleString()}</b><span>${safe(p.body)}</span></div></div>`).join("") : `<div class="lc-product-empty">No posts yet. Share a short table update for followers.</div>`}</section>
        ${renderNotifications("No audience notifications yet. Followers, reactions and comments will appear here.")}
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
    const provider = subtype === "provider";
    shell().innerHTML = `${top(`${subtype} perspective`, "Concept evaluation")}
      <div class="lc-product-stack">
        ${visualHero(provider ? "Provider / ecosystem" : "Operator perspective", provider ? "Distribution can start with a person." : "The operator keeps the game. LC creates another path to it.", provider ? "Creators, rooms and content become an additional discovery surface around existing provider distribution." : "Creator → Audience → Live intent → Operator handoff → Return. LC adds discovery and continuity around licensed operator infrastructure.", provider ? visualMedia["demo-mia"] : visualMedia["demo-sofia"], "", "copy-top")}
        <section class="lc-product-card"><div class="lc-product-flow">${provider ? "<span>Game</span><span>Creator</span><span>Audience</span><span>Live intent</span><span>Operator</span>" : "<span>Creator</span><span>Audience</span><span>Live intent</span><span>Handoff</span><span>Return</span>"}</div></section>
        <section class="lc-product-media-grid">${state.creators.slice(0, 3).map((item, index) => visualTile(visualImage(item.profile), provider ? "Room discovery" : "Creator-led discovery", profileName(item.profile), sessionStatusLabel(item.sessions[0]), index === 0)).join("")}</section>
        <section class="lc-product-card"><h2>Partnership access</h2><p>Status: ${safe(request?.status || state.industry?.access_status || "not_requested")}</p><button class="lc-product-btn" type="button" data-lc-request-access="${safe(subtype)}">REQUEST PARTNERSHIP ACCESS</button><span class="lc-product-note">Request submission is persisted. Client cannot approve itself. No production integration is configured.</span></section>
      </div>${tabs("home")}`;
  }

  function renderCreatorDetail(id) {
    const item = state.creators.find((entry) => entry.profile.id === id);
    if (!item) return renderMissing("Creator unavailable", "This creator is not available in the current context.", "Back to Discover");
    state.selectedCreator = id;
    const post = item.posts[0];
    const next = item.sessions[0];
    shell().innerHTML = `${top(profileName(item.profile), "Creator profile")}
      <div class="lc-product-stack">
        ${visualHero(sessionStatusLabel(next), profileName(item.profile), `${item.creator.headline || "Live Casino creator"} · ${(item.creator.games || []).join(", ") || "Live Casino"}`, visualImage(item.profile), `<button class="lc-product-btn secondary ${state.follows.has(item.profile.id) ? "active" : ""}" type="button" data-lc-follow="${safe(item.profile.id)}">${state.follows.has(item.profile.id) ? "Following" : "Follow"}</button>${next ? `<button class="lc-product-btn" type="button" data-lc-live="${safe(next.id)}">Watch live</button>` : ""}`, "compact")}
        <section class="lc-product-media-grid">${item.posts.slice(0, 3).map((p, index) => visualTile(visualImage(item.profile), "Creator content", new Date(p.created_at).toLocaleString(), p.body, index === 0)).join("")}</section>
        <section class="lc-product-card"><h2>Sessions</h2>${item.sessions.length ? item.sessions.map((s) => `<div class="lc-product-row"><div class="lc-product-row-main"><b>${safe(s.game)} · ${safe(s.title || "Live session")}</b><span>${safe(s.operator_name || "Operator to be confirmed")} · ${safe(sessionLine(s))}</span></div><button class="lc-product-chip ${state.reminders.has(s.id) ? "active" : ""}" type="button" data-lc-reminder="${safe(s.id)}">${state.reminders.has(s.id) ? "Reminder set" : "Remind me"}</button></div>`).join("") : `<div class="lc-product-empty">No upcoming sessions. Follow the creator or return to Discover.</div>`}</section>
        ${post ? `<section class="lc-product-card"><form class="lc-product-form" data-lc-form="comment" data-post-id="${safe(post.id)}"><input class="lc-product-input" name="body" maxlength="1000" placeholder="Comment on latest post"><button class="lc-product-btn secondary" type="submit">COMMENT</button></form></section>` : ""}
      </div>${tabs("discover")}`;
  }

  function renderLive(sessionId) {
    const found = findSessionEntry(sessionId);
    const item = found?.entry;
    const session = found?.session;
    if (!item || !session) return renderMissing("Session unavailable", "This live context is no longer available.", "Back to Discover");
    state.selectedCreator = item.profile.id;
    state.selectedSession = session.id;
    shell().innerHTML = `${top("Live", "Watch mode before handoff")}
      <div class="lc-product-stack">
        ${visualHero(sessionStatusLabel(session), `${session.game} with ${profileName(item.profile)}`, "Watch mode with creator identity, social context and table intent.", visualImage(item.profile), `<button class="lc-product-btn" type="button" data-lc-product="handoff">Play with ${safe(profileName(item.profile))}</button><button class="lc-product-btn secondary ${state.follows.has(item.profile.id) ? "active" : ""}" type="button" data-lc-follow="${safe(item.profile.id)}">${state.follows.has(item.profile.id) ? "Following" : "Follow"}</button>`, "compact copy-top")}
        <section class="lc-product-card"><h2>Room chat</h2><div class="lc-product-row"><div class="lc-product-row-main"><b>James</b><span>Same table tomorrow?</span></div></div><div class="lc-product-row"><div class="lc-product-row-main"><b>${safe(profileName(item.profile))}</b><span>Yes - 20:00.</span></div></div></section>
        <section class="lc-product-card"><h2>LC owns the social layer</h2><p>Creator identity, follow relationship, session reminder and return context. The licensed operator controls gameplay.</p><span class="lc-product-note">${state.demo ? "Demo handoff only." : "Conceptual handoff only."} No confirmed operator/provider integration.</span></section>
      </div>${tabs("discover")}`;
  }

  function renderHandoff(sessionId = state.selectedSession) {
    const found = findSessionEntry(sessionId);
    if (!found) return renderMissing("Handoff unavailable", "The selected table context is not available.", "Back to Discover");
    const { entry, session } = found;
    state.selectedCreator = entry.profile.id;
    state.selectedSession = session.id;
    shell().innerHTML = `${top("Operator handoff", "Conceptual external flow")}
      <div class="lc-product-stack">
        ${visualHero(state.demo ? "Demo handoff" : "Conceptual handoff", "Continue with the operator.", "The licensed operator controls gameplay, wallet, KYC/AML, responsible gaming, bet acceptance and settlement.", visualImage(entry.profile), `<button class="lc-product-btn" type="button" data-lc-return-live="${safe(session.id)}">Return to LC App</button><button class="lc-product-btn secondary" type="button" data-lc-open-creator="${safe(entry.profile.id)}">Creator profile</button>`, "compact copy-top")}
        <section class="lc-product-card"><div class="lc-product-section-head"><h2>The relationship survives the handoff</h2><span>Context returns with the player</span></div><div class="lc-product-flow"><span>Creator</span><span>Intent</span><span>Operator</span><span>Play</span><span>Return</span></div><p style="margin-top:10px">The table is temporary. The relationship can continue.</p><span class="lc-product-note">No deposits, wagering, KYC, AML, wallet or settlement data passes through LC.</span></section><section class="lc-product-card lc-product-hero"><span class="lc-product-label">LC App</span><h1>Live Casino through people.</h1><p>Discovery, identity and return context around the licensed casino ecosystem.</p></section>
      </div>${tabs("discover")}`;
  }

  function renderMissing(title, body, action) {
    shell().innerHTML = `${top(title, "Product state")}
      <div class="lc-product-stack">
        <section class="lc-product-card lc-product-empty"><h2>${safe(title)}</h2><p>${safe(body)}</p><div class="lc-product-actions"><button class="lc-product-btn" type="button" data-lc-product="discover">${safe(action || "Back to Discover")}</button></div></section>
      </div>${tabs("discover")}`;
  }

  function renderAccount() {
    shell().innerHTML = `${top("Account", "Experience and profile")}
      <div class="lc-product-stack">
        <section class="lc-product-card"><div class="lc-product-row"><img src="${safe(avatar(state.profile))}" alt=""><div class="lc-product-row-main"><b>${safe(profileName(state.profile))}</b><span>${safe(state.profile.username ? "@" + state.profile.username : state.profile.id)}</span></div></div></section>
        <section class="lc-product-card"><h2>Current experience</h2><p>${safe(state.current?.persona || "none")} ${state.current?.industry_subtype ? "· " + safe(state.current.industry_subtype) : ""}</p><div class="lc-product-actions"><button class="lc-product-chip" type="button" data-lc-persona="player">Player</button><button class="lc-product-chip" type="button" data-lc-persona="creator">Creator</button><button class="lc-product-chip" type="button" data-lc-persona="industry">Industry</button></div></section>
        <section class="lc-product-card"><h2>Security role</h2><p>${safe(state.profile.role || "user")} stays separate from product persona.</p></section>
        <section class="lc-product-card"><h2>Session</h2><p>Sign out clears the local LC App session and returns to login.</p><div class="lc-product-actions">${state.demo ? `<button class="lc-product-btn secondary" type="button" data-lc-demo-exit>BACK TO OPENING</button>` : `<button class="lc-product-btn secondary" type="button" data-auth-route="logout">SIGN OUT</button>`}</div></section>
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
    const affiliationType = String(data.get("affiliation_type") || "unlisted");
    const currentVerification = state.creator?.verification_status || "not_requested";
    const currentAffiliationVerification = state.creator?.affiliation_verification_status || "unverified";
    const verificationStatus = currentVerification === "not_requested" ? "submitted" : currentVerification;
    const affiliationVerificationStatus = affiliationType !== "unlisted" && currentAffiliationVerification === "unverified"
      ? "submitted"
      : currentAffiliationVerification;
    const creatorApproved = verificationStatus === "verified";
    const { error } = await state.client.from("creator_profiles").upsert({
      user_id: state.profile.id,
      headline,
      games: selectedGames,
      languages: selectedLanguages,
      affiliation_type: affiliationType,
      affiliation_name: String(data.get("affiliation_name") || "").trim().slice(0, 120) || null,
      verification_status: verificationStatus,
      affiliation_verification_status: affiliationVerificationStatus,
      profile_status: creatorApproved ? "published" : "draft",
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
      if (type === "search") {
        state.search = String(new FormData(form).get("search") || "").trim().slice(0, 80);
        renderPlayerHome();
        return;
      }
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
    const demoReset = target.closest("[data-lc-demo-reset]");
    const demoSwitch = target.closest("[data-lc-demo-switch]");
    const returnLive = target.closest("[data-lc-return-live]");
    const clearSearch = target.closest("[data-lc-clear-search]");
    try {
      if (demoPersona) {
        event.preventDefault();
        return enterDemo(demoPersona.dataset.lcDemoPersona);
      }
      if (demoExit) {
        event.preventDefault();
        clear();
        resetDemoStore();
        if (window.location.hash !== "#/product") window.location.hash = "#/product";
        return renderDemoEntry();
      }
      if (demoSwitch && state.demo) {
        event.preventDefault();
        return renderDemoEntry();
      }
      if (demoReset && state.demo) {
        event.preventDefault();
        const personaValue = state.demoPersona || "player";
        setupDemo(personaValue, true);
        if (setProductHash(["demo", personaValue])) return;
        routeHome();
        toast("Demo reset");
        return;
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
        if (value === "handoff") {
          if (state.demo && state.selectedSession && setProductHash(["demo", state.demoPersona, "handoff", state.selectedSession])) return;
          return renderHandoff();
        }
        return routeHome();
      }
      if (clearSearch) {
        event.preventDefault();
        state.search = "";
        await loadCreators();
        return renderPlayerHome();
      }
      if (openCreator) {
        const id = openCreator.dataset.lcOpenCreator;
        if (state.demo && setProductHash(["demo", state.demoPersona, "creator", id])) return;
        return renderCreatorDetail(id);
      }
      if (live) {
        const id = live.dataset.lcLive;
        if (state.demo && setProductHash(["demo", state.demoPersona, "live", id])) return;
        return renderLive(id);
      }
      if (returnLive) {
        const id = returnLive.dataset.lcReturnLive;
        if (state.demo) {
          const found = findSessionEntry(id);
          if (found) addDemoNotification(`Returned from operator context to ${profileName(found.entry.profile)}. Follow, content and next session stayed connected.`, id);
        }
        if (state.demo && setProductHash(["demo", state.demoPersona, "live", id])) return;
        return renderLive(id);
      }
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
        if (state.demo) {
          refreshDemoData();
          return renderIndustryHome();
        }
        await loadState();
        return renderIndustryHome();
      }
    } catch (error) {
      toast(err(error));
      await loadState().catch(() => {});
      routeHome();
    }
  }

  async function mount({ client, profile, target = "product" }) {
    state.demo = false;
    state.demoPersona = null;
    state.client = client;
    state.profile = profile;
    state.ready = true;
    renderLoading();
    try {
      await loadState();
      renderProductTarget(productParts(target));
    } catch (error) {
      shell().innerHTML = `${top()}<section class="lc-product-card lc-product-empty"><h2>Product experience unavailable</h2><p>${safe(err(error))}</p><div class="lc-product-actions"><button class="lc-product-btn" type="button" data-lc-product="home">Retry</button></div></section>`;
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
    state.notifications = [];
    state.accessRequests = [];
    state.search = "";
    hide();
  }

  function mountDemoEntry() {
    state.ready = true;
    const parts = productParts();
    if (parts[0] === "demo" && validDemoPersonas.has(parts[1])) {
      const preserveState = state.demo && state.demoPersona === parts[1];
      if (!preserveState) clear();
      setupDemo(parts[1], !preserveState);
      return renderProductTarget(parts.slice(2));
    }
    clear();
    renderDemoEntry();
  }

  function renderProductTarget(parts = []) {
    if (parts[0] === "creator" && parts[1]) return renderCreatorDetail(decodeURIComponent(parts[1]));
    if (parts[0] === "live" && parts[1]) return renderLive(decodeURIComponent(parts[1]));
    if (parts[0] === "handoff" && parts[1]) return renderHandoff(decodeURIComponent(parts[1]));
    if (parts[0] && !["demo"].includes(parts[0])) return renderMissing("Route not found", "This product link is not available.", "Back to Discover");
    return routeHome();
  }

  document.addEventListener("submit", handleSubmit, true);
  document.addEventListener("click", handleClick, true);
  window.LCAppProduct = { mount, mountDemoEntry, clear };
})();
