(() => {
  "use strict";
  if (window.LC_APP_MODE !== "public_demo") return;
  let mounted = false;
  const mount = () => {
    document.documentElement.classList.remove("lc-auth-booting");
    document.documentElement.classList.add("lc-auth-ready");
    window.LCAppProduct?.mountDemoEntry();
    mounted = Boolean(window.LCAppProduct?.mountDemoEntry);
  };
  for (const event of ["hashchange", "popstate"]) window.addEventListener(event, mount);
  window.addEventListener("load", () => { if (!mounted) mount(); });
  mount();
})();
