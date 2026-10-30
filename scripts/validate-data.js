// Usage: npm run validate   (checks data/products.csv, changes nothing)
const { loadProducts, csvPathFromArgs, printReport } = require('./lib/load-products');

const result = loadProducts(csvPathFromArgs(process.argv.slice(2)));
printReport(result);
if (result.errors.length > 0) {
  console.error(`\nValidation failed with ${result.errors.length} error(s). Fix them in Google Sheets, export the CSV again, then re-run.`);
  process.exit(1);
}
console.log('Validation passed.');
