const PAGE_SIZE = 1000;

type PageResult = {
  data: unknown[] | null;
  error: { message: string } | null;
  count: number | null;
};

// Supabase caps response sizes. Never silently use a failed partial read.
export async function fetchAllPages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult>,
): Promise<T[]> {
  const rows: T[] = [];
  while (true) {
    const from = rows.length;
    const { data, error, count } = await fetchPage(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    rows.push(...(data as T[]));
    if (count !== null && rows.length >= count) break;
  }
  return rows;
}

// Counts can shrink between requests. Keyset reads finish only on an empty page.
export async function fetchAllPagesAfter<T, Cursor>(
  fetchPage: (after: Cursor | null, limit: number) => PromiseLike<PageResult>,
  cursorFor: (row: T) => Cursor,
): Promise<T[]> {
  const rows: T[] = [];
  let after: Cursor | null = null;
  while (true) {
    const { data, error } = await fetchPage(after, PAGE_SIZE);
    if (error) throw new Error(error.message);
    if (!data?.length) return rows;
    const page = data as T[];
    const next = cursorFor(page[page.length - 1]);
    if (JSON.stringify(next) === JSON.stringify(after)) throw new Error("Pagination cursor did not advance.");
    rows.push(...page);
    after = next;
  }
}
