"use client";

import type { Produit } from "@/src/types/produit";

type ProprietesGrilleAdministration = {
  produits: Produit[];
  surAjouterClique: () => void;
  surModifierClique: (produit: Produit) => void;
  surSupprimerProduit: (id: string) => void;
};

export default function GrilleAdministration({
  produits,
  surAjouterClique,
  surModifierClique,
  surSupprimerProduit,
}: ProprietesGrilleAdministration) {
  return (
    <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4">
      <button
        onClick={surAjouterClique}
        className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-encre/25 text-encre/50 transition hover:border-accent-secondaire hover:text-accent-secondaire"
      >
        <span className="font-titre text-4xl">+</span>
        <span className="font-corps text-sm font-medium">Ajouter une paire</span>
      </button>

      {produits.map((produit) => (
        <div
          key={produit.id}
          className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-[#F5E6CE] to-[#E4CDA8] ring-1 ring-encre/5"
        >
          <img
            src={produit.url_photo}
            alt={produit.nom_produit}
            className="h-full w-full object-cover mix-blend-multiply"
          />

          <div className="absolute right-2 top-2 flex gap-2">
            <button
              onClick={() => surModifierClique(produit)}
              aria-label={`Modifier ${produit.nom_produit}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface/95 text-encre shadow transition hover:bg-encre hover:text-fond"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
            <button
              onClick={() => surSupprimerProduit(produit.id)}
              aria-label={`Supprimer ${produit.nom_produit}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface/95 text-sm text-red-600 shadow transition hover:bg-red-600 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-encre/85 to-transparent px-3 pb-3 pt-8">
            <p className="truncate font-titre text-fond">{produit.nom_produit}</p>
            <p className="font-corps text-sm font-semibold text-accent">
              {produit.prix_cfa.toLocaleString("fr-FR")} FCFA
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}