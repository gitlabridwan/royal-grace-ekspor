import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// The catalog is also loaded as a regular script by the browser.
globalThis.window = {};
await import('./catalog-data.js');
const { company, products, productPages, videos, services, articles } = window.RGE_DATA;

const name = 'PT Royal Grace Exportindo';
const phone = `https://wa.me/${company.whatsapp}`;
const email = `mailto:${company.email}`;
const profile = 'assets/royal-grace-company-profile.pdf';
const mark = 'assets/editorial/royal-grace-mark.webp';
const landscape = 'assets/editorial/rice-terraces.webp';
const escape = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);
const icon = key => `<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-${key}"/></svg>`;
const nicePath = (product, base) => `${base}products/${productPages[product.id].slug}/`;
const photo = (base, path, alt, attributes = 'loading="lazy" decoding="async"') =>
  `<img src="${base}${path}" alt="${escape(alt)}" ${attributes}>`;
const editorial = (base, file, alt, attributes) => photo(base, `assets/editorial/${file}.webp`, alt, attributes);
const quote = (base, product) => `${base}contact/${product ? `?product=${encodeURIComponent(product.id)}` : ''}#inquiry`;
const action = (href, label, style = '', graphic = '') =>
  `<a class="btn ${style}" href="${href}">${label}${graphic ? icon(graphic) : ''}</a>`;
const options = [['all', 'All products'], ['agri', 'Food &amp; Agriculture'], ['industrial', 'Industrial'], ['craft', 'Natural Fibers']];
const category = { agri: 'Food & Agriculture', industrial: 'Industrial', craft: 'Natural Fibers' };
const icons = {
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6.5h14M5 17.5h14"/>',
  leaf: '<path d="M5 20c1-7 6-12 13-15M5 15C0 7 9 3 21 3c0 11-6 17-13 14"/>',
  box: '<path d="m3 7 9-5 9 5v11l-9 5-9-5V7Zm0 0 9 5 9-5M12 12v11M8 4l9 5v5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  shield: '<path d="m12 2 8 4v6c0 4-4 8-8 10-4-2-8-6-8-10V6l8-4Zm-4 10 3 3 5-6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  document: '<path d="M14 2H5v20h14V7l-5-5Zm0 0v5h5M8 11h8M8 15h8M8 18h5"/>',
  chat: '<path d="M21 12a9 9 0 0 1-13 8l-5 1 1-5A9 9 0 1 1 21 12Z"/><path d="M7 10h10M7 14h7"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  close: '<path d="m5 5 14 14M19 5 5 19"/>',
  flask: '<path d="M9 3h6M10 3v7l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3M7 15h10"/>',
  ship: '<path d="M4 16l-2-5 10-3 10 3-2 5M5 10V5h14v5M12 1v4M3 19c2 0 2-1 4-1s3 1 5 1 3-1 5-1 2 1 4 1"/>',
  play: '<path d="m8 4 12 8-12 8V4Z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 5 10 8L22 5"/>',
  phone: '<path d="M6 3h4l1 5-3 2a15 15 0 0 0 6 6l2-3 5 1v4c0 2-2 3-4 3A19 19 0 0 1 3 7c0-2 1-4 3-4Z"/>'
};

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" class="sprite" aria-hidden="true"><defs>
${Object.entries(icons).map(([key, paths]) => `  <symbol id="i-${key}" viewBox="0 0 24 24">${paths}</symbol>`).join('\n')}
</defs></svg>`;

function brand(base, footer = false) {
  return `<a class="brand${footer ? ' footer-brand' : ''}" href="${base}" aria-label="${name} home">
    ${photo(base, mark, '', 'width="62" height="72"')}
    <span><strong>${name}</strong><span class="brand-line">${footer ? 'Royal in Quality. Graceful in Service.' : 'Export · Import · Commodities'}</span></span>
  </a>`;
}

function header(base, page) {
  const nav = [
    ['home', base, 'Home'], ['about', `${base}about/`, 'About'], ['products', `${base}products/`, 'Products'],
    ['why', `${base}#why`, 'Why Us'], ['export', `${base}export/`, 'Export'], ['contact', `${base}contact/`, 'Contact']
  ];
  return `<header class="site-header">
    <div class="container header-inner">
      ${brand(base)}
      <nav class="site-nav" id="siteNav" aria-label="Main navigation">
        ${nav.map(([key, href, label]) => `<a href="${href}"${page === key ? ' aria-current="page"' : ''}>${label}</a>`).join('\n        ')}
      </nav>
      ${action(quote(base), 'Get Quote', 'btn-green header-quote', 'arrow')}
      <button id="menuToggle" class="icon-button menu-toggle" type="button" aria-expanded="false" aria-controls="siteNav" aria-label="Open navigation" hidden>${icon('menu')}${icon('close')}</button>
    </div>
  </header>`;
}

