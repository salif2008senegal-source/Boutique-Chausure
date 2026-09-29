"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import cloudinary from "@/src/lib/cloudinary";
import {
  emailEstAutorise,
  creerSession,
  vendeurEstConnecte,
  detruireSession,
} from "@/src/lib/sessionVendeur";

type Resultat = { ok: boolean; message?: string };

const TAILLE_MAX_PHOTO = 10 * 1024 * 1024; // 10 Mo

function verifierPhoto(photo: FormDataEntryValue | null): string | null {
  if (!(photo instanceof File) || photo.size === 0) return "Ajoute une photo.";
  if (!photo.type.startsWith("image/")) return "Le fichier doit être une image.";
  if (photo.size > TAILLE_MAX_PHOTO) return "La photo dépasse 10 Mo.";
  return null;
}

function verifierNomEtPrix(nom: string, prix: number): string | null {
  if (!nom) return "Le nom du produit est obligatoire.";
  if (nom.length > 80) return "Le nom est trop long (80 caractères maximum).";
  if (!Number.isInteger(prix) || prix <= 0) {
    return "Le prix doit être un nombre entier positif.";
  }
  return null;
}

// Accepte "77 123 45 67", "+221 77 123 45 67", "221771234567"...
function normaliserNumero(brut: string): string | null {
  let chiffres = brut.replace(/\D/g, "");
  if (chiffres.startsWith("00")) chiffres = chiffres.slice(2);
  if (chiffres.length === 9) chiffres = "221" + chiffres;
  if (chiffres.length < 11 || chiffres.length > 15) return null;
  return chiffres;
}

async function envoyerPhoto(
  photo: File,
  dossier: string,
  dimensionMax: number
): Promise<string> {
  const octets = Buffer.from(await photo.arrayBuffer());

  return new Promise<string>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: dossier,
          transformation: [{ width: dimensionMax, crop: "limit", quality: "auto" }],
        },
        (erreur, resultat) => {
          if (erreur || !resultat) {
            reject(erreur ?? new Error("Envoi Cloudinary échoué"));
          } else {
            resolve(resultat.secure_url);
          }
        }
      )
      .end(octets);
  });
}

export async function connecterVendeur(email: string): Promise<boolean> {
  if (!emailEstAutorise(email)) return false;
  await creerSession();
  return true;
}

export async function deconnecterVendeur(): Promise<void> {
  await detruireSession();
}

export async function configurerBoutique(formData: FormData): Promise<Resultat> {
  if (!(await vendeurEstConnecte())) {
    return { ok: false, message: "Session expirée. Reconnecte-toi." };
  }

  const nom_boutique = String(formData.get("nom_boutique") ?? "").trim();
  const numero_whatsapp = normaliserNumero(
    String(formData.get("numero_whatsapp") ?? "")
  );
  const logo = formData.get("logo");
  const aNouveauLogo = logo instanceof File && logo.size > 0;

  if (!nom_boutique) {
    return { ok: false, message: "Le nom de la boutique est obligatoire." };
  }
  if (nom_boutique.length > 60) {
    return { ok: false, message: "Le nom est trop long (60 caractères maximum)." };
  }
  if (!numero_whatsapp) {
    return { ok: false, message: "Numéro invalide. Exemple : 77 123 45 67" };
  }

  try {
    let url_logo: string | null = null;

    if (aNouveauLogo) {
      const erreurLogo = verifierPhoto(logo);
      if (erreurLogo) return { ok: false, message: erreurLogo };
      url_logo = await envoyerPhoto(logo as File, "logos", 600);
    } else {
      const { data } = await supabaseAdmin
        .from("boutique")
        .select("url_logo")
        .eq("id", 1)
        .maybeSingle();
      url_logo = data?.url_logo ?? null;
    }

    if (!url_logo) {
      return { ok: false, message: "Ajoute ton logo." };
    }

    const { error } = await supabaseAdmin
      .from("boutique")
      .upsert({ id: 1, nom_boutique, url_logo, numero_whatsapp });

    if (error) {
      console.error("Erreur Supabase (boutique) :", error.message);
      return { ok: false, message: "Impossible d'enregistrer la boutique." };
    }

    revalidatePath("/");
    revalidatePath("/ajouter");
    return { ok: true };
  } catch (erreur) {
    console.error("Erreur configurerBoutique :", erreur);
    return { ok: false, message: "Erreur pendant l'envoi du logo." };
  }
}

