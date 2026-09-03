import type { ProgramExercise, WorkoutDay, WorkoutProgram } from "@/lib/types";

const e = (
  exerciseId: string,
  sets: number,
  repMin: number,
  repMax: number,
  restSec: number,
  kind: ProgramExercise["kind"],
  targetRir: number,
  note?: string
): ProgramExercise => ({ exerciseId, sets, repMin, repMax, restSec, kind, targetRir, note });

/** Durée estimée : séries × (repos + ~40 s d'exécution) + 8 min d'échauffement/transitions. */
export function estimateMinutes(exercises: ProgramExercise[]) {
  const seconds = exercises.reduce((acc, x) => acc + x.sets * (x.restSec + 40), 0);
  return Math.round((seconds / 60 + 8) / 5) * 5;
}

function day(d: Omit<WorkoutDay, "estimatedMin">): WorkoutDay {
  return { ...d, estimatedMin: estimateMinutes(d.exercises) };
}

export const DAY_1 = day({
  id: "j1",
  index: 1,
  name: "Haut du corps",
  focus: "Force",
  accent: "ember",
  exercises: [
    e("bench-press", 3, 4, 6, 180, "force", 2, "Exercice principal : garde 1 à 2 reps en réserve."),
    e("pull-up", 3, 5, 8, 150, "force", 2, "Lestées si tu dépasses 8 répétitions propres."),
    e("chest-supported-row", 3, 6, 8, 120, "force", 2),
    e("overhead-press", 2, 5, 8, 150, "force", 2),
    e("incline-db-press", 2, 8, 12, 90, "hypertrophie", 1),
    e("lateral-raise", 3, 12, 20, 60, "accessoire", 1),
    e("biceps-curl", 2, 8, 12, 60, "accessoire", 1),
    e("triceps-pushdown", 2, 8, 12, 60, "accessoire", 1),
  ],
});

export const DAY_2 = day({
  id: "j2",
  index: 2,
  name: "Bas du corps",
  focus: "Force",
  accent: "violet",
  exercises: [
    e("squat", 3, 4, 6, 210, "force", 2, "Stoppeurs réglés avant la première série."),
    e("rdl", 3, 6, 8, 150, "force", 2, "Le dos plat est le critère d'arrêt de la descente."),
    e("leg-press", 3, 8, 12, 120, "hypertrophie", 1),
    e("leg-curl", 3, 8, 12, 90, "hypertrophie", 1),
    e("standing-calf-raise", 3, 10, 15, 60, "accessoire", 1),
    e("weighted-crunch", 3, 8, 15, 60, "accessoire", 1),
  ],
});

export const DAY_3 = day({
  id: "j3",
  index: 3,
  name: "Haut du corps",
  focus: "Hypertrophie",
  accent: "cyan",
  exercises: [
    e("incline-barbell-press", 3, 6, 10, 150, "hypertrophie", 1),
    e("lat-pulldown", 3, 8, 12, 120, "hypertrophie", 1),
    e("machine-row", 3, 8, 12, 120, "hypertrophie", 1),
    e("chest-press", 2, 8, 12, 90, "hypertrophie", 1),
    e("shoulder-press-machine", 2, 8, 12, 90, "hypertrophie", 1),
    e("lateral-raise", 3, 12, 20, 60, "accessoire", 0),
    e("incline-curl", 3, 8, 15, 60, "accessoire", 1),
    e("overhead-triceps-extension", 3, 8, 15, 60, "accessoire", 1),
  ],
});

export const DAY_4 = day({
  id: "j4",
  index: 4,
  name: "Bas du corps",
  focus: "Hypertrophie",
  accent: "volt",
  exercises: [
    e("hack-squat", 3, 6, 10, 180, "hypertrophie", 1),
    e("bulgarian-split-squat", 3, 8, 12, 120, "hypertrophie", 1, "Répétitions par jambe."),
    e("hip-thrust", 3, 8, 12, 120, "hypertrophie", 1),
    e("leg-curl", 3, 10, 15, 90, "hypertrophie", 1),
    e("leg-extension", 2, 10, 15, 60, "accessoire", 0),
    e("seated-calf-raise", 3, 10, 20, 60, "accessoire", 0),
  ],
});

export const DEFAULT_PROGRAM: WorkoutProgram = {
  id: "muscle-force-4j",
  name: "Muscle & Force — 4 jours",
  goal: "muscle-force",
  daysPerWeek: 4,
  days: [DAY_1, DAY_2, DAY_3, DAY_4],
};

export const ALL_DAYS = DEFAULT_PROGRAM.days;

export function getDay(id: string) {
  return ALL_DAYS.find((d) => d.id === id);
}
