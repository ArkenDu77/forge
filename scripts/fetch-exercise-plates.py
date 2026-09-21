#!/usr/bin/env python3
"""
Télécharge les planches d'exercices depuis Wikimedia Commons et produit le registre
des licences (public/exercise-media-sources.json).

Toutes les planches proviennent du jeu Everkinetic, publié sous CC BY-SA 3.0.
Le choix du fichier pour chaque exercice est délibéré (voir PLATES) : on ne prend
jamais le premier résultat d'une recherche, et on n'invente aucune correspondance.

Règle d'acceptation : la planche doit montrer le matériel que la fiche
`coaching[id].findIt` dit d'aller chercher. Une planche au bon mouvement mais au
mauvais matériel est refusée — c'est ce matériel qu'un débutant cherche dans la
salle. C'est pourquoi le développé militaire (planche assise, consigne debout)
et la traction assistée (planche de traction libre, machine à assistance) restent
dessinés par le moteur maison.

Les exercices sans planche fidèle sont listés dans CUSTOM : ils sont dessinés par
le moteur d'animation maison (components/exercise/Figure.tsx).

Usage : python scripts/fetch-exercise-plates.py
"""

import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

UA = "ForgeFitnessApp/1.0 (personal training app; benarken@yahoo.com)"
API = "https://commons.wikimedia.org/w/api.php"
OUT_DIR = os.path.join("public", "exercises")
LEDGER = os.path.join("public", "exercise-media-sources.json")
PLATES_TS = os.path.join("lib", "data", "plates.ts")

# exerciseId -> nom de base du fichier sur Commons (« <base> 1.svg » / « <base> 2.svg »),
# ou couple de noms complets quand les deux positions n'appartiennent pas à la
# même série de fichiers.
PLATES = {
    # --- Haut du corps : pousser ---
    "bench-press": "Bench press",
    "db-bench-press": "Bench press dumbbell",
    "incline-db-press": "Dumbbell incline bench press",
    "incline-barbell-press": "Incline bench press",
    "chest-press": "Machine bench press",
    "cable-fly": "Cable crossover",
    "dips": "Chest dips",
    "db-shoulder-press": "Dumbbell shoulder press",
    "shoulder-press-machine": "Seated shoulder press machine",
    "lateral-raise": "Lateral dumbbell raises",
    "overhead-triceps-extension": "Standing overhead triceps extension with barbell",
    "triceps-pushdown": "Triceps pushdown with cable",
    "skull-crusher": "Lying triceps press with barbell",
    # --- Haut du corps : tirer ---
    # La traction libre et sa version négative se font sur la même barre, avec le
    # même mouvement : une seule planche pour les deux, volontairement.
    "pull-up": "Pull ups",
    "negative-pull-up": "Pull ups",
    "lat-pulldown": "Wide grip lat pull down",
    "seated-cable-row": "Seated cable rows",
    "t-bar-row": "T bar rows",
    "preacher-curl": "Preacher curl with machine",
    "incline-curl": "Alternating incline curl with dumbbell",
    "hammer-curl": "Bicep hammer curl with dumbbell",
    "biceps-curl": "Bicep curls with barbell",
    # --- Bas du corps ---
    # Le catalogue n'a pas de seconde position pour la machine à hack squat :
    # « Narrow stance hack squats 2 » est la même machine, dessinée dans le même
    # style et la même orientation, en position basse. L'écart de stance est noté
    # dans le registre.
    "hack-squat": ("Hack squat machine 1.svg", "Narrow stance hack squats 2.svg"),
    "squat": "Wide stance squat with barbell",
    "front-squat": "Front squat with barbell",
    "walking-lunge": "Walking lunges",
    "rdl": "Romanian dead lift",
    "good-morning": "Barbell good mornings",
    "back-extension": "Hyperextensions",
    "leg-curl": "Lying leg curl machine",
    "leg-extension": "Leg extensions",
    "standing-calf-raise": "Standing calf raises using machine",
    "seated-calf-raise": "Seated calf raise using machine",
    # --- Tronc ---
    "weighted-crunch": "Seated ab crunch with cable",
}

