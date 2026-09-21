/**
 * Contenu pédagogique destiné à quelqu'un qui n'a jamais mis les pieds dans une salle.
 *
 * why       — à quoi sert l'exercice, en une phrase
 * findIt    — comment reconnaître la machine ou le coin de la salle
 * simple    — le mouvement réexpliqué sans aucun vocabulaire technique
 * checklist — ce qu'on vérifie juste avant de lancer la série
 */
export type Coaching = {
  why: string;
  findIt: string[];
  simple: string[];
  checklist: string[];
};

export const COACHING: Record<string, Coaching> = {
  "bench-press": {
    why: "Le principal constructeur de pectoraux. Tes triceps et l'avant de tes épaules poussent avec.",
    findIt: [
      "Un banc plat posé sous une barre horizontale, à hauteur de poitrine allongé.",
      "Des crochets de chaque côté pour poser la barre.",
      "Souvent plusieurs bancs identiques alignés côte à côte.",
    ],
    simple: [
      "Allonge-toi sur le banc, les yeux juste sous la barre.",
      "Attrape la barre un peu plus large que tes épaules.",
      "Sors-la des crochets, bras tendus au-dessus de toi.",
      "Descends-la lentement jusqu'à toucher ta poitrine.",
      "Repousse-la vers le plafond.",
    ],
    checklist: ["Pieds bien à plat au sol", "Épaules qui restent posées sur le banc", "Barre contrôlée, pas de rebond", "Aucune douleur d'épaule"],
  },
  "assisted-pull-up": {
    why: "Le meilleur exercice pour élargir le dos. C'est la version aidée de la traction.",
    findIt: [
      "Une machine haute avec une barre en haut et un gros marchepied ou coussin à genoux.",
      "Une pile de poids sur le côté : plus tu mets lourd, plus la machine t'aide.",
      "Parfois appelée « assisted pull-up » ou « graviton ».",
    ],
    simple: [
      "Choisis un poids d'assistance : plus il est élevé, plus c'est facile.",
      "Monte sur la machine et pose tes genoux ou tes pieds sur le support.",
      "Attrape la barre du haut, mains un peu plus larges que les épaules.",
      "Tire-toi vers le haut jusqu'à ce que ton menton dépasse la barre.",
      "Redescends lentement jusqu'aux bras tendus.",
    ],
    checklist: ["Assistance réglée avant de monter", "Bras complètement tendus en bas", "Pas de balancement", "Descente contrôlée"],
  },
  "incline-db-press": {
    why: "Vise le haut des pectoraux, la partie qui donne une poitrine épaisse vue de face.",
    findIt: [
      "Un banc dont le dossier est incliné, réglable par un cran à l'arrière.",
      "Règle-le à mi-hauteur, autour de 30 à 40 degrés.",
      "Prends deux haltères identiques au râtelier.",
    ],
    simple: [
      "Assieds-toi sur le banc incliné, un haltère posé sur chaque cuisse.",
      "Bascule-toi en arrière en poussant les haltères avec tes genoux.",
      "Monte-les bras tendus au-dessus de ta poitrine.",
      "Descends-les jusqu'au niveau de ta poitrine.",
      "Repousse vers le haut.",
    ],
    checklist: ["Dos bien collé au dossier", "Poignets droits", "Haltères qui ne s'entrechoquent pas", "Descente maîtrisée"],
  },
  "chest-supported-row": {
    why: "Épaissit le milieu du dos sans faire travailler le bas du dos. Idéal quand on débute.",
    findIt: [
      "Un banc incliné contre lequel tu poses la poitrine, face au dossier.",
      "Ou une machine assise avec un coussin pour la poitrine et deux poignées.",
      "Deux haltères suffisent si tu utilises un banc.",
    ],
    simple: [
      "Règle le banc à mi-inclinaison et allonge-toi dessus, poitrine contre le dossier.",
      "Laisse tes bras pendre avec un haltère dans chaque main.",
      "Tire tes coudes vers l'arrière, le long de ton corps.",
      "Serre les omoplates une seconde en haut.",
      "Redescends lentement jusqu'aux bras tendus.",
    ],
    checklist: ["Poitrine qui reste collée au banc", "Coudes le long du corps", "Omoplates serrées en fin de mouvement", "Pas d'à-coup"],
  },
  "db-shoulder-press": {
    why: "Construit des épaules rondes et larges, celles qui changent une silhouette de face.",
    findIt: [
      "Un banc avec dossier réglé presque droit.",
      "Deux haltères identiques.",
      "Souvent près des miroirs, dans la zone haltères.",
    ],
    simple: [
      "Assieds-toi, dos bien calé contre le dossier presque vertical.",
      "Monte les haltères au niveau de tes oreilles, paumes vers l'avant.",
      "Pousse-les vers le plafond jusqu'à ce que les bras soient tendus.",
      "Redescends jusqu'à ce que tes coudes forment un angle droit.",
    ],
    checklist: ["Dos plaqué, pas de grosse cambrure", "Coudes légèrement en avant", "Pas de blocage brutal en haut", "Aucune douleur d'épaule"],
  },
  "lateral-raise": {
    why: "Le seul exercice qui élargit vraiment les épaules vues de face.",
    findIt: [
      "Deux petits haltères, beaucoup plus légers que tu ne l'imagines.",
      "Un espace libre devant un miroir suffit.",
      "Commence avec 4 à 6 kg maximum, même si ça paraît ridicule.",
    ],
    simple: [
      "Debout, un haltère dans chaque main le long du corps.",
      "Penche-toi très légèrement vers l'avant.",
      "Lève les bras sur les côtés, comme des ailes, jusqu'à hauteur d'épaules.",
      "Redescends lentement, sans laisser tomber.",
    ],
    checklist: ["Charge légère", "Pas d'élan du buste", "Épaules basses, pas montées aux oreilles", "Descente lente"],
  },
  "overhead-triceps-extension": {
    why: "Cible la grosse partie du triceps, celle qui donne du volume au bras vu de côté.",
    findIt: [
      "Une poulie avec une corde, réglée en position haute ou basse selon la variante.",
      "Ou simplement un haltère tenu à deux mains.",
      "La corde est une lanière avec deux embouts.",
    ],
    simple: [
      "Tiens la corde ou l'haltère derrière ta tête, coudes pointés vers le haut.",
      "Tends les bras jusqu'à ce qu'ils soient droits.",
      "Redescends lentement derrière la tête.",
      "Tes coudes ne bougent pas : seuls les avant-bras travaillent.",
    ],
    checklist: ["Coudes serrés vers l'intérieur", "Coudes immobiles", "Pas de cambrure du dos", "Amplitude complète"],
  },
  "incline-curl": {
    why: "Étire le biceps avant de le contracter, ce qui le fait travailler davantage.",
    findIt: [
      "Un banc incliné réglé assez bas, autour de 45 à 60 degrés.",
      "Deux haltères légers.",
    ],
    simple: [
      "Assieds-toi sur le banc incliné, dos bien calé.",
      "Laisse tes bras pendre complètement dans le vide, un haltère dans chaque main.",
      "Remonte les haltères vers tes épaules en pliant les coudes.",
      "Redescends très lentement jusqu'aux bras tendus.",
    ],
    checklist: ["Coudes qui restent en arrière", "Bras tendus en bas", "Descente lente", "Pas de mouvement d'épaule"],
  },
  "negative-pull-up": {
    why: "L'exercice qui te fera passer de 1 traction à plusieurs. Tu travailles uniquement la descente.",
    findIt: [
      "Une barre de traction fixe et un banc ou une marche à placer dessous.",
      "La barre est souvent au-dessus d'une cage ou fixée au mur.",
    ],
    simple: [
      "Pose un banc sous la barre et monte dessus.",
      "Attrape la barre, menton déjà au-dessus d'elle.",
      "Décolle les pieds du banc.",
      "Descends le plus lentement possible, en comptant jusqu'à 5.",
      "Repose les pieds et recommence.",
    ],
    checklist: ["Banc bien stable", "Menton au-dessus avant de lâcher les pieds", "Descente de 4 à 5 secondes", "Pas de saut au sol"],
  },
  "hack-squat": {
    why: "Charge lourdement les cuisses sans que tu aies à gérer l'équilibre d'une barre.",
    findIt: [
      "Une grosse machine inclinée avec une plateforme pour les pieds et deux coussins d'épaules.",
      "Tu te places dessous, dos contre le dossier incliné.",
      "Des poignées latérales servent à déverrouiller les sécurités.",
    ],
    simple: [
      "Place-toi sous les coussins d'épaules, dos plaqué au dossier.",
      "Pose tes pieds au milieu de la plateforme, écartés comme tes épaules.",
      "Tourne les poignées pour libérer la machine.",
      "Plie les genoux et descends lentement.",
      "Remonte en poussant la plateforme avec tes pieds.",
    ],
    checklist: ["Sécurités déverrouillées", "Dos plaqué", "Talons qui restent en contact", "Genoux qui ne rentrent pas vers l'intérieur"],
  },
  rdl: {
    why: "Muscle l'arrière des cuisses et les fessiers, et solidifie tout le dos.",
    findIt: [
      "Une barre droite posée sur un support à hauteur de cuisses, ou deux haltères.",
      "Un espace dégagé suffit, pas besoin de machine.",
    ],
    simple: [
      "Debout, tiens la barre devant tes cuisses, bras tendus.",
      "Plie très légèrement les genoux, puis ne les bouge plus.",
      "Pousse tes fesses vers l'arrière : la barre descend le long de tes jambes.",
      "Arrête-toi quand tu sens l'arrière de tes cuisses tirer fort.",
      "Reviens debout en poussant tes hanches vers l'avant.",
    ],
    checklist: ["Dos plat, jamais arrondi", "Barre collée aux jambes", "Genoux figés", "Arrêt dès que le dos veut s'arrondir"],
  },
  "leg-press": {
    why: "Permet de charger lourd les cuisses avec un risque technique très faible.",
    findIt: [
      "Une grosse machine où tu es assis ou allongé face à une plateforme inclinée.",
      "Tu pousses la plateforme avec tes pieds.",
      "Des poignées de chaque côté du siège pour te tenir.",
    ],
    simple: [
      "Assieds-toi, dos et fesses bien collés au dossier.",
      "Pose tes pieds au milieu de la plateforme, écartés comme tes épaules.",
      "Déverrouille les sécurités avec les leviers latéraux.",
      "Plie les genoux pour laisser descendre la plateforme vers toi.",
      "Repousse sans bloquer complètement les genoux.",
    ],
    checklist: ["Bas du dos qui reste collé au siège", "Genoux alignés avec les pieds", "Pas de blocage sec des genoux", "Sécurités ouvertes"],
  },
  "leg-curl": {
    why: "Le seul exercice qui isole l'arrière des cuisses, souvent négligé et souvent la cause des blessures.",
    findIt: [
      "Une machine où tu es allongé sur le ventre, ou assis, avec un coussin derrière les chevilles.",
      "Une pile de poids sur le côté.",
    ],
    simple: [
      "Installe-toi, le coussin juste au-dessus de tes talons.",
      "Plie les genoux pour ramener tes talons vers tes fesses.",
      "Serre une seconde en fin de mouvement.",
      "Redescends lentement, sans laisser la charge retomber.",
    ],
    checklist: ["Coussin au-dessus des talons", "Bassin qui ne décolle pas", "Retour lent", "Amplitude complète"],
  },
  "standing-calf-raise": {
    why: "Développe les mollets, qui répondent surtout à beaucoup de répétitions.",
    findIt: [
      "Une machine debout avec des coussins d'épaules et une marche pour les avant-pieds.",
      "À défaut, une simple marche et deux haltères font l'affaire.",
    ],
    simple: [
      "Pose tes avant-pieds sur la marche, talons dans le vide.",
      "Laisse tes talons descendre le plus bas possible.",
      "Monte sur la pointe des pieds le plus haut possible.",
      "Marque un temps d'arrêt en haut avant de redescendre.",
    ],
    checklist: ["Talons qui descendent bien bas", "Montée complète sur la pointe", "Pas de rebond", "Jambes quasi tendues"],
  },
  "farmer-carry": {
    why: "Renforce la poigne, les trapèzes et tout le tronc. C'est ce qui rend « fort pour porter ».",
    findIt: [
      "Deux haltères lourds et un couloir dégagé d'une vingtaine de mètres.",
      "Aucune machine nécessaire.",
    ],
    simple: [
      "Pose deux haltères au sol, de chaque côté de toi.",
      "Plie les genoux, attrape-les, redresse-toi.",
      "Marche droit devant toi jusqu'au bout du couloir.",
      "Repose-les en pliant les genoux.",
    ],
    checklist: ["Buste bien droit", "Épaules en arrière", "Doigts fermement serrés", "Repose en pliant les genoux"],
  },
  "dead-hang": {
    why: "Construit la poigne et étire le dos. C'est souvent la main qui lâche avant le dos en traction.",
    findIt: [
      "N'importe quelle barre de traction fixe.",
      "Une marche ou un banc pour l'attraper sans sauter.",
    ],
    simple: [
      "Attrape la barre, mains écartées comme tes épaules.",
      "Laisse-toi pendre, bras tendus, pieds dans le vide.",
      "Ne bouge plus, et compte les secondes.",
      "Descends doucement quand tu ne tiens plus.",
    ],
    checklist: ["Pouces enroulés autour de la barre", "Pas de balancement", "Épaules légèrement engagées", "Descente contrôlée"],
  },
  "incline-barbell-press": {
    why: "La version lourde du travail du haut des pectoraux.",
    findIt: [
      "Un banc incliné placé sous une barre, avec des crochets.",
      "Ou une machine de développé incliné avec deux poignées.",
    ],
    simple: [
      "Allonge-toi sur le banc incliné, dos bien calé.",
      "Attrape la barre un peu plus large que tes épaules.",
      "Sors-la des crochets, bras tendus.",
      "Descends-la vers le haut de ta poitrine.",
      "Repousse vers le plafond.",
    ],
    checklist: ["Fesses qui restent sur le banc", "Barre vers le haut de la poitrine", "Poignets droits", "Pas de rebond"],
  },
  "lat-pulldown": {
    why: "Élargit le dos. C'est la traction en version réglable, accessible dès le premier jour.",
    findIt: [
      "Une machine avec un siège et deux coussins qui bloquent les cuisses.",
      "Une grande barre suspendue au-dessus de toi, reliée à un câble.",
      "Une pile de poids sur le côté.",
    ],
    simple: [
      "Règle les coussins pour qu'ils bloquent bien tes cuisses.",
      "Attrape la barre, mains plus larges que tes épaules.",
      "Assieds-toi, bras tendus vers le haut.",
      "Tire la barre vers le haut de ta poitrine.",
      "Laisse-la remonter lentement.",
    ],
    checklist: ["Cuisses bien bloquées", "Buste presque droit", "Barre devant, jamais derrière la nuque", "Remontée contrôlée"],
  },
  "chest-press": {
    why: "Le développé couché en version machine : aucun équilibre à gérer, parfait pour apprendre.",
    findIt: [
      "Une machine assise avec deux poignées à hauteur de poitrine.",
      "Un levier sur le côté pour régler la hauteur du siège.",
      "Tu pousses vers l'avant, pas vers le haut.",
    ],
    simple: [
      "Règle le siège pour que les poignées soient au milieu de ta poitrine.",
      "Assieds-toi, dos bien collé au dossier.",
      "Attrape les poignées et pousse vers l'avant.",
      "Arrête juste avant de bloquer les coudes.",
      "Reviens lentement jusqu'à sentir l'étirement.",
    ],
    checklist: ["Poignées au milieu de la poitrine", "Dos plaqué", "Épaules basses", "Retour lent"],
  },
  "seated-cable-row": {
    why: "Épaissit le milieu du dos et corrige la posture des épaules.",
    findIt: [
      "Une machine assise face à une poulie basse, avec un repose-pieds.",
      "Une poignée simple ou double reliée au câble.",
    ],
    simple: [
      "Assieds-toi, pieds calés, genoux un peu pliés.",
      "Attrape la poignée, bras tendus vers l'avant.",
      "Tire la poignée vers ton ventre, coudes le long du corps.",
      "Serre les omoplates.",
      "Reviens lentement vers l'avant sans arrondir le dos.",
    ],
    checklist: ["Buste presque droit", "Coudes le long du corps", "Dos qui ne s'arrondit pas au retour", "Pas de balancement"],
  },
  "reverse-pec-deck": {
    why: "Muscle l'arrière des épaules, ce qui donne des épaules rondes vues de tous les angles.",
    findIt: [
      "La machine à pectoraux, utilisée à l'envers : tu t'assieds face au dossier.",
      "Un coussin pour la poitrine et deux poignées devant toi.",
    ],
    simple: [
      "Assieds-toi face au dossier, poitrine contre le coussin.",
      "Attrape les deux poignées devant toi, bras presque tendus.",
      "Écarte les bras vers l'arrière, comme si tu ouvrais des rideaux.",
      "Reviens lentement devant toi.",
    ],
    checklist: ["Poitrine collée au coussin", "Coudes à peine pliés et figés", "Charge légère", "Retour lent"],
  },
  "preacher-curl": {
    why: "Isole totalement le biceps : impossible de tricher avec le dos ou l'élan.",
    findIt: [
      "Un siège avec un pupitre incliné devant, sur lequel tu poses les bras.",
      "Souvent une machine avec pile de poids, parfois un simple banc avec une barre.",
    ],
    simple: [
      "Assieds-toi et cale tes aisselles en haut du pupitre.",
      "Attrape la barre, paumes vers le haut.",
      "Plie les coudes pour monter la barre vers tes épaules.",
      "Redescends lentement jusqu'aux bras presque tendus.",
    ],
    checklist: ["Aisselles bien calées", "Bras collés au pupitre", "Pas d'extension sèche en bas", "Fesses sur le siège"],
  },
  "hammer-curl": {
    why: "Épaissit le bras et renforce l'avant-bras. Prise plus confortable pour les poignets.",
    findIt: ["Deux haltères et un espace libre.", "Aucune machine nécessaire."],
    simple: [
      "Debout, un haltère dans chaque main, paumes face à face.",
      "Monte les haltères vers tes épaules sans tourner les poignets.",
      "Redescends lentement.",
    ],
    checklist: ["Coudes collés au corps", "Poignets qui ne tournent pas", "Pas d'élan du buste", "Descente contrôlée"],
  },
  "triceps-pushdown": {
    why: "Le geste le plus simple pour finir les triceps en fin de séance.",
    findIt: [
      "Une poulie réglée en position haute avec une barre courte ou une corde.",
      "Tu te places debout face à la machine.",
    ],
    simple: [
      "Attrape la barre à hauteur de poitrine, coudes collés au corps.",
      "Pousse vers le bas jusqu'à tendre complètement les bras.",
      "Laisse remonter jusqu'à ce que tes coudes forment un angle droit.",
      "Tes coudes ne bougent jamais.",
    ],
    checklist: ["Coudes collés aux côtes", "Buste immobile", "Extension complète en bas", "Remontée contrôlée"],
  },
  "trap-bar-deadlift": {
    why: "L'exercice de force par excellence : tout le corps pousse en même temps.",
    findIt: [
      "Une barre hexagonale posée au sol, avec deux poignées sur les côtés.",
      "Tu te places au milieu de l'hexagone, à l'intérieur.",
      "Si ta salle n'en a pas, deux haltères lourds au sol font le travail.",
    ],
    simple: [
      "Place-toi au centre de la barre, pieds écartés comme tes hanches.",
      "Accroupis-toi et attrape les deux poignées.",
      "Poitrine haute, dos droit, bras tendus.",
      "Pousse le sol avec tes pieds pour te redresser complètement.",
      "Redescends en poussant tes hanches vers l'arrière.",
    ],
    checklist: ["Dos plat avant de tirer", "Bras tendus, ils ne tirent pas", "Poitrine haute", "Pas de cambrure en fin de montée"],
  },
  "bulgarian-split-squat": {
    why: "Muscle chaque jambe séparément et corrige les déséquilibres entre la gauche et la droite.",
    findIt: [
      "Un banc plat et un espace libre devant.",
      "Deux haltères légers pour commencer, ou rien du tout.",
    ],
    simple: [
      "Place-toi debout, dos à un banc, à environ un grand pas devant lui.",
      "Pose le dessus de ton pied arrière sur le banc.",
      "Descends verticalement en pliant la jambe avant.",
      "Ton genou arrière descend vers le sol.",
      "Remonte en poussant dans le talon de la jambe avant.",
    ],
    checklist: ["Pied avant assez loin du banc", "Descente verticale, pas vers l'avant", "Buste stable", "Une jambe puis l'autre"],
  },
  "hip-thrust": {
    why: "L'exercice le plus efficace pour les fessiers, qui soutiennent tous les mouvements de jambes.",
    findIt: [
      "Un banc plat contre lequel tu appuies le haut du dos, assis au sol.",
      "Une barre posée sur les hanches, avec une mousse épaisse autour.",
    ],
    simple: [
      "Assieds-toi au sol, dos appuyé contre le côté long d'un banc.",
      "Pose la barre sur le pli de tes hanches, avec une mousse.",
      "Pieds à plat, écartés comme tes hanches.",
      "Pousse le sol avec tes talons pour monter ton bassin.",
      "En haut, ton corps forme une ligne droite des épaules aux genoux.",
    ],
    checklist: ["Mousse en place sur les hanches", "Menton légèrement rentré", "Fessiers serrés en haut", "Pas de cambrure excessive"],
  },
  "leg-extension": {
    why: "Isole l'avant des cuisses. Utile en finition et pour échauffer les genoux.",
    findIt: [
      "Une machine assise avec un coussin qui se place devant les tibias.",
      "Tu tends les jambes vers l'avant.",
    ],
    simple: [
      "Assieds-toi, dos calé, coussin juste au-dessus de tes chevilles.",
      "Tends les jambes vers l'avant jusqu'à ce qu'elles soient droites.",
      "Marque une seconde en haut.",
      "Redescends lentement.",
    ],
    checklist: ["Axe de la machine au niveau du genou", "Dos plaqué", "Pas d'à-coup", "Descente freinée"],
  },
  "sandbag-carry": {
    why: "Fait travailler tout le tronc en résistant au poids qui tire vers l'avant.",
    findIt: [
      "Un sac lesté, souvent rangé près de la zone fonctionnelle.",
      "À défaut, une grosse haltère serrée contre la poitrine fait le travail.",
    ],
    simple: [
      "Accroupis-toi devant le sac, dos droit.",
      "Serre-le contre ta poitrine avec les deux bras.",
      "Redresse-toi avec les jambes.",
      "Marche droit jusqu'au bout, puis repose-le en pliant les genoux.",
    ],
    checklist: ["Sac haut contre la poitrine", "Buste droit", "Petites respirations", "Repose en pliant les genoux"],
  },
  "weighted-crunch": {
    why: "Muscle les abdominaux avec de la charge, comme n'importe quel autre muscle.",
    findIt: [
      "Une poulie haute avec une corde.",
      "Tu te places à genoux, dos à la machine.",
    ],
    simple: [
      "Mets-toi à genoux, dos à la poulie, corde derrière la nuque.",
      "Enroule le haut de ton dos vers le sol, menton vers le nombril.",
      "Le mouvement vient du ventre, pas des hanches.",
      "Reviens lentement.",
    ],
    checklist: ["Hanches immobiles", "Mouvement d'enroulement, pas de flexion de hanche", "Bras qui ne tirent pas", "Retour lent"],
  },
};

const FALLBACK: Coaching = {
  why: "Exercice complémentaire du programme.",
  findIt: ["Demande à l'accueil de la salle si tu ne trouves pas le matériel : c'est leur métier."],
  simple: ["Regarde l'animation, puis suis les étapes de la section « Comment faire »."],
  checklist: ["Charge raisonnable", "Mouvement contrôlé", "Aucune douleur articulaire"],
};

export function coachingFor(exerciseId: string): Coaching {
  return COACHING[exerciseId] ?? FALLBACK;
}

export function hasCoaching(exerciseId: string) {
  return exerciseId in COACHING;
}
