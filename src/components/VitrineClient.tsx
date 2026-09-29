"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GrilleProduits from "@/src/components/GrilleProduits";
import ModaleCommande from "@/src/components/LienCommande";
import type { Produit } from "@/src/types/produit";
import type { Boutique } from "@/src/types/boutique";

const points_forts = [
  "Réponse rapide sur WhatsApp",
  "Livraison à ton adresse",
  "Paiement à la livraison",
];

type ProprietesVitrine = {
  produits: Produit[];
  boutique: Boutique | null;
};

export default function VitrineClient({ produits, boutique }: ProprietesVitrine) {
  const [produitChoisi, setProduitChoisi] = useState<Produit | null>(null);
  const [estVendeur, setEstVendeur] = useState(false);

  const nomBoutique = boutique?.nom_boutique ?? "Notre boutique";

  // Simple repère visuel : seul le téléphone du vendeur voit le raccourci vers son espace
  useEffect(() => {
    try {
      setEstVendeur(localStorage.getItem("estVendeur") === "1");
    } catch {
      setEstVendeur(false);
    }
  }, []);

  return (
    <div className="min-h-screen pb-24">
      <header className="mx-auto flex max-w-4xl items-center gap-3 px-4 pt-6">
        {boutique?.url_logo ? (
          <img
            src={boutique.url_logo}
            alt={`Logo ${nomBoutique}`}
            className="h-12 w-12 rounded-2xl object-cover shadow-md ring-2 ring-white/60"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-secondaire font-titre text-xl text-fond shadow-md">
            {nomBoutique.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="font-titre text-lg text-encre">{nomBoutique}</span>
      </header>

      <section className="relative mx-auto max-w-4xl overflow-hidden px-4 pb-8 pt-10 sm:pt-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-16 h-72 w-72 rounded-full bg-accent/25 blur-3xl"
        />
        <h1 className="relative font-titre text-5xl font-semibold leading-[1.05] tracking-tight text-encre sm:text-7xl">
          Trouve la paire
          <br />
          qui te <span className="text-accent">ressemble.</span>
        </h1>
        <p className="relative mt-5 max-w-md font-corps text-base text-encre/70 sm:text-lg">
          Choisis ta paire, discute sur WhatsApp, le vendeur fait le reste.
        </p>
        <ul className="relative mt-6 flex flex-wrap gap-2 font-corps text-sm">
          {points_forts.map((point) => (
            <li
              key={point}
              className="rounded-full bg-surface px-3.5 py-1.5 text-encre/80 ring-1 ring-encre/10"
            >
              {point}
            </li>
          ))}
        </ul>
      </section>

      <div className="mx-auto max-w-4xl px-4 pt-4">
        <h2 className="font-titre text-2xl text-encre">Le catalogue</h2>
      </div>

      <GrilleProduits produits={produits} surCommanderClique={setProduitChoisi} />

      <ModaleCommande
        produit={produitChoisi}
        numeroWhatsApp={boutique?.numero_whatsapp ?? ""}
        surFermer={() => setProduitChoisi(null)}
      />

      {estVendeur && (
        <Link
          href="/ajouter"
          className="fixed bottom-4 right-4 z-40 rounded-full bg-encre px-5 py-3 font-corps text-sm font-semibold text-fond shadow-lg transition hover:bg-accent-secondaire"
        >
          Gérer mes produits
        </Link>
      )}
    </div>
  );
}