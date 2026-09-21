#!/usr/bin/env python3
"""
Télécharge les planches d'exercices depuis Wikimedia Commons et produit le registre
des licences (public/exercise-media-sources.json).

Toutes les planches proviennent du jeu Everkinetic, publié sous CC BY-SA 3.0.
Le choix du fichier pour chaque exercice est délibéré (voir PLATES) : on ne prend
jamais le premier résultat d'une recherche, et on n'invente aucune correspondance.
Les exercices absents du catalogue sont listés dans CUSTOM : ils sont dessinés par
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

# exerciseId -> nom de base du fichier sur Commons (« <base> 1.svg » / « <base> 2.svg »)
PLATES = {
    "bench-press": "Bench press",
    "assisted-pull-up": "Pull ups",
    "negative-pull-up": "Pull ups",
    "incline-db-press": "Dumbbell incline bench press",
    "db-shoulder-press": "Dumbbell shoulder press",
    "overhead-triceps-extension": "Standing overhead triceps extension with barbell",
    "incline-curl": "Alternating incline curl with dumbbell",
    "hack-squat": "Hack squat machine",
    "rdl": "Romanian dead lift",
    "leg-curl": "Lying leg curl machine",
    "standing-calf-raise": "Standing calf raises using machine",
    "incline-barbell-press": "Incline bench press",
    "lat-pulldown": "Wide grip lat pull down",
    "chest-press": "Machine bench press",
    "seated-cable-row": "Seated cable rows",
    "preacher-curl": "Preacher curl with machine",
    "hammer-curl": "Bicep hammer curl with dumbbell",
    "triceps-pushdown": "Triceps pushdown with cable",
    "leg-extension": "Leg extensions",
    "weighted-crunch": "Seated ab crunch with cable",
}

# Absents du catalogue Commons : rendus par le moteur maison.
CUSTOM = [
    "chest-supported-row",
    "lateral-raise",
    "leg-press",
    "farmer-carry",
    "dead-hang",
    "reverse-pec-deck",
    "trap-bar-deadlift",
    "bulgarian-split-squat",
    "hip-thrust",
    "sandbag-carry",
]


def api(params):
    params = {**params, "format": "json"}
    req = urllib.request.Request(API + "?" + urllib.parse.urlencode(params), headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


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
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as r:
        raw = r.read()
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
        frames = []
        for frame in (1, 2):
            title = f"{base} {frame}.svg"
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
            time.sleep(0.15)

        if frames:
            info = file_info(f"{base} 1.svg")
            ledger.append({
                "exerciseId": exercise_id,
                "commonsBase": base,
                "author": info["author"],
                "license": info["license"],
                "licenseUrl": info["licenseUrl"],
                "attributionRequired": True,
                "attribution": f"{info['author']} — {info['license']}",
                "credit": info["credit"],
                "frames": frames,
                "notes": "Planches recolorées à l'affichage (filtre CSS). Les fichiers stockés sont inchangés.",
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
            "reason": "Absents du catalogue Commons — dessinés par le moteur maison, aucune licence tierce.",
            "exercises": CUSTOM,
        },
        "assets": ledger,
    }
    with open(LEDGER, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

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
