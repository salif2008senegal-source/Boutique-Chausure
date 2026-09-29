"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { compresserImage } from "@/src/lib/compresserImage";
import { configurerBoutique } from "@/src/app/ajouter/actions";
import type { Boutique } from "@/src/types/boutique";

type ProprietesAccueilConfiguration = {
  nomVendeur: string;
  boutiqueExistante: Boutique | null;
  surAnnuler?: () => void;
};

const EMOJI_CHAUSSURE = "\u{1F45F}";

const chaussures = [
  { haut: "6%", gauche: "8%", taille: "text-5xl", duree: 7, delai: 0, inverse: false },
  { haut: "12%", gauche: "76%", taille: "text-6xl", duree: 9, delai: 1.2, inverse: true },
  { haut: "34%", gauche: "88%", taille: "text-3xl", duree: 6, delai: 0.6, inverse: false },
  { haut: "58%", gauche: "3%", taille: "text-4xl", duree: 8, delai: 2, inverse: true },
  { haut: "78%", gauche: "72%", taille: "text-5xl", duree: 10, delai: 0.4, inverse: false },
  { haut: "88%", gauche: "20%", taille: "text-3xl", duree: 7, delai: 1.6, inverse: true },
  { haut: "3%", gauche: "46%", taille: "text-4xl", duree: 9, delai: 2.4, inverse: false },
  { haut: "68%", gauche: "46%", taille: "text-3xl", duree: 8, delai: 3, inverse: true },
];

export default function AccueilConfiguration({
  nomVendeur,
  boutiqueExistante,
  surAnnuler,
}: ProprietesAccueilConfiguration) {
  const routeur = useRouter();
  const modeEdition = Boolean(boutiqueExistante);

  const [apercuLogo, setApercuLogo] = useState<string | null>(
    boutiqueExistante?.url_logo ?? null
  );
  const [fichierLogo, setFichierLogo] = useState<File | null>(null);
  const [nomBoutique, setNomBoutique] = useState(boutiqueExistante?.nom_boutique ?? "");
  const [numeroWhatsApp, setNumeroWhatsApp] = useState(
    boutiqueExistante?.numero_whatsapp ?? ""
  );
  const [enCours, setEnCours] = useState(false);
  const [compressionEnCours, setCompressionEnCours] = useState(false);
  const [messageErreur, setMessageErreur] = useState("");

  async function surChangementLogo(e: ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    if (apercuLogo && apercuLogo.startsWith("blob:")) URL.revokeObjectURL(apercuLogo);
    setApercuLogo(URL.createObjectURL(fichier));
    setFichierLogo(null);
    setCompressionEnCours(true);

    const fichierLeger = await compresserImage(fichier, 600);
    setFichierLogo(fichierLeger);
    setCompressionEnCours(false);
  }

  async function surSoumission(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!modeEdition && !fichierLogo) {
      setMessageErreur("Ajoute ton logo.");
      return;
    }

    setEnCours(true);
    setMessageErreur("");

    const formData = new FormData();
    formData.append("nom_boutique", nomBoutique);
    formData.append("numero_whatsapp", numeroWhatsApp);
    if (fichierLogo) formData.append("logo", fichierLogo);

    try {
      const resultat = await configurerBoutique(formData);
      if (resultat.ok) {
        routeur.refresh();
        surAnnuler?.();
      } else {
        setMessageErreur(resultat.message ?? "Une erreur est survenue.");
      }
    } catch {
      setMessageErreur("Envoi impossible. Vérifie ta connexion et réessaie.");
    }

    setEnCours(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-encre p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/30 blur-3xl"
      />

      {chaussures.map((chaussure, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={`animation-vol pointer-events-none absolute select-none ${chaussure.taille}`}
          style={{
            top: chaussure.haut,
            left: chaussure.gauche,
            animationDuration: `${chaussure.duree}s`,
            animationDelay: `${chaussure.delai}s`,
            scale: chaussure.inverse ? "-1 1" : "1 1",
          }}
        >
          {EMOJI_CHAUSSURE}
        </span>
      ))}

      <div className="relative z-10 w-full max-w-sm">
        <h1 className="text-center font-titre text-4xl font-semibold leading-tight text-fond">
          {modeEdition ? (
            "Ma boutique"
          ) : (
            <>
              Bienvenue
              {nomVendeur ? (
                <>
                  <br />
                  <span className="text-accent">{nomVendeur}</span>
                </>
              ) : null}
            </>
          )}
        </h1>
        <p className="mt-3 text-center font-corps text-fond/70">
          {modeEdition
            ? "Modifie les infos de ta boutique."
            : "Configure ta boutique en 30 secondes."}
        </p>

        <form
          onSubmit={surSoumission}
          className="mt-8 space-y-4 rounded-3xl bg-surface p-6 shadow-2xl"
        >
          <label className="mx-auto flex aspect-square w-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-encre/25 bg-fond text-encre/50 transition hover:border-accent-secondaire">
            {apercuLogo ? (
              <img src={apercuLogo} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <>
                <span className="font-titre text-4xl">+</span>
                <span className="font-corps text-sm">Ajouter ton logo</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={surChangementLogo}
              className="sr-only"
              required={!modeEdition}
            />
          </label>

          <label className="block">
            <span className="font-corps text-sm text-encre/70">Nom de la boutique</span>
            <input
              type="text"
              value={nomBoutique}
              onChange={(e) => setNomBoutique(e.target.value)}
              placeholder="Ex : Babacar Sneakers"
              maxLength={60}
              className="mt-1 w-full rounded-xl border border-encre/20 bg-white px-3 py-2.5 font-corps text-encre placeholder:text-encre/40"
              required
            />
          </label>

          <label className="block">
            <span className="font-corps text-sm text-encre/70">Ton numéro WhatsApp</span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={numeroWhatsApp}
              onChange={(e) => setNumeroWhatsApp(e.target.value)}
              placeholder="Ex : 77 123 45 67"
              className="mt-1 w-full rounded-xl border border-encre/20 bg-white px-3 py-2.5 font-corps text-encre placeholder:text-encre/40"
              required
            />
            <span className="mt-1 block font-corps text-xs text-encre/50">
              Le numéro sur lequel tes clients t&apos;écriront.
            </span>
          </label>

          {messageErreur && (
            <p className="font-corps text-sm text-red-700">{messageErreur}</p>
          )}

          <button
            type="submit"
            disabled={enCours || compressionEnCours}
            className="w-full rounded-xl bg-accent py-3 font-corps font-semibold text-encre transition hover:brightness-110 disabled:opacity-60"
          >
            {compressionEnCours
              ? "Préparation du logo…"
              : enCours
              ? "Enregistrement…"
              : modeEdition
              ? "Enregistrer"
              : "Lancer ma boutique"}
          </button>

          {modeEdition && surAnnuler && (
            <button
              type="button"
              onClick={surAnnuler}
              className="w-full py-2 font-corps text-sm text-encre/60 underline underline-offset-4"
            >
              Annuler
            </button>
          )}
        </form>
      </div>
    </main>
  );
}