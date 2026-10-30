// A small CSV parser. In plain English: it walks through the text one character
// at a time and remembers whether it is currently inside "quotes". Inside quotes,
// commas and line breaks are part of the value; outside quotes they separate
// fields and rows. A doubled quote ("") inside quotes means one literal quote.

function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // Excel/Sheets BOM
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field); field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++; // Windows line ending
      row.push(field); rows.push(row); row = []; field = '';
    } else {
      field += char;
    }
  }
  if (inQuotes) throw new Error('The CSV has an opening quote that is never closed.');
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

// Turn rows into objects keyed by header name. `rowNumber` matches the spreadsheet row
// (header = row 1), so error messages point at the right line in Google Sheets.
function rowsToRecords(rows, requiredHeaders) {
  if (rows.length === 0) return { records: [], missingHeaders: requiredHeaders.slice() };
  const header = rows[0].map((name) => name.trim());
  const missingHeaders = requiredHeaders.filter((name) => !header.includes(name));
  if (missingHeaders.length > 0) return { records: [], missingHeaders };

  const records = [];
  rows.slice(1).forEach((cells, index) => {
    if (cells.every((cell) => cell.trim() === '')) return; // skip blank rows
    const record = { rowNumber: index + 2 };
    header.forEach((name, column) => { record[name] = (cells[column] ?? '').trim(); });
    records.push(record);
  });
  return { records, missingHeaders: [] };
}

module.exports = { parseCsv, rowsToRecords };
