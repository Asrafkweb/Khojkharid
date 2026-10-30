const test = require('node:test');
const assert = require('node:assert');
const { parseCsv, rowsToRecords } = require('../scripts/lib/csv-parser');

test('handles commas, escaped quotes and multiline fields', () => {
  const rows = parseCsv('a,b\r\n"one, two","say ""hi"""\r\n"line1\nline2",x\r\n');
  assert.deepStrictEqual(rows, [['a', 'b'], ['one, two', 'say "hi"'], ['line1\nline2', 'x']]);
});

test('keeps empty fields and a last row without trailing newline', () => {
  assert.deepStrictEqual(parseCsv('a,b,c\n1,,3'), [['a', 'b', 'c'], ['1', '', '3']]);
});

test('strips a BOM and rejects an unclosed quote', () => {
  assert.deepStrictEqual(parseCsv('\uFEFFa\n1'), [['a'], ['1']]);
  assert.throws(() => parseCsv('a\n"oops'));
});

test('rowsToRecords trims values, numbers rows from the sheet and reports missing columns', () => {
  const { records } = rowsToRecords(parseCsv('name,price\n  Lamp , 10 \n,\nDesk,20'), ['name', 'price']);
  assert.deepStrictEqual(records.map((r) => [r.rowNumber, r.name, r.price]), [[2, 'Lamp', '10'], [4, 'Desk', '20']]);
  assert.deepStrictEqual(rowsToRecords(parseCsv('name\nx'), ['name', 'price']).missingHeaders, ['price']);
});
