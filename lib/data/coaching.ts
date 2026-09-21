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
  "db-bench-press": {
    why: "Le développé couché en version haltères : chaque bras travaille seul, donc aucun côté ne triche.",
    findIt: [
      "Un banc plat, dans la zone des bancs et des râteliers d'haltères.",
      "Prends deux haltères identiques, tu les soulèves toi-même : pas besoin de barre ni de crochets.",
      "C'est l'option la plus simple quand tous les bancs à barre sont pris.",
    ],
    simple: [
      "Assieds-toi au bout du banc, un haltère posé debout sur chaque cuisse.",
      "Bascule-toi en arrière en donnant une petite impulsion avec les genoux.",
      "Tu te retrouves allongé, les deux haltères au-dessus de ta poitrine, bras tendus.",
      "Descends-les lentement jusqu'au niveau de ta poitrine.",
      "Repousse vers le plafond.",
      "À la fin de la série, repose les haltères sur tes cuisses puis redresse-toi.",
    ],
    checklist: ["Pieds bien à plat au sol", "Épaules posées sur le banc", "Poignets droits, pas cassés en arrière", "Descente lente, remontée franche"],
  },
  "converging-chest-press": {
    why: "Le développé couché en version machine : aucun équilibre à gérer, tu pousses, c'est tout.",
    findIt: [
      "Une machine où tu es assis le dos calé, avec deux poignées au niveau de la poitrine.",
      "Les bras de la machine se rapprochent quand tu pousses, d'où le nom.",
      "Une pile de poids avec une goupille sur le côté.",
    ],
    simple: [
      "Règle la hauteur du siège pour que les poignées soient au niveau de ta poitrine.",
      "Assieds-toi, dos bien collé au dossier.",
      "Attrape les deux poignées.",
      "Pousse devant toi jusqu'à ce que tes bras soient presque tendus.",
      "Reviens lentement, sans laisser les poids retomber d'un coup.",
    ],
    checklist: ["Siège réglé à hauteur de poitrine", "Dos collé au dossier", "Coudes qui ne descendent pas trop bas", "Retour freiné"],
  },
  "cable-fly": {
    why: "Étire et resserre les pectoraux. C'est le mouvement qui creuse le milieu de la poitrine.",
    findIt: [
      "Deux colonnes de poulies qui se font face, avec des poignées réglables en hauteur.",
      "Règle les deux poulies en haut, prends une poignée dans chaque main.",
      "Place-toi au milieu, un pied légèrement en avant.",
    ],
    simple: [
      "Attrape une poignée de chaque main, bras écartés en croix.",
      "Avance d'un pas pour mettre les câbles en tension.",
      "Ramène tes deux mains devant toi, comme si tu serrais quelqu'un dans tes bras.",
      "Laisse les bras repartir en arrière, lentement, jusqu'à sentir l'étirement.",
    ],
    checklist: ["Coudes légèrement pliés et figés", "Buste penché très légèrement en avant", "Mouvement lent dans les deux sens", "Pas de douleur à l'avant de l'épaule"],
  },
  dips: {
    why: "Un des meilleurs exercices pour le bas des pectoraux et les triceps, avec ton seul poids de corps.",
    findIt: [
      "Deux barres parallèles à hauteur de hanches, souvent sur la même station que la barre de traction.",
      "Certaines salles ont une machine assistée : tu poses les genoux sur un coussin et la machine t'aide.",
      "Si tu n'en trouves pas, demande « les barres à dips » à l'accueil.",
    ],
    simple: [
      "Attrape une barre de chaque main et monte, bras tendus, pieds dans le vide.",
      "Plie les coudes et descends jusqu'à ce que tes épaules arrivent au niveau de tes coudes.",
      "Remonte en poussant sur tes bras jusqu'à les tendre.",
      "Si c'est trop dur : utilise la machine assistée, ou pose les pieds au sol pour t'aider.",
    ],
    checklist: ["Buste légèrement penché en avant", "Descente contrôlée, pas de chute", "Épaules qui ne remontent pas vers les oreilles", "Aucune douleur d'épaule"],
  },
  "overhead-press": {
    why: "Le meilleur exercice pour des épaules larges et fortes. Tu pousses une barre au-dessus de ta tête.",
    findIt: [
      "Une barre olympique et un support à hauteur de poitrine, ou un rack à squat.",
      "Ça se fait debout, dans la zone des barres libres.",
      "La barre seule pèse déjà 20 kg : c'est souvent bien suffisant au début.",
    ],
    simple: [
      "Place-toi debout sous la barre, mains un peu plus larges que tes épaules.",
      "Sors la barre du support et tiens-la au niveau des clavicules.",
      "Pousse la barre droit au-dessus de ta tête jusqu'à tendre les bras.",
      "Redescends lentement jusqu'aux clavicules.",
    ],
    checklist: ["Fesses et abdos serrés pour ne pas cambrer", "Barre qui monte à la verticale, pas en avant", "Tête qui recule légèrement au passage de la barre", "Bras tendus en haut"],
  },
  "shoulder-press-machine": {
    why: "Le développé épaules en version machine : le trajet est guidé, tu ne peux pas te tromper.",
    findIt: [
      "Une machine où tu es assis avec deux poignées au niveau des oreilles.",
      "Le dossier est presque vertical.",
      "Souvent placée à côté des autres machines de haut du corps.",
    ],
    simple: [
      "Règle le siège pour que les poignées soient au niveau de tes épaules.",
      "Assieds-toi, dos collé au dossier.",
      "Pousse les poignées vers le plafond jusqu'à presque tendre les bras.",
      "Redescends lentement jusqu'au niveau des épaules.",
    ],
    checklist: ["Siège réglé avant de commencer", "Dos plaqué au dossier", "Pas de blocage sec des coudes en haut", "Retour freiné"],
  },
  "cable-lateral-raise": {
    why: "Élargit le côté de l'épaule. C'est ce qui donne les épaules rondes vues de face.",
    findIt: [
      "Une colonne de poulie réglée tout en bas, avec une petite poignée.",
      "Tu te places debout à côté, la poulie du côté opposé au bras qui travaille.",
      "Très peu de poids suffit : c'est un petit muscle.",
    ],
    simple: [
      "Attrape la poignée avec la main la plus éloignée de la machine, bras le long du corps.",
      "Lève le bras sur le côté jusqu'à ce qu'il soit à hauteur d'épaule.",
      "Redescends lentement.",
      "Fais toutes les répétitions d'un côté, puis change de côté.",
    ],
    checklist: ["Bras presque tendu, coude à peine plié", "Montée jusqu'à l'horizontale, pas plus haut", "Aucun élan du buste", "Descente lente"],
  },
  "pull-up": {
    why: "L'exercice roi pour le dos et la poigne. C'est ta référence de force sur le haut du corps.",
    findIt: [
      "Une barre fixe horizontale, assez haute pour que tes pieds ne touchent pas le sol.",
      "Souvent sur la même station que les barres à dips.",
      "Un marchepied ou une caisse à côté pour l'atteindre.",
    ],
    simple: [
      "Attrape la barre, mains un peu plus larges que tes épaules, paumes vers l'avant.",
      "Laisse-toi pendre, bras tendus.",
      "Tire-toi vers le haut jusqu'à ce que ton menton passe au-dessus de la barre.",
      "Redescends lentement jusqu'aux bras tendus.",
      "Si tu n'en fais pas encore : la version aidée par la machine compte tout autant.",
    ],
    checklist: ["Pouces refermés autour de la barre", "Bras complètement tendus en bas", "Aucun balancement de jambes", "Descente freinée jusqu'au bout"],
  },
  "machine-row": {
    why: "Épaissit le milieu du dos, assis et le buste calé : ton bas du dos ne travaille pas.",
    findIt: [
      "Une machine assise avec un coussin pour la poitrine et deux poignées devant toi.",
      "Tu es face à la machine, pas dos à elle.",
      "Une pile de poids sur le côté.",
    ],
    simple: [
      "Règle le siège pour que les poignées soient au niveau de ta poitrine.",
      "Assieds-toi, poitrine contre le coussin.",
      "Attrape les poignées, bras tendus.",
      "Tire vers toi en amenant les coudes en arrière, jusqu'à ce que tes mains touchent tes côtes.",
      "Reviens lentement bras tendus.",
    ],
    checklist: ["Poitrine qui reste collée au coussin", "Épaules qui descendent avant de tirer", "Coudes qui longent le corps", "Retour complet, bras tendus"],
  },
  "t-bar-row": {
    why: "Épaissit le milieu du dos avec de la charge lourde. Le buste est penché, le dos bien droit.",
    findIt: [
      "Une barre fixée au sol par une extrémité, avec des poignées en V au milieu.",
      "Parfois une machine avec un support pour la poitrine : prends celle-là en priorité.",
      "Tu charges des disques sur le bout libre de la barre.",
    ],
    simple: [
      "Place-toi à cheval au-dessus de la barre, pieds écartés comme tes épaules.",
      "Plie légèrement les genoux et penche le buste en avant, dos bien droit.",
      "Attrape les poignées, bras tendus.",
      "Tire la barre vers ton ventre en ramenant les coudes en arrière.",
      "Redescends lentement bras tendus.",
    ],
    checklist: ["Dos droit, jamais arrondi", "Buste qui ne se relève pas pendant la série", "Coudes qui longent le corps", "Charge posée entre les séries"],
  },
  "face-pull": {
    why: "Muscle l'arrière de l'épaule et corrige la posture des épaules qui tombent en avant.",
    findIt: [
      "Une poulie réglée à hauteur de visage, avec une corde à deux brins.",
      "Tu tires vers ton visage, d'où le nom.",
      "Très léger : c'est un exercice de posture, pas de force.",
    ],
    simple: [
      "Attrape un brin de la corde dans chaque main, paumes vers le haut.",
      "Recule d'un ou deux pas pour mettre le câble en tension.",
      "Tire la corde vers ton front en écartant les mains.",
      "Tes coudes finissent hauts, à hauteur d'épaules.",
      "Reviens lentement bras tendus.",
    ],
    checklist: ["Poulie à hauteur de visage", "Coudes hauts pendant tout le mouvement", "Aucun élan du buste", "Charge légère, mouvement propre"],
  },
  "biceps-curl": {
    why: "L'exercice le plus direct pour grossir les biceps : tu plies le bras contre une charge.",
    findIt: [
      "Deux haltères au râtelier, ou une barre courte droite ou ondulée.",
      "Ça se fait debout, n'importe où dans la salle.",
      "Aucun réglage nécessaire.",
    ],
    simple: [
      "Debout, un haltère dans chaque main, bras le long du corps, paumes vers l'avant.",
      "Plie les coudes pour monter les haltères vers tes épaules.",
      "Redescends lentement jusqu'aux bras tendus.",
    ],
    checklist: ["Coudes collés au corps", "Aucun mouvement du buste", "Descente lente jusqu'aux bras tendus", "Poignets droits"],
  },
  "cable-curl": {
    why: "Le curl avec une tension constante du début à la fin, y compris en bas du mouvement.",
    findIt: [
      "Une poulie réglée tout en bas, avec une barre droite ou une corde.",
      "Tu te places debout face à la machine, à un pas.",
    ],
    simple: [
      "Attrape la barre de la poulie basse à deux mains, paumes vers le haut.",
      "Tiens-toi debout, bras tendus, coudes contre le corps.",
      "Plie les coudes pour monter la barre vers tes épaules.",
      "Redescends lentement jusqu'aux bras tendus.",
    ],
    checklist: ["Coudes qui restent contre les côtes", "Buste immobile", "Tension jamais relâchée en bas", "Descente lente"],
  },
  "skull-crusher": {
    why: "Cible la longue portion du triceps, celle qui donne du volume à l'arrière du bras.",
    findIt: [
      "Un banc plat et une barre courte ondulée, ou deux haltères légers.",
      "Ça se fait allongé, dans la zone des bancs.",
      "Commence très léger : les coudes sont sensibles sur ce mouvement.",
    ],
    simple: [
      "Allonge-toi sur le banc, barre tenue bras tendus au-dessus de ta poitrine.",
      "Plie uniquement les coudes pour descendre la barre vers ton front.",
      "Tes bras du haut restent immobiles, à la verticale.",
      "Retends les bras pour remonter la barre.",
    ],
    checklist: ["Bras du haut figés à la verticale", "Descente lente près du front", "Coudes qui ne s'écartent pas", "Arrête si les coudes chauffent"],
  },
  squat: {
    why: "Le meilleur exercice pour les cuisses et les fessiers. C'est aussi ce qui fait progresser tout le reste.",
    findIt: [
      "Une cage avec une barre posée sur des crochets à hauteur de poitrine.",
      "On l'appelle rack à squat ou cage à squat.",
      "Les barres de sécurité se règlent à hauteur de hanches : prends le temps de les mettre.",
    ],
    simple: [
      "Place la barre sur le haut de ton dos, pas sur ta nuque.",
      "Décolle la barre des crochets et recule de deux pas.",
      "Pieds écartés comme tes épaules, pointes légèrement vers l'extérieur.",
      "Descends en poussant les fesses en arrière, comme pour t'asseoir.",
      "Descends jusqu'à ce que tes cuisses soient à l'horizontale, puis remonte.",
    ],
    checklist: ["Barres de sécurité réglées", "Talons qui restent au sol", "Genoux dans l'axe des pieds", "Dos droit, regard devant"],
  },
  "goblet-squat": {
    why: "Le squat avec un seul haltère tenu devant la poitrine. C'est la version la plus facile à apprendre.",
    findIt: [
      "Un seul haltère au râtelier, ou une kettlebell.",
      "Aucune machine, aucun réglage : tu le fais où tu veux.",
      "C'est le bon choix si le rack à squat t'intimide encore.",
    ],
    simple: [
      "Tiens un haltère à la verticale contre ta poitrine, à deux mains sous le poids du haut.",
      "Pieds écartés comme tes épaules.",
      "Descends en poussant les fesses en arrière, buste bien droit.",
      "Descends jusqu'à ce que tes cuisses soient à l'horizontale.",
      "Remonte en poussant dans tes talons.",
    ],
    checklist: ["Haltère collé à la poitrine", "Coudes qui passent entre les genoux en bas", "Talons au sol", "Dos droit"],
  },
  "front-squat": {
    why: "Le squat avec la barre devant : le buste reste plus droit et les cuisses travaillent davantage.",
    findIt: [
      "Le même rack à squat que le squat classique.",
      "La barre se pose devant, sur le haut de la poitrine et les épaules.",
      "Utilise nettement moins de charge qu'au squat classique.",
    ],
    simple: [
      "Place la barre devant toi, posée sur le haut de ta poitrine et tes épaules.",
      "Croise les bras et lève bien les coudes pour la caler.",
      "Décolle-la des crochets et recule de deux pas.",
      "Descends en gardant le buste le plus droit possible.",
      "Remonte en poussant dans tes talons.",
    ],
    checklist: ["Coudes hauts pendant tout le mouvement", "Barre qui ne glisse pas vers l'avant", "Buste droit", "Barres de sécurité réglées"],
  },
  "walking-lunge": {
    why: "Travaille chaque jambe séparément et corrige les différences entre la gauche et la droite.",
    findIt: [
      "Un couloir libre dans la salle, souvent le long des miroirs.",
      "Deux haltères légers, un dans chaque main.",
      "Aucune machine.",
    ],
    simple: [
      "Debout, un haltère dans chaque main, bras le long du corps.",
      "Fais un grand pas en avant et plie les deux genoux.",
      "Le genou arrière descend presque jusqu'au sol.",
      "Pousse sur la jambe avant pour te relever et enchaîne un pas avec l'autre jambe.",
      "Avance ainsi sur toute la longueur prévue.",
    ],
    checklist: ["Buste droit, pas penché en avant", "Genou avant qui reste au-dessus du pied", "Pas assez grands", "Mouvement lent et stable"],
  },
  "good-morning": {
    why: "Muscle l'arrière des cuisses et le bas du dos. Le buste bascule en avant, les jambes restent presque tendues.",
    findIt: [
      "Le rack à squat, avec la barre posée sur le haut du dos comme au squat.",
      "Commence avec la barre seule, voire un simple bâton : la technique passe avant la charge.",
    ],
    simple: [
      "Barre posée sur le haut du dos, pieds écartés comme tes épaules.",
      "Plie très légèrement les genoux et garde-les figés.",
      "Pousse tes fesses en arrière et penche ton buste vers l'avant.",
      "Descends jusqu'à sentir l'arrière de tes cuisses tirer.",
      "Reviens en poussant tes hanches vers l'avant.",
    ],
    checklist: ["Dos parfaitement droit, jamais arrondi", "Genoux figés", "Descente jusqu'à l'étirement, pas plus", "Charge très légère au début"],
  },
  "back-extension": {
    why: "Renforce le bas du dos et les fessiers. C'est ce qui protège ton dos sur tous les autres exercices.",
    findIt: [
      "Un banc incliné à 45 degrés avec deux coussins pour les cuisses et deux rouleaux pour les chevilles.",
      "On l'appelle banc à lombaires ou chaise romaine.",
      "Se fait au poids du corps, bras croisés sur la poitrine.",
    ],
    simple: [
      "Installe-toi le ventre sur les coussins, chevilles bloquées sous les rouleaux.",
      "Croise les bras sur ta poitrine.",
      "Descends le buste vers le sol en pliant à la hanche.",
      "Remonte jusqu'à ce que ton corps forme une ligne droite.",
      "Ne monte pas plus haut : inutile de cambrer.",
    ],
    checklist: ["Coussins réglés au niveau des hanches", "Dos droit pendant tout le mouvement", "Arrêt à l'alignement en haut", "Mouvement lent"],
  },
  "seated-calf-raise": {
    why: "Cible la partie basse du mollet, celle que le mollet debout travaille peu.",
    findIt: [
      "Une machine où tu es assis avec un coussin qui appuie sur tes genoux.",
      "Tes pointes de pieds se posent sur un petit marchepied.",
      "Souvent dans un coin, près des machines à jambes.",
    ],
    simple: [
      "Assieds-toi et pose la pointe des pieds sur le marchepied.",
      "Cale le coussin sur le bas de tes cuisses, juste au-dessus des genoux.",
      "Laisse tes talons descendre le plus bas possible.",
      "Pousse sur tes pointes pour monter tes talons le plus haut possible.",
      "Redescends lentement.",
    ],
    checklist: ["Coussin bien calé sur les cuisses", "Talons qui descendent complètement", "Montée jusqu'en haut", "Mouvement lent, pas de rebond"],
  },
  "hanging-leg-raise": {
    why: "Le meilleur exercice pour les abdominaux du bas, et ça muscle la poigne en prime.",
    findIt: [
      "La même barre de traction que pour les tractions.",
      "Ou une station avec deux accoudoirs et un dossier, où tu prends appui sur les avant-bras.",
    ],
    simple: [
      "Attrape la barre et laisse-toi pendre, bras tendus.",
      "Monte tes genoux vers ta poitrine en enroulant le bas du dos.",
      "Redescends lentement jusqu'aux jambes tendues.",
      "Si c'est trop dur, monte les genoux moins haut.",
    ],
    checklist: ["Aucun balancement", "Mouvement qui vient du ventre", "Descente lente", "Lâche la barre avant de perdre le contrôle"],
  },
  plank: {
    why: "Apprend à ton ventre à tenir le tronc rigide. C'est la base qui protège ton dos partout ailleurs.",
    findIt: [
      "N'importe quel tapis au sol, dans la zone d'étirements.",
      "Aucun matériel, aucun réglage.",
    ],
    simple: [
      "Pose tes avant-bras au sol, coudes juste sous tes épaules.",
      "Tends les jambes en arrière, en appui sur les pointes de pieds.",
      "Ton corps forme une ligne droite des épaules aux talons.",
      "Serre le ventre et les fesses, et tiens la position.",
    ],
    checklist: ["Fesses ni trop hautes ni trop basses", "Ventre serré", "Respiration continue", "Arrête dès que le dos creuse"],
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
