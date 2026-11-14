'use strict';

// OPSIONAL: setelah GitHub Pages aktif, isi alamat website lengkap di sini.
// Contoh: siteUrl: 'https://USERNAME.github.io/royal-grace-exportindo/'
// Jika dikosongkan, alamat akan mengikuti lokasi website yang sedang dibuka.
window.RGE_SITE_CONFIG = Object.freeze({
  siteUrl: ''
});

(() => {
  if (!/^https?:$/.test(window.location.protocol)) return;

  let base = new URL('./', window.location.href);
  const configured = window.RGE_SITE_CONFIG.siteUrl.trim();
  if (configured) {
    try {
      const parsed = new URL(configured);
      if (/^https?:$/.test(parsed.protocol) && !parsed.username && !parsed.password) {
        parsed.search = '';
        parsed.hash = '';
        if (!parsed.pathname.endsWith('/')) parsed.pathname += '/';
        base = parsed;
      }
    } catch {
      // Invalid optional configuration falls back to the current website URL.
    }
  }

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = base.href;

  const setOpenGraph = (property, content) => {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.content = content;
  };
  setOpenGraph('og:url', base.href);
  setOpenGraph('og:image', new URL('assets/collection.webp', base).href);

  const structured = document.querySelector('script[type="application/ld+json"]');
  if (structured) {
    try {
      const data = JSON.parse(structured.textContent);
      data.url = base.href;
      structured.textContent = JSON.stringify(data);
    } catch {
      // Keep existing structured metadata when it cannot be parsed.
    }
  }
})();
