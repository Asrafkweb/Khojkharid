const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'search.js'), 'utf8'), sandbox);
const { matches, normalize } = sandbox.window.KKSearch;

test('search ignores case and extra spaces', () => {
  assert.strictEqual(normalize('  Laptop   STAND '), 'laptop stand');
  assert.ok(matches('dummy laptop stand office', '  LAPTOP  stand '));
});
test('every word must match, and an empty query matches everything', () => {
  assert.ok(!matches('dummy laptop stand', 'laptop lamp'));
  assert.ok(matches('anything', '   '));
});
