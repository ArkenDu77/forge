import type { Ingredient, Recipe } from "@/lib/types";

const i = (
  name: string,
  qty: number,
  unit: Ingredient["unit"],
  aisle: Ingredient["aisle"],
  pricePerUnit: number
): Ingredient => ({ name, qty, unit, aisle, pricePerUnit });

/**
 * Les repas du programme.
 *
 * Les quatre premiers sont les repas fixes de la journée : tout ce qui est listé
 * fait partie du repas, ce ne sont pas des options entre lesquelles choisir.
 * Les dîners sont interchangeables : même apport, plats différents.
 */
/**
 * Le coût d'une portion se déduit du prix des ingrédients : le recopier à la
 * main à côté d'eux revenait à maintenir deux fois le même chiffre.
 */
const priced = (r: Omit<Recipe, "costPerServing">): Recipe => ({
  ...r,
  costPerServing: Math.round(r.ingredients.reduce((a, x) => a + x.qty * x.pricePerUnit, 0) * 100) / 100,
});

const RAW_RECIPES: Omit<Recipe, "costPerServing">[] = [
  /* ---------------- Petit-déjeuner ---------------- */
  {
    id: "mass-smoothie",
    name: "Smoothie prise de masse",
    slug: "smoothie-prise-de-masse",
    slot: ["petit-dejeuner"],
    minutes: 5,
    servings: 1,
    macros: { kcal: 768, prot: 47, carbs: 97, fat: 22 },
    tags: ["rapide", "tres-proteine", "hypercalorique", "vegetarien"],
    emoji: "🥤",
    gradient: ["#c58cff", "#6b3fb0"],
    ingredients: [
      i("Flocons d'avoine", 80, "g", "epicerie", 0.0025),
      i("Lait demi-écrémé", 300, "ml", "cremerie", 0.0012),
      i("Banane", 1, "u", "fruits-legumes", 0.28),
      i("Whey", 27, "g", "epicerie", 0.025),
      i("Beurre de cacahuète", 20, "g", "epicerie", 0.012),
    ],
    steps: [
      "Verse le lait dans le blender.",
      "Ajoute la banane entière, épluchée.",
      "Ajoute les flocons d'avoine.",
      "Ajoute la whey.",
      "Ajoute le beurre de cacahuète.",
      "Mixe jusqu'à ce que ce soit fluide, environ 45 secondes.",
      "Bois tout, tranquillement.",
    ],
    storage: "À boire tout de suite. Si tu le prépares la veille, remue avant de boire.",
  },

  /* ---------------- Déjeuner ---------------- */
  {
    id: "chicken-rice",
    name: "Poulet riz légumes",
    slug: "poulet-riz-legumes",
    slot: ["dejeuner"],
    minutes: 20,
    servings: 1,
    macros: { kcal: 655, prot: 38, carbs: 75, fat: 19 },
    tags: ["tres-proteine", "meal-prep", "sans-lactose"],
    emoji: "🍛",
    gradient: ["#ffb347", "#d9622b"],
    ingredients: [
      i("Blanc de poulet", 130, "g", "viande", 0.0105),
      i("Riz basmati (cru)", 70, "g", "epicerie", 0.0022),
      i("Légumes surgelés", 200, "g", "surgele", 0.0035),
      i("Huile d'olive", 10, "ml", "epicerie", 0.009),
      i("Pomme", 1, "u", "fruits-legumes", 0.4),
    ],
    steps: [
      "Mets le riz à cuire dans deux fois son volume d'eau salée, 11 minutes.",
      "Coupe le poulet en cubes.",
      "Fais chauffer l'huile dans une poêle, à feu moyen.",
      "Cuis le poulet 8 minutes en remuant, jusqu'à ce qu'il ne soit plus rose au centre.",
      "Fais cuire les légumes surgelés à la poêle ou au micro-ondes.",
      "Mets tout dans l'assiette. Mange la pomme en dessert.",
    ],
    storage: "3 jours au réfrigérateur. Tu peux en préparer 3 portions d'avance.",
  },

  /* ---------------- Collation ---------------- */
  {
    id: "skyr-bowl",
    name: "Bol de skyr",
    slug: "bol-de-skyr",
    slot: ["snack"],
    minutes: 3,
    servings: 1,
    macros: { kcal: 600, prot: 36, carbs: 76, fat: 17 },
    tags: ["rapide", "tres-proteine", "vegetarien"],
    emoji: "🥣",
    gradient: ["#a4b8ff", "#6b7ce0"],
    ingredients: [
      i("Skyr nature", 250, "g", "cremerie", 0.0042),
      i("Granola", 40, "g", "epicerie", 0.008),
      i("Banane", 1, "u", "fruits-legumes", 0.28),
      i("Miel", 15, "g", "epicerie", 0.008),
      i("Amandes", 20, "g", "epicerie", 0.018),
    ],
    steps: [
      "Verse le skyr dans un bol.",
      "Ajoute le granola.",
      "Coupe la banane en rondelles par-dessus.",
      "Ajoute le miel et les amandes.",
      "Mélange et mange tout.",
    ],
    storage: "À manger tout de suite, sinon le granola ramollit.",
  },

  /* ---------------- Dîners interchangeables ---------------- */
  {
    id: "chicken-pasta",
    name: "Pâtes au poulet",
    slug: "pates-au-poulet",
    slot: ["diner"],
    minutes: 18,
    servings: 1,
    macros: { kcal: 643, prot: 40, carbs: 83, fat: 17 },
    tags: ["rapide", "tres-proteine"],
    emoji: "🍝",
    gradient: ["#a8e063", "#4f9a45"],
    ingredients: [
      i("Blanc de poulet", 125, "g", "viande", 0.0105),
      i("Pâtes (crues)", 90, "g", "epicerie", 0.0018),
      i("Sauce tomate", 150, "g", "epicerie", 0.003),
      i("Huile d'olive", 8, "ml", "epicerie", 0.009),
      i("Parmesan", 15, "g", "cremerie", 0.022),
    ],
    steps: [
      "Fais bouillir l'eau et cuis les pâtes selon le paquet.",
      "Coupe le poulet en lanières et fais-le cuire 7 minutes à la poêle avec l'huile.",
      "Ajoute la sauce tomate au poulet, laisse chauffer 3 minutes.",
      "Égoutte les pâtes, mélange avec le poulet et la sauce.",
      "Ajoute le parmesan par-dessus.",
    ],
    storage: "2 jours au réfrigérateur.",
  },
  {
    id: "beef-rice",
    name: "Bœuf riz",
    slug: "boeuf-riz",
    slot: ["diner"],
    minutes: 20,
    servings: 1,
    macros: { kcal: 619, prot: 37, carbs: 74, fat: 18 },
    tags: ["tres-proteine", "sans-lactose"],
    emoji: "🥩",
    gradient: ["#ff8f6b", "#c33d2e"],
    ingredients: [
      i("Bœuf haché 5%", 125, "g", "viande", 0.012),
      i("Riz basmati (cru)", 72, "g", "epicerie", 0.0022),
      i("Haricots verts", 200, "g", "surgele", 0.0035),
      i("Huile d'olive", 8, "ml", "epicerie", 0.009),
      i("Sauce soja", 15, "ml", "epicerie", 0.006),
    ],
    steps: [
      "Lance le riz.",
      "Fais revenir la viande hachée à la poêle, en l'écrasant à la spatule.",
      "Ajoute la sauce soja en fin de cuisson.",
      "Fais cuire les haricots verts.",
      "Sers le tout ensemble.",
    ],
    storage: "3 jours au réfrigérateur.",
  },
  {
    id: "salmon-potatoes",
    name: "Saumon pommes de terre",
    slug: "saumon-pommes-de-terre",
    slot: ["diner"],
    minutes: 30,
    servings: 1,
    macros: { kcal: 636, prot: 36, carbs: 60, fat: 25 },
    tags: ["tres-proteine", "sans-lactose"],
    emoji: "🐟",
    gradient: ["#ff9a8b", "#d2543f"],
    ingredients: [
      i("Pavé de saumon", 130, "g", "poisson", 0.022),
      i("Pommes de terre", 300, "g", "fruits-legumes", 0.0022),
      i("Brocoli", 150, "g", "fruits-legumes", 0.0032),
      i("Huile d'olive", 10, "ml", "epicerie", 0.009),
    ],
    steps: [
      "Coupe les pommes de terre en quartiers, mets-les au four 25 minutes à 200 °C avec l'huile.",
      "Fais cuire le saumon à la poêle, 4 minutes de chaque côté, peau en bas d'abord.",
      "Fais cuire le brocoli à la vapeur 6 minutes.",
      "Sers le tout ensemble.",
    ],
    storage: "2 jours au réfrigérateur.",
  },
  {
    id: "eggs-bread",
    name: "Œufs, pain et avocat",
    slug: "oeufs-pain-avocat",
    slot: ["diner", "petit-dejeuner"],
    minutes: 12,
    servings: 1,
    macros: { kcal: 651, prot: 33, carbs: 48, fat: 36 },
    tags: ["rapide", "vegetarien", "sans-lactose"],
    emoji: "🍳",
    gradient: ["#ffd479", "#e0913a"],
    ingredients: [
      i("Œufs", 4, "u", "cremerie", 0.32),
      i("Pain complet", 80, "g", "boulangerie", 0.005),
      i("Avocat", 0.5, "u", "fruits-legumes", 1.2),
      i("Huile d'olive", 5, "ml", "epicerie", 0.009),
    ],
    steps: [
      "Fais chauffer l'huile à feu moyen.",
      "Casse les œufs et cuis-les comme tu préfères, 3 à 4 minutes.",
      "Fais griller le pain.",
      "Écrase l'avocat sur le pain, pose les œufs dessus. Sel et poivre.",
    ],
    storage: "À manger tout de suite.",
  },
  {
    id: "tuna-pasta",
    name: "Pâtes au thon",
    slug: "pates-au-thon",
    slot: ["diner"],
    minutes: 12,
    servings: 1,
    macros: { kcal: 637, prot: 40, carbs: 83, fat: 14 },
    tags: ["rapide", "pas-cher", "sans-lactose", "tres-proteine"],
    emoji: "🥫",
    gradient: ["#7fd4e8", "#2d7f96"],
    ingredients: [
      i("Pâtes (crues)", 95, "g", "epicerie", 0.0018),
      i("Thon au naturel", 1, "u", "epicerie", 1.25),
      i("Sauce tomate", 150, "g", "epicerie", 0.003),
      i("Huile d'olive", 8, "ml", "epicerie", 0.009),
    ],
    steps: [
      "Cuis les pâtes.",
      "Chauffe la sauce tomate avec le thon égoutté.",
      "Mélange le tout, poivre généreusement.",
    ],
    storage: "2 jours au réfrigérateur.",
  },

  /* ---------------- Rattrapage de fin de journée ---------------- */
  {
    id: "quick-smoothie",
    name: "Smoothie de rattrapage",
    slug: "smoothie-de-rattrapage",
    slot: ["snack"],
    minutes: 3,
    servings: 1,
    macros: { kcal: 380, prot: 14, carbs: 52, fat: 13 },
    tags: ["rapide", "hypercalorique", "vegetarien", "pas-cher"],
    emoji: "🥛",
    gradient: ["#b9e5ff", "#4a8fb5"],
    ingredients: [
      i("Lait demi-écrémé", 250, "ml", "cremerie", 0.0012),
      i("Flocons d'avoine", 40, "g", "epicerie", 0.0025),
      i("Banane", 1, "u", "fruits-legumes", 0.28),
      i("Beurre de cacahuète", 15, "g", "epicerie", 0.012),
    ],
    steps: ["Mets tout au blender.", "Mixe 30 secondes.", "Bois."],
    storage: "À boire tout de suite.",
  },
  {
    id: "peanut-toast",
    name: "Tartines beurre de cacahuète",
    slug: "tartines-beurre-cacahuete",
    slot: ["snack"],
    minutes: 3,
    servings: 1,
    macros: { kcal: 420, prot: 14, carbs: 46, fat: 20 },
    tags: ["rapide", "pas-cher", "vegetarien", "hypercalorique"],
    emoji: "🍞",
    gradient: ["#ffd08a", "#d18b3a"],
    ingredients: [
      i("Pain complet", 80, "g", "boulangerie", 0.005),
      i("Beurre de cacahuète", 30, "g", "epicerie", 0.012),
      i("Miel", 10, "g", "epicerie", 0.008),
    ],
    steps: ["Grille le pain.", "Étale le beurre de cacahuète.", "Filet de miel."],
    storage: "À manger tout de suite.",
  },
];

