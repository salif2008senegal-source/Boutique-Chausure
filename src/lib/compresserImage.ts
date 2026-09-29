// Réduit une photo de téléphone (plusieurs Mo) à quelques centaines de Ko avant l'envoi.
// Si quelque chose échoue, on renvoie la photo d'origine : l'ajout ne se bloque jamais.
export async function compresserImage(
  fichier: File,
  dimensionMax = 1200,
  qualite = 0.8
): Promise<File> {
  try {
    const image = await createImageBitmap(fichier, { imageOrientation: "from-image" });
    const ratio = Math.min(1, dimensionMax / Math.max(image.width, image.height));
    const largeur = Math.round(image.width * ratio);
    const hauteur = Math.round(image.height * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = largeur;
    canvas.height = hauteur;
    const contexte = canvas.getContext("2d");
    if (!contexte) return fichier;

    // Fond blanc : évite un fond noir sur les photos PNG à fond transparent
    contexte.fillStyle = "#ffffff";
    contexte.fillRect(0, 0, largeur, hauteur);
    contexte.drawImage(image, 0, 0, largeur, hauteur);
    image.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", qualite)
    );
    if (!blob || blob.size >= fichier.size) return fichier;

    return new File([blob], "photo.jpg", { type: "image/jpeg" });
  } catch {
    return fichier;
  }
}