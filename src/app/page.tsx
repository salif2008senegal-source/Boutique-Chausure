import type { Metadata } from "next";
import VitrineClient from "@/src/components/VitrineClient";
import { supabase } from "@/src/lib/supabase";
import { lireBoutique } from "@/src/lib/boutique";
import type { Produit } from "@/src/types/produit";


export const revalidate = 0; // Pour que la page se mette à jour immédiatement après une modif

export async function generateMetadata(): Promise<Metadata> {
  const boutique = await lireBoutique();
  if (!boutique) return {};

  const description =
    "Découvre nos chaussures et discute directement avec nous sur WhatsApp.";

  return {
    title: boutique.nom_boutique,
    description,
    openGraph: {
      title: boutique.nom_boutique,
      description,
      images: [boutique.url_logo],
      type: "website",
      locale: "fr_FR",
    },
  };
}

export default async function PageAccueil() {
  const [reponseProduits, boutique] = await Promise.all([
    supabase
      .from("produits")
      .select("id, nom_produit, prix_cfa, url_photo")
      .order("cree_le", { ascending: false }),
    lireBoutique(),
  ]);

  if (reponseProduits.error) {
    console.error("Erreur Supabase :", reponseProduits.error.message);
  }

  const produits: Produit[] = reponseProduits.data ?? [];

  return <VitrineClient produits={produits} boutique={boutique} />;
}