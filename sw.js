const CACHE_NAME = "lc-app-investor-demo-v25";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./?app=1",
  "./02_OPEN_STATIC_PREVIEW.html",
  "./manifest.webmanifest",
  "./app-icon.svg",
  "./app-icon-512.png",
  "./app_prototype_assets/dealers/dealer_mia_avatar_v1.jpg",
  "./app_prototype_assets/dealers/dealer_sofia_avatar_v1.jpg",
  "./app_prototype_assets/dealers/dealer_marcus_avatar_v1.jpg",
  "./app_prototype_assets/dealers/dealer_lilit_avatar_v1.jpg",
  "./static_preview/LC_App_V2_Preview_Pack.pdf",
  "./static_preview/LC_App_V2_Preview_Contact_Sheet.png",
  "./static_preview/png/01_feed_discovery_mia_roulette.png",
  "./static_preview/png/02_watch_mode_mia_roulette.png",
  "./static_preview/png/03_roulette_gameplay_win_state.png",
  "./static_preview/png/04_blackjack_gameplay_win_state.png",
  "./static_preview/png/05_baccarat_gameplay_win_state.png",
  "./static_preview/png/06_dealer_profile_sofia.png",
  "./static_preview/png/07_operator_handoff.png",
  "./static_preview/png/08_operator_pilot_insights.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
        return undefined;
      })))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
