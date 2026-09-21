import type { ProgramExercise, WarmupSet, WorkoutDay, WorkoutProgram } from "@/lib/types";

/* ------------------------------------------------------------------
   Programme Lundi / Mardi / Jeudi / Samedi — muscle et force.
   Mercredi, vendredi et dimanche sont des jours de repos.
   ------------------------------------------------------------------ */

/** Séries d'échauffement des gros mouvements : montée en charge guidée. */
const RAMP: WarmupSet[] = [
  { loadPct: 0.4, reps: 10, restSec: 60, note: "Très léger. Tu dois finir en te disant « c'était facile »." },
  { loadPct: 0.7, reps: 5, restSec: 60, note: "Un peu plus lourd. Cinq répétitions propres, sans forcer." },
];

/** Exercice compté en répétitions. */
const reps = (
  exerciseId: string,
  sets: number,
  repMin: number,
  repMax: number,
  restSec: number,
  kind: ProgramExercise["kind"],
  extra: Partial<ProgramExercise> = {}
): ProgramExercise => ({
  exerciseId,
  sets,
  metric: "reps",
  repMin,
  repMax,
  restSec,
  kind,
  targetRir: kind === "force" ? 2 : 1,
  ...extra,
});

/** Exercice compté en mètres parcourus. */
const carry = (
  exerciseId: string,
  sets: number,
  distMin: number,
  distMax: number,
  restSec: number,
  extra: Partial<ProgramExercise> = {}
): ProgramExercise => ({
  exerciseId,
  sets,
  metric: "distance",
  repMin: 0,
  repMax: 0,
  distMin,
  distMax,
  restSec,
  kind: "accessoire",
  targetRir: 1,
  ...extra,
});

/** Exercice compté en secondes tenues. */
const hold = (
  exerciseId: string,
  sets: number,
  secMin: number,
  secMax: number,
  restSec: number,
  extra: Partial<ProgramExercise> = {}
): ProgramExercise => ({
  exerciseId,
  sets,
  metric: "duration",
  repMin: 0,
  repMax: 0,
  secMin,
  secMax,
  restSec,
  kind: "accessoire",
  targetRir: 1,
  ...extra,
});

/** Durée estimée : séries × (repos + exécution) + échauffement cardio + transitions. */
export function estimateMinutes(day: Omit<WorkoutDay, "estimatedMin">) {
  const work = day.exercises.reduce((acc, x) => {
    const perSet = x.metric === "reps" ? 40 : x.metric === "distance" ? 45 : 35;
    const warm = (x.warmup?.length ?? 0) * (60 + 30);
    return acc + x.sets * (x.restSec + perSet) + warm;
  }, 0);
  return Math.round((work / 60 + day.warmup.minutes + 6) / 5) * 5;
}

function day(d: Omit<WorkoutDay, "estimatedMin">): WorkoutDay {
  return { ...d, estimatedMin: estimateMinutes(d) };
}

const TAPIS = {
  machine: "tapis" as const,
  minutes: 6,
  instruction: "Marche rapide, à un rythme où tu pourrais encore parler. Pas de course.",
};

const VELO = {
  machine: "velo" as const,
  minutes: 6,
  instruction: "Résistance faible à moyenne, pédalage régulier. Tu dois avoir juste un peu chaud à la fin.",
};

export const LUNDI = day({
  id: "lundi",
  index: 1,
  weekday: 0,
  name: "Haut du corps",
  focus: "Séance A",
  accent: "ember",
  warmup: TAPIS,
  exercises: [
    reps("bench-press", 4, 4, 6, 180, "force", {
      warmup: RAMP,
      note: "L'exercice principal de la semaine pour les pectoraux.",
    }),
    // Pas de séries d'échauffement ici : sur cette machine, le poids réglé est
    // l'aide, pas la charge. Monter progressivement reviendrait à retirer de
    // l'aide, donc à commencer par le plus dur. La première série sert de repère.
    reps("assisted-pull-up", 4, 5, 8, 150, "force", {
      note: "Règle l'assistance pour finir chaque série difficilement mais proprement. Prends la première série tranquillement : elle sert à trouver le bon réglage.",
    }),
    reps("incline-db-press", 3, 8, 12, 120, "hypertrophie"),
    reps("chest-supported-row", 3, 6, 10, 120, "hypertrophie"),
    reps("db-shoulder-press", 3, 6, 10, 150, "hypertrophie"),
    reps("lateral-raise", 3, 12, 20, 90, "accessoire"),
    reps("overhead-triceps-extension", 3, 10, 15, 90, "accessoire"),
    reps("incline-curl", 3, 8, 12, 90, "accessoire"),
    reps("negative-pull-up", 2, 3, 3, 90, "accessoire", {
      note: "Trois descentes par série, chacune en 4 à 5 secondes.",
    }),
  ],
});

