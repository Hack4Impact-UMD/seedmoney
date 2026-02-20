import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "missing Supabase env variables, SUPABASE_URL and SUPABASE_ANON_KEY must be set.",
  );
}

export const supabase = createClient(url, anonKey);
