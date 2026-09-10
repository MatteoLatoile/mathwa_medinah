/**
 * Réglages globaux du site.
 * Le numéro WhatsApp est au format international sans "+" ni espaces.
 */
export const site = {
  name: "Mathwa",
  nameAr: "مثوى",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "966500000000",
  city: "Medina",
};

/** Construit un lien wa.me avec un message pré-rempli. */
export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
