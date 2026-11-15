'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const site = window.RGE_DATA;
const base = document.body.dataset.root || './';
const { company, products, productPages } = site;
const productById = id => products.find(product => product.id === id);
const icon = key => `<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-${key}"/></svg>`;
const selectionKey = 'rge-products';
let selected = readSelection();
let toastTimer;

function localPageLink(href) {
  if (location.protocol !== 'file:') return href;
  const url = new URL(href, location.href);
  if (url.protocol === 'file:' && url.pathname.endsWith('/')) url.pathname += 'index.html';
  return url.href;
}

function announce(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function readSelection() {
  try {
    const stored = JSON.parse(localStorage.getItem(selectionKey) || '[]');
    return new Set(Array.isArray(stored) ? stored.filter(id => productById(id)) : []);
  } catch {
    return new Set();
  }
}

function saveSelection() {
  try {
    localStorage.setItem(selectionKey, JSON.stringify([...selected]));
  } catch {
    // The current page still tracks selections if storage is unavailable.
  }
  syncSelection();
}

function syncSelection() {
  $$('#rfqProducts input').forEach(input => { input.checked = selected.has(input.value); });
  $$('[data-save]').forEach(button => {
    const saved = selected.has(button.dataset.save);
    const label = productPages[button.dataset.save].label;
    const action = saved ? `Remove ${label} from your quote list` : `Add ${label} to your quote list`;
    button.setAttribute('aria-pressed', String(saved));
    button.setAttribute('aria-label', action);
    button.title = action;
    button.innerHTML = icon(saved ? 'check' : 'plus');
  });
  $('#shortlistBar').hidden = selected.size === 0 || Boolean($('#inquiryForm'));
  $('#shortlistTitle').textContent = `${selected.size} ${selected.size === 1 ? 'product' : 'products'} selected`;
  if (selected.size && $('#productError')) $('#productError').hidden = true;
  const continuation = $('#shortlistBar a');
  if (selected.size) {
    continuation.href = localPageLink(`${base}contact/?products=${[...selected].join(',')}#inquiry`);
  }
}

function initializeNavigation() {
  const toggle = $('#menuToggle');
  const nav = $('#siteNav');
  const mobile = matchMedia('(max-width: 900px)');
  function setMenu(open) {
    nav.hidden = mobile.matches && !open;
    toggle.hidden = !mobile.matches;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }
  mobile.addEventListener('change', () => setMenu(false));
  toggle.addEventListener('click', () => setMenu(nav.hidden));
  nav.addEventListener('click', event => {
    if (event.target.closest('a') && mobile.matches) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });
  setMenu(false);
}

function initializeCatalog() {
  const search = $('#productSearch');
  if (!search) return;
  const categories = $$('[data-filter]');
  const cards = $$('#productGrid [data-product]');
  let filter = 'all';
  const catalogEntries = cards.map(card => {
    const save = document.createElement('button');
    save.type = 'button';
    save.className = 'icon-button catalog-save';
    save.dataset.save = card.dataset.product;
    save.addEventListener('click', () => {
      const id = card.dataset.product;
      const active = selected.has(id);
      if (active) selected.delete(id);
      else selected.add(id);
      saveSelection();
      announce(active ? 'Product removed from your quote list.' : 'Product added to your quote list.');
    });
    card.append(save);
    return { card, product: productById(card.dataset.product) };
  });
  function updateResults() {
    const query = search.value.trim().toLowerCase();
    let count = 0;
    for (const { card, product } of catalogEntries) {
      const view = productPages[product.id];
      const searchable = [product.name.en, product.description.en, product.tag.en, product.origin.en,
        view.label, view.title, view.summary, ...product.applications].join(' ').toLowerCase();
      const visible = (filter === 'all' || product.category === filter) && searchable.includes(query);
      card.hidden = !visible;
      if (visible) count += 1;
    }
    $('#noResults').hidden = count > 0;
    $('#productCount').textContent = count === products.length ? `Showing all ${count} products` : `Showing ${count} of ${products.length} products`;
  }
  function setCategory(value) {
    filter = value;
    categories.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === value)));
    updateResults();
  }
  categories.forEach(button => button.addEventListener('click', () => setCategory(button.dataset.filter)));
  search.addEventListener('input', updateResults);
  $('#resetSearch').addEventListener('click', () => {
    search.value = '';
    setCategory('all');
    search.focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== '/' || event.altKey || event.ctrlKey || event.metaKey || $('dialog[open]')) return;
    if (event.target.closest?.('input, textarea, select, [contenteditable]')) return;
    event.preventDefault();
    $('#catalogFind').open = true;
    search.focus();
  });
  $('#catalogFind').hidden = false;
}

