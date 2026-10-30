const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sandbox = { window: {}, document: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'pager.js'), 'utf8'), sandbox);
// Results come from another JS context, so they are compared as plain JSON text.
const pageList = (current, total) => JSON.parse(JSON.stringify(sandbox.window.KKPager.pageList(current, total)));

test('few pages: every number is shown', () => assert.deepStrictEqual(pageList(2, 5), [1, 2, 3, 4, 5]));
test('many pages: first, last and neighbours with gaps', () => {
  assert.deepStrictEqual(pageList(10, 20), [1, '…', 9, 10, 11, '…', 20]);
});
test('near the start and the end', () => {
  assert.deepStrictEqual(pageList(1, 20), [1, 2, 3, 4, '…', 20]);
  assert.deepStrictEqual(pageList(20, 20), [1, '…', 17, 18, 19, 20]);
});
