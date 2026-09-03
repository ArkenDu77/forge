# Forge

Application de coaching musculation orientée **prise de masse et gain de force**.
Elle transforme un programme papier en séance guidée : quel exercice, sur quelle machine,
combien de séries, quelle charge aujourd'hui, combien de repos — et comment progresser la fois suivante.

Interface en français, mobile-first, installable en PWA.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Motion · Zustand (persistance `localStorage`).
Aucune base de données ni service externe : tout vit sur l'appareil.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Ce que fait l'application

- **Onboarding** en 11 étapes → profil, objectif, disponibilité, équipement, alimentation, budget, récupération.
- **Programme** 4 jours (haut/bas × force/hypertrophie) et bibliothèque de 45 exercices.
- **Mode séance** plein écran : un exercice à la fois, sélecteur de charge, saisie répétitions + RIR en deux gestes,
  chrono de repos, célébration des records, résumé de fin de séance.
- **Progression automatique** en double progression, avec justification affichée (« Pourquoi cette charge ? »).
- **Nutrition** : besoins estimés, 18 recettes chiffrées, semaine type, liste de courses par rayon et budget.
- **Progression corporelle** : force, volume, régularité, mensurations, projections conditionnelles.

## Démonstrations de mouvement

Aucun média sous copyright. Les animations sont générées par un moteur de silhouette vectorielle
piloté par les données : chaque pose décrit les points d'appui (pieds au sol, mains sur la barre)
et la cinématique inverse (`lib/data/poses.ts`) en déduit les angles des segments.
Le rendu (`components/exercise/Figure.tsx`) écrit les positions directement dans le DOM,
sans re-render React, et se met en pause hors écran.

Ajouter un exercice = ajouter une entrée de données dans `lib/data/ex-*.ts`.

## Organisation

```
app/
  (app)/          écrans avec navigation basse
  seance/[dayId]/ mode séance plein écran
  onboarding/
components/
  exercise/       moteur d'animation, carte musculaire
  workout/        chrono, saisie de série, substitutions
  ui/             primitives, icônes, jauges
  charts/         graphiques SVG animés
lib/
  data/           exercices, programme, recettes, plan
  progression.ts  double progression + détection de records
  estimator.ts    charge de départ, 1RM estimé, niveaux de force
  nutrition.ts    besoins caloriques et macros
  projection.ts   projections conditionnelles
  coach.ts        messages calculés depuis les données réelles
  copy.ts         formulations de prudence, centralisées
```

## Prudence

Les charges affichées sont des **estimations de départ**, jamais présentées comme sûres.
Les projections sont des intervalles conditionnels, jamais des promesses.
L'application ne pose aucun diagnostic et ne remplace pas l'avis d'un professionnel de santé.
Toutes ces formulations sont regroupées dans `lib/copy.ts`.
