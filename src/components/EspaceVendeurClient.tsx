"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GrilleAdministration from "@/src/components/GrilleAdministration";
import ModaleAjoutProduit from "@/src/components/ModaleAjoutProduit";
import ModaleModificationProduit, {
  type DonneesModification,
} from "@/src/components/ModaleModificationProduit";
import AccueilConfiguration from "@/src/components/AccueilConfiguration";
import {
  connecterVendeur,
  deconnecterVendeur,
  ajouterProduit,
  modifierProduit,
  supprimerProduit,
} from "@/src/app/ajouter/actions";
import type { Produit } from "@/src/types/produit";
import type { Boutique } from "@/src/types/boutique";

type NouveauProduit = {
  nomProduit: string;
  prixCfa: string;
  fichierPhoto: File | null;
};

type ProprietesEspaceVendeur = {
  produits: Produit[];
  estConnecte: boolean;
  boutique: Boutique | null;
  nomVendeur: string;
};

export default function EspaceVendeurClient({
  produits,
  estConnecte,
  boutique,
  nomVendeur,
}: ProprietesEspaceVendeur) {
  const routeur = useRouter();
  const [emailSaisi, setEmailSaisi] = useState("");
  const [erreurConnexion, setErreurConnexion] = useState("");
  const [connexionEnCours, setConnexionEnCours] = useState(false);
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [produitAModifier, setProduitAModifier] = useState<Produit | null>(null);
  const [reglagesOuverts, setReglagesOuverts] = useState(false);
  const [erreurGlobale, setErreurGlobale] = useState("");

  // Repère pour le site public : ce téléphone est celui du vendeur (affiche le raccourci "Gérer mes produits")
  useEffect(() => {
    try {
      if (estConnecte) localStorage.setItem("estVendeur", "1");
    } catch {
      // stockage indisponible : sans conséquence
    }
  }, [estConnecte]);

  async function surConnexion(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setConnexionEnCours(true);
    setErreurConnexion("");
    const autorise = await connecterVendeur(emailSaisi);
    if (autorise) {
      routeur.refresh();
    } else {
      setErreurConnexion("Email non reconnu.");
    }
    setConnexionEnCours(false);
  }

  async function surDeconnexion() {
    await deconnecterVendeur();
    try {
      localStorage.removeItem("estVendeur");
    } catch {
      // stockage indisponible : sans conséquence
    }
    routeur.refresh();
  }

  async function surValiderAjout(nouveauProduit: NouveauProduit) {
    const formData = new FormData();
    formData.append("nom_produit", nouveauProduit.nomProduit);
    formData.append("prix_cfa", nouveauProduit.prixCfa);
    if (nouveauProduit.fichierPhoto) {
      formData.append("photo", nouveauProduit.fichierPhoto);
    }

    try {
      return await ajouterProduit(formData);
    } catch {
      return { ok: false, message: "Envoi impossible. Vérifie ta connexion et réessaie." };
    }
  }

  async function surEnregistrerModification(donnees: DonneesModification) {
    const formData = new FormData();
    formData.append("id", donnees.id);
    formData.append("nom_produit", donnees.nomProduit);
    formData.append("prix_cfa", donnees.prixCfa);
    if (donnees.fichierPhoto) {
      formData.append("photo", donnees.fichierPhoto);
    }

    try {
      const resultat = await modifierProduit(formData);
      if (resultat.ok) setProduitAModifier(null);
      return resultat;
    } catch {
      return { ok: false, message: "Envoi impossible. Vérifie ta connexion et réessaie." };
    }
  }

  async function surSupprimerProduit(id: string) {
    if (!window.confirm("Supprimer ce produit du catalogue ?")) return;
    setErreurGlobale("");
    const resultat = await supprimerProduit(id);
    if (!resultat.ok) {
      setErreurGlobale(resultat.message ?? "Suppression impossible.");
    }
  }

  if (!estConnecte) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <form
          onSubmit={surConnexion}
          className="w-full max-w-sm space-y-5 rounded-3xl bg-surface p-8 shadow-lg ring-1 ring-encre/5"
        >
          <div>
            <h1 className="font-titre text-3xl font-semibold text-encre">Espace vendeur</h1>
            <p className="mt-1 font-corps text-sm text-encre/60">
              Entre ton email une seule fois, ton téléphone s&apos;en souviendra.
            </p>
          </div>

          <input
            type="email"
            value={emailSaisi}
            onChange={(e) => setEmailSaisi(e.target.value)}
            placeholder="ton@email.com"
            className="w-full rounded-xl border border-encre/20 bg-white px-3 py-3 font-corps text-encre placeholder:text-encre/40"
            required
          />

          {erreurConnexion && (
            <p className="font-corps text-sm text-red-700">{erreurConnexion}</p>
          )}

          <button
            type="submit"
            disabled={connexionEnCours}
            className="w-full rounded-xl bg-encre py-3 font-corps font-semibold text-fond transition hover:bg-accent-secondaire disabled:opacity-60"
          >
            {connexionEnCours ? "Vérification…" : "Entrer"}
          </button>
        </form>
      </div>
    );
  }

  if (!boutique || reglagesOuverts) {
    return (
      <AccueilConfiguration
        nomVendeur={nomVendeur}
        boutiqueExistante={boutique}
        surAnnuler={boutique ? () => setReglagesOuverts(false) : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen pb-32">
          <div className="mx-auto max-w-4xl px-4 pt-8">
        <div className="flex items-center gap-3">
          {boutique.url_logo && (
            <img
              src={boutique.url_logo}
              alt={`Logo ${boutique.nom_boutique}`}
              className="h-14 w-14 rounded-2xl object-cover shadow-md ring-2 ring-accent/40"
            />
          )}
          <div>
            <p className="font-corps text-xs uppercase tracking-wide text-encre/50">
              Ta boutique
            </p>
            <p className="font-titre text-2xl font-semibold text-accent">
              {boutique.nom_boutique}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-4xl items-start justify-between px-4">
        <div>
          <h1 className="font-titre text-3xl font-semibold text-encre">Mes produits</h1>
          <p className="font-corps text-sm text-encre/60">
            {produits.length} {produits.length > 1 ? "paires" : "paire"} en ligne
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={() => setReglagesOuverts(true)}
            className="font-corps text-sm font-medium text-accent-secondaire underline underline-offset-4"
          >
            Ma boutique
          </button>
          <button
            onClick={surDeconnexion}
            className="font-corps text-sm text-encre/60 underline underline-offset-4"
          >
            Se déconnecter
          </button>
        </div>
      </div>

      {erreurGlobale && (
        <p className="mx-auto mt-4 max-w-4xl px-4 font-corps text-sm text-red-700">
          {erreurGlobale}
        </p>
      )}

      <GrilleAdministration
        produits={produits}
        surAjouterClique={() => setModaleOuverte(true)}
        surModifierClique={setProduitAModifier}
        surSupprimerProduit={surSupprimerProduit}
      />

      <ModaleAjoutProduit
        estOuverte={modaleOuverte}
        surFermer={() => setModaleOuverte(false)}
        surValiderAjout={surValiderAjout}
      />

      {produitAModifier && (
        <ModaleModificationProduit
          key={produitAModifier.id}
          produit={produitAModifier}
          surFermer={() => setProduitAModifier(null)}
          surEnregistrer={surEnregistrerModification}
        />
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-encre/10 bg-fond/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto flex max-w-4xl gap-3">
          <Link
            href="/"
            className="flex items-center justify-center rounded-xl border border-encre/20 px-4 py-3 font-corps text-sm font-semibold text-encre"
          >
            Voir mon site
          </Link>
          <button
            onClick={() => setModaleOuverte(true)}
            className="flex-1 rounded-xl bg-encre py-3 font-corps font-semibold text-fond transition hover:bg-accent-secondaire"
          >
            + Ajouter une paire
          </button>
        </div>
      </nav>
    </div>
  );
}