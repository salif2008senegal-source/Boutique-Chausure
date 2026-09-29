import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const NOM_COOKIE = "session_vendeur";
const DUREE_SECONDES = 60 * 60 * 24 * 365; // un an

function emailAttendu(): string | null {
  const email = process.env.EMAIL_VENDEUR_AUTORISE?.trim().toLowerCase();
  return email ? email : null;
}

function signer(email: string): string {
  const secret = process.env.SECRET_SESSION;
  if (!secret) throw new Error("SECRET_SESSION manquant dans .env.local");
  return createHmac("sha256", secret).update(email).digest("hex");
}

export function emailEstAutorise(email: unknown): boolean {
  const attendu = emailAttendu();
  if (!attendu || typeof email !== "string") return false;
  return email.trim().toLowerCase() === attendu;
}

export async function creerSession(): Promise<void> {
  const attendu = emailAttendu();
  if (!attendu) return;
  const magasinCookies = await cookies();
  magasinCookies.set(NOM_COOKIE, signer(attendu), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DUREE_SECONDES,
  });
}

export async function vendeurEstConnecte(): Promise<boolean> {
  const attendu = emailAttendu();
  if (!attendu || !process.env.SECRET_SESSION) return false;

  const magasinCookies = await cookies();
  const valeurRecue = magasinCookies.get(NOM_COOKIE)?.value;
  if (!valeurRecue) return false;

  const valeurAttendue = Buffer.from(signer(attendu));
  const valeurRecueOctets = Buffer.from(valeurRecue);
  return (
    valeurAttendue.length === valeurRecueOctets.length &&
    timingSafeEqual(valeurAttendue, valeurRecueOctets)
  );
}

export async function detruireSession(): Promise<void> {
  const magasinCookies = await cookies();
  magasinCookies.delete(NOM_COOKIE);
}