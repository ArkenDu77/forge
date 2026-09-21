/* Généré par scripts/fetch-exercise-plates.py — ne pas modifier à la main. */

/**
 * Exercices illustrés par une planche Everkinetic, et nombre de positions
 * disponibles. La table est produite à partir des fichiers réellement présents
 * dans public/exercises : déclarer une planche qui n'existe pas, ou l'oublier
 * après un changement de catalogue, n'est pas possible.
 */
export const PLATE_FRAMES: Record<string, 1 | 2> = {
  "back-extension": 2,
  "bench-press": 2,
  "biceps-curl": 2,
  "cable-fly": 2,
  "chest-press": 2,
  "db-bench-press": 2,
  "db-shoulder-press": 2,
  "dips": 2,
  "front-squat": 2,
  "good-morning": 2,
  "hack-squat": 2,
  "hammer-curl": 2,
  "incline-barbell-press": 2,
  "incline-curl": 2,
  "incline-db-press": 2,
  "lat-pulldown": 2,
  "lateral-raise": 2,
  "leg-curl": 2,
  "leg-extension": 2,
  "negative-pull-up": 2,
  "overhead-triceps-extension": 2,
  "preacher-curl": 2,
  "pull-up": 2,
  "rdl": 2,
  "seated-cable-row": 2,
  "seated-calf-raise": 2,
  "shoulder-press-machine": 2,
  "skull-crusher": 2,
  "squat": 2,
  "standing-calf-raise": 2,
  "t-bar-row": 2,
  "triceps-pushdown": 2,
  "walking-lunge": 2,
  "weighted-crunch": 2,
};

export const plateFrames = (exerciseId: string): 1 | 2 | undefined => PLATE_FRAMES[exerciseId];