export const MARDI = day({
  id: "mardi",
  index: 2,
  weekday: 1,
  name: "Bas du corps",
  focus: "Séance A + poigne",
  accent: "violet",
  warmup: VELO,
  exercises: [
    reps("hack-squat", 3, 5, 8, 180, "force", { warmup: RAMP }),
    reps("rdl", 3, 6, 10, 180, "force", {
      warmup: RAMP,
      note: "Le dos plat est le signal d'arrêt de la descente.",
    }),
    reps("leg-press", 3, 10, 15, 120, "hypertrophie"),
    reps("leg-curl", 3, 10, 15, 90, "hypertrophie"),
    reps("standing-calf-raise", 3, 10, 15, 90, "accessoire"),
    carry("farmer-carry", 4, 20, 30, 120, {
      note: "Un passage = un aller. Repose les haltères entre chaque.",
    }),
    hold("dead-hang", 3, 20, 45, 90),
  ],
});

export const JEUDI = day({
  id: "jeudi",
  index: 3,
  weekday: 3,
  name: "Haut du corps",
  focus: "Séance B",
  accent: "cyan",
  warmup: TAPIS,
  exercises: [
    reps("incline-barbell-press", 4, 6, 10, 150, "force", { warmup: RAMP }),
    reps("lat-pulldown", 3, 8, 12, 120, "hypertrophie"),
    reps("chest-press", 3, 8, 12, 120, "hypertrophie"),
    reps("seated-cable-row", 3, 8, 12, 120, "hypertrophie", {
      perSide: true,
      note: "Un bras à la fois : l'objectif s'entend par bras.",
    }),
    reps("lateral-raise", 4, 12, 20, 90, "accessoire"),
    reps("reverse-pec-deck", 3, 12, 20, 90, "accessoire"),
    reps("preacher-curl", 3, 8, 12, 90, "accessoire"),
    reps("hammer-curl", 2, 10, 15, 90, "accessoire"),
    reps("overhead-triceps-extension", 3, 10, 15, 90, "accessoire"),
    reps("triceps-pushdown", 2, 10, 15, 90, "accessoire"),
  ],
});

export const SAMEDI = day({
  id: "samedi",
  index: 4,
  weekday: 5,
  name: "Bas du corps",
  focus: "Séance B + force",
  accent: "volt",
  warmup: VELO,
  exercises: [
    reps("trap-bar-deadlift", 3, 3, 5, 210, "force", {
      warmup: RAMP,
      note: "La séance de force de la semaine. Technique avant charge.",
    }),
    reps("bulgarian-split-squat", 3, 8, 12, 120, "hypertrophie", {
      perSide: true,
      note: "L'objectif s'entend par jambe : tu fais donc la série deux fois.",
    }),
    reps("hip-thrust", 3, 8, 12, 120, "hypertrophie"),
    reps("leg-extension", 3, 10, 15, 90, "accessoire"),
    reps("leg-curl", 3, 10, 15, 90, "accessoire"),
    carry("sandbag-carry", 4, 15, 30, 120),
    reps("weighted-crunch", 3, 10, 15, 90, "accessoire"),
  ],
});

export const DEFAULT_PROGRAM: WorkoutProgram = {
  id: "muscle-force-4j-v2",
  name: "Muscle & Force",
  goal: "muscle-force",
  daysPerWeek: 4,
  days: [LUNDI, MARDI, JEUDI, SAMEDI],
};

export const ALL_DAYS = DEFAULT_PROGRAM.days;

export function getDay(id: string) {
  return ALL_DAYS.find((d) => d.id === id);
}

export const WEEKDAY_LABELS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

/* ------------------------------------------------------------------
   Phase d'adaptation : les deux premières semaines, on allège le volume
   d'isolation pour éviter des courbatures qui empêchent la séance suivante.
   ------------------------------------------------------------------ */

export const ADAPTATION_WEEKS = 2;

export function adaptForWeek(d: WorkoutDay, week: number): WorkoutDay {
  if (week > ADAPTATION_WEEKS) return d;
  const exercises = d.exercises.map((x) =>
    x.kind === "accessoire" && x.sets > 2 ? { ...x, sets: Math.max(2, x.sets - 1) } : x
  );
  return { ...d, exercises, estimatedMin: estimateMinutes({ ...d, exercises }) };
}

export function adaptationLabel(week: number) {
  if (week > ADAPTATION_WEEKS) return null;
  return `Phase d'adaptation — semaine ${Math.min(week, ADAPTATION_WEEKS)}/${ADAPTATION_WEEKS}`;
}
