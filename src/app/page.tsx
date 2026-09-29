import type { Metadata } from "next";
import Link from "next/link";
import VitrineClient from "@/src/components/VitrineClient";
import { supabase } from "@/src/lib/supabase";
import { lireBoutique } from "@/src/lib/boutique";
import type { Produit } from "@/src/types/produit";

export const revalidate = 60;

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
  const boutique = await lireBoutique();

  // Pas de redirection : juste un lien. Aucune boucle possible.
  if (!boutique) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <p className="font-titre text-2xl font-semibold text-encre">
            Cette boutique n&apos;est pas encore configurée.
          </p>
          <Link
            href="/ajouter"
            className="mt-5 inline-block rounded-xl bg-encre px-5 py-3 font-corps font-semibold text-fond"
          >
            Configurer ma boutique
          </Link>
        </div>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("produits")
    .select("id, nom_produit, prix_cfa, url_photo")
    .order("cree_le", { ascending: false });

  if (error) {
    console.error("Erreur Supabase :", error.message);
  }

  const produits: Produit[] = data ?? [];

  return <VitrineClient produits={produits} boutique={boutique} />;
}