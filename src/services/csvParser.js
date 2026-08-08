/**
 * Lightweight, zero-dependency CSV parser with auto-type conversion
 */

export function parseCSV(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];
  
  const lines = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      currentLine += '"';
      i++; // skip escaped quote
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === '\r' && nextChar === '\n') || char === '\n' || char === '\r') {
      if (inQuotes) {
        currentLine += char;
      } else {
        if (currentLine.trim()) lines.push(currentLine);
        currentLine = '';
        if (char === '\r' && nextChar === '\n') i++; // skip \n
      }
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) lines.push(currentLine);

  if (lines.length === 0) return [];

  const headers = splitCSVLine(lines[0]);
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;

    const row = {};
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      const val = values[j] !== undefined ? values[j] : '';
      row[header] = autoCastValue(val);
    }
    results.push(row);
  }

  return results;
}

function splitCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    const next = line[i + 1];

    if (c === '"' && inQuotes && next === '"') {
      cur += '"';
      i++;
    } else if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

function autoCastValue(val) {
  if (val === '' || val === null || val === undefined) return null;
  if (val === 'null' || val === 'NULL') return null;
  if (val === 'true' || val === 'TRUE' || val === 'Yes' || val === 'yes') return true;
  if (val === 'false' || val === 'FALSE' || val === 'No' || val === 'no') return false;
  
  // Clean string quotes
  if (typeof val === 'string' && val.startsWith('"') && val.endsWith('"')) {
    val = val.substring(1, val.length - 1);
  }

  // Check integer/float
  if (!isNaN(val) && !isNaN(parseFloat(val)) && isFinite(val) && !val.includes('-') && !val.startsWith('0') && val.length < 16) {
    return Number(val);
  }
  if (val === '0') return 0;

  return val;
}
