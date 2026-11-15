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
const landscape = 'assets/reference/home-banner.webp';
const escape = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);
const icon = key => `<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-${key}"/></svg>`;
const nicePath = (product, base) => `${base}products/${productPages[product.id].slug}/`;
const photo = (base, path, alt, attributes = 'loading="lazy" decoding="async"') =>
  `<img src="${base}${path}" alt="${escape(alt)}" ${attributes}>`;
const editorial = (base, file, alt, attributes) => photo(base, `assets/editorial/${file}.webp`, alt, attributes);
const reference = (base, file, alt, attributes) => photo(base, `assets/reference/${file}.webp`, alt, attributes);
const alternatives = { vanilla: 'premium-vanilla-beans-grade-a', coffee: 'indonesian-robusta-coffee-grade-a', carbon: 'coconut-based-activated-carbon', sulfur: 'natural-sulfur-99-8', broom: 'coconut-palm-broomstick', candlenut: 'premium-dried-candlenut' };
const quote = (base, product) => `${base}contact/${product ? `?product=${encodeURIComponent(product.id)}` : ''}#inquiry`;
const action = (href, label, style = '', graphic = '') =>
  `<a class="btn ${style}" href="${href}">${label}${graphic ? icon(graphic) : ''}</a>`;
const options = [['all', 'All products'], ['agri', 'Food &amp; Agriculture'], ['industrial', 'Industrial'], ['craft', 'Natural Fibers']];
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

function brand(base, { variant = 'home', footer = false } = {}) {
  const labels = {
    home: 'Export · Import · Commodities', products: 'Export · Natural · Premium', vanilla: 'Export · Agriculture · Spices',
    coffee: 'Export · Coffee · Sustainable', carbon: 'Export &amp; Supplier · Indonesia', sulfur: 'Export · Supply · Quality',
    broom: 'Export &amp; Manufacture · Natural Palm Products', candlenut: 'Natural Indonesian Export'
  };
  const design = ['about', 'products', 'vanilla', 'coffee', 'carbon', 'sulfur', 'broom', 'candlenut'].includes(variant) ? variant : 'home';
  return `<a class="brand${footer ? ' footer-brand' : ''}" href="${base}" aria-label="${name} home">
    ${reference(base, `${design}-mark`, '', 'width="86" height="92"')}
    <span class="brand-name"><strong>${name}</strong>${design === 'about' && !footer ? '' : `<span class="brand-line">${footer ? 'Royal in Quality. Graceful in Service.' : labels[design]}</span>`}</span>
  </a>`;
}

function header(base, page, variant) {
  const links = {
    home: [base, 'Home'], about: [`${base}about/`, page === 'about' ? 'About Us' : 'About'],
    products: [`${base}products/`, 'Products'], why: [`${base}#why`, 'Why Us'],
    quality: [`${base}export/#quality`, 'Quality'], sustainability: [`${base}about/#sustainability`, 'Sustainability'],
    export: [`${base}export/`, 'Export'], contact: [`${base}contact/`, 'Contact']
  };
  const layouts = {
    home: ['home', 'about', 'products', 'why', 'export', 'contact'],
    about: ['home', 'about', 'products', 'sustainability', 'contact'],
    products: ['about', 'products', 'sustainability', 'export', 'contact'],
    vanilla: ['home', 'products', 'about', 'quality', 'sustainability', 'contact'],
    coffee: ['home', 'products', 'about', 'quality', 'contact'],
    carbon: ['home', 'products', 'about', 'sustainability', 'contact'],
    sulfur: ['home', 'products', 'about', 'sustainability', 'contact'],
    broom: ['home', 'products', 'about', 'sustainability', 'contact'],
    candlenut: ['home', 'products', 'about', 'sustainability', 'contact']
  };
  const section = page === 'product' ? 'products' : page;
  const current = layouts[variant] || layouts.home;
  const style = { products: 'btn-outline', about: 'btn-green', home: 'btn-green' }[variant] || 'btn-gold';
  return `<header class="site-header header-${variant}">
    <div class="container header-inner">
      ${brand(base, { variant })}
      <div class="header-controls">
        <nav class="site-nav" id="siteNav" aria-label="Main navigation">
          ${current.map(key => `<a href="${links[key][0]}"${section === key ? ' aria-current="page"' : ''}>${links[key][1]}</a>`).join('\n          ')}
        </nav>
        ${action(quote(base), variant === 'products' ? 'Get a Quote' : 'Get Quote', `${style} header-quote`, variant === 'home' ? 'arrow' : '')}
        <button id="menuToggle" class="icon-button menu-toggle" type="button" aria-expanded="false" aria-controls="siteNav" aria-label="Open navigation" hidden>${icon('menu')}${icon('close')}</button>
      </div>
    </div>
  </header>`;
}