export async function ajouterProduit(formData: FormData): Promise<Resultat> {
  if (!(await vendeurEstConnecte())) {
    return { ok: false, message: "Session expirée. Reconnecte-toi." };
  }

  const nom_produit = String(formData.get("nom_produit") ?? "").trim();
  const prix_cfa = Number(formData.get("prix_cfa"));
  const photo = formData.get("photo");

  const erreurTexte = verifierNomEtPrix(nom_produit, prix_cfa);
  if (erreurTexte) return { ok: false, message: erreurTexte };

  const erreurPhoto = verifierPhoto(photo);
  if (erreurPhoto) return { ok: false, message: erreurPhoto };

  try {
    const url_photo = await envoyerPhoto(photo as File, "chaussures", 1200);

    const { error } = await supabaseAdmin
      .from("produits")
      .insert({ nom_produit, prix_cfa, url_photo });

    if (error) {
      console.error("Erreur Supabase :", error.message);
      return { ok: false, message: "Impossible d'enregistrer le produit." };
    }

    revalidatePath("/");
    revalidatePath("/ajouter");
    return { ok: true };
  } catch (erreur) {
    console.error("Erreur ajouterProduit :", erreur);
    return { ok: false, message: "Erreur pendant l'envoi de la photo." };
  }
}

export async function modifierProduit(formData: FormData): Promise<Resultat> {
  if (!(await vendeurEstConnecte())) {
    return { ok: false, message: "Session expirée. Reconnecte-toi." };
  }

  const id = String(formData.get("id") ?? "");
  const nom_produit = String(formData.get("nom_produit") ?? "").trim();
  const prix_cfa = Number(formData.get("prix_cfa"));
  const photo = formData.get("photo");
  const aNouvellePhoto = photo instanceof File && photo.size > 0;

  if (!id) return { ok: false, message: "Produit introuvable." };

  const erreurTexte = verifierNomEtPrix(nom_produit, prix_cfa);
  if (erreurTexte) return { ok: false, message: erreurTexte };

  try {
    const modifications: { nom_produit: string; prix_cfa: number; url_photo?: string } = {
      nom_produit,
      prix_cfa,
    };

    if (aNouvellePhoto) {
      const erreurPhoto = verifierPhoto(photo);
      if (erreurPhoto) return { ok: false, message: erreurPhoto };
      modifications.url_photo = await envoyerPhoto(photo as File, "chaussures", 1200);
    }

    const { error } = await supabaseAdmin
      .from("produits")
      .update(modifications)
      .eq("id", id);

    if (error) {
      console.error("Erreur modification :", error.message);
      return { ok: false, message: "Impossible de modifier le produit." };
    }

    revalidatePath("/");
    revalidatePath("/ajouter");
    return { ok: true };
  } catch (erreur) {
    console.error("Erreur modifierProduit :", erreur);
    return { ok: false, message: "Erreur pendant l'envoi de la photo." };
  }
}

export async function supprimerProduit(id: string): Promise<Resultat> {
  if (!(await vendeurEstConnecte())) {
    return { ok: false, message: "Session expirée. Reconnecte-toi." };
  }

  const { error } = await supabaseAdmin.from("produits").delete().eq("id", id);

  if (error) {
    console.error("Erreur suppression :", error.message);
    return { ok: false, message: "Impossible de supprimer le produit." };
  }

  revalidatePath("/");
  revalidatePath("/ajouter");
  return { ok: true };
}