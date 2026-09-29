import "server-only";
import { createClient } from "@supabase/supabase-js";

const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const cleServeur = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client admin : peut écrire dans la base (ajout, suppression).
// Utilisé UNIQUEMENT côté serveur, jamais dans un composant client.
export const supabaseAdmin = createClient(urlSupabase, cleServeur, {
  auth: { persistSession: false },
});