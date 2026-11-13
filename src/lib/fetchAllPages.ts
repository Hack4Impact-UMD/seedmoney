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
