export type CsvValue = string | number | boolean | null | undefined;

export type CsvColumn<T> = {
  header: string;
  value: (row: T) => CsvValue;
  // Keep the value as text when opened in a spreadsheet, so ZIP codes and
  // phone numbers aren't converted to numbers (e.g. "02101" -> 2101).
  asText?: boolean;
};

// Prepended so Excel opens the file as UTF-8 (accented names render correctly).
const UTF8_BOM = "﻿";

// Cells starting with these characters can be interpreted as formulas by
// spreadsheet apps (CSV injection), so they get a leading apostrophe.
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

// Values made only of digits, spaces and + - ( ) . (phone numbers like
// "+1 (301) 555-0142") can't call functions, so they're left unescaped.
const NUMERIC_LIKE = /^[\d\s+\-().]+$/;

// Characters allowed inside a ="..." text formula. Excluding quotes means the
// value can't break out of the string literal.
const TEXT_FORMULA_SAFE = /^[A-Za-z0-9 +\-().]+$/;

export function toCsvCell(value: CsvValue, asText = false) {
  if (value === null || value === undefined) return '""';

  let text = String(value);

  // ="02101" makes Excel, Numbers and Google Sheets display the value as text.
  if (asText && TEXT_FORMULA_SAFE.test(text)) {
    return '"=""' + text + '"""';
  }

  // Only guard strings, so numbers like -5 stay numeric.
  if (
    typeof value === "string" &&
    FORMULA_PREFIX.test(text) &&
    !NUMERIC_LIKE.test(text)
  ) {
    text = "'" + text;
  }

  return '"' + text.replaceAll('"', '""') + '"';
}

export function buildCsv<T>(columns: CsvColumn<T>[], rows: T[]) {
  const header = columns.map((column) => toCsvCell(column.header)).join(",");
  const body = rows.map((row) =>
    columns
      .map((column) => toCsvCell(column.value(row), column.asText))
      .join(","),
  );

  return UTF8_BOM + [header, ...body].join("\r\n");
}

export function downloadFile(filename: string, file: Blob) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function formatCsvDate(dateStr?: string | null) {
  if (!dateStr) return "";
  return dateStr.split("T")[0];
}

export function formatCsvBoolean(value?: boolean | null) {
  if (value === null || value === undefined) return "";
  return value ? "Yes" : "No";
}

export function formatCsvList(values: CsvValue[]) {
  return values
    .filter((value) => value !== null && value !== undefined && value !== "")
    .join("; ");
}
