'use strict';

// Set this to the final site root when publishing, including any repository path.
window.RGE_SITE_CONFIG = Object.freeze({ siteUrl: '' });

(() => {
  if (!/^https?:$/.test(location.protocol)) return;
  const { root, path, canonical, social } = document.body.dataset;
  let base = new URL(root, location.href);
  try {
    const configured = window.RGE_SITE_CONFIG.siteUrl.trim();
    if (configured) {
      const url = new URL(configured);
      if (/^https?:$/.test(url.protocol) && !url.username && !url.password) {
        url.search = '';
        url.hash = '';
        if (!url.pathname.endsWith('/')) url.pathname += '/';
        base = url;
      }
    }
  } catch {
    // Use the current site root if the optional URL is invalid.
  }
  const canonicalLink = document.createElement('link');
  canonicalLink.rel = 'canonical';
  canonicalLink.href = new URL(canonical ?? path, base).href;
  document.head.append(canonicalLink);

  const graphUrl = document.createElement('meta');
  graphUrl.setAttribute('property', 'og:url');
  graphUrl.content = canonicalLink.href;
  document.head.append(graphUrl);
  document.querySelector('meta[property="og:image"]').content = new URL(social, base).href;

  const organization = document.querySelector('script[type="application/ld+json"]');
  if (organization) {
    const data = JSON.parse(organization.textContent);
    data.url = base.href;
    organization.textContent = JSON.stringify(data);
  }
})();
