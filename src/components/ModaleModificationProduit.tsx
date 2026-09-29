"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { compresserImage } from "@/src/lib/compresserImage";
import type { Produit } from "@/src/types/produit";

export type DonneesModification = {
  id: string;
  nomProduit: string;
  prixCfa: string;
  fichierPhoto: File | null;
};

type Resultat = { ok: boolean; message?: string };

type ProprietesModaleModification = {
  produit: Produit;
  surFermer: () => void;
  surEnregistrer: (donnees: DonneesModification) => Promise<Resultat>;
};

export default function ModaleModificationProduit({
  produit,
  surFermer,
  surEnregistrer,
}: ProprietesModaleModification) {
  const [apercuPhoto, setApercuPhoto] = useState(produit.url_photo);
  const [fichierPhoto, setFichierPhoto] = useState<File | null>(null);
  const [nomProduit, setNomProduit] = useState(produit.nom_produit);
  const [prixCfa, setPrixCfa] = useState(String(produit.prix_cfa));
  const [enCours, setEnCours] = useState(false);
  const [compressionEnCours, setCompressionEnCours] = useState(false);
  const [messageErreur, setMessageErreur] = useState("");

  async function surChangementPhoto(e: ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    if (apercuPhoto.startsWith("blob:")) URL.revokeObjectURL(apercuPhoto);
    setApercuPhoto(URL.createObjectURL(fichier));
    setFichierPhoto(null);
    setCompressionEnCours(true);

    const fichierLeger = await compresserImage(fichier);
    setFichierPhoto(fichierLeger);
    setCompressionEnCours(false);
  }

  async function surSoumission(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnCours(true);
    setMessageErreur("");

    let resultat: Resultat;
    try {
      resultat = await surEnregistrer({
        id: produit.id,
        nomProduit,
        prixCfa,
        fichierPhoto,
      });
    } catch {
      resultat = { ok: false, message: "Envoi impossible. Vérifie ta connexion." };
    }

    setEnCours(false);
    if (!resultat.ok) {
      setMessageErreur(resultat.message ?? "Une erreur est survenue.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-encre/60 sm:items-center">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-surface p-6 sm:w-96 sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-titre text-xl font-semibold text-encre">Modifier la paire</h2>
          <button
            onClick={surFermer}
            aria-label="Fermer"
            className="text-xl text-encre/50 hover:text-encre"
          >
            ✕
          </button>
        </div>

        <form onSubmit={surSoumission} className="space-y-4">
          <label className="mx-auto flex aspect-square w-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-encre/25 bg-fond transition hover:border-accent-secondaire">
            <img src={apercuPhoto} alt="Photo du produit" className="h-full w-full object-cover" />
            <input
              type="file"
              accept="image/*"
              onChange={surChangementPhoto}
              className="sr-only"
            />
          </label>
          <p className="text-center font-corps text-xs text-encre/50">
            Touche la photo pour la changer
          </p>

          <label className="block">
            <span className="font-corps text-sm text-encre/70">Nom du produit</span>
            <input
              type="text"
              value={nomProduit}
              onChange={(e) => setNomProduit(e.target.value)}
              maxLength={80}
              className="mt-1 w-full rounded-xl border border-encre/20 bg-white px-3 py-2.5 font-corps text-encre placeholder:text-encre/40"
              required
            />
          </label>

          <label className="block">
            <span className="font-corps text-sm text-encre/70">Prix (FCFA)</span>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={prixCfa}
              onChange={(e) => setPrixCfa(e.target.value)}
              className="mt-1 w-full rounded-xl border border-encre/20 bg-white px-3 py-2.5 font-corps text-encre placeholder:text-encre/40"
              required
            />
          </label>

          {messageErreur && (
            <p className="font-corps text-sm text-red-700">{messageErreur}</p>
          )}

          <button
            type="submit"
            disabled={enCours || compressionEnCours}
            className="w-full rounded-xl bg-encre py-3 font-corps font-semibold text-fond transition hover:bg-accent-secondaire disabled:opacity-60"
          >
            {compressionEnCours
              ? "Préparation de la photo…"
              : enCours
              ? "Enregistrement…"
              : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}