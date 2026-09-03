/* ============================================================
   Modèle de données — Forge
   ============================================================ */

/* ---------- Anatomie ---------- */
export type MuscleId =
  | "pectoraux" | "dorsaux" | "trapezes" | "deltoide-ant" | "deltoide-lat" | "deltoide-post"
  | "biceps" | "triceps" | "avant-bras" | "abdominaux" | "obliques" | "lombaires"
  | "fessiers" | "quadriceps" | "ischios" | "adducteurs" | "mollets";

export type Muscle = {
  id: MuscleId;
  name: string;
  group: "haut" | "bas" | "tronc";
  side: "front" | "back";
};

/* ---------- Silhouette animée ---------- */
/** Angles en degrés, repère écran (0° = vers la droite, 90° = vers le bas). */
export type Pose = {
  hip: [number, number];
  torso: number;
  upperArm: number;
  foreArm: number;
  thigh: number;
  shin: number;
  foot: number;
  headTilt?: number;
  /** Côté opposé (profondeur) : [bras, avant-bras] */
  farArm?: [number, number];
  /** Côté opposé : [cuisse, tibia] */
  farLeg?: [number, number];
  /** Écartement des bras en vue de face (px) */
  spread?: number;
};

export type PropSpec =
  | { kind: "floor" }
  | { kind: "bench"; x: number; y: number; w?: number; incline?: number }
  | { kind: "rack"; x: number; y: number; h?: number }
  | { kind: "pullup-bar"; x: number; y: number; w?: number }
  | { kind: "seat"; x: number; y: number; back?: number }
  | { kind: "machine"; x: number; y: number; w?: number; h?: number; label?: string }
  | { kind: "pulley"; x: number; y: number }
  | { kind: "platform"; x: number; y: number; w?: number; h?: number }
  | { kind: "step"; x: number; y: number };

export type LoadSpec =
  | { kind: "barbell"; r?: number }
  | { kind: "ez" }
  | { kind: "dumbbell" }
  | { kind: "handle" }
  | { kind: "cable"; anchor: [number, number] }
  | { kind: "machine-handle" }
  | { kind: "bodyweight" }
  | { kind: "none" };

export type ExerciseMedia = {
  view: "side" | "front";
  poses: Pose[];
  props: PropSpec[];
  load: LoadSpec;
  /** durée d un aller (ms) */
  tempoMs?: number;
  /** légendes des positions clés */
  captions?: string[];
  /** cadrage SVG (défaut : 0 0 200 150) */
  viewBox?: string;
};

/* ---------- Bibliothèque d exercices ---------- */
export type Equipment =
  | "barre" | "halteres" | "poulie" | "machine" | "poids-du-corps" | "banc" | "barre-traction" | "aucun";

export type LoadModel =
  | "barbell"
  | "dumbbell-pair"
  | "machine"
  | "cable"
  | "bodyweight"
  | "bodyweight-loaded";

export type Exercise = {
  id: string;
  name: string;
  shortName?: string;
  slug: string;
  pattern: "poussee-horizontale" | "poussee-verticale" | "tirage-horizontal" | "tirage-vertical"
    | "squat" | "charniere" | "fente" | "isolation" | "gainage" | "mollets";
  equipment: Equipment[];
  primary: MuscleId[];
  secondary: MuscleId[];
  loadModel: LoadModel;
  increment: number;
  unilateral?: boolean;
  /** difficulté technique 1-5 : conditionne la prudence des estimations */
  technical: 1 | 2 | 3 | 4 | 5;
  /** Charge de départ estimée ≈ facteur × poids de corps (débutant, très prudent) */
  startFactor: number;
  setup: string[];
  execution: string[];
  mistakes: string[];
  feel: string;
  breathing: string;
  tempo: string;
  rom: string;
  handPlacement?: string;
  footPlacement?: string;
  backPosition?: string;
  machineSetup?: string;
  firstTime?: string[];
  needsSpotter?: boolean;
  substitutions: string[];
  media: ExerciseMedia;
  tips: string[];
  sources?: { label: string; note: string }[];
};

/* ---------- Programme ---------- */
export type ProgramBlockKind = "force" | "hypertrophie" | "accessoire";

export type ProgramExercise = {
  exerciseId: string;
  sets: number;
  repMin: number;
  repMax: number;
  restSec: number;
  kind: ProgramBlockKind;
  targetRir: number;
  note?: string;
};