# Sans planche fidèle : rendus par le moteur maison.
# `raison` sert à écrire le registre, et à ne pas re-débattre du choix.
CUSTOM = {
    "assisted-pull-up": "La seule planche de traction du catalogue montre une barre fixe ; la fiche envoie chercher une machine à assistance avec repose-genoux.",
    "overhead-press": "Le catalogue n'a que le développé militaire assis ; la consigne est debout.",
    "converging-chest-press": "Pas de planche distincte du développé machine déjà utilisé pour un autre exercice.",
    "cable-lateral-raise": "Absent du catalogue.",
    "cable-curl": "Absent du catalogue.",
    "face-pull": "Absent du catalogue.",
    "machine-row": "Absent du catalogue ; la seule planche de rowing assis sert déjà au rowing à la poulie.",
    "chest-supported-row": "Absent du catalogue : aucune planche ne montre la poitrine appuyée sur un banc incliné.",
    "reverse-pec-deck": "Absent du catalogue : les planches d'arrière d'épaule montrent haltères ou poulie, pas la machine.",
    "leg-press": "Absent du catalogue.",
    "goblet-squat": "Absent du catalogue.",
    "bulgarian-split-squat": "Absent du catalogue : les fentes du catalogue ont le pied arrière au sol, pas surélevé.",
    "hip-thrust": "Absent du catalogue : le pont fessier du catalogue se fait au sol, sans banc sous les épaules.",
    "trap-bar-deadlift": "Absent du catalogue.",
    "farmer-carry": "Absent du catalogue.",
    "sandbag-carry": "Absent du catalogue.",
    "dead-hang": "Absent du catalogue : un maintien statique n'a pas de seconde position, la silhouette maison suffit.",
    "hanging-leg-raise": "Absent du catalogue.",
    "plank": "Absent du catalogue : seule la version latérale existe.",
}


PAUSE = 2.0  # Commons limite le débit : en dessous, on se fait renvoyer des 429.


def fetch(url, timeout=90):
    """Requête avec reprise : Commons répond 429 dès qu'on enchaîne trop vite."""
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except Exception as exc:
            if attempt == 5:
                raise
            wait = 6 * (attempt + 1)
            print(f"    (nouvelle tentative dans {wait}s : {exc})")
            time.sleep(wait)
    return None


def api(params):
    params = {**params, "format": "json"}
    return json.loads(fetch(API + "?" + urllib.parse.urlencode(params), timeout=60))


def strip_html(value):
    return re.sub(r"<[^>]+>", "", value or "").strip()


def file_info(title):
    """URL directe + métadonnées de licence, ou None si le fichier n'existe pas."""
    data = api({
        "action": "query",
        "titles": "File:" + title,
        "prop": "imageinfo",
        "iiprop": "url|extmetadata|size",
    })
    for page in data.get("query", {}).get("pages", {}).values():
        if "imageinfo" not in page:
            return None
        info = page["imageinfo"][0]
        meta = info.get("extmetadata", {})
        return {
            "url": info["url"].split("?")[0],
            "descriptionUrl": info.get("descriptionurl", "").split("?")[0],
            "license": strip_html(meta.get("LicenseShortName", {}).get("value")),
            "licenseUrl": strip_html(meta.get("LicenseUrl", {}).get("value")),
            "author": strip_html(meta.get("Artist", {}).get("value")),
            "credit": strip_html(meta.get("Credit", {}).get("value")),
        }
    return None


