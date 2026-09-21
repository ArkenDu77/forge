import { describe, expect, it } from "vitest";
import { adaptationLabel, adaptForWeek, ADAPTATION_WEEKS, ALL_DAYS, getDay } from "@/lib/data/program";
import { EXERCISES, ex } from "@/lib/data/exercises";
import { hasCoaching } from "@/lib/data/coaching";
import { PLATE_FRAMES } from "@/lib/data/plates";
import { existsSync, readFileSync } from "node:fs";

/**
 * Le programme est une donnée, pas du code : rien ne l'empêche de dériver
 * silencieusement d'une séance à l'autre. Ces tests figent ce que le brief
 * demande — les jours, les durées, et le fait que la phase d'adaptation
 * n'allège que l'isolation.
 */

/** Fourchettes de durée annoncées pour chaque séance. */
const DUREES: Record<string, [number, number]> = {
  lundi: [85, 95],
  mardi: [75, 90],
  jeudi: [85, 95],
  samedi: [75, 90],
};

describe("semaine de programme", () => {
  it("quatre séances : lundi, mardi, jeudi, samedi", () => {
    expect(ALL_DAYS.map((d) => d.id)).toEqual(["lundi", "mardi", "jeudi", "samedi"]);
    expect(ALL_DAYS.map((d) => d.weekday)).toEqual([0, 1, 3, 5]);
  });

  it("chaque séance dure ce qui est annoncé", () => {
    for (const day of ALL_DAYS) {
      const [min, max] = DUREES[day.id];
      expect(day.estimatedMin, `${day.id} : ${day.estimatedMin} min`).toBeGreaterThanOrEqual(min);
      expect(day.estimatedMin, `${day.id} : ${day.estimatedMin} min`).toBeLessThanOrEqual(max);
    }
  });

  it("chaque séance commence par du cardio", () => {
    for (const day of ALL_DAYS) {
      expect(day.warmup.minutes).toBeGreaterThanOrEqual(5);
      expect(day.warmup.instruction.length).toBeGreaterThan(20);
    }
  });

  it("les exercices lourds à charge libre ont des séries d'échauffement guidées", () => {
    for (const day of ALL_DAYS) {
      const force = day.exercises.filter((x) => x.kind === "force");
      expect(force.length, day.id).toBeGreaterThan(0);
      for (const x of force) {
        // Sur une machine assistée, le poids réglé est l'aide : une montée
        // progressive commencerait par le plus dur. L'exception est expliquée
        // dans la note de l'exercice, qui doit donc exister.
        if (ex(x.exerciseId).assistance) {
          expect(x.note, x.exerciseId).toBeTruthy();
          continue;
        }
        expect(x.warmup?.length, `${day.id} / ${x.exerciseId}`).toBeGreaterThan(0);
      }
    }
  });
});

describe("phase d'adaptation", () => {
  it("n'allège que l'isolation, et jamais en dessous de deux séries", () => {
    for (const day of ALL_DAYS) {
      const light = adaptForWeek(day, 1);
      day.exercises.forEach((x, i) => {
        const y = light.exercises[i];
        expect(y.exerciseId).toBe(x.exerciseId);
        if (x.kind === "accessoire" && x.sets > 2) expect(y.sets).toBe(x.sets - 1);
        else expect(y.sets).toBe(x.sets);
        expect(y.sets).toBeGreaterThanOrEqual(2);
      });
      expect(light.estimatedMin).toBeLessThanOrEqual(day.estimatedMin);
    }
  });

  it("rend le programme complet passé les deux premières semaines", () => {
    const day = getDay("jeudi")!;
    expect(adaptForWeek(day, ADAPTATION_WEEKS + 1)).toBe(day);
    expect(adaptationLabel(1)).toMatch(/1\/2/);
    expect(adaptationLabel(2)).toMatch(/2\/2/);
    expect(adaptationLabel(3)).toBeNull();
  });
});

