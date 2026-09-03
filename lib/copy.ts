/**
 * Toutes les formulations prudentes de l'application vivent ici.
 * Objectif : ne jamais promettre de résultat, ne jamais poser de diagnostic,
 * ne jamais présenter une charge comme « sans danger ».
 */

export const SAFETY = {
  estimateLabel: "Estimation de départ",
  estimateDisclaimer:
    "Une taille et un poids ne suffisent pas à déterminer une charge sûre. Considère cette valeur comme un point de départ prudent, à ajuster dès la première série.",
  loadNeverSafe:
    "Aucune charge n'est « sans risque ». Commence plus léger que nécessaire : tu ajusteras à la hausse en 2 minutes.",
  sharpPain:
    "Douleur articulaire vive, lancinante ou qui irradie : arrête la série. Ce n'est pas un effort musculaire normal.",
  normalEffort:
    "Effort normal : brûlure musculaire progressive, muscle qui « ne répond plus » en fin de série, courbatures diffuses les jours suivants.",
  abnormalPain:
    "Signal anormal : douleur nette dans une articulation, craquement douloureux, douleur qui persiste au repos.",
  noDiagnosis:
    "Forge ne pose aucun diagnostic. En cas de douleur qui dure, parles-en à un professionnel de santé.",
  learnWithSomeone:
    "Mouvement lourd et technique : idéalement appris avec quelqu'un de compétent, ou filmé de profil les premières séances.",
  spotter: "Prévois une parade ou des stoppeurs réglés avant de charger.",
  projectionDisclaimer:
    "Ces intervalles sont des estimations basées sur des moyennes de population. Ils dépendent notamment de ta régularité, de ton alimentation, de ton sommeil, de ta génétique et de ton point de départ.",
  nutritionDisclaimer:
    "Ces valeurs sont des estimations, pas une prescription. Ajuste-les selon l'évolution réelle de ton poids sur 2 à 3 semaines.",
  notMedical:
    "Forge n'est pas un dispositif médical et ne remplace pas l'avis d'un professionnel de santé.",
} as const;

export const HEDGE = {
  generally: "généralement",
  may: "peut",
  estimate: "estimation",
  dependsOn: "dépend notamment de",
} as const;

/** Principes d'entraînement utilisés par l'application, affichables comme sources. */
export const PRINCIPLES: { id: string; label: string; note: string }[] = [
  {
    id: "surcharge",
    label: "Surcharge progressive",
    note: "Augmenter progressivement la charge, les répétitions ou le volume est le principal moteur d'adaptation à long terme.",
  },
  {
    id: "volume",
    label: "Volume hebdomadaire",
    note: "Environ 10 à 20 séries dures par groupe musculaire et par semaine conviennent généralement pour progresser en hypertrophie.",
  },
  {
    id: "echec",
    label: "Proximité de l'échec",
    note: "Travailler à 0-3 répétitions de la limite est généralement suffisant. Aller systématiquement à l'échec augmente la fatigue sans bénéfice net clair.",
  },
  {
    id: "frequence",
    label: "Fréquence",
    note: "Répartir le volume sur 2 séances par groupe musculaire et par semaine est généralement au moins aussi efficace qu'une seule.",
  },
  {
    id: "amplitude",
    label: "Amplitude",
    note: "Une grande amplitude, en particulier la portion étirée, est généralement au moins aussi efficace qu'une amplitude partielle.",
  },
  {
    id: "recuperation",
    label: "Récupération",
    note: "Le muscle se construit entre les séances : sommeil, alimentation et gestion de la fatigue conditionnent la progression.",
  },
  {
    id: "proteines",
    label: "Apport protéique",
    note: "Environ 1,6 à 2,2 g de protéines par kg de poids de corps et par jour couvrent généralement les besoins en prise de masse.",
  },
  {
    id: "surplus",
    label: "Surplus énergétique",
    note: "Un surplus modéré (environ 10 % au-dessus de la maintenance) favorise la prise de muscle en limitant la prise de gras.",
  },
];

export function principle(id: string) {
  return PRINCIPLES.find((p) => p.id === id);
}
