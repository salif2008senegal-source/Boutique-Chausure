import { supabase } from "@/src/lib/supabase";
import type { Boutique } from "@/src/types/boutique";

export async function lireBoutique(): Promise<Boutique | null> {
  const { data, error } = await supabase
    .from("boutique")
    .select("nom_boutique, url_logo, numero_whatsapp")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("Erreur Supabase (boutique) :", error.message);
    return null;
  }

  return data;
}