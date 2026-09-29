"use client";

import { useState, type FormEvent } from "react";
import type { Produit } from "@/src/types/produit";

type ProprietesModaleCommande = {
  produit: Produit | null;
  numeroWhatsApp: string;
  surFermer: () => void;
};

// Emojis écrits sous forme de codes : ils s'affichent bien quel que soit l'encodage du fichier
const EMOJI = {
  salut: "\u{1F44B}",
  chaussure: "\u{1F45F}",
  prix: "\u{1F4B0}",
  pointure: "\u{1F4CF}",
  lieu: "\u{1F4CD}",
  photo: "\u{1F4F8}",
  merci: "\u{1F64F}",
};

function formaterPrix(prix: number): string {
  return prix.toLocaleString("fr-FR").replace(/[\u202f\u00a0]/g, " ");
}

export default function ModaleCommande({
  produit,
  numeroWhatsApp,
  surFermer,
}: ProprietesModaleCommande) {
  const [pointure, setPointure] = useState("");
  const [adresse, setAdresse] = useState("");

  if (!produit) return null;

  function surSoumission(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!produit) return;

    // Lien de photo plus léger pour l'aperçu dans WhatsApp
    const lienPhoto = produit.url_photo.replace("/upload/", "/upload/q_auto,w_800/");

    const message = [
      `Bonjour ${EMOJI.salut}, je suis intéressé(e) par cette paire :`,
      "",
      `${EMOJI.chaussure} *${produit.nom_produit}*`,
      `${EMOJI.prix} ${formaterPrix(produit.prix_cfa)} FCFA`,
      `${EMOJI.pointure} Pointure : ${pointure.trim()}`,
      `${EMOJI.lieu} Livraison : ${adresse.trim()}`,
      "",
      `${EMOJI.photo} Photo : ${lienPhoto}`,
      "",
      `Pouvez-vous me confirmer la disponibilité ${EMOJI.merci} ?`,
    ].join("\n");

    const lien = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(message)}`;
    window.open(lien, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-encre/60 sm:items-center">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-surface p-6 sm:w-96 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-titre text-xl font-semibold text-encre">
            Discuter avec le vendeur
          </h2>
          <button
            onClick={surFermer}
            aria-label="Fermer"
            className="text-xl text-encre/50 hover:text-encre"
          >
            ✕
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-fond p-3">
          <img
            src={produit.url_photo}
            alt={produit.nom_produit}
            className="h-16 w-16 rounded-xl object-cover"
          />
          <div>
            <p className="font-titre text-encre">{produit.nom_produit}</p>
            <p className="font-corps font-semibold text-accent">
              {formaterPrix(produit.prix_cfa)} FCFA
            </p>
          </div>
        </div>

        <form onSubmit={surSoumission} className="space-y-4">
          <label className="block">
            <span className="font-corps text-sm text-encre/70">Pointure souhaitée</span>
            <input
              type="text"
              value={pointure}
              onChange={(e) => setPointure(e.target.value)}
              placeholder="Ex : 42"
              className="mt-1 w-full rounded-xl border border-encre/20 bg-white px-3 py-2.5 font-corps text-encre placeholder:text-encre/40"
              required
            />
          </label>

          <label className="block">
            <span className="font-corps text-sm text-encre/70">
              Adresse / Quartier de livraison
            </span>
            <input
              type="text"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Ex : Médina, près du marché"
              className="mt-1 w-full rounded-xl border border-encre/20 bg-white px-3 py-2.5 font-corps text-encre placeholder:text-encre/40"
              required
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-b from-[#34E37F] to-[#1FBF5B] py-3 font-corps font-bold text-encre shadow-[0_10px_24px_-8px_rgba(31,191,91,0.75)] transition hover:-translate-y-0.5 active:translate-y-0"
          >
            Envoyer sur WhatsApp
          </button>
          <p className="text-center font-corps text-xs text-encre/50">
            Ton message est déjà rédigé, tu n&apos;as qu&apos;à l&apos;envoyer.
          </p>
        </form>
      </div>
    </div>
  );
}