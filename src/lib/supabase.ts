import { createClient } from "@supabase/supabase-js";

const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const cleAnonyme = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client public : lecture seule des produits (protégé par les règles RLS)
export const supabase = createClient(urlSupabase, cleAnonyme);