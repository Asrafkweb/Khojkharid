// Product comparison: choose up to four products, remembered in localStorage
// (product IDs only, no personal data). Also draws the table on /compare/.
(function () {
  const STORAGE_KEY = 'kk-compare';
  const MAX_PRODUCTS = 4;
  const NOT_PROVIDED = 'Not provided';

  function readIds() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) ? saved.filter((id) => typeof id === 'string').slice(0, MAX_PRODUCTS) : [];
    } catch (error) { return []; } // storage blocked or corrupted: start empty
  }
  function saveIds(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (error) { /* storage blocked: selection lasts for this page only */ }
  }

  // Small helper that builds elements with textContent (never innerHTML).
  function el(tag, props, ...children) {
    const node = document.createElement(tag);
    Object.entries(props || {}).forEach(([key, value]) => {
      if (key === 'text') node.textContent = value;
      else if (key === 'class') node.className = value;
      else node.setAttribute(key, value);
    });
    children.forEach((child) => node.append(child));
    return node;
  }

  let ids = readIds();
  const buttons = Array.from(document.querySelectorAll('[data-compare-id]'));
  const onComparePage = Boolean(document.getElementById('compare-root'));

  // Tray shown at the bottom of the screen while products are selected.
  const message = el('p', { class: 'compare-tray__msg', role: 'status', text: '' });
  const clearButton = el('button', { class: 'btn btn--ghost btn--small', type: 'button', text: 'Clear all' });
  const tray = el('div', { class: 'compare-tray', role: 'region', 'aria-label': 'Selected products to compare', hidden: '' },
    message, el('a', { class: 'btn btn--primary btn--small', href: '/compare/', text: 'Compare now' }), clearButton);
  document.body.append(tray);

  function update() {
    saveIds(ids);
    buttons.forEach((button) => {
      const selected = ids.includes(button.dataset.compareId);
      const name = button.dataset.compareName || 'product';
      button.hidden = false; // revealed only now that the script works
      button.setAttribute('aria-pressed', String(selected));
      button.setAttribute('aria-label', `${selected ? 'Remove' : 'Add'} ${name} ${selected ? 'from' : 'to'} compare`);
      button.textContent = selected ? 'Remove from compare' : 'Add to compare';
    });
    tray.hidden = ids.length === 0 || onComparePage;
    if (ids.length > 0 && message.dataset.limit !== 'true') message.textContent = `${ids.length} of ${MAX_PRODUCTS} selected`;
    if (onComparePage) renderComparePage();
  }

  function toggle(id, button) {
    message.dataset.limit = 'false';
    if (ids.includes(id)) {
      ids = ids.filter((item) => item !== id);
    } else if (ids.length >= MAX_PRODUCTS) {
      message.dataset.limit = 'true';
      message.textContent = `You can compare up to ${MAX_PRODUCTS} products. Remove one to add another.`;
      tray.hidden = false;
      return;
    } else {
      ids = ids.concat(id);
    }
    if (button) { button.classList.remove('pulse'); void button.offsetWidth; button.classList.add('pulse'); }
    update();
  }

  buttons.forEach((button) => button.addEventListener('click', () => toggle(button.dataset.compareId, button)));
  clearButton.addEventListener('click', () => { message.dataset.limit = 'false'; ids = []; update(); });
  window.addEventListener('storage', () => { ids = readIds(); update(); }); // another tab changed it

  // ---------- Comparison table (only on /compare/) ----------
  const AVAILABILITY = { in_stock: 'In stock', out_of_stock: 'Out of stock' };
  const formatPrice = (p) => `${p.currency} ${p.price.toLocaleString('en-US')}`;
  const formatDate = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const orNotProvided = (value) => value || NOT_PROVIDED;

  function renderComparePage() {
    const root = document.getElementById('compare-root');
    let catalog = [];
    try { catalog = JSON.parse(document.getElementById('products-data').textContent); } catch (error) { /* shown as empty below */ }
    const byId = new Map(catalog.map((product) => [product.id, product]));
    const selected = ids.map((id) => byId.get(id)).filter(Boolean);
    if (selected.length !== ids.length) { ids = selected.map((p) => p.id); saveIds(ids); } // drop products that no longer exist
    root.replaceChildren();

    if (selected.length === 0) {
      root.append(el('div', { class: 'empty-state' },
        el('p', {}, el('strong', { text: 'No products selected.' })),
        el('p', { text: 'Use "Add to compare" on any product, then come back here to see them side by side.' }),
        el('a', { class: 'btn btn--primary', href: '/products/', text: 'Browse products' })));
      return;
    }

    const clearAll = el('button', { class: 'btn btn--ghost btn--small', type: 'button', text: 'Remove all products' });
    clearAll.addEventListener('click', () => { ids = []; update(); });
    root.append(el('p', { class: 'result-count', text: `Comparing ${selected.length} of ${MAX_PRODUCTS} possible products.` }), clearAll);

    const specLabels = [];
    selected.forEach((p) => p.specs.forEach((s) => { if (!specLabels.includes(s.label)) specLabels.push(s.label); }));
    const list = (items) => items.length ? el('ul', { class: 'feature-list' }, ...items.map((item) => el('li', { text: item }))) : NOT_PROVIDED;
    const shopLink = (p) => el('a', { class: 'btn btn--primary btn--small', href: p.affiliateUrl, target: '_blank', rel: 'sponsored nofollow noopener noreferrer', text: 'View Price on Daraz ↗' });

    const rows = [
      ['Price', (p) => `${formatPrice(p)} (checked ${formatDate(p.lastUpdated)})`],
      ['Category', (p) => p.category],
      ['Brand', (p) => orNotProvided(p.brand)],
      ['Model', (p) => orNotProvided(p.model)],
      ['Seller', (p) => orNotProvided(p.seller)],
      ['Availability', (p) => AVAILABILITY[p.availability] || NOT_PROVIDED],
      ['Key features', (p) => list(p.features)],
      ...specLabels.map((label) => [label, (p) => orNotProvided((p.specs.find((s) => s.label === label) || {}).value)]),
      ['Last checked', (p) => formatDate(p.lastUpdated)],
      ['Shop', shopLink]
    ];

    const headRow = el('tr', {}, el('td', {}, el('span', { class: 'visually-hidden', text: 'Feature' })));
    selected.forEach((p) => {
      const remove = el('button', { class: 'btn btn--ghost btn--small', type: 'button', 'aria-label': `Remove ${p.name} from comparison`, text: 'Remove' });
      remove.addEventListener('click', () => { ids = ids.filter((id) => id !== p.id); update(); });
      headRow.append(el('th', { scope: 'col' }, el('a', { href: p.url, text: p.name }), el('br'), remove));
    });
    const body = rows.map(([label, getValue]) => {
      const row = el('tr', {}, el('th', { scope: 'row', text: label }));
      selected.forEach((p) => row.append(el('td', {}, getValue(p))));
      return row;
    });

    root.append(
      el('div', { class: 'table-scroll', tabindex: '0', role: 'region', 'aria-label': 'Comparison table, scrolls sideways on small screens' },
        el('table', { class: 'compare-table' }, el('caption', { class: 'visually-hidden', text: 'Product comparison' }), el('thead', {}, headRow), el('tbody', {}, ...body))),
      el('p', { class: 'disclosure', text: 'Details are shown as listed in our product data. A lower price does not make a product better, so check what each one includes. Shop links are affiliate links: KhojKharid may earn a commission from qualifying purchases.' }));
  }

  update();
})();