export const RECIPES: Recipe[] = RAW_RECIPES.map(priced);

/** Repas fixes de la journée : on ne choisit pas entre les ingrédients, on mange tout. */
export const FIXED_MEALS: Record<string, string> = {
  "mass-smoothie": "Tous les ingrédients font partie du repas. Tu bois tout.",
  "chicken-rice": "Tous les ingrédients font partie du repas.",
  "skyr-bowl": "Tu manges tout. Il ne s'agit pas d'alternatives.",
};

const BY_ID = new Map(RECIPES.map((r) => [r.id, r]));
const BY_SLUG = new Map(RECIPES.map((r) => [r.slug, r]));

export const getRecipe = (id: string) => BY_ID.get(id);
export const getRecipeBySlug = (slug: string) => BY_SLUG.get(slug);
export function recipe(id: string): Recipe {
  const r = BY_ID.get(id);
  if (!r) throw new Error(`Recette inconnue : ${id}`);
  return r;
}

export const RECIPE_TAGS: { id: Recipe["tags"][number] | "tous"; label: string }[] = [
  { id: "tous", label: "Tout" },
  { id: "rapide", label: "Rapide" },
  { id: "tres-proteine", label: "Très protéiné" },
  { id: "pas-cher", label: "Pas cher" },
  { id: "hypercalorique", label: "Calorique" },
  { id: "vegetarien", label: "Végétarien" },
  { id: "sans-lactose", label: "Sans lactose" },
  { id: "meal-prep", label: "Meal prep" },
];

export const SLOTS: { id: "petit-dejeuner" | "dejeuner" | "diner" | "snack"; label: string; when: string }[] = [
  { id: "petit-dejeuner", label: "Petit déjeuner", when: "Au réveil" },
  { id: "dejeuner", label: "Déjeuner", when: "Midi" },
  { id: "snack", label: "Collation", when: "Après-midi" },
  { id: "diner", label: "Dîner", when: "Le soir" },
];
