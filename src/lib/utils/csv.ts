export type CsvValue = string | number | boolean | null | undefined;

export type CsvColumn<T> = {
  header: string;
  value: (row: T) => CsvValue;
};

// Prepended so Excel opens the file as UTF-8 (accented names render correctly).
const UTF8_BOM = "﻿";

// Cells starting with these characters can be interpreted as formulas by
// spreadsheet apps (CSV injection), so they get a leading apostrophe.
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export function toCsvCell(value: CsvValue) {
  if (value === null || value === undefined) return '""';

  let text = String(value);
  // Only guard strings, so numbers like -5 stay numeric.
  if (typeof value === "string" && FORMULA_PREFIX.test(text)) {
    text = "'" + text;
  }

  return '"' + text.replaceAll('"', '""') + '"';
}

export function buildCsv<T>(columns: CsvColumn<T>[], rows: T[]) {
  const header = columns.map((column) => toCsvCell(column.header)).join(",");
  const body = rows.map((row) =>
    columns.map((column) => toCsvCell(column.value(row))).join(","),
  );

  return UTF8_BOM + [header, ...body].join("\r\n");
}

export function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
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
