"use client";

import CarteProduit from "@/src/components/CarteProduit";
import type { Produit } from "@/src/types/produit";

type ProprietesGrilleProduits = {
  produits: Produit[];
  surCommanderClique: (produit: Produit) => void;
};

export default function GrilleProduits({
  produits,
  surCommanderClique,
}: ProprietesGrilleProduits) {
  if (produits.length === 0) {
    return (
      <p className="mx-auto max-w-4xl px-4 py-16 text-center font-corps text-encre/60">
        Les nouvelles paires arrivent bientôt.
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 p-4">
      {produits.map((produit) => (
        <CarteProduit
          key={produit.id}
          produit={produit}
          surCommanderClique={surCommanderClique}
        />
      ))}
    </div>
  );
}