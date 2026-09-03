import type { Exercise } from "@/lib/types";
import { PUSH_EXERCISES } from "./ex-push";
import { PULL_EXERCISES } from "./ex-pull";
import { LEG_EXERCISES } from "./ex-legs";

export const EXERCISES: Exercise[] = [...PUSH_EXERCISES, ...PULL_EXERCISES, ...LEG_EXERCISES];

const BY_ID = new Map(EXERCISES.map((e) => [e.id, e]));
const BY_SLUG = new Map(EXERCISES.map((e) => [e.slug, e]));

export function getExercise(id: string): Exercise | undefined {
  return BY_ID.get(id);
}

export function getExerciseBySlug(slug: string): Exercise | undefined {
  return BY_SLUG.get(slug);
}

/** Version non-nullable pour les rendus : évite les gardes partout. */
export function ex(id: string): Exercise {
  const found = BY_ID.get(id);
  if (!found) throw new Error(`Exercice inconnu : ${id}`);
  return found;
}

export function substitutionsFor(id: string): Exercise[] {
  const base = BY_ID.get(id);
  if (!base) return [];
  return base.substitutions.map((s) => BY_ID.get(s)).filter(Boolean) as Exercise[];
}

export function searchExercises(q: string): Exercise[] {
  const n = q.trim().toLowerCase();
  if (!n) return EXERCISES;
  return EXERCISES.filter(
    (e) =>
      e.name.toLowerCase().includes(n) ||
      e.slug.includes(n) ||
      e.primary.some((m) => m.includes(n))
  );
}