function footer(base, variant, short = false, productId = '') {
  const companyWidth = variant === 'home';
  const isVanilla = variant === 'vanilla';
  return `<footer class="site-footer footer-${variant}">
    ${isVanilla ? `<section class="vanilla-contact" aria-labelledby="vanillaContact"><div class="container">
      <h2 id="vanillaContact">Contact Us</h2><p>We’re here to assist with bulk orders, samples and export inquiries.</p>
      <div class="vanilla-contact-options">
        <a href="${phone}" target="_blank" rel="noopener">${icon('phone')}<span><strong>WhatsApp</strong>${company.phoneDisplay}</span></a>
        <a href="${base}contact/#contact">${icon('pin')}<span><strong>Head Office</strong>${company.location}</span></a>
        <a href="${email}">${icon('mail')}<span><strong>Email</strong>${company.email}</span></a>
      </div>
      ${action(quote(base, products.find(p => p.id === productId)), 'Request a Quote Now', 'btn-gold')}
      <button type="button" class="vanilla-guide text-link" id="helpLauncher" aria-expanded="false" aria-controls="helpPanel">Export Guide</button>
    </div></section>` : ''}
    ${short || isVanilla ? '' : `<div class="container footer-top">
      <div class="footer-identity">${brand(base, { variant, footer: true })}
        <p>${companyWidth ? 'Exporting Indonesian natural commodities with a focus on quality and lasting partnerships.' : 'Indonesian natural commodities and industrial materials for international buyers.'}</p>
      </div>
      <div class="footer-column footer-office"><h2>${companyWidth ? 'Office' : 'Contact'}</h2><p>${companyWidth ? '' : icon('pin')}${company.location}</p>
        ${companyWidth ? `<p>Business Hours: Mon–Sat, 08:00–17:00 WIB</p>` : `<a href="${phone}" target="_blank" rel="noopener">${icon('phone')}WhatsApp ${company.phoneDisplay}</a><a href="${email}">${icon('mail')}${company.email}</a>`}
      </div>
      <div class="footer-column footer-contact"><h2>${companyWidth ? 'Contact Us' : 'Export Information'}</h2>
        ${companyWidth ? `<a href="${phone}" target="_blank" rel="noopener">WhatsApp ${company.phoneDisplay}</a><a href="${email}">${company.email}</a>` : `<a href="${base}export/#quality">Quality &amp; Documentation</a><a href="${base}${profile}" download>Company Profile</a>`}
        <button type="button" class="text-link" id="helpLauncher" aria-expanded="false" aria-controls="helpPanel">Export Guide</button>
      </div>
    </div>`}
    <div class="footer-bottom"><div class="container"><span>© <span id="year">${new Date().getUTCFullYear()}</span> ${name}. All rights reserved.</span>
      <nav aria-label="Footer"><button type="button" data-policy="privacy">Privacy Policy</button><button type="button" data-policy="terms">Terms of Use</button>${short ? `<a href="${base}export/#quality">Quality &amp; Documentation</a><a href="${email}">${company.email}</a>` : ''}</nav>
    </div></div>
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

function shell({ path, base, page, title, description, main, social = landscape, shortFooter = false, variant = page, bodyStyle = '', productId = '', canonicalPath = path }) {
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
<body class="page-${page} design-${variant}${bodyStyle ? ` ${bodyStyle}` : ''}" data-root="${base}" data-path="${path}" data-canonical="${canonicalPath}" data-social="${social}">
  <a href="#main" class="skip">Skip to content</a>
  ${header(base, page, variant)}
  <main id="main">
${main}
  </main>
  ${footer(base, variant, shortFooter, productId)}
  ${sharedControls(base, shortFooter)}
  ${sprite}
</body>
</html>
`;
}

