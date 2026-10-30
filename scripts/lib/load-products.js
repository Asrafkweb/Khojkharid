// Read a products CSV from disk and return validated, public-ready products.
const fs = require('node:fs');
const path = require('node:path');
const config = require('../../site.config');
const { parseCsv, rowsToRecords } = require('./csv-parser');
const { PRODUCT_HEADERS, validateRecords } = require('./product-rules');

const ROOT = path.join(__dirname, '..', '..');
const DEFAULT_CSV = path.join(ROOT, 'data', 'products.csv');

function loadProducts(csvPath = DEFAULT_CSV) {
  const fail = (message) => ({ products: [], errors: [message], warnings: [], counts: { published: 0, draft: 0, archived: 0 } });
  if (!fs.existsSync(csvPath)) return fail(`File not found: ${csvPath}`);

  let rows;
  try { rows = parseCsv(fs.readFileSync(csvPath, 'utf8')); }
  catch (error) { return fail(`Could not read CSV: ${error.message}`); }

  const { records, missingHeaders } = rowsToRecords(rows, PRODUCT_HEADERS);
  if (missingHeaders.length > 0) return fail(`Missing column(s): ${missingHeaders.join(', ')}. Export the Products tab with its header row.`);

  return validateRecords(records, {
    domain: config.domain,
    today: new Date().toISOString().slice(0, 10),
    imageExists: (imagePath) => fs.existsSync(path.join(ROOT, 'src', imagePath))
  });
}

// Read "--csv some/file.csv" from the command line (used for local previews).
function csvPathFromArgs(argv) {
  const index = argv.indexOf('--csv');
  return index !== -1 && argv[index + 1] ? path.resolve(argv[index + 1]) : DEFAULT_CSV;
}

function printReport(result) {
  const { counts, errors, warnings } = result;
  console.log(`Rows: ${counts.published} published, ${counts.draft} draft, ${counts.archived} archived`);
  warnings.forEach((w) => console.log(`  warning: ${w}`));
  errors.forEach((e) => console.error(`  ERROR: ${e}`));
}

module.exports = { loadProducts, csvPathFromArgs, printReport };