export type WorkoutDay = {
  id: string;
  index: number;
  name: string;
  focus: string;
  accent: "ember" | "violet" | "cyan" | "volt";
  estimatedMin: number;
  exercises: ProgramExercise[];
};

export type WorkoutProgram = {
  id: string;
  name: string;
  goal: Goal;
  daysPerWeek: number;
  days: WorkoutDay[];
};

/* ---------- Utilisateur ---------- */
export type Goal = "muscle" | "force" | "muscle-force";
export type Level = "jamais" | "debutant" | "intermediaire" | "avance";
export type Diet = "omnivore" | "vegetarien" | "sans-lactose" | "sans-porc" | "pescetarien";
export type BudgetTier = "economique" | "standard" | "flexible";

export type Profile = {
  firstName: string;
  age: number;
  sex: "h" | "f" | "na";
  heightCm: number;
  weightKg: number;
  level: Level;
  currentFrequency: number;
  daysAvailable: number;
  goal: Goal;
  priorityMuscles: MuscleId[];
  gymType: "salle" | "home";
  equipment: Equipment[];
  sessionMinutes: number;
  diet: Diet;
  dislikedFoods: string[];
  allergies: string[];
  monthlyFoodBudget: number;
  budgetTier: BudgetTier;
  targetWeightKg: number;
  sleepHours: number;
  dailyActivity: "sedentaire" | "leger" | "actif" | "tres-actif";
  createdAt: string;
};

/* ---------- Séances réalisées ---------- */
export type SetLog = {
  setIndex: number;
  reps: number;
  weight: number;
  rir: number;
  pain?: boolean;
  ts: string;
};

export type ExerciseSession = {
  exerciseId: string;
  sets: SetLog[];
  substitutedFor?: string;
  skipped?: boolean;
};

export type PersonalRecord = {
  exerciseId: string;
  kind: "charge" | "reps" | "1rm" | "volume";
  value: number;
  reps?: number;
  date: string;
};

export type WorkoutSession = {
  id: string;
  dayId: string;
  date: string;
  durationSec: number;
  entries: ExerciseSession[];
  xp: number;
  completed: boolean;
  prs: PersonalRecord[];
};

/* ---------- Mesures ---------- */
export type WeightEntry = { date: string; kg: number };
export type BodyMeasurement = {
  date: string;
  brasCm?: number; poitrineCm?: number; tailleCm?: number; cuisseCm?: number; epaulesCm?: number;
};

/* ---------- Nutrition ---------- */
export type Macros = { kcal: number; prot: number; carbs: number; fat: number };

export type NutritionTarget = Macros & {
  maintenance: number;
  surplus: number;
  proteinPerKg: number;
  updatedAt: string;
};

export type Ingredient = {
  name: string;
  qty: number;
  unit: "g" | "ml" | "u" | "cs" | "cc";
  aisle: "viande" | "poisson" | "cremerie" | "epicerie" | "fruits-legumes" | "surgele" | "boulangerie";
  pricePerUnit: number;
};

export type Recipe = {
  id: string;
  name: string;
  slug: string;
  slot: ("petit-dejeuner" | "dejeuner" | "diner" | "snack")[];
  minutes: number;
  servings: number;
  macros: Macros;
  costPerServing: number;
  tags: ("pas-cher" | "tres-proteine" | "rapide" | "vegetarien" | "sans-lactose" | "meal-prep" | "hypercalorique")[];
  ingredients: Ingredient[];
  steps: string[];
  storage: string;
  gradient: [string, string];
  emoji: string;
};

export type MealPlanEntry = { day: number; slot: "petit-dejeuner" | "dejeuner" | "diner" | "snack"; recipeId: string; servings: number };

export type LoggedMeal = { id: string; date: string; recipeId?: string; label: string; macros: Macros };

/* ---------- Récupération / gamification ---------- */
export type RecoveryCheckin = {
  date: string;
  sleepHours: number;
  fatigue: "faible" | "moyenne" | "elevee";
  soreness: MuscleId[];
  motivation: 1 | 2 | 3 | 4 | 5;
};

export type Achievement = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  tier: "bronze" | "argent" | "or";
};

/* ---------- Projection ---------- */
export type ProgressProjection = {
  weeks: number;
  weightKg: [number, number];
  strengthPct: [number, number];
  sessions: number;
  note: string;
};
