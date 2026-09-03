import type { Muscle, MuscleId } from "@/lib/types";

export const MUSCLES: Record<MuscleId, Muscle> = {
  pectoraux: { id: "pectoraux", name: "Pectoraux", group: "haut", side: "front" },
  dorsaux: { id: "dorsaux", name: "Dorsaux", group: "haut", side: "back" },
  trapezes: { id: "trapezes", name: "Trapèzes", group: "haut", side: "back" },
  "deltoide-ant": { id: "deltoide-ant", name: "Deltoïde antérieur", group: "haut", side: "front" },
  "deltoide-lat": { id: "deltoide-lat", name: "Deltoïde latéral", group: "haut", side: "front" },
  "deltoide-post": { id: "deltoide-post", name: "Deltoïde postérieur", group: "haut", side: "back" },
  biceps: { id: "biceps", name: "Biceps", group: "haut", side: "front" },
  triceps: { id: "triceps", name: "Triceps", group: "haut", side: "back" },
  "avant-bras": { id: "avant-bras", name: "Avant-bras", group: "haut", side: "front" },
  abdominaux: { id: "abdominaux", name: "Abdominaux", group: "tronc", side: "front" },
  obliques: { id: "obliques", name: "Obliques", group: "tronc", side: "front" },
  lombaires: { id: "lombaires", name: "Lombaires", group: "tronc", side: "back" },
  fessiers: { id: "fessiers", name: "Fessiers", group: "bas", side: "back" },
  quadriceps: { id: "quadriceps", name: "Quadriceps", group: "bas", side: "front" },
  ischios: { id: "ischios", name: "Ischio-jambiers", group: "bas", side: "back" },
  adducteurs: { id: "adducteurs", name: "Adducteurs", group: "bas", side: "front" },
  mollets: { id: "mollets", name: "Mollets", group: "bas", side: "back" },
};

export const MUSCLE_LIST = Object.values(MUSCLES);

export function muscleName(id: MuscleId) {
  return MUSCLES[id]?.name ?? id;
}

/** Regroupement grossier utilisé pour le volume hebdomadaire et la carte corporelle. */
export const MUSCLE_GROUPS: { id: string; name: string; members: MuscleId[] }[] = [
  { id: "pecs", name: "Pectoraux", members: ["pectoraux"] },
  { id: "dos", name: "Dos", members: ["dorsaux", "trapezes"] },
  { id: "epaules", name: "Épaules", members: ["deltoide-ant", "deltoide-lat", "deltoide-post"] },
  { id: "bras", name: "Bras", members: ["biceps", "triceps", "avant-bras"] },
  { id: "jambes", name: "Jambes", members: ["quadriceps", "ischios", "fessiers", "adducteurs", "mollets"] },
  { id: "tronc", name: "Tronc", members: ["abdominaux", "obliques", "lombaires"] },
];
