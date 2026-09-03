export const nf = (n: number, digits = 0) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);

export const kg = (n: number) => `${nf(n, n % 1 === 0 ? 0 : 1)} kg`;

export const tons = (kgValue: number) => `${nf(Math.round(kgValue / 100) / 10, 1)} t`;

export const eur = (n: number) => `${nf(n, 2).replace(".", ",")} €`;

export function roundTo(value: number, step: number) {
  if (step <= 0) return Math.round(value);
  return Math.round(value / step) * step;
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function mmss(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

export function frDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" }) {
  return new Intl.DateTimeFormat("fr-FR", opts).format(new Date(iso));
}

export function relativeDay(iso: string) {
  const diff = daysBetween(iso, today());
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  if (diff < 7) return `Il y a ${diff} jours`;
  return frDate(iso);
}

export function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 6) return "Bonne nuit";
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

export const WEEKDAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
