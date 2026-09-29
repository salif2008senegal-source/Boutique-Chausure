import EspaceVendeurClient from "@/src/components/EspaceVendeurClient";
import { supabase } from "@/src/lib/supabase";
import { lireBoutique } from "@/src/lib/boutique";
import { vendeurEstConnecte } from "@/src/lib/sessionVendeur";
import type { Produit } from "@/src/types/produit";
import type { Boutique } from "@/src/types/boutique";

export const dynamic = "force-dynamic";

export default async function PageAjouter() {
  const estConnecte = await vendeurEstConnecte();
  let produits: Produit[] = [];
  let boutique: Boutique | null = null;

  if (estConnecte) {
    const [reponseProduits, boutiqueLue] = await Promise.all([
      supabase
        .from("produits")
        .select("id, nom_produit, prix_cfa, url_photo")
        .order("cree_le", { ascending: false }),
      lireBoutique(),
    ]);

    if (reponseProduits.error) {
      console.error("Erreur Supabase :", reponseProduits.error.message);
    }
    produits = reponseProduits.data ?? [];
    boutique = boutiqueLue;
  }

  return (
    <EspaceVendeurClient
      produits={produits}
      estConnecte={estConnecte}
      boutique={boutique}
      nomVendeur={process.env.NOM_VENDEUR ?? ""}
    />
  );
}