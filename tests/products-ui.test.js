// Runs src/js/products.js against a tiny fake page, so filtering and sorting logic is tested without a browser.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const read = (file) => fs.readFileSync(path.join(__dirname, '..', 'src', 'js', file), 'utf8');
const card = (name, category, brand, price, updated) => ({
  hidden: false,
  dataset: { name: name.toLowerCase(), category, brand, price: String(price), updated, search: `${name} ${brand} ${category}`.toLowerCase() }
});

function setup(search = '', extraCards = 0) {
  const cards = [card('Lamp', 'office', 'A', 2400, '2026-10-22'), card('Stand', 'office', 'B', 1850, '2026-10-24'), card('Bottle', 'sports', 'C', 950, '2026-10-20')];
  for (let i = 0; i < extraCards; i++) cards.push(card(`Item ${String(i).padStart(2, '0')}`, 'misc', 'Z', 100 + i, '2026-10-01'));
  const pagerCalls = [];
  const input = (value = '') => ({ value });
  const form = { hidden: true, listeners: {}, addEventListener(t, f) { this.listeners[t] = f; }, reset() { Object.values(this.elements).forEach((e) => { e.value = e.defaultValue || ''; }); },
    elements: { q: input(), category: input(), brand: input(), min: input(), max: input(), sort: { value: 'default', defaultValue: 'default' } } };
  const grid = { hidden: false, order: cards.slice(), querySelectorAll: () => cards, append(...items) { this.order = items; } };
  const count = { textContent: '' };
  const empty = { hidden: true };
  const byId = { 'product-grid': grid, filters: form, 'result-count': count, 'no-results': empty, 'clear-search': { addEventListener() {} }, pagination: {} };
  const window = { location: { search }, KKPager: { render: (el, page, total, onChange) => pagerCalls.push({ page, total, onChange }) } };
  const sandbox = { window, document: { getElementById: (id) => byId[id], querySelectorAll: () => [] }, URLSearchParams };
  vm.createContext(sandbox);
  vm.runInContext(read('search.js'), sandbox);
  vm.runInContext(read('products.js'), sandbox);
  const run = (changes) => { Object.assign(form.elements, Object.fromEntries(Object.entries(changes).map(([k, v]) => [k, { value: v }]))); form.listeners.input(); };
  const names = () => grid.order.filter((c) => !c.hidden).map((c) => c.dataset.name);
  return { form, grid, count, empty, run, names, pagerCalls };
}

test('starts with all products and reveals the controls', () => {
  const ui = setup();
  assert.strictEqual(ui.form.hidden, false);
  assert.strictEqual(ui.count.textContent, '3 of 3 products');
});
test('search reads ?q= from the URL', () => assert.deepStrictEqual(setup('?q=bottle').names(), ['bottle']));
test('filters work together instead of overwriting each other', () => {
  const ui = setup();
  ui.run({ category: 'office', max: '2000' });
  assert.deepStrictEqual(ui.names(), ['stand']);
  ui.run({ q: 'lamp', max: '' });
  assert.deepStrictEqual(ui.names(), ['lamp']);
});
test('sorting by price and name', () => {
  const ui = setup();
  ui.run({ sort: 'price-asc' }); assert.deepStrictEqual(ui.names(), ['bottle', 'stand', 'lamp']);
  ui.run({ sort: 'price-desc' }); assert.deepStrictEqual(ui.names(), ['lamp', 'stand', 'bottle']);
  ui.run({ sort: 'name' }); assert.deepStrictEqual(ui.names(), ['bottle', 'lamp', 'stand']);
  ui.run({ sort: 'recent' }); assert.deepStrictEqual(ui.names(), ['stand', 'lamp', 'bottle']);
});
test('shows the empty message when nothing matches', () => {
  const ui = setup();
  ui.run({ q: 'zzz' });
  assert.strictEqual(ui.empty.hidden, false);
  assert.strictEqual(ui.count.textContent, '0 of 3 products');
});

test('shows 12 products per page and numbers the pages', () => {
  const ui = setup('', 27); // 30 products in total
  assert.strictEqual(ui.names().length, 12);
  assert.strictEqual(ui.count.textContent, 'Showing 1–12 of 30 products');
  const last = ui.pagerCalls[ui.pagerCalls.length - 1];
  assert.strictEqual(last.total, 3);
  assert.strictEqual(last.page, 1);
});
test('next page shows the next products, a new filter goes back to page 1', () => {
  const ui = setup('', 27);
  ui.pagerCalls[ui.pagerCalls.length - 1].onChange(3);
  assert.strictEqual(ui.names().length, 6);
  assert.strictEqual(ui.count.textContent, 'Showing 25–30 of 30 products');
  ui.run({ category: 'misc' }); // 27 matches, back on page 1
  assert.strictEqual(ui.count.textContent, 'Showing 1–12 of 27 products');
  assert.strictEqual(ui.pagerCalls[ui.pagerCalls.length - 1].page, 1);
});
test('no pager is needed for 12 products or fewer', () => {
  const ui = setup('', 9); // 12 products
  assert.strictEqual(ui.pagerCalls[ui.pagerCalls.length - 1].total, 1);
});