def download(url, dest):
    raw = fetch(url, timeout=120)
    # Allègement : on retire les commentaires et métadonnées d'édition inutiles.
    text = raw.decode("utf-8", "ignore")
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    text = re.sub(r"<metadata>.*?</metadata>", "", text, flags=re.S)
    text = re.sub(r"\s+", " ", text).strip()
    with open(dest, "w", encoding="utf-8") as f:
        f.write(text)
    return len(text)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    ledger, total, failures = [], 0, []

    for exercise_id, base in PLATES.items():
        # Une chaîne = série « <base> 1.svg » / « <base> 2.svg ».
        # Un couple = deux fichiers nommés explicitement.
        titles = base if isinstance(base, tuple) else (f"{base} 1.svg", f"{base} 2.svg")
        frames = []
        for frame in (1, 2):
            title = titles[frame - 1]
            info = file_info(title)
            if not info:
                if frame == 2:
                    print(f"  (une seule planche pour {exercise_id})")
                else:
                    failures.append((exercise_id, title))
                continue
            if "CC BY-SA" not in info["license"] and "CC BY" not in info["license"]:
                failures.append((exercise_id, f"{title} — licence inattendue : {info['license']}"))
                continue
            dest = os.path.join(OUT_DIR, f"{exercise_id}-{frame}.svg")
            size = download(info["url"], dest)
            total += size
            frames.append({
                "frame": frame,
                "assetPath": f"/exercises/{exercise_id}-{frame}.svg",
                "sourceUrl": info["descriptionUrl"] or info["url"],
                "bytes": size,
            })
            print(f"  {exercise_id}-{frame}.svg  ({size // 1024} Ko)  {info['license']}")
            time.sleep(PAUSE)

        if frames:
            info = file_info(titles[0])
            recomposed = isinstance(base, tuple)
            entry_notes = "Planches recolorées à l'affichage (filtre CSS). Les fichiers stockés sont inchangés."
            if recomposed:
                entry_notes = (
                    "Paire recomposée : le catalogue n'a pas de seconde position pour ce fichier. "
                    "Les deux planches montrent la même machine, dans le même style et la même "
                    "orientation, en position haute puis basse — la seconde est titrée « narrow "
                    "stance », l'écartement des pieds diffère donc légèrement. "
                    + entry_notes
                )
            ledger.append({
                "exerciseId": exercise_id,
                "commonsFiles": list(titles),
                "recomposedPair": recomposed,
                "author": info["author"],
                "license": info["license"],
                "licenseUrl": info["licenseUrl"],
                "attributionRequired": True,
                "attribution": f"{info['author']} — {info['license']}",
                "credit": info["credit"],
                "frames": frames,
                "notes": entry_notes,
            })

    payload = {
        "generatedAt": time.strftime("%Y-%m-%d"),
        "source": "Wikimedia Commons — jeu de planches Everkinetic",
        "globalLicense": "CC BY-SA 3.0",
        "obligations": [
            "Créditer l'auteur (Everkinetic) et la licence partout où les planches sont affichées.",
            "Toute modification d'une planche doit rester sous CC BY-SA 3.0.",
            "La recoloration est faite à l'affichage : les fichiers distribués ne sont pas modifiés.",
        ],
        "customDrawn": {
            "reason": (
                "Dessinés par le moteur d'animation du projet à partir de données de pose : "
                "aucun média extérieur, aucune licence tierce. Une planche du catalogue n'est "
                "retenue que si elle montre le matériel que la fiche de l'exercice dit d'aller "
                "chercher ; sinon l'exercice est dessiné ici, avec sa raison."
            ),
            "exercises": CUSTOM,
        },
        "assets": ledger,
    }
    with open(LEDGER, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    # Table lue par l'application. Elle est produite ici, à partir des fichiers
    # réellement écrits : un exercice ne peut pas déclarer une planche absente,
    # ni en oublier une après un changement de catalogue.
    counts = {e["exerciseId"]: len(e["frames"]) for e in ledger}
    rows = "
".join(f'  "{k}": {v},' for k, v in sorted(counts.items()))
    with open(PLATES_TS, "w", encoding="utf-8", newline="
") as f:
        f.write(
            "/* Généré par scripts/fetch-exercise-plates.py — ne pas modifier à la main. */

"
            "/**
"
            " * Exercices illustrés par une planche Everkinetic, et nombre de positions
"
            " * disponibles. La table est produite à partir des fichiers réellement présents
"
            " * dans public/exercises : déclarer une planche qui n'existe pas, ou l'oublier
"
            " * après un changement de catalogue, n'est pas possible.
"
            " */
"
            "export const PLATE_FRAMES: Record<string, 1 | 2> = {
" + rows + "
};

"
            "export const plateFrames = (exerciseId: string): 1 | 2 | undefined => PLATE_FRAMES[exerciseId];
"
        )

    print(f"\n{len(ledger)} exercices illustrés · {total // 1024} Ko au total")
    print(f"{len(CUSTOM)} exercices en animation maison")
    print(f"registre : {LEDGER}")
    if failures:
        print("\nÉCHECS :")
        for exercise_id, why in failures:
            print(f"  {exercise_id}: {why}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