function footer(base, short = false) {
  return `<footer class="site-footer">
    ${short ? '' : `<div class="container footer-top">
      <div class="footer-identity">${brand(base, true)}
        <p>Indonesian natural commodities and industrial materials for international buyers.</p>
      </div>
      <div class="footer-column"><h2>Office</h2><p>${icon('pin')}${company.location}</p>
        <a href="${base}${profile}" download>${icon('download')}Company Profile</a>
        <button type="button" class="text-link" id="helpLauncher" aria-expanded="false" aria-controls="helpPanel">${icon('chat')}Export Guide</button>
      </div>
      <div class="footer-column"><h2>Contact Us</h2>
        <a href="${phone}" target="_blank" rel="noopener">${icon('phone')}WhatsApp ${company.phoneDisplay}</a>
        <a href="${email}">${icon('mail')}${company.email}</a>
      </div>
    </div>`}
    <div class="footer-bottom">
      <div class="container"><span>© <span id="year">${new Date().getUTCFullYear()}</span> ${name}</span>
        <nav aria-label="Footer"><button type="button" data-policy="privacy">Privacy Policy</button><button type="button" data-policy="terms">Terms of Use</button>${short ? `<a href="${base}export/#quality">Quality &amp; Documentation</a><a href="${email}">${company.email}</a>` : ''}</nav>
      </div>
    </div>
  </footer>`;
}

function sharedControls(base, shortFooter) {
  return `
  <aside id="shortlistBar" class="shortlist-bar" aria-label="Selected products" hidden>
    <strong id="shortlistTitle"></strong><button id="clearShortlist" type="button" class="text-link">Clear</button>${action(quote(base), 'Continue to RFQ', 'btn-gold', 'arrow')}
  </aside>
  ${shortFooter ? '' : `<aside id="helpPanel" class="help-panel" aria-labelledby="helpHeading" hidden>
    <div class="help-heading"><h2 id="helpHeading">Export Guide</h2><button id="closeHelp" class="icon-button" type="button" aria-label="Close export guide">${icon('close')}</button></div>
    <div id="helpQuestions"></div><p id="helpAnswer" aria-live="polite" hidden></p>
    <a class="text-link" href="${base}contact/">Contact the team ${icon('arrow')}</a>
  </aside>`}
  <dialog id="articleDialog" class="dialog article-dialog" aria-labelledby="articleTitle">
    <button class="icon-button dialog-close" type="button" data-close aria-label="Close article">${icon('close')}</button><div id="articleContent"></div>
  </dialog>
  <div id="toast" class="toast" role="status"></div>`;
}

