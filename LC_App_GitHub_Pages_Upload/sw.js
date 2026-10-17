const CACHE_NAME = "lc-app-investor-demo-v144";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./public-demo-bootstrap.js",
  "./public-product-v4.css",
  "./public-runtime-v4.js",
  "./legacy-preview.js",
  "./app_prototype_assets/dealers/dealer_marcus_avatar_v1-avatar-120.webp",
  "./app_prototype_assets/dealers/dealer_mia_avatar_v1-avatar-120.webp",
  "./app_prototype_assets/dealers/dealer_lilit_avatar_v1-avatar-120.webp",
  "./app_prototype_assets/dealers/dealer_sofia_avatar_v1-avatar-120.webp",
  "./app_prototype_assets/dealers/v2_polish/alex_baccarat-avatar-120.webp",
  "./app_prototype_assets/dealers/v2_polish/alex_portrait-avatar-120.webp",
  "./app_prototype_assets/dealers/dealer_sofia_avatar_v1.avif",
  "./social.js",
  "./app-product.js",
  "./product-shell-v4.css",
  "./social-feed-v4.css",
  "./creator-studio-v4.css",
  "./social-account-v4.css",
  "./social-journey-v4.css",
  "./business-console-v4.css",
  "./product-shell-v2.css",
  "./product-shell-v2.js",
  "./?app=1",
  "./manifest.webmanifest",
  "./app-icon.svg",
  "./app-icon-512.png",
  "./app_prototype_assets/dealers/dealer_mia_avatar_v1.jpg",
  "./app_prototype_assets/dealers/dealer_sofia_avatar_v1.jpg",
  "./app_prototype_assets/dealers/dealer_marcus_avatar_v1.jpg",
  "./app_prototype_assets/dealers/dealer_lilit_avatar_v1.jpg",
  "./app_prototype_assets/dealers/v2_polish/alex_baccarat.jpg",
  "./app_prototype_assets/dealers/v2_polish/alex_portrait.jpg",
  "./app_prototype_assets/dealers/v2_polish/marcus_community.jpg",
  "./app_prototype_assets/dealers/v2_polish/mia_roulette.jpg",
  "./app_prototype_assets/dealers/v2_polish/sofia_avatar_public.jpg",
  "./app_prototype_assets/dealers/v2_polish/sofia_discover_public.jpg",
  "./app_prototype_assets/dealers/v2_polish/sofia_profile_public.jpg",
  "./app_prototype_assets/dealers/v2_polish/sofia_welcome_public.jpg",
  "./app_prototype_assets/dealers/dealer_lilit_avatar_v1-avatar.webp",
  "./app_prototype_assets/dealers/dealer_marcus_avatar_v1-avatar.webp",
  "./app_prototype_assets/dealers/dealer_mia_avatar_v1-avatar.webp",
  "./app_prototype_assets/dealers/dealer_sofia_avatar_v1-avatar.webp",
  "./app_prototype_assets/dealers/v2_polish/alex_portrait-avatar.webp",
  "./app_prototype_assets/dealers/v2_polish/alex_baccarat-avatar.webp"
];

const rootWorker = typeof self.location.pathname === "string"
  && !self.location.pathname.endsWith("/LC_App_GitHub_Pages_Upload/sw.js");
const PRECACHE_FILES = rootWorker
  ? ["./", "./index.html", "./app-icon.svg", "./robots.txt", "./sitemap.xml",
    ...FILES_TO_CACHE.filter(file => file.startsWith("./app_prototype_assets/dealers/") && !file.includes("/v2_polish/") && !file.endsWith("-avatar.webp") && !file.endsWith("-avatar-120.webp") && !file.endsWith(".avif")), "./LC_App_GitHub_Pages_Upload/", "./LC_App_GitHub_Pages_Upload/index.html",
    ...FILES_TO_CACHE.filter(file => file !== "./" && file !== "./index.html")
      .map(file => "./LC_App_GitHub_Pages_Upload/" + file.slice(2))]
  : FILES_TO_CACHE;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => {
        if (key.startsWith("lc-app-investor-demo-") && key !== CACHE_NAME) return caches.delete(key);
        return undefined;
      })))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const scope = new URL(self.registration.scope);
  const relativePath = url.pathname.startsWith(scope.pathname)
    ? url.pathname.slice(scope.pathname.length) : null;
  const shellPath = relativePath === "" || relativePath === "index.html"
    || (rootWorker && ["LC_App_GitHub_Pages_Upload/", "LC_App_GitHub_Pages_Upload/index.html"].includes(relativePath));
  const staticAsset = PRECACHE_FILES.some((file) => new URL(file, scope).pathname === url.pathname)
    || (relativePath !== null && /^app_prototype_assets\/[A-Za-z0-9_./-]+\.(?:png|jpe?g|webp|svg)$/i.test(relativePath));
  const revisionedAsset = staticAsset && /\.(?:js|css)$/i.test(url.pathname) && /^\?v=\d+$/.test(url.search);
  const localeShellQuery = shellPath && [...url.searchParams].every(([key, value]) =>
    (key === "app" && value === "1") || (key === "demo" && value === "investor") || (key === "lang" && ["en", "ru"].includes(value)))
    && new Set([...url.searchParams.keys()]).size === [...url.searchParams.keys()].length;
  const safeQuery = revisionedAsset || !url.search || localeShellQuery;
  if (!staticAsset || !safeQuery || event.request.headers.has("authorization")
      || event.request.cache === "no-store") return;

  const cacheable = (response) => response.ok && !response.redirected
    && !/(?:no-store|private)/i.test(response.headers.get("cache-control") || "")
    && !(response.headers.get("vary") || "").split(",")
      .some((header) => /^(?:\*|authorization|cookie)$/i.test(header.trim()));

  const acceptsHtml = event.request.headers.get("accept")?.includes("text/html");
  const currentAsset = acceptsHtml || /\.(?:html|js|css)$/i.test(url.pathname);
  if (currentAsset) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (cacheable(response)) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || (revisionedAsset ? caches.match(url.origin + url.pathname) : acceptsHtml ? caches.match("./index.html") : undefined)))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (cacheable(response)) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)));
        }
        return response;
      });
    })
  );
});