describe("contenu pédagogique", () => {
  it("chaque exercice du programme et chacune de ses alternatives a sa fiche", () => {
    const joignables = new Set<string>();
    for (const day of ALL_DAYS) for (const x of day.exercises) joignables.add(x.exerciseId);
    // Une substitution amène un exercice dans la séance : sa fiche doit exister aussi.
    for (const id of [...joignables]) for (const s of ex(id).substitutions) joignables.add(s);

    const sans = [...joignables].filter((id) => !hasCoaching(id));
    expect(sans, `sans fiche : ${sans.join(", ")}`).toEqual([]);
  });

  it("les portés et les suspensions ne se comptent pas en répétitions", () => {
    const carries = ALL_DAYS.flatMap((d) => d.exercises).filter((x) => x.metric !== "reps");
    expect(carries.length).toBeGreaterThan(0);
    for (const x of carries) {
      if (x.metric === "distance") expect(x.distMin && x.distMax).toBeTruthy();
      if (x.metric === "duration") expect(x.secMin && x.secMax).toBeTruthy();
    }
  });
});

/* ---------------- Illustrations ---------------- */

describe("illustrations", () => {
  const ledger = JSON.parse(readFileSync("public/exercise-media-sources.json", "utf8")) as {
    assets: { exerciseId: string; commonsFiles: string[]; license: string; attributionRequired: boolean }[];
    customDrawn: { exercises: Record<string, string> };
  };

  it("chaque exercice est illustré, par une planche ou par le moteur maison", () => {
    for (const e of EXERCISES) {
      const plate = PLATE_FRAMES[e.id];
      if (plate) continue;
      // Sans planche, la silhouette doit avoir de quoi être dessinée.
      expect(e.media.poses.length, e.id).toBeGreaterThan(0);
    }
  });

  it("la table des planches correspond aux fichiers du registre", () => {
    const fromLedger = Object.fromEntries(ledger.assets.map((a) => [a.exerciseId, a.commonsFiles.length]));
    expect(PLATE_FRAMES).toEqual(fromLedger);
  });

  it("toute planche est sous licence libre et créditée", () => {
    for (const a of ledger.assets) {
      expect(a.license, a.exerciseId).toMatch(/^CC BY/);
      expect(a.attributionRequired, a.exerciseId).toBe(true);
    }
  });

  it("les fichiers annoncés par le registre existent", () => {
    for (const id of Object.keys(PLATE_FRAMES)) {
      for (let f = 1; f <= PLATE_FRAMES[id]; f++) {
        expect(existsSync(`public/exercises/${id}-${f}.svg`), `${id}-${f}.svg`).toBe(true);
      }
    }
  });

  it("deux exercices ne partagent une planche que si c'est voulu", () => {
    // La traction et sa version négative se font sur la même barre, avec le
    // même mouvement : c'est le seul partage accepté. Tout autre doublon est
    // une faute de frappe dans la table de correspondance.
    const PARTAGES_VOULUS = [["negative-pull-up", "pull-up"]];
    const byFiles = new Map<string, string[]>();
    for (const a of ledger.assets) {
      const key = a.commonsFiles.join(" + ");
      byFiles.set(key, [...(byFiles.get(key) ?? []), a.exerciseId]);
    }
    const partages = [...byFiles.values()].filter((ids) => ids.length > 1).map((ids) => ids.sort());
    expect(partages).toEqual(PARTAGES_VOULUS);
  });

  it("chaque exercice dessiné à la main dit pourquoi il n'a pas de planche", () => {
    const maison = EXERCISES.filter((e) => !PLATE_FRAMES[e.id]).map((e) => e.id).sort();
    expect(Object.keys(ledger.customDrawn.exercises).sort()).toEqual(maison);
    for (const [id, raison] of Object.entries(ledger.customDrawn.exercises)) {
      expect(raison.length, id).toBeGreaterThan(15);
    }
  });
});
