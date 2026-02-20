import { createClient } from "@supabase/supabase-js";

const anonKey = process.env.SUPABASE_ANON_KEY;
const url = process.env.SUPABASE_URL;

export const supabase = createClient();
