import { DEFAULT_CC } from "../constants";

export function toTelLink(raw?: string) {
  const digits = (raw || "").replace(/\D/g, "");
  return digits ? `tel:${digits}` : "#";
}

export function toWhatsAppLink(raw?: string, name?: string, defaultCC = DEFAULT_CC) {
  if (!raw) return "#";
  const digits = raw.replace(/\D/g, "");
  const withCC = digits.length === 10 && digits.startsWith("3") ? `${defaultCC}${digits}` : digits;
  const saludo = name ? `Hola ${name},` : "Hola,";
  const msg = `${saludo} te contacto desde el colegio respecto a la inscripción.`;
  return `https://wa.me/${withCC}?text=${encodeURIComponent(msg)}`;
}
