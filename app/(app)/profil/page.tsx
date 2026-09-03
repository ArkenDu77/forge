"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useState } from "react";
import { Page, TopBar } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";
import { Badge, Button, Card, Chip, cx, InfoNote, SectionTitle, Sheet } from "@/components/ui/primitives";
import { Counter, ProgressBar, ProgressRing } from "@/components/ui/progress";
import { useApp, useTotalXp } from "@/lib/store";
import { levelFor, unlockedAchievements } from "@/lib/gamification";
import { currentStreak } from "@/lib/progression";
import { MUSCLE_GROUPS, muscleName } from "@/lib/data/muscles";
import { buildDemoData } from "@/lib/seed";
import { SAFETY, PRINCIPLES } from "@/lib/copy";
import { today } from "@/lib/format";
import type { MuscleId, RecoveryCheckin } from "@/lib/types";

export default function ProfilPage() {
  const router = useRouter();
  const profile = useApp((s) => s.profile)!;
  const sessions = useApp((s) => s.sessions);
  const recovery = useApp((s) => s.recovery);
  const patchProfile = useApp((s) => s.patchProfile);
  const addRecovery = useApp((s) => s.addRecovery);
  const reset = useApp((s) => s.reset);
  const importDemo = useApp((s) => s.importDemo);
  const xp = useTotalXp();
  const level = levelFor(xp);
  const streak = currentStreak(sessions);
  const badges = unlockedAchievements(sessions);
  const unlocked = badges.filter((b) => b.unlocked).length;

  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const todayCheck = recovery.find((r) => r.date === today());
  const [draft, setDraft] = useState<RecoveryCheckin>(
    todayCheck ?? { date: today(), sleepHours: profile.sleepHours, fatigue: "moyenne", soreness: [], motivation: 3 }
  );

  const advice =
    draft.fatigue === "elevee" || draft.sleepHours < 6
      ? "Fatigue élevée ou nuit courte : garde une répétition de réserve supplémentaire et n'essaie pas de battre un record aujourd'hui."
      : draft.fatigue === "faible" && draft.sleepHours >= 7
        ? "Bonnes conditions : c'est une séance où tenter une progression de charge a du sens."
        : "Conditions correctes : suis les charges proposées, en restant attentif à la technique.";

  return (
    <Page>
      <TopBar
        title="Profil"
        subtitle={profile.firstName}
        action={
          <button onClick={() => setEditOpen(true)} className="tap grid h-10 w-10 place-items-center rounded-2xl border border-white/10 text-chalk-dim" aria-label="Modifier">
            <Icon name="edit" size={17} />
          </button>
        }
      />

      <Card className="mb-4 p-5">
        <div className="flex items-center gap-4">
          <ProgressRing value={level.progress} size={78} stroke={7}>
            <span className="num font-display text-xl font-extrabold">{level.level}</span>
          </ProgressRing>
          <div className="flex-1">
            <p className="font-display text-xl font-extrabold">{level.name}</p>
            <p className="num text-[12.5px] text-chalk-mute">
              <Counter value={xp} /> XP
              {level.next ? ` · ${level.toNext} XP avant ${level.next.name}` : " · niveau maximum"}
            </p>
            <div className="mt-2 flex gap-1.5">
              {streak >= 2 && (
                <Badge tone="ember" icon="flame">
                  {streak} séances
                </Badge>
              )}
              <Badge icon="trophy">
                {unlocked}/{badges.length} badges
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-2">
        {[
          { l: "Poids", v: `${profile.weightKg} kg` },
          { l: "Objectif", v: `${profile.targetWeightKg} kg` },
          { l: "Taille", v: `${profile.heightCm} cm` },
          { l: "Séances / sem.", v: profile.daysAvailable },
        ].map((s) => (
          <Card key={s.l} className="p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-chalk-mute">{s.l}</p>
            <p className="num mt-1 font-display text-lg font-bold">{s.v}</p>
          </Card>
        ))}
      </div>

      {/* Récupération */}
      <SectionTitle
        action={
          <button onClick={() => setRecoveryOpen(true)} className="text-[12px] text-ember-400">
            {todayCheck ? "Modifier" : "Faire le point"}
          </button>
        }
      >
        Récupération
      </SectionTitle>
      <Card className="mb-5 p-5">
        {todayCheck ? (
          <>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { l: "Sommeil", v: `${todayCheck.sleepHours} h` },
                { l: "Fatigue", v: todayCheck.fatigue },
                { l: "Motivation", v: `${todayCheck.motivation}/5` },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-display text-[17px] font-bold capitalize">{s.v}</p>
                  <p className="text-[11px] text-chalk-mute">{s.l}</p>
                </div>
              ))}
            </div>
            {todayCheck.soreness.length > 0 && (
              <p className="mt-3 text-[12.5px] text-chalk-mute">
                Courbatures : {todayCheck.soreness.map((m) => muscleName(m)).join(", ")}
              </p>
            )}
            <p className="mt-3 rounded-2xl border border-white/8 bg-white/[.03] px-3.5 py-3 text-[13px] text-chalk-dim">{advice}</p>
          </>
        ) : (
          <p className="text-center text-[13px] text-chalk-mute">
            Un point rapide sur ton sommeil et ta fatigue permet d&apos;ajuster les charges du jour.
          </p>
        )}
      </Card>

      {/* Badges */}
      <SectionTitle>Badges</SectionTitle>
      <div className="mb-5 grid grid-cols-4 gap-2">
        {badges.map((b) => (
          <motion.div key={b.id} whileTap={{ scale: 0.95 }} className={cx("flex flex-col items-center gap-1.5 rounded-2xl border border-white/[.07] bg-white/[.03] p-3", !b.unlocked && "opacity-35")}>
            <span
              className={cx(
                "grid h-10 w-10 place-items-center rounded-xl",
                b.tier === "or" ? "bg-ember-500/15 text-ember-300" : b.tier === "argent" ? "bg-white/10 text-chalk-dim" : "bg-white/[.06] text-chalk-mute"
              )}
            >
              <Icon name={b.unlocked ? b.icon : "lock"} size={17} />
            </span>
            <span className="text-center text-[10px] leading-tight text-chalk-mute">{b.name}</span>
          </motion.div>
        ))}
      </div>

      {/* Préférences */}
      <SectionTitle>Préférences</SectionTitle>
      <Card className="mb-5 divide-y divide-white/[.05] p-0">
        {[
          { l: "Objectif", v: profile.goal === "muscle" ? "Prendre du muscle" : profile.goal === "force" ? "Gagner en force" : "Muscle et force" },
          { l: "Niveau", v: { jamais: "Jamais fait de musculation", debutant: "Débutant", intermediaire: "Intermédiaire", avance: "Avancé" }[profile.level] },
          { l: "Lieu", v: profile.gymType === "salle" ? "Salle de sport" : "Home gym" },
          { l: "Régime", v: profile.diet },
          { l: "Budget", v: `${profile.monthlyFoodBudget} € / mois` },
          { l: "Zones prioritaires", v: profile.priorityMuscles.length ? profile.priorityMuscles.map((m) => muscleName(m)).join(", ") : "Aucune" },
        ].map((r) => (
          <div key={r.l} className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-[13px] text-chalk-mute">{r.l}</span>
            <span className="truncate text-[13px] font-medium capitalize">{r.v}</span>
          </div>
        ))}
      </Card>

      {/* Principes */}
      <SectionTitle>Sur quoi reposent les recommandations</SectionTitle>
      <Card className="mb-5 divide-y divide-white/[.05] p-0">
        {PRINCIPLES.map((p) => (
          <div key={p.id} className="px-4 py-3">
            <p className="text-[13px] font-semibold">{p.label}</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-chalk-mute">{p.note}</p>
          </div>
        ))}
      </Card>

      <InfoNote tone="warn">{SAFETY.notMedical}</InfoNote>

      <div className="mt-5 space-y-2">
        <Button
          variant="outline"
          full
          size="lg"
          icon="refresh"
          onClick={() => {
            const demo = buildDemoData(profile);
            importDemo(demo);
          }}
        >
          Recharger la démonstration
        </Button>
        <Button
          variant="danger"
          full
          size="lg"
          icon="x"
          onClick={() => {
            reset();
            router.push("/onboarding");
          }}
        >
          Réinitialiser toutes mes données
        </Button>
      </div>

      {/* --- Récupération --- */}
      <Sheet open={recoveryOpen} onClose={() => setRecoveryOpen(false)} title="Point récupération">
        <div className="space-y-4 pb-4">
          <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px]">Sommeil cette nuit</span>
              <span className="num font-display text-xl font-bold">{draft.sleepHours} h</span>
            </div>
            <input
              type="range"
              min={3}
              max={12}
              step={0.5}
              value={draft.sleepHours}
              onChange={(e) => setDraft({ ...draft, sleepHours: Number(e.target.value) })}
              className="mt-3 h-1.5 w-full appearance-none rounded-full bg-white/10 accent-[#ff6b2c]"
            />
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Fatigue</p>
            <div className="grid grid-cols-3 gap-2">
              {(["faible", "moyenne", "elevee"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setDraft({ ...draft, fatigue: f })}
                  className={cx(
                    "tap rounded-2xl border py-3 text-[13px] font-semibold capitalize transition active:scale-95",
                    draft.fatigue === f ? "border-ember-500/60 bg-ember-500/[.10] text-ember-300" : "border-white/10 bg-white/[.03] text-chalk-dim"
                  )}
                >
                  {f === "elevee" ? "élevée" : f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Courbatures</p>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.flatMap((g) => g.members).map((m) => (
                <Chip
                  key={m}
                  active={draft.soreness.includes(m)}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      soreness: draft.soreness.includes(m)
                        ? draft.soreness.filter((x) => x !== m)
                        : [...draft.soreness, m as MuscleId],
                    })
                  }
                >
                  {muscleName(m)}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Motivation</p>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setDraft({ ...draft, motivation: n as 1 | 2 | 3 | 4 | 5 })}
                  className={cx(
                    "tap rounded-2xl border py-3 font-display text-lg font-bold transition active:scale-95",
                    draft.motivation === n ? "border-ember-500/60 bg-ember-500/[.10] text-ember-300" : "border-white/10 bg-white/[.03] text-chalk-dim"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <p className="rounded-2xl border border-white/8 bg-white/[.03] px-3.5 py-3 text-[13px] text-chalk-dim">{advice}</p>
          <p className="text-center text-[11.5px] text-chalk-mute">{SAFETY.noDiagnosis}</p>

          <Button
            full
            size="lg"
            icon="check"
            onClick={() => {
              addRecovery({ ...draft, date: today() });
              patchProfile({ sleepHours: draft.sleepHours });
              setRecoveryOpen(false);
            }}
          >
            Enregistrer
          </Button>
        </div>
      </Sheet>

      {/* --- Édition profil --- */}
      <Sheet open={editOpen} onClose={() => setEditOpen(false)} title="Modifier mon profil">
        <div className="space-y-3 pb-4">
          {(
            [
              ["weightKg", "Poids (kg)", 35, 200, 0.5],
              ["targetWeightKg", "Objectif de poids (kg)", 35, 200, 0.5],
              ["heightCm", "Taille (cm)", 130, 220, 1],
              ["daysAvailable", "Séances par semaine", 1, 7, 1],
              ["sessionMinutes", "Minutes par séance", 20, 150, 5],
              ["monthlyFoodBudget", "Budget alimentation (€)", 80, 800, 10],
            ] as const
          ).map(([key, label, min, max, step]) => (
            <div key={key} className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px]">{label}</span>
                <span className="num font-display text-lg font-bold">{profile[key]}</span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={profile[key] as number}
                onChange={(e) => patchProfile({ [key]: Number(e.target.value) })}
                className="mt-3 h-1.5 w-full appearance-none rounded-full bg-white/10 accent-[#ff6b2c]"
              />
            </div>
          ))}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Zones prioritaires</p>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.flatMap((g) => g.members).map((m) => (
                <Chip
                  key={m}
                  active={profile.priorityMuscles.includes(m)}
                  onClick={() =>
                    patchProfile({
                      priorityMuscles: profile.priorityMuscles.includes(m)
                        ? profile.priorityMuscles.filter((x) => x !== m)
                        : [...profile.priorityMuscles, m].slice(0, 3),
                    })
                  }
                >
                  {muscleName(m)}
                </Chip>
              ))}
            </div>
          </div>
          <ProgressBar value={1} tone="ember" />
          <Button full size="lg" icon="check" onClick={() => setEditOpen(false)}>
            Terminé
          </Button>
        </div>
      </Sheet>
    </Page>
  );
}
