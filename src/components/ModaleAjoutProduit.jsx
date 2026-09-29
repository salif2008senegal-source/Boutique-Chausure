"use client";

import { useState } from "react";
import { compresserImage } from "@/src/lib/compresserImage";

export default function ModaleAjoutProduit({ estOuverte, surFermer, surValiderAjout }) {
  const [apercuPhoto, setApercuPhoto] = useState(null);
  const [fichierPhoto, setFichierPhoto] = useState(null);
  const [nomProduit, setNomProduit] = useState("");
  const [prixCfa, setPrixCfa] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [compressionEnCours, setCompressionEnCours] = useState(false);
  const [messageErreur, setMessageErreur] = useState("");
  const [ajoutReussi, setAjoutReussi] = useState(false);
  const [cleInputPhoto, setCleInputPhoto] = useState(0);

  if (!estOuverte) return null;

  function reinitialiserFormulaire() {
    if (apercuPhoto) URL.revokeObjectURL(apercuPhoto);
    setNomProduit("");
    setPrixCfa("");
    setFichierPhoto(null);
    setApercuPhoto(null);
    setMessageErreur("");
    setCleInputPhoto((n) => n + 1);
  }

  function fermer() {
    setAjoutReussi(false);
    surFermer();
  }

  async function surChangementPhoto(e) {
    const fichier = e.target.files[0];
    if (!fichier) return;

    if (apercuPhoto) URL.revokeObjectURL(apercuPhoto);
    setApercuPhoto(URL.createObjectURL(fichier));
    setFichierPhoto(null);
    setCompressionEnCours(true);

    const fichierLeger = await compresserImage(fichier);
    setFichierPhoto(fichierLeger);
    setCompressionEnCours(false);
  }

  async function surSoumission(e) {
    e.preventDefault();
    if (!fichierPhoto) {
      setMessageErreur("Ajoute une photo.");
      return;
    }

    setEnCours(true);
    setMessageErreur("");

    const resultat = await surValiderAjout({ nomProduit, prixCfa, fichierPhoto });

    setEnCours(false);
    if (resultat?.ok) {
      reinitialiserFormulaire();
      setAjoutReussi(true);
    } else {
      setMessageErreur(resultat?.message ?? "Une erreur est survenue.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-encre/60 sm:items-center">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-surface p-6 sm:w-96 sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-titre text-xl font-semibold text-encre">Ajouter une paire</h2>
          <button
            onClick={fermer}
            aria-label="Fermer"
            className="text-xl text-encre/50 hover:text-encre"
          >
            ✕
          </button>
        </div>

        {ajoutReussi ? (
          <div className="space-y-5 py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-3xl text-accent">
              ✓
            </div>
            <div>
              <p className="font-titre text-xl font-semibold text-encre">Paire ajoutée !</p>
              <p className="mt-1 font-corps text-sm text-encre/60">
                Elle est déjà visible sur ton site.
              </p>
            </div>
            <button
              onClick={() => setAjoutReussi(false)}
              className="w-full rounded-xl bg-encre py-3 font-corps font-semibold text-fond transition hover:bg-accent-secondaire"
            >
              Ajouter une autre paire
            </button>
            <button
              onClick={fermer}
              className="w-full rounded-xl border border-encre/20 py-3 font-corps font-semibold text-encre"
            >
              Terminer
            </button>
          </div>
        ) : (
          <form onSubmit={surSoumission} className="space-y-4">
            <label className="mx-auto flex aspect-square w-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-encre/25 bg-fond text-encre/50 transition hover:border-accent-secondaire">
              {apercuPhoto ? (
                <img src={apercuPhoto} alt="Aperçu" className="h-full w-full object-cover" />
              ) : (
                <>
                  <span className="font-titre text-4xl">+</span>
                  <span className="font-corps text-sm">Ajouter la photo</span>
                </>
              )}
              <input
                key={cleInputPhoto}
                type="file"
                accept="image/*"
                onChange={surChangementPhoto}
                className="sr-only"
                required
              />
            </label>

            <label className="block">
              <span className="font-corps text-sm text-encre/70">Nom du produit</span>
              <input
                type="text"
                value={nomProduit}
                onChange={(e) => setNomProduit(e.target.value)}
                placeholder="Ex : Sneaker Blanche"
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
                placeholder="Ex : 15000"
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
                ? "Envoi en cours…"
                : "Ajouter au catalogue"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}