function shell({ path, base, page, title, description, main, social = landscape, shortFooter = false }) {
  const schema = page === 'home' ? `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Organization', name, email: company.email,
    telephone: `+${company.whatsapp}`, address: { '@type': 'PostalAddress', addressLocality: 'Jakarta', addressCountry: 'ID' },
    description, founder: { '@type': 'Person', name: 'Meyliana Wiranto' }
  })}</script>` : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#163b2c">
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(description)}">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description)}">
  <meta property="og:image" content="${base}${social}">
  <meta property="og:type" content="website">
  <link rel="icon" href="${base}${mark}" type="image/webp">
  <link rel="manifest" href="${base}manifest.webmanifest">
  <link rel="stylesheet" href="${base}style.css">
  ${schema}
  <script src="${base}site-config.js" defer></script>
  <script src="${base}catalog-data.js" defer></script>
  <script src="${base}app.js" defer></script>
</head>
<body class="page-${page}" data-root="${base}" data-path="${path}" data-social="${social}">
  <a href="#main" class="skip">Skip to content</a>
  ${header(base, page === 'product' ? 'products' : page)}
  <main id="main">
${main}
  </main>
  ${footer(base, shortFooter)}
  ${sharedControls(base, shortFooter)}
  ${sprite}
</body>
</html>
`;
}

function scenery(base, { title, description, actions = '', variant = '', id = '', tag = 'section' }) {
  return `<${tag} class="scenery ${variant}"${id ? ` id="${id}"` : ''}>
    ${editorial(base, 'rice-terraces', '', 'width="1900" height="706" fetchpriority="high"')}
    ${variant === 'home-hero' ? '<div class="hero-waves" aria-hidden="true"></div>' : ''}
    <div class="container scenery-content"><h1>${title}</h1><p>${description}</p>${actions ? `<div class="actions">${actions}</div>` : ''}</div>
  </${tag}>`;
}

const titles = {
  home: `${name} | Premium Indonesian Commodities`, about: `About Us | ${name}`,
  products: `Indonesian Natural Commodities | ${name}`, export: `Export Services | ${name}`,
  contact: `Contact & Request a Quote | ${name}`
};
const descriptions = {
  home: 'Source Indonesian vanilla, robusta coffee, activated carbon, sulfur, palm brooms and candlenut from PT Royal Grace Exportindo.',
  about: 'Learn how PT Royal Grace Exportindo works with Indonesian farmers and producers to source, select and prepare commodities for export.',
  products: 'Browse six Indonesian commodities. Compare product applications, photographs, specifications and packing options.',
  export: 'Discuss sourcing, samples, packaging, export documentation and shipment coordination with PT Royal Grace Exportindo.',
  contact: 'Contact PT Royal Grace Exportindo in Jakarta, Indonesia, or prepare a quotation request with your product and shipment requirements.'
};

function home(base) {
  return `  ${scenery(base, {
    title: 'Bridging Nations, Enriching Lives',
    description: 'Premium Indonesian Commodities. From Indonesia to the World.',
    variant: 'home-hero', id: 'home',
    actions: action(`${base}products/`, 'Explore Products', 'btn-gold', 'arrow') + action(`${base}contact/`, 'Contact Us', 'btn-light', 'chat')
  })}
  <section class="trust-strip" aria-label="Sourcing priorities">
    <ul class="container"><li>${icon('leaf')} Sourced in Indonesia</li><li>${icon('shield')} Batch Quality &amp; Testing</li><li>${icon('globe')} Global Export Support</li></ul>
  </section>
  <section class="home-portfolio container" aria-labelledby="homeProducts">
    <div class="section-heading center"><h2 id="homeProducts">Our Products</h2><p>From Indonesian farms and producers to buyers around the world.</p></div>
    <div class="home-columns">
      <div class="mini-grid">
        ${products.map(p => {
          const view = productPages[p.id];
          return `<a class="mini-card" href="${nicePath(p, base)}">
            <div class="catalog-thumb">${editorial(base, `card-${p.id}`, '')}</div>
            <h3>${view.label}</h3><span>View details ${icon('arrow')}</span>
          </a>`;
        }).join('\n        ')}
      </div>
      <section class="why-panel" id="why" aria-labelledby="whyHeading">
        <h2 id="whyHeading">Why Choose Us</h2>
        <ul>
          <li>${icon('globe')}<div><h3>Global Export</h3><p>Packaging, documents and shipment coordination.</p></div></li>
          <li>${icon('shield')}<div><h3>Quality Selection</h3><p>Samples, agreed specifications and batch testing.</p></div></li>
          <li>${icon('leaf')}<div><h3>Local Sourcing</h3><p>We work with Indonesian farmers and producers.</p></div></li>
        </ul>
        <a class="text-link" href="${base}export/">View export services ${icon('arrow')}</a>
      </section>
      <aside class="home-note" aria-labelledby="homeNoteHeading">
        <p class="note-motif" aria-hidden="true">✧</p>
        <h2 id="homeNoteHeading">Our Commitment</h2>
        <blockquote>Royal in Quality.<br>Graceful in Service.</blockquote>
        <p>We help buyers agree on product quality, packaging and documents before shipment.</p>
        <a class="text-link" href="${base}about/">About Royal Grace ${icon('arrow')}</a>
      </aside>
    </div>
  </section>`;
}

function catalog(base) {
  return `  ${scenery(base, {
    title: 'Our Products<br>Premium Natural Commodities',
    description: 'Indonesian ingredients, industrial materials and natural fibers for export.', variant: 'catalog-hero'
  })}
  <section class="catalog container" id="products" aria-labelledby="catalogHeading">
    <div class="catalog-toolbar">
      <div><h2 id="catalogHeading">Products Overview</h2><p id="productCount" role="status">Showing all ${products.length} products</p></div>
      <div class="catalog-controls" id="catalogControls" hidden>
        <div class="filter-group" role="group" aria-label="Product category">
          ${options.map(([key, label]) => `<button type="button" data-filter="${key}" aria-pressed="${key === 'all'}">${label}</button>`).join('')}
        </div>
        <div class="search">${icon('search')}<input id="productSearch" type="search" placeholder="Search products" aria-label="Search products"></div>
      </div>
    </div>
    <div class="product-grid" id="productGrid">
      ${products.map(p => {
        const view = productPages[p.id];
        return `<article class="catalog-card" data-product="${p.id}">
          <a href="${nicePath(p, base)}" class="catalog-thumb" aria-label="View ${escape(view.label)}">${editorial(base, `card-${p.id}`, '')}</a>
          <h3><a href="${nicePath(p, base)}">${view.label}</a></h3><p>${view.summary}</p>
          <div class="card-actions">${action(nicePath(p, base), 'View Details', 'btn-outline')}${action(quote(base, p), 'Get Quote', 'btn-gold')}</div>
        </article>`;
      }).join('\n      ')}
    </div>
    <div id="noResults" class="empty-state" hidden><h3>No products found</h3><p>Try a different keyword or category.</p><button id="resetSearch" type="button" class="btn btn-outline">Reset search</button></div>
  </section>`;
}

function about(base) {
  return `  ${scenery(base, {
    title: 'About Us',
    description: 'Connecting Indonesian farmers and producers with buyers around the world.',
    variant: 'about-hero',
    actions: action('#our-story', 'Our Story', 'btn-gold') + `<a class="btn btn-light" href="${base}${profile}" download>${icon('download')}Download Company Profile</a>`
  })}
  <section class="about container" id="our-story" aria-labelledby="storyHeading">
    <div class="story-grid">
      <div><h2 id="storyHeading">Our <span class="gold-text">Story</span></h2>
        <p>${name} works with Indonesian farmers and producers to source natural commodities for international buyers. Our portfolio includes food ingredients, industrial materials and natural palm fibers.</p>
        <p>We work with buyers to define what they need, how they will evaluate the product and how it should be packed and prepared for export.</p>
      </div>
      <figure class="story-image">${editorial(base, 'terraces-about', 'Green rice terraces in an Indonesian highland valley', 'width="309" height="150"')}
        <figcaption>${photo(base, 'assets/founder.webp', '', 'width="38" height="38" loading="lazy"')}<span><strong>Meyliana Wiranto</strong>Founder &amp; Owner</span></figcaption>
      </figure>
    </div>
    <div class="about-columns">
      <div class="value-tiles" aria-label="Vision and values">
        <article class="value-tile featured">${icon('globe')}<h3>Vision</h3><p>To be a trusted exporter of Indonesian natural and industrial products.</p></article>
        <article class="value-tile featured">${icon('leaf')}<h3>Mission</h3><p>Source and select products with local producers and support buyers through export.</p></article>
        <article class="value-tile">${icon('shield')}<h3>Quality</h3><p>Agree the specification and confirm quality through selection, samples and batch testing.</p></article>
        <article class="value-tile">${icon('ship')}<h3>Sustainability</h3><p>Build lasting working relationships with farmers and producers in Indonesia.</p></article>
      </div>
      <figure class="about-map"><h3>From Indonesia to the World</h3>${editorial(base, 'indonesia-map', 'World map with Indonesia highlighted and Jakarta marked', 'width="1000" height="450" loading="lazy"')}<figcaption>${icon('pin')} ${company.location}</figcaption></figure>
      <section class="journey" aria-labelledby="journeyHeading"><h3 id="journeyHeading">Our Supply Chain</h3>
        <ul><li>${icon('check')}<span><strong>Indonesian Origins</strong>Commodities sourced through local farmers and producers.</span></li>
          <li>${icon('check')}<span><strong>Product Selection</strong>Grades and samples discussed for the intended use.</span></li>
          <li>${icon('check')}<span><strong>Export Preparation</strong>Packing, documentation and shipment planned with buyers.</span></li></ul>
      </section>
    </div>
  </section>
  <div class="about-band"><div class="container"><strong>Local Sourcing</strong><span></span><strong>Agreed Quality</strong><span></span><strong>Export Coordination</strong></div></div>`;
}

function productDetail(base, p) {
  const view = productPages[p.id];
  return `  <nav class="breadcrumbs" aria-label="Breadcrumb"><div class="container">
    <a href="${base}">Home</a>${icon('chevron')}<a href="${base}products/">Products</a>${icon('chevron')}<span aria-current="page">${escape(view.label)}</span>
  </div></nav>
  <header class="product-hero hero-${p.id}${view.feature ? ' has-feature' : ''}">
    ${editorial(base, view.hero, '', 'fetchpriority="high"')}
    <div class="container product-hero-inner">
      <div class="product-hero-copy">
        <p class="product-category">${escape(category[p.category])}</p>
        <h1>${escape(view.title)}</h1><p>${escape(view.subtitle)}</p>
        <div class="actions">${action(quote(base, p), 'Get Quote', 'btn-gold', 'arrow')}<a class="btn btn-light" href="${base}assets/specs/${view.slug}.pdf" download>${icon('download')}Download Spec Sheet</a></div>
        <p class="product-highlight">${icon('check')}${escape(view.highlight)}</p>
      </div>
      ${view.feature ? `<figure class="hero-feature">${editorial(base, ...view.feature, 'decoding="async"')}</figure>` : ''}
    </div>
  </header>
  <div class="container product-content ${p.id}-content">
    <section class="product-block" id="overview"><h2>Overview</h2><p>${escape(p.story[0])}</p></section>
    <section class="product-block" id="specifications"><h2>Specifications</h2>
      <table class="spec-table"><thead><tr><th scope="col">Parameter</th><th scope="col">Specification</th></tr></thead>
        <tbody>${p.specs.en.map(([key, value]) => `<tr><th scope="row">${escape(key)}</th><td>${escape(value)}</td></tr>`).join('')}</tbody>
      </table><p class="spec-note">${escape(p.note.en)}</p>
    </section>
    <section class="product-block" id="applications"><h2>Applications</h2><ul class="application-list">${p.applications.map(application => `<li>${icon('check')}${escape(application)}</li>`).join('')}</ul></section>
    <section class="product-block" id="benefits"><h2>Benefits</h2>
      <div class="benefit-grid">${view.benefits.map(([symbol, heading, text]) => `<article class="benefit">${icon(symbol)}<div><h3>${escape(heading)}</h3><p>${escape(text)}</p></div></article>`).join('')}</div>
    </section>
    <section class="product-block" id="gallery"><h2>Gallery</h2>
      ${gallery(base, view.gallery)}
    </section>
  </div>
  <section class="product-quote" aria-label="Request a product quote">
    <div class="container"><div><h2>Ready to Order ${escape(view.label)}?</h2><p>Ask about pricing, samples, packing and shipping.</p></div>${action(quote(base, p), 'Get Quote', 'btn-gold', 'arrow')}</div>
  </section>
  <div class="container buyer-extras">
    <details>
      <summary>Packaging &amp; Buyer Checklist</summary>
      <div class="buyer-content"><div><h2>Packaging &amp; Preparation</h2><p>${escape(p.packing)}</p><p>${escape(p.story[1])}</p></div>
      <div><h2>What to Include in Your Inquiry</h2><ul>${p.questions.map(question => `<li>${escape(question)}</li>`).join('')}</ul></div>
      <div><h2>From Requirements to Selection</h2><ol>${p.steps.map(step => `<li>${escape(step)}</li>`).join('')}</ol></div></div>
    </details>
    <details id="media"><summary>More Photos &amp; Videos <small>${p.videoIds.length} ${p.videoIds.length === 1 ? 'video' : 'videos'}</small></summary>
      ${gallery(base, p.photos)}
      <div class="video-grid product-videos">${p.videoIds.map(id => videoCard(base, videos.find(video => video.id === id))).join('')}</div>
    </details>
    <a class="text-link" href="${base}products/">${icon('chevron')} All Products</a>
  </div>
  <dialog id="galleryDialog" class="dialog gallery-dialog" aria-labelledby="galleryTitle">
    <div class="gallery-dialog-head"><h2 id="galleryTitle">Product Gallery</h2><button class="icon-button dialog-close" type="button" data-close aria-label="Close gallery">${icon('close')}</button></div>
    <figure><img id="galleryPhoto" alt=""><figcaption id="galleryCaption" aria-live="polite"></figcaption></figure>
    <div class="gallery-controls"><button type="button" id="galleryPrev" class="btn btn-outline">Previous</button><span id="galleryPosition"></span><button type="button" id="galleryNext" class="btn btn-outline">Next</button></div>
  </dialog>`;
}

function gallery(base, images) {
  return `<div class="photo-grid" data-gallery>
    ${images.map(([image, caption]) => `<figure><a href="${base}${image}" data-image aria-label="Enlarge ${escape(caption)}">${photo(base, image, caption)}</a><figcaption>${escape(caption)}</figcaption></figure>`).join('')}
  </div>`;
}

function videoCard(base, video, linkToProduct = false) {
  const product = products.find(p => p.id === video.product);
  const isPresentation = video.type === 'photo-presentation';
  const note = video.product === 'production' ? 'Ask the team for details about the process shown in this clip.' : '';
  return `<figure class="video-card" data-video-product="${video.product}">
    <video controls playsinline preload="none" poster="${base}${video.poster}" aria-label="${escape(video.title)}">
      <source src="${base}${video.src}" type="video/mp4"><track kind="descriptions" src="${base}${video.track}" srclang="en" label="English visual notes">
      <a href="${base}${video.src}">Open the video file</a>
    </video>
    <figcaption><p class="media-label">${isPresentation ? 'Photo presentation' : 'Supplied video'}</p><h3>${escape(video.title)}</h3>
      ${note ? `<p>${note}</p>` : ''}${linkToProduct && product ? `<a class="text-link" href="${nicePath(product, base)}#media">See product details ${icon('arrow')}</a>` : ''}</figcaption>
  </figure>`;
}

function exportPage(base) {
  return `  ${scenery(base, { title: 'Export Services', description: 'Sourcing, samples, packaging and shipment coordination for your order.', variant: 'inner-hero', actions: action(quote(base), 'Get Quote', 'btn-gold', 'arrow') })}
  <div class="container export-content">
    <nav class="section-nav" aria-label="Export page sections"><a href="#solutions">Services</a><a href="#quality">Quality &amp; Documentation</a><a href="#media">Videos</a><a href="#insights">Buyer Guides</a><a href="#faq">FAQ</a></nav>
    <section id="solutions" class="export-section"><h2>Sourcing &amp; Export Support</h2><div class="services-grid">
      ${services.map(service => `<article>${icon(service.icon)}<h3>${escape(service.title)}</h3><p>${escape(service.text)}</p></article>`).join('')}
    </div></section>
    <section id="quality" class="export-section"><h2>Quality &amp; Documentation</h2>
      <div class="quality-grid">
        <article><h3>Quality by Batch</h3><p>We can help arrange samples and testing. Agree on the product specifications and ask for the batch Certificate of Analysis before ordering.</p>
          <dl class="sample-results"><div><dt>Sulfur sample · SUCOFINDO</dt><dd>99.92% total sulfur</dd></div><div><dt>Activated carbon sample · PT Carsurin Cikarang</dt><dd>1,145 mg/g iodine number</dd></div></dl>
        </article>
        <article><h3>Export Documentation</h3><p>Ask the team which documents apply to your commodity and destination.</p>
          <ul><li>Certificate of Analysis (COA) and Certificate of Origin (COO)</li><li>Phytosanitary, fumigation and safety documentation where applicable</li><li>Commercial invoice, packing list and Bill of Lading</li></ul>
        </article>
      </div>
    </section>
    <section id="media" class="export-section"><h2>Product Videos</h2>
      <div class="filter-group media-filters" id="mediaFilters" role="group" aria-label="Filter product videos" hidden>
        <button type="button" data-media-filter="all" aria-pressed="true">All videos</button>${products.map(p => `<button type="button" data-media-filter="${p.id}" aria-pressed="false">${productPages[p.id].label}</button>`).join('')}
      </div>
      <div class="video-grid">${videos.map(video => videoCard(base, video, true)).join('')}</div>
    </section>
    <section id="insights" class="export-section"><h2>Buyer Guides</h2><div class="insights-grid">
      ${articles.map(article => `<article>${photo(base, `assets/${article.image}.webp`, '')}<div><h3>${escape(article.title)}</h3><button type="button" class="text-link" data-article="${article.id}">Read the guide ${icon('arrow')}</button></div></article>`).join('')}
    </div></section>
    <section id="faq" class="export-section"><h2>Frequently Asked Questions</h2><div id="faqList" class="faq-list"></div></section>
  </div>`;
}

function contact(base) {
  return `  ${scenery(base, { title: 'Contact Us', description: 'Get in touch for pricing, samples, packaging and export inquiries.', variant: 'inner-hero' })}
  <div class="container contact-content" id="contact">
    <div class="contact-links">
      <a href="${phone}" target="_blank" rel="noopener">${icon('phone')}<span><strong>WhatsApp</strong>${company.phoneDisplay}</span></a>
      <a href="${email}">${icon('mail')}<span><strong>Email</strong>${company.email}</span></a>
      <div>${icon('pin')}<span><strong>Head Office</strong>${company.location}</span></div>
    </div>
    <section id="inquiry" class="inquiry-section" aria-labelledby="inquiryHeading">
      <div class="inquiry-intro"><h2 id="inquiryHeading">Request a Quote</h2><p>Share the products you need, your quantity and where the shipment should go. Review the request before sending it by email or WhatsApp.</p><a href="${base}products/" class="text-link">Browse all products ${icon('arrow')}</a></div>
      <form id="inquiryForm">
        <fieldset><legend>Commodities of interest</legend><div id="rfqProducts" class="rfq-products">
          ${products.map(p => `<label class="rfq-option"><input type="checkbox" name="product" value="${p.id}"><span>${productPages[p.id].label}</span></label>`).join('')}
        </div><p id="productError" class="field-error" role="alert" hidden>Select at least one product.</p></fieldset>
        <fieldset><legend>Your sourcing requirements</legend>
          <div class="form-grid">
            <label>Full name *<input name="name" required autocomplete="name" maxlength="100"></label>
            <label>Company *<input name="company" required autocomplete="organization" maxlength="150"></label>
            <label>Business email *<input name="email" required type="email" autocomplete="email" maxlength="200" placeholder="you@company.com"></label>
            <label>Destination country *<input name="country" required autocomplete="country-name" maxlength="100"></label>
            <div><label for="quantity">Indicative total quantity *</label><div class="input-unit"><input id="quantity" name="quantity" type="number" min="0.01" step="0.01" required><select name="unit" aria-label="Quantity unit"><option value="MT">MT</option><option value="kg">kg</option><option value="container">Container</option><option value="units">Units</option></select></div></div>
            <label>Shipping preference<select name="incoterm"><option value="To be discussed">Discuss with the team</option><option>FOB</option><option>CIF</option><option>CFR</option><option>EXW</option></select></label>
            <label class="full">Destination port or city<input name="destination" maxlength="150"></label>
            <label class="full">Grade, quantity per product, packing or other requirements<textarea name="notes" rows="3" maxlength="2500"></textarea></label>
          </div>
        </fieldset>
        <label class="consent"><input name="consent" type="checkbox" required><span>I understand that this is a draft request and that the company will confirm its commercial terms separately.</span></label>
        <button class="btn btn-green" type="submit">Create RFQ Summary ${icon('arrow')}</button>
        <noscript><p>Enable JavaScript to prepare a summary, or use the email and WhatsApp links above.</p></noscript>
      </form>
    </section>
  </div>
  <dialog id="summaryDialog" class="dialog summary-dialog" aria-labelledby="summaryTitle">
    <button class="icon-button dialog-close" type="button" data-close aria-label="Close RFQ summary">${icon('close')}</button>
    <h2 id="summaryTitle">Review Your Inquiry</h2><p>Choose how to share this draft with our team.</p><pre id="rfqSummary"></pre>
    <div class="summary-actions"><button id="downloadRFQ" class="btn btn-gold" type="button">${icon('download')}Download</button><button id="copyRFQ" class="btn btn-outline" type="button">${icon('document')}Copy</button>
      <a id="emailRFQ" class="btn btn-outline" href="${email}">${icon('mail')}Email RFQ</a><a id="whatsappRFQ" class="btn btn-green" href="${phone}" target="_blank" rel="noopener">${icon('phone')}Open WhatsApp</a></div>
  </dialog>`;
}

const pages = [
  { path: '', base: './', page: 'home', main: home('./') },
  { path: 'about/', base: '../', page: 'about', main: about('../') },
  { path: 'products/', base: '../', page: 'products', main: catalog('../'), shortFooter: true },
  { path: 'export/', base: '../', page: 'export', main: exportPage('../') },
  { path: 'contact/', base: '../', page: 'contact', main: contact('../') },
  ...products.map(product => {
    const view = productPages[product.id];
    return { path: `products/${view.slug}/`, base: '../../', page: 'product', main: productDetail('../../', product),
      title: `${view.title} | ${name}`, description: view.subtitle, social: `assets/editorial/${view.hero}.webp` };
  })
];

for (const page of pages) {
  const file = fileURLToPath(new URL(`${page.path}index.html`, import.meta.url));
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, shell({ title: titles[page.page], description: descriptions[page.page], ...page }));
}