const focusBeforeOpen = new WeakMap();

function openDialog(dialog) {
  if (dialog.open) return;
  focusBeforeOpen.set(dialog, document.activeElement);
  dialog.showModal();
  dialog.scrollTop = 0;
}

function initializeDialogs() {
  $$('dialog').forEach(dialog => {
    $('[data-close]', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
        dialog.close();
      }
    });
    dialog.addEventListener('close', () => {
      $$('video', dialog).forEach(video => video.pause());
      const previous = focusBeforeOpen.get(dialog);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    });
  });

  const productLinks = $$('[data-product-dialog]');
  if (!productLinks.length) return;

  const openLinkedDialog = link => openDialog(document.getElementById(link.dataset.productDialog));
  const showFromHash = () => {
    const link = productLinks.find(candidate => candidate.hash === location.hash);
    if (link) openLinkedDialog(link);
  };
  productLinks.forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openLinkedDialog(link);
  }));
  showFromHash();
  window.addEventListener('hashchange', showFromHash);
}

function initializeGallery() {
  const dialog = $('#galleryDialog');
  if (!dialog) return;
  let links = [];
  let position = 0;
  function showImage(index) {
    position = (index + links.length) % links.length;
    const link = links[position];
    const img = $('#galleryPhoto');
    img.src = link.href;
    img.alt = $('img', link).alt;
    $('#galleryCaption').textContent = img.alt;
    $('#galleryPosition').textContent = `${position + 1} / ${links.length}`;
  }
  $$('[data-image]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      links = $$('[data-image]', link.closest('[data-gallery]'));
      showImage(links.indexOf(link));
      openDialog(dialog);
    });
  });
  $('#galleryPrev').addEventListener('click', () => showImage(position - 1));
  $('#galleryNext').addEventListener('click', () => showImage(position + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showImage(position + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
}

function initializeVideo() {
  const media = $('#mediaFilters');
  if (media) {
    const buttons = $$('[data-media-filter]', media);
    const cards = $$('[data-video-product]');
    media.hidden = false;
    buttons.forEach(button => button.addEventListener('click', () => {
      buttons.forEach(candidate => candidate.setAttribute('aria-pressed', String(candidate === button)));
      cards.forEach(card => {
        const filter = button.dataset.mediaFilter;
        card.hidden = filter !== 'all' && card.dataset.videoProduct !== filter;
        if (card.hidden) $('video', card).pause();
      });
    }));
  }
  document.addEventListener('play', event => {
    if (event.target.tagName !== 'VIDEO') return;
    $$('video').forEach(video => { if (video !== event.target) video.pause(); });
  }, true);
}

const faqs = [
  ['MOQ & pricing', 'What are the minimum order quantities and prices?', 'The company confirms both by quotation. Include your product form, grade, quantity, packing, destination and shipping terms.'],
  ['Samples', 'Can I request a sample before ordering?', 'Yes. Discuss availability, quantity, fees, shipping costs and the tests you plan to run before the sample is dispatched.'],
  ['Quality', 'Do the profile specifications apply to every shipment?', 'Confirm specifications and acceptance criteria for the actual batch. Activated carbon and sulfur laboratory results shown on the site apply to the samples identified in the company profile.'],
  ['Documentation', 'Which export documents are available?', 'Discuss the COA, COO, phytosanitary or fumigation records, safety documentation, invoice, packing list and Bill of Lading with our team. Requirements depend on the commodity and destination.'],
  ['Packaging', 'Can I request custom packing or labels?', 'Yes. Discuss material, pack size, label language and minimum quantities for the chosen product.'],
  ['Media', 'Where do the product images and videos come from?', 'The site includes editorial reference images, company-profile photographs and supplied videos. Carbon and candlenut photo presentations use company-profile images.'],
  ['Shipping', 'How are shipping terms and lead times confirmed?', 'Share your destination, estimated quantity, packing preferences and required date. The company confirms availability, preparation time and shipping terms with each order.'],
  ['Contact', 'How do I send a quote request?', `Use the quote form to create a summary, then send it by email or WhatsApp. You can also contact ${company.email} directly.`]
];

const policies = {
  privacy: {
    title: 'Privacy Policy',
    body: `<p>The quote form prepares a summary on your device. When you choose email or WhatsApp, that application receives the draft text and you choose when to send it.</p>
      <h3>Device storage</h3><p>The site saves your selected products in your browser. Use Clear to remove the list or clear site data in browser settings. The form keeps your name, email and other details in the current page.</p>
      <h3>Media and hosting</h3><p>Photographs and videos load from the same site. The hosting provider may process technical access logs under its own policies.</p>
      <h3>Contact</h3><p><a href="mailto:${company.email}">${company.email}</a></p>`
  },
  terms: {
    title: 'Terms of Use',
    body: `<h3>Product information</h3><p>Confirm product specifications, grades, availability, documentation, price and delivery terms for each transaction. Sample results apply to the samples identified in the company profile.</p>
      <h3>Visual references</h3><p>Photographs, supplied footage and editorial images illustrate products and settings. Confirm the shipment’s grade and characteristics with the team.</p>
      <h3>Quotation requests</h3><p>The form produces a draft request. Commercial terms take effect after direct agreement with the company.</p>`
  }
};

function initializeSupport() {
  const faq = $('#faqList');
  if (faq) faq.innerHTML = faqs.map(([, question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join('');
  const panel = $('#helpPanel');
  if (panel) {
    const launcher = $('#helpLauncher');
    const close = $('#closeHelp');
    const questions = $('#helpQuestions');
    questions.innerHTML = faqs.map(([topic], index) => `<button type="button" data-help="${index}">${topic}</button>`).join('');
    const setOpen = open => {
      panel.hidden = !open;
      launcher.setAttribute('aria-expanded', String(open));
      (open ? close : launcher).focus();
    };
    launcher.addEventListener('click', () => setOpen(panel.hidden));
    close.addEventListener('click', () => setOpen(false));
    panel.addEventListener('keydown', event => { if (event.key === 'Escape') setOpen(false); });
    questions.addEventListener('click', event => {
      const choice = event.target.closest('[data-help]');
      if (!choice) return;
      const output = $('#helpAnswer');
      output.textContent = faqs[Number(choice.dataset.help)][2];
      output.hidden = false;
    });
  }
  const articleDialog = $('#articleDialog');
  function showArticle(title, text) {
    const content = $('#articleContent');
    content.innerHTML = `<h2 id="articleTitle"></h2>${text}`;
    $('#articleTitle', content).textContent = title;
    openDialog(articleDialog);
  }
  $$('[data-policy]').forEach(button => button.addEventListener('click', () => {
    const policy = policies[button.dataset.policy];
    showArticle(policy.title, policy.body);
  }));
  $$('[data-article]').forEach(button => button.addEventListener('click', () => {
    const article = site.articles.find(item => item.id === button.dataset.article);
    showArticle(article.title, `${article.body}<p><a href="${localPageLink(`${base}contact/#inquiry`)}" class="text-link">Prepare your inquiry ${icon('arrow')}</a></p>`);
  }));
}

function buildSummary(form) {
  const fields = new FormData(form);
  const value = key => String(fields.get(key) || '').trim();
  return [
    'REQUEST FOR QUOTATION', company.name,
    `Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    '', `Name: ${value('name')}`, `Company: ${value('company')}`, `Email: ${value('email')}`,
    '', `Commodities: ${products.filter(product => selected.has(product.id)).map(product => product.name.en).join(', ')}`,
    `Indicative total quantity: ${value('quantity')} ${value('unit')}`,
    `Destination country: ${value('country')}`, `Destination port or city: ${value('destination') || '—'}`,
    `Shipping preference: ${value('incoterm')}`, '', 'Requirement notes:', value('notes') || '—',
    '', 'Draft inquiry. Please confirm specifications, price, minimum order, documents and shipping terms.'
  ].join('\n');
}

function initializeInquiry() {
  const form = $('#inquiryForm');
  if (!form) return;
  const query = new URLSearchParams(location.search);
  const incoming = [query.get('product'), ...(query.get('products') || '').split(',')].filter(id => productById(id));
  if (incoming.length) {
    incoming.forEach(id => selected.add(id));
    saveSelection();
  }
  $('#rfqProducts').addEventListener('change', event => {
    const { checked, value } = event.target;
    if (checked) selected.add(value);
    else selected.delete(value);
    saveSelection();
  });

  const dialog = $('#summaryDialog');
  const copy = $('#copyRFQ');
  let summary = '';
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!selected.size) {
      $('#productError').hidden = false;
      $('#rfqProducts input').focus();
      return;
    }
    summary = buildSummary(form);
    $('#rfqSummary').textContent = summary;
    copy.innerHTML = `${icon('document')}Copy`;
    const subject = encodeURIComponent('Sourcing inquiry — Royal Grace Exportindo');
    const body = encodeURIComponent(summary);
    $('#emailRFQ').href = `mailto:${company.email}?subject=${subject}&body=${body}`;
    $('#whatsappRFQ').href = `https://wa.me/${company.whatsapp}?text=${body}`;
    openDialog(dialog);
  });
  $('#downloadRFQ').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([`\ufeff${summary}`], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `Royal-Grace-RFQ-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(summary);
      copy.innerHTML = `${icon('check')}Copied`;
    } catch {
      copy.innerHTML = `${icon('document')}Copy unavailable`;
    }
  });
}

function redirectLegacySection() {
  if (document.body.dataset.path !== '') return;
  const routes = {
    '#about': 'about/#our-story', '#products': 'products/', '#quality': 'export/#quality', '#solutions': 'export/#solutions',
    '#media': 'export/#media', '#insights': 'export/#insights', '#faq': 'export/#faq',
    '#contact': 'contact/#contact', '#inquiry': 'contact/#inquiry'
  };
  if (Object.hasOwn(routes, location.hash)) location.replace(localPageLink(base + routes[location.hash]));
}

if (location.protocol === 'file:') {
  for (const link of $$('a[href^="./"], a[href^="../"]')) {
    link.href = localPageLink(link.getAttribute('href'));
  }
}
initializeNavigation();
initializeCatalog();
initializeDialogs();
initializeGallery();
initializeVideo();
initializeSupport();
initializeInquiry();
syncSelection();
$('#year').textContent = String(new Date().getFullYear());
$('#clearShortlist').addEventListener('click', () => {
  const lastFocused = $('[data-save][aria-pressed="true"]:not([hidden])');
  selected.clear();
  saveSelection();
  (lastFocused || $('.header-quote')).focus({ preventScroll: true });
  announce('Product selection cleared.');
});
window.addEventListener('storage', event => {
  if (event.key === selectionKey || event.key === null) {
    selected = readSelection();
    syncSelection();
  }
});
redirectLegacySection();
window.addEventListener('hashchange', redirectLegacySection);