function scenery(base, { title, description, subtitle = '', actions = '', variant = '', background = 'about-banner', id = '' }) {
  return `<section class="scenery ${variant}"${id ? ` id="${id}"` : ''}>
    ${reference(base, background, '', 'fetchpriority="high"')}
    <div class="container scenery-content"><h1>${title}</h1>${subtitle ? `<p class="scenery-subtitle">${subtitle}</p>` : ''}<p>${description}</p>${actions ? `<div class="actions">${actions}</div>` : ''}</div>
  </section>`;
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
    title: 'Bridging Nations Enriching Lives',
    description: 'Premium Indonesian Commodities From Indonesia To The World.',
    variant: 'home-hero', background: 'home-banner', id: 'home',
    actions: action(`${base}products/`, 'Explore Products', 'btn-gold') + action(`${base}contact/`, 'Contact Us', 'btn-light', 'chat')
  })}
  <section class="trust-strip" aria-label="Sourcing priorities">
    <ul class="container"><li>${icon('plus')} Indonesian Origin</li><li>Quality &amp; Responsible Sourcing</li><li>Reliable Global Logistics</li></ul>
  </section>
  <section class="home-portfolio container" aria-labelledby="homeProducts">
    <div class="section-heading center"><h2 id="homeProducts">Our Products</h2><p>Sourced from Indonesia’s finest producers, delivered to the world with quality and trust</p></div>
    <div class="home-columns">
      <div class="home-selection">
        <div class="mini-grid">
          ${[
            ['vanilla', 'Vanilla', 'Premium Vanilla Beans · Natural Flavor · Food Grade'],
            ['coffee', 'Robusta Coffee', 'Robusta Beans · Full Body · Indonesian Origin'],
            ['carbon', 'Activated Carbon', 'Granules, Powder & Pellets · Industrial Filtration'],
            ['sulfur', 'Sulfur', 'Industrial Sulfur · Agricultural & Chemical Uses'],
            ['broom', 'Broomstick', 'Handcrafted Palm Broomstick · Household Cleaning']
          ].map(([id, label, summary]) => `<a class="mini-card mini-${id}" href="${nicePath(products.find(p => p.id === id), base)}">
            ${reference(base, `icon-${id}`, '')}<h3>${label}</h3><p>${escape(summary)}</p><span>View Details ${icon('arrow')}</span>
          </a>`).join('\n          ')}
        </div>
        <section class="why-panel" id="why" aria-labelledby="whyHeading">
          <h2 id="whyHeading">Why Choose Us</h2>
          <ul>
            <li>${icon('globe')}<h3>Global Export</h3><p>Export coordination, shipping and documentation for international buyers.</p><a class="text-link" href="${base}export/#solutions">View Details ${icon('arrow')}</a></li>
            <li>${icon('shield')}<h3>Quality Selection</h3><p>Product selection, agreed specifications and relevant batch documentation.</p><a class="text-link" href="${base}export/#quality">View Details ${icon('arrow')}</a></li>
            <li>${icon('leaf')}<h3>Sustainable Sourcing</h3><p>Working with local farmers and producers across Indonesia.</p><a class="text-link" href="${base}about/#sustainability">View Details ${icon('arrow')}</a></li>
          </ul>
        </section>
      </div>
      <aside class="home-note" aria-labelledby="homeNoteHeading">
        <h2 id="homeNoteHeading">Our Commitment</h2>
        <p class="home-note-intro">Partnerships for global sourcing</p>
        ${icon('document')}
        <blockquote>“We deliver not only goods, but trust that you can rely on.”</blockquote>
        <a class="text-link" href="${base}about/">PT Royal Grace Exportindo</a>
      </aside>
    </div>
  </section>`;
}

function catalog(base) {
  return `  ${scenery(base, {
    title: 'Our Products —<br>Premium Natural Commodities', background: 'catalog-banner',
    description: 'Sourced ethically from Indonesia. Export-quality natural commodities trusted worldwide.', variant: 'catalog-hero'
  })}
  <section class="catalog container" id="products" aria-labelledby="catalogHeading">
    <div class="catalog-toolbar">
      <div><h2 id="catalogHeading">Products Overview</h2><p id="productCount" role="status">Showing ${products.length} products</p></div>
      <details class="catalog-find" id="catalogFind" hidden>
        <summary>${icon('search')} Search &amp; Filter</summary>
        <div class="catalog-controls" id="catalogControls">
          <div class="filter-group" role="group" aria-label="Product category">
            ${options.map(([key, label]) => `<button type="button" data-filter="${key}" aria-pressed="${key === 'all'}">${label}</button>`).join('')}
          </div>
          <div class="search">${icon('search')}<input id="productSearch" type="search" placeholder="Search products" aria-label="Search products"></div>
        </div>
      </details>
    </div>
    <div class="product-grid" id="productGrid">
      ${products.map(p => {
        const view = productPages[p.id];
        return `<article class="catalog-card" data-product="${p.id}">
          <a href="${nicePath(p, base)}" class="catalog-thumb" aria-label="View ${escape(view.label)}">${editorial(base, `card-${p.id}`, '')}</a>
          <h3><a href="${nicePath(p, base)}">${p.id === 'broom' ? 'Broomstick' : escape(view.label)}</a></h3><p>${escape(view.summary)}</p>
          <div class="card-actions">${action(nicePath(p, base), 'View Detail', 'btn-outline')}${action(quote(base, p), 'Get Quote', 'btn-gold')}</div>
        </article>`;
      }).join('\n      ')}
    </div>
    <div id="noResults" class="empty-state" hidden><h3>No products found</h3><p>Try a different keyword or category.</p><button id="resetSearch" type="button" class="btn btn-outline">Reset search</button></div>
  </section>`;
}

function about(base) {
  return `  ${scenery(base, {
    title: 'About Us', subtitle: 'Growing Excellence. Delivering Trust Worldwide.',
    description: 'PT Royal Grace Exportindo brings Indonesian agricultural products to the global market with a focus on quality and sustainable sourcing.',
    variant: 'about-hero',
    actions: action('#our-story', 'Our Story', 'btn-green') + `<a class="btn btn-light" href="${base}${profile}" download>Download Company Profile</a>`
  })}
  <section class="about container" id="our-story" aria-labelledby="storyHeading">
    <div class="story-grid">
      <div><h2 id="storyHeading">Our <span class="gold-text">Story</span></h2>
        <p>${name} began with a vision to bring the richness of Indonesian agriculture to the world. We work with local farmers and producers to source food ingredients, industrial materials and natural palm products for buyers across international markets.</p>
        <p>Our team helps buyers define their product requirements, evaluate samples and prepare each order for export.</p>
      </div>
      <figure class="story-image">${editorial(base, 'terraces-about', 'Rice terraces framed by an Indonesian highland valley', 'width="309" height="150"')}</figure>
    </div>
    <div class="about-columns">
      <div class="value-tiles" aria-label="Vision and values">
        <article class="value-tile featured">${icon('globe')}<h3>Vision</h3><p>To be a trusted global exporter of Indonesian natural and industrial products.</p></article>
        <article class="value-tile featured">${icon('leaf')}<h3>Mission</h3><p>Source and select products with local producers and support buyers through export.</p></article>
        <article class="value-tile">${icon('shield')}<h3>Quality</h3><p>Agree the specification and confirm quality through selection, samples and batch testing.</p></article>
        <article class="value-tile" id="sustainability">${icon('leaf')}<h3>Sustainability</h3><p>Build lasting working relationships with farmers and producers across Indonesia.</p></article>
      </div>
      <figure class="about-map"><h3>Values</h3>${reference(base, 'trade-map', 'World map with regional labels for North America, Europe, the Middle East, East Asia and Southeast Asia', 'width="402" height="200" loading="lazy"')}</figure>
      <section class="journey" aria-labelledby="journeyHeading"><header><h3 id="journeyHeading">Our Journey</h3><p>From local sourcing to global trade</p></header>
        <ul><li>${icon('check')}<span><strong>Rich Natural Resources</strong>Fertile landscapes across the archipelago.</span></li>
          <li>${icon('check')}<span><strong>Skilled Local Producers</strong>Generations of farming and craft expertise.</span></li>
          <li>${icon('check')}<span><strong>Global Export Preparation</strong>Planning for the buyer’s specific market.</span></li></ul>
      </section>
    </div>
  </section>
  <div class="about-band"><div class="container">
    <article><h3>Rooted in Indonesia</h3><p>Working with local farmers and producers.</p></article>
    <article><h3>Product Selection</h3><p>Agreeing on quality, samples and specifications.</p></article>
    <article class="about-commitment"><h3>Meet Our Commitment</h3><p>${icon('shield')} Quality &amp; Safety &nbsp; ${icon('leaf')} Local Sourcing</p></article>
    <article><h3>International Buyers</h3><p>Packing, documentation and shipment coordination.</p></article>
  </div></div>`;
}

function productDetail(base, p, alternate = false) {
  const view = productPages[p.id];
  const areas = {
    vanilla: { title: alternate ? 'Premium Vanilla Beans Grade A' : 'Premium Vanilla Beans', pill: 'Grade A', line: 'Aromatic · Rich Flavor · Premium Indonesian Vanilla',
      description: 'Gourmet Grade A vanilla from Indonesia for culinary, fragrance and cosmetics applications.',
      highlights: ['Indonesian Origin', 'Gourmet Grade A', 'Vacuum Packed'] },
    coffee: { title: alternate ? 'Indonesian Robusta Coffee — Grade 1' : 'Indonesian Robusta Coffee Grade 1',
      description: 'Premium Indonesian Robusta · Sumatra, Java, Flores & Lampung · Full-Bodied Flavor',
      highlights: ['100% Robusta', 'Grade 1', 'Screen Size 16–18'] },
    carbon: { title: 'Activated Carbon', line: 'High Adsorption',
      description: 'Premium activated carbon for water treatment, air filtration and industrial adsorption.',
      feature: ['carbon-feature', 'Reference image of granular activated carbon beside coconut shells'] },
    sulfur: { title: 'Industrial Sulfur High Purity', pill: 'Sulfur · Industrial Grade',
      line: 'Premium Industrial Sulfur', description: 'Available in lump, granule, powder and pastille form.',
      highlights: ['99.92% in Tested Sample', 'Industrial Grade', 'Multiple Forms'],
      feature: ['sulfur-feature', 'Yellow sulfur lumps'], secondary: ['sulfur-feature-2', 'Sulfur lumps on volcanic ground'] },
    broom: { title: 'Natural Palm Broomstick', pill: 'Natural · Handcrafted · Palm Fiber', line: 'Handcrafted Eco-Friendly',
      description: 'Traditional brooms made from natural palm midribs. Durable and practical for everyday cleaning in homes and gardens.',
      highlights: ['Natural Palm Fiber', 'Handcrafted', 'Outdoor Cleaning'] },
    candlenut: { title: 'Premium Dried Candlenut', line: 'Natural Culinary & Oil',
      description: 'Dried Indonesian candlenuts for seasonings, spice pastes and oil processing.',
      feature: ['candlenut-feature', 'Whole and shelled candlenuts in wooden bowls'] }
  };
  const copy = areas[p.id];
  const variant = p.id;
  const productVideos = p.videoIds.map(id => videos.find(video => video.id === id));
  const extras = `<div class="product-extras">
    <a class="text-link" href="#packing" data-product-dialog="packing">Packing &amp; Buyer Checklist</a>
    <a class="text-link" href="#photos" data-product-dialog="photos">More Photos</a>
    ${productVideos.length ? `<a class="text-link" href="#media">${icon('play')}Watch Videos</a>` : ''}
    ${alternate ? `<a class="text-link" href="${nicePath(p, base)}">Main Product Page</a>` : `<a class="text-link" href="${base}products/${alternatives[p.id]}/">Alternate Layout</a>`}
  </div>`;
  const applications = (list = p.applications) => `<section class="ref-block ref-applications"><h2>Applications</h2><ul class="ref-list">${list.map(item => {
    const [title, detail] = Array.isArray(item) ? item : [item, ''];
    return `<li>${icon('check')}<span><strong>${escape(title)}</strong>${detail ? `<small>${escape(detail)}</small>` : ''}</span></li>`;
  }).join('')}</ul></section>`;
  const overview = `<section class="ref-block ref-overview"><h2>${p.id === 'vanilla' ? 'Product Overview' : 'Overview'}</h2><p>${escape(p.story[0])}</p></section>`;
  const specifications = (kind = '') => `<section class="ref-block ref-specifications ${kind}" id="specifications"><h2>Specifications</h2>
    <table class="spec-table"><thead><tr><th scope="col">Parameter</th><th scope="col">Specification</th></tr></thead>
      <tbody>${p.specs.en.map(([key, value]) => `<tr><th scope="row">${escape(key)}</th><td>${escape(value)}</td></tr>`).join('')}</tbody>
    </table><p class="spec-note">${p.id === 'carbon' || p.id === 'sulfur' ? 'Laboratory values apply to the tested sample. Request the relevant batch COA.' : 'Confirm the current product and order specifications with our team.'}</p>
  </section>`;
  const benefits = (items = view.benefits) => `<section class="ref-block ref-benefits"><h2>Benefits</h2><div class="ref-benefit-grid">${items.map(([symbol, title, detail]) => `<article>${icon(symbol)}<div><h3>${escape(title)}</h3><p>${escape(detail)}</p></div></article>`).join('')}</div></section>`;
  const pics = (entries, heading = true, captions = false) => `<section class="ref-block ref-gallery">${heading ? '<h2>Gallery</h2>' : '<h2 class="sr-only">Gallery</h2>'}${gallery(base, entries.map(([file, alt]) => [`assets/reference/${file}.webp`, alt]), captions)}</section>`;
  const quotePanel = (title = 'Request a Quote', detail = 'Contact us for pricing, samples, packing and shipping.', button = 'Get Quote Now') => `<section class="ref-quote"><h2>${title}</h2><p>${detail}</p>${action(quote(base, p), button, 'btn-gold')}</section>`;

  const productGalleries = {
    vanilla: [['vanilla-1', 'Cured vanilla pods tied with twine'], ['vanilla-2', 'Vanilla orchid flower'], ['vanilla-3', 'Illustrative vanilla pouch'], ['vanilla-4', 'Vanilla flower with cured pods']],
    coffee: [['coffee-1', 'Ripe coffee cherries on the branch'], ['coffee-2', 'Coffee beans in a burlap sack'], ['coffee-3', 'Example 60 kg jute sacks'], ['coffee-4', 'Coffee farm in the highlands']],
    carbon: [['carbon-1', 'Granular activated carbon'], ['carbon-2', 'Activated carbon and coconut shell'], ['carbon-3', 'Illustrative export bag for activated carbon']],
    sulfur: [['sulfur-1', 'Yellow Sulfur Rocks'], ['sulfur-2', 'Illustrative Sulfur Bag'], ['sulfur-3', 'Sulfur Powder']],
    broom: [['broom-1', 'Close-up of dried palm midribs'], ['broom-2', 'Tied palm broom bundles'], ['broom-3', 'Hand-tied natural palm broom']],
    candlenut: [['candlenut-1', 'Shelled candlenuts in a wooden bowl'], ['candlenut-2', 'Candlenuts and candlenut oil']]
  };

  let content;
  switch (p.id) {
    case 'vanilla':
      content = `<div class="container ref-product-grid vanilla-content"><div>${overview}${benefits()}${applications([['Food & Bakery', ''], ['Fragrance', ''], ['Cosmetics & Skincare', '']])}${extras}</div><div>${specifications('ref-spec-float')}${pics(productGalleries.vanilla)}</div></div>`;
      break;
    case 'coffee':
      content = `<div class="container ref-product-grid coffee-content"><div>${overview}${specifications()}${extras}</div><div>${benefits()}${applications([['Roasting', 'For espresso blends and traditional coffee.'], ['Instant Coffee', 'For industrial instant coffee production.'], ['Food & Beverage Manufacturing', 'For coffee extracts and flavoring.']])}</div><aside class="coffee-aside"><h2>Product Details</h2><div class="coffee-pack">${reference(base, 'coffee-feature', 'Coffee beans in a jute bag', 'decoding="async"')}<div><h3>Packaging</h3><p>60 kg jute bag with PE liner</p></div></div>${quotePanel('Request a Quote', 'Contact us for pricing, MOQ and shipping options.')}${pics(productGalleries.coffee)}</aside></div>`;
      break;
    case 'carbon':
      content = `<div class="container ref-product-grid carbon-content"><div>${overview}${specifications('ref-spec-head')}${extras}</div><div>${applications([['Water Purification', 'Liquid filtration and water treatment.'], ['Air Filtration', 'Air and gas purification.'], ['Industrial Adsorption', 'Discuss the media grade and target contaminant.']])}${benefits()}${pics(productGalleries.carbon, false)}</div></div>`;
      break;
    case 'sulfur':
      content = `<div class="container ref-product-grid sulfur-content"><div>${specifications()}${extras}</div><div>${applications([['Agriculture', 'Agricultural inputs'], ['Chemical Industry', 'Chemical processing'], ['Manufacturing', 'Rubber production']])}${quotePanel('Interested in Our Sulfur?', 'Contact our team for samples, pricing and bulk export inquiries.')}</div><div>${benefits([...view.benefits, ['globe', 'Export Support', 'Discuss logistics and documentation.']])}${pics(productGalleries.sulfur, true, true)}</div></div>`;
      break;
    case 'broom':
      content = `<div class="container ref-product-grid broom-content">${overview}<div>${specifications()}${extras}</div><div>${benefits()}</div>${pics(productGalleries.broom)}</div><div class="broom-quote-band">${quotePanel('Ready to Order in Bulk?', 'Contact us for wholesale inquiries, custom packing and export shipping.', 'Get Quote Now')}</div>`;
      break;
    case 'candlenut':
      content = `<div class="container ref-product-grid candlenut-content"><div>${overview}${specifications()}${extras}</div><div>${applications([['Culinary', 'Traditional dishes, sauces and spice pastes'], ['Cooking Oil', 'Candlenut oil processing'], ['Ingredient Manufacturing', 'Discuss preferred kernel and oil grades']])}${benefits()}<div class="ref-block ref-gallery-title"><h2 id="candlenut-gallery">Gallery</h2></div></div></div>
      <section class="candlenut-band" aria-labelledby="candlenut-gallery"><div class="container" data-gallery>${productGalleries.candlenut.map(([file, title]) => `<a class="band-photo" href="${base}assets/reference/${file}.webp" data-image aria-label="Enlarge ${escape(title)}">${reference(base, file, title)}</a>`).join('')}${quotePanel('Ready to Order Premium Dried Candlenut?', 'Contact us for pricing, sample requests and export details.', 'Get Quote')}</div></section>`;
      break;
  }
  const heroPhoto = p.id === 'broom' && !alternate ? editorial(base, 'broom-palm', '', 'fetchpriority="high"') : reference(base, `${p.id}${alternate && !['sulfur', 'candlenut'].includes(p.id) ? '-alt' : ''}-banner`, '', 'fetchpriority="high"');
  const highlights = copy.highlights ? `<ul class="hero-highlights">${copy.highlights.map(label => `<li>${icon('check')}${label}</li>`).join('')}</ul>` : '';
  const feature = copy.feature ? `<figure class="ref-hero-feature">${reference(base, ...copy.feature, 'decoding="async"')}${p.id === 'sulfur' ? '<figcaption><strong>Sulfur</strong><span>Granule / Lump / Powder</span></figcaption>' : ''}${copy.secondary ? `<div class="feature-extra">${reference(base, ...copy.secondary)}</div>` : ''}</figure>` : '';
  if (alternate) {
    content = alternateProduct(p.id, { overview, specifications, benefits, applications, pics, extras, quotePanel, base, view });
  }
  const crumb = alternate ? `<nav class="ref-crumb" aria-label="Breadcrumb"><div class="container"><a href="${base}">Home</a>${icon('chevron')}<a href="${base}products/">Products</a>${icon('chevron')}<span aria-current="page">${escape(view.label)}</span></div></nav>` : '';
  const showHero = !alternate || !['sulfur', 'candlenut'].includes(variant);
  const alternateFeature = variant === 'carbon' ? `<aside class="alternate-highlights"><h2>Key Highlights</h2><ul class="ref-list"><li>${icon('check')} Granular, powder and pellet</li><li>${icon('check')} Sample test results available</li><li>${icon('check')} Grades by application</li></ul><a href="#specifications">Specifications</a></aside>` :
    variant === 'broom' ? `<aside class="alternate-highlights">${specifications()}</aside>` : '';
  return `  ${crumb}${showHero ? `<header class="ref-product-hero ref-hero-${p.id}">
    ${heroPhoto}
    <div class="container ref-hero-inner"><div class="ref-hero-copy">
      ${copy.pill && p.id !== 'vanilla' ? `<span class="hero-pill">${copy.pill}</span>` : ''}
      <h1>${copy.title}</h1>
      ${copy.pill && p.id === 'vanilla' && !alternate ? `<span class="hero-pill">${copy.pill}</span>` : ''}
      ${copy.line && !(alternate && variant === 'vanilla') ? `<p class="ref-product-line">${escape(copy.line)}</p>` : ''}
      <p class="ref-product-deck">${escape(copy.description)}</p>
      ${p.id === 'sulfur' ? highlights : ''}
      <div class="actions">${action(quote(base, p), p.id === 'sulfur' ? 'Request Quote' : 'Get Quote', 'btn-gold', p.id === 'sulfur' ? 'arrow' : p.id === 'broom' ? 'chat' : '')}<a class="btn btn-light" href="${base}assets/specs/${view.slug}.pdf" download>${p.id === 'sulfur' ? 'Download Datasheet' : 'Download Spec Sheet'}</a></div>
      ${p.id !== 'sulfur' ? highlights : ''}
    </div>${alternate ? alternateFeature : feature}</div>
  </header>` : ''}
  ${content}
  ${productVideos.length ? `<section class="container ref-block product-media" id="media" aria-labelledby="productMediaHeading">
    <h2 id="productMediaHeading">Product Videos</h2>
    <div class="video-grid product-videos">${productVideos.map(video => videoCard(base, video)).join('')}</div>
  </section>` : ''}
  <dialog id="packing" class="dialog product-info-dialog" aria-labelledby="packingHeading">
    <button type="button" class="icon-button dialog-close" data-close aria-label="Close buyer checklist">${icon('close')}</button>
    <h2 id="packingHeading">Packaging &amp; Buyer Checklist</h2><p>${escape(p.packing)}</p><p>${escape(p.story[1])}</p><p>${escape(p.note.en)}</p>
    <h3>What to Include in Your Inquiry</h3><ul>${p.questions.map(question => `<li>${escape(question)}</li>`).join('')}</ul>
    <h3>From Requirements to Selection</h3><ol>${p.steps.map(step => `<li>${escape(step)}</li>`).join('')}</ol>
  </dialog>
  <dialog id="photos" class="dialog product-info-dialog" aria-labelledby="productPhotosHeading">
    <button type="button" class="icon-button dialog-close" data-close aria-label="Close product photos">${icon('close')}</button>
    <h2 id="productPhotosHeading">More Photos</h2>${gallery(base, p.photos, true)}
  </dialog>
  <dialog id="galleryDialog" class="dialog gallery-dialog" aria-labelledby="galleryTitle">
    <div class="gallery-dialog-head"><h2 id="galleryTitle">Product Gallery</h2><button class="icon-button dialog-close" type="button" data-close aria-label="Close gallery">${icon('close')}</button></div>
    <figure><img id="galleryPhoto" alt=""><figcaption id="galleryCaption" aria-live="polite"></figcaption></figure>
    <div class="gallery-controls"><button type="button" id="galleryPrev" class="btn btn-outline">Previous</button><span id="galleryPosition"></span><button type="button" id="galleryNext" class="btn btn-outline">Next</button></div>
  </dialog>`;
}

function alternateProduct(variant, { overview, specifications, benefits, applications, pics, extras, quotePanel, base, view }) {
  const datasheet = `<a class="btn btn-outline" href="${base}assets/specs/${view.slug}.pdf" download>Download Spec Sheet</a>`;
  const chipSpecs = (rows, title = 'Specifications') => `<section class="ref-block ref-spec-chips"><h2>${title}</h2><dl>${rows.map(([id, label, value]) => `<div>${icon(id)}<div><dt>${label}</dt><dd>${escape(value)}</dd></div></div>`).join('')}</dl></section>`;
  const content = {
    vanilla: () => `<div class="container ref-product-grid alt-vanilla-body"><div>${overview}${chipSpecs([['leaf','Moisture','25–35%'],['flask','Vanillin','1.5–2.5%'],['box','Grade A Length','15–20 cm']])}${benefits()}${applications([['Food',''],['Fragrance',''],['Cosmetics','']])}${extras}</div><aside class="alternate-vanilla-gallery">${pics([['vanilla-alt-gallery-1','Cured vanilla pods on burlap'],['vanilla-alt-gallery-2','Cured pods in a wooden scoop'],['vanilla-alt-gallery-3','Vanilla pods tied in a bundle'],['vanilla-alt-gallery-4','Vanilla orchid and pods']])}${quotePanel('Need a custom volume or packaging?', 'Ask about bulk orders, private labels and export documentation.')}</aside></div>`,
    coffee: () => `<div class="container ref-product-grid alt-coffee-body"><div>${overview}${benefits()}${extras}</div><div class="alt-coffee-combined">${specifications()}${applications([['Roasting','Used in espresso blends and traditional coffee.'],['Instant Coffee','For industrial instant coffee processing.']])}${pics([['coffee-alt-1','Roasted coffee in a burlap sack'],['coffee-alt-2','Unroasted green coffee beans'],['coffee-alt-3','Roasted coffee beans']])}</div></div>`,
    carbon: () => `<div class="container ref-product-grid alt-carbon-body">${overview}<div>${specifications()}${extras}</div><div>${benefits()}</div>${applications([['Water Treatment','Drinking water and wastewater treatment applications.'],['Air Purification','Odor control and gas purification.'],['Industrial Adsorption','Specify the target contaminant and performance requirements.']])}${quotePanel('Need a Bulk Quote or Technical Details?', 'Our team can assist with specifications, samples and shipping.')}</div>`,
    sulfur: () => `<div class="container ref-product-grid alt-sulfur-body"><div><figure class="alt-hero-frame">${editorial(base, 'sulfur-crater','Illustrative Indonesian volcanic crater with sulfur deposits')}<figcaption>Indonesian Volcanic Landscape</figcaption></figure>${pics([['sulfur-alt-1','Yellow sulfur lumps'],['sulfur-alt-2','Yellow sulfur powder and illustrative package'],['sulfur-alt-3','Sulfur bearing rock']],false)}</div><div><header class="alt-detail-heading"><h1>Industrial Sulfur —<br> Tested High Purity</h1><span class="hero-pill">Industrial Quality · Export Supply</span></header>${overview}${chipSpecs([['check','Total Sulfur (Sample)','99.92%'],['flask','Moisture (Sample)','0.14%'],['box','Form','Granule · Lump · Powder']])}${benefits()}${applications([['Agriculture',''],['Chemical',''],['Manufacturing','']])}${quotePanel('Interested in pricing or bulk export?','Ask for price, samples and delivery details.')}${extras}${datasheet}</div></div>`,
    broom: () => `<div class="container ref-product-grid alt-broom-body"><div>${overview}${benefits()}${applications([['Household & Garden',''],['Outdoor Cleaning',''],['Broom Manufacturing',''],['Natural-Fiber Products','']])}${extras}</div><div class="alt-broom-gallery">${pics([['broom-alt-1','Broom bristles tied with natural twine'],['broom-alt-2','Dried palm midribs'],['broom-alt-3','Tied palm brooms'],['broom-alt-4','Bundle of palm brooms']])}${quotePanel('Interested in Bulk Orders or Export Inquiry?', 'Get in touch for pricing, options and shipping.', 'Get Quote')}</div></div>`,
    candlenut: () => `<div class="container ref-product-grid alt-candlenut-body"><div><header class="alt-detail-heading"><h1>Premium Dried Candlenut<br>Natural Culinary &amp; Oil</h1><p>Natural · Indonesian Origin · Whole and Shelled</p></header><figure class="alt-hero-frame">${editorial(base,'candlenut-trees','Candlenut trees in a plantation setting')}</figure>${overview}<div class="alt-candlenut-specs">${specifications()}${benefits()}</div>${extras}${datasheet}</div><div><figure class="alt-hero-frame">${reference(base,'candlenut-alt-feature','Shelled candlenuts in a wooden bowl')}</figure>${applications([['Culinary','Traditional dishes, sauces and spice pastes'],['Cooking Oil','Processing of candlenut oil'],['Ingredient Manufacturing','Discuss preferred kernel and oil grades']])}${pics([['candlenut-alt-1','Whole candlenuts in a fabric sack'],['candlenut-alt-2','Illustrative candlenut export bag'],['candlenut-alt-3','Candlenut oil and whole candlenuts']])}${quotePanel('Ready to Place Your Bulk Order?','Contact us for pricing, documentation and shipping.', 'Get Quote')}</div></div>`
  };
  return content[variant]();
}

function gallery(base, images, captions = true) {
  return `<div class="photo-grid${captions ? '' : ' photo-grid-clean'}" data-gallery>
    ${images.map(([image, caption]) => `<figure><a href="${base}${image}" data-image aria-label="Enlarge ${escape(caption)}">${photo(base, image, caption, captions ? 'loading="lazy" decoding="async"' : 'decoding="async"')}</a>${captions ? `<figcaption>${escape(caption)}</figcaption>` : ''}</figure>`).join('')}
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
  { path: 'about/', base: '../', page: 'about', main: about('../'), social: 'assets/reference/about-banner.webp' },
  { path: 'products/', base: '../', page: 'products', main: catalog('../'), shortFooter: true, social: 'assets/reference/catalog-banner.webp' },
  { path: 'products/overview/', canonicalPath: 'products/', base: '../../', page: 'products', main: catalog('../../'), shortFooter: true, social: 'assets/reference/catalog-banner.webp' },
  { path: 'about-us/', canonicalPath: 'about/', base: '../', page: 'about', main: about('../'), social: 'assets/reference/about-banner.webp' },
  { path: 'export/', base: '../', page: 'export', main: exportPage('../') },
  { path: 'contact/', base: '../', page: 'contact', main: contact('../') },
  ...products.flatMap(product => {
    const view = productPages[product.id];
    const common = { base: '../../', page: 'product', productId: product.id,
      title: `${view.title} | ${name}`, description: view.subtitle, variant: product.id,
      social: product.id === 'broom' ? 'assets/editorial/broom-palm.webp' : `assets/reference/${product.id}-banner.webp` };
    return [
      { ...common, path: `products/${view.slug}/`, main: productDetail('../../', product) },
      { ...common, path: `products/${alternatives[product.id]}/`, canonicalPath: `products/${view.slug}/`, main: productDetail('../../', product, true), bodyStyle: 'alternate-layout' }
    ];
  })
];

for (const page of pages) {
  const file = fileURLToPath(new URL(`${page.path}index.html`, import.meta.url));
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, shell({ title: titles[page.page], description: descriptions[page.page], ...page }));
}
