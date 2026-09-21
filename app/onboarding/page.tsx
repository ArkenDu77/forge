"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, cx } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/progress";
import { ExerciseMedia } from "@/components/exercise/ExerciseMedia";
import { ex } from "@/lib/data/exercises";
import { useApp } from "@/lib/store";
import { computeTargets } from "@/lib/nutrition";
import { ALL_DAYS, WEEKDAY_LABELS } from "@/lib/data/program";
import { SAFETY } from "@/lib/copy";
import type { Goal, Profile } from "@/lib/types";

type Draft = Omit<Profile, "createdAt">;

const DEFAULTS: Draft = {
  firstName: "",
  age: 24,
  sex: "h",
  heightCm: 178,
  weightKg: 62.5,
  level: "jamais",
  currentFrequency: 0,
  daysAvailable: 4,
  goal: "muscle-force",
  priorityMuscles: ["deltoide-lat", "pectoraux", "dorsaux"],
  gymType: "salle",
  equipment: ["barre", "halteres", "machine", "poulie", "banc", "barre-traction", "poids-du-corps"],
  sessionMinutes: 90,
  diet: "omnivore",
  dislikedFoods: [],
  allergies: [],
  monthlyFoodBudget: 280,
  budgetTier: "standard",
  targetWeightKg: 69,
  sleepHours: 7.5,
  dailyActivity: "leger",
  startPullUps: 1,
  startPushUps: 8,
};

function Stepper({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  decimals = 0,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
  decimals?: number;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[.03] p-5">
      <p className="text-[13px] font-medium">{label}</p>
      {hint && <p className="mt-0.5 text-[12px] text-chalk-mute">{hint}</p>}
      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, Math.round((value - step) * 10) / 10))}
          className="tap grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[.05] active:scale-95"
          aria-label={`Diminuer ${label}`}
        >
          <Icon name="minus" size={20} />
        </button>
        <div className="flex-1 text-center">
          <span className="num font-display text-4xl font-extrabold">{value.toFixed(decimals).replace(".", ",")}</span>
          <span className="ml-1 text-base font-semibold text-chalk-dim">{unit}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, Math.round((value + step) * 10) / 10))}
          className="tap grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[.05] active:scale-95"
          aria-label={`Augmenter ${label}`}
        >
          <Icon name="plus" size={20} />
        </button>
      </div>
    </div>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const setProfile = useApp((s) => s.setProfile);
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(DEFAULTS);
  const patch = (p: Partial<Draft>) => setD((prev) => ({ ...prev, ...p }));

  const targets = computeTargets({ ...d, createdAt: new Date().toISOString() });

  const steps: { title: string; sub?: string; body: React.ReactNode; valid?: boolean }[] = [
    {
      title: "Bienvenue",
      sub: "Cinq écrans, et on commence.",
      valid: d.firstName.trim().length > 0,
      body: (
        <div className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/[.03] p-5">
            <label htmlFor="fn" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">
              Comment tu t&apos;appelles ?
            </label>
            <input
              id="fn"
              autoFocus
              value={d.firstName}
              onChange={(e) => patch({ firstName: e.target.value })}
              placeholder="Ton prénom"
              className="mt-2 w-full bg-transparent font-display text-3xl font-extrabold outline-none placeholder:text-chalk-mute/40"
            />
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/8 bg-white/[.02]">
            <ExerciseMedia exercise={ex("bench-press")} className="aspect-[16/9] w-full" priority />
          </div>
        </div>
      ),
    },
    {
      title: "Ton objectif",
      sub: "Ça oriente le programme et la nutrition.",
      body: (
        <div className="space-y-2.5">
          {(
            [
              { v: "muscle", t: "Devenir plus musclé", d: "Des épaules larges, des bras et des pecs plus épais.", i: "dumbbell" },
              { v: "muscle-force", t: "Musclé et fort", d: "Les deux à la fois. C'est ce qui marche le mieux quand on débute.", i: "bolt" },
              { v: "force", t: "Devenir plus fort", d: "Porter lourd, sans forcément chercher le volume.", i: "weight" },
            ] as { v: Goal; t: string; d: string; i: string }[]
          ).map((o) => (
            <button
              key={o.v}
              onClick={() => patch({ goal: o.v })}
              className={cx(
                "tap w-full rounded-2xl border p-4 text-left transition-all active:scale-[.98]",
                d.goal === o.v ? "border-ember-500/60 bg-ember-500/[.09]" : "border-white/10 bg-white/[.03]"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cx(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                    d.goal === o.v ? "bg-ember-500/20 text-ember-300" : "bg-white/[.05] text-chalk-mute"
                  )}
                >
                  <Icon name={o.i} size={19} />
                </span>
                <div className="flex-1">
                  <p className="text-[15px] font-semibold">{o.t}</p>
                  <p className="mt-0.5 text-[12.5px] leading-snug text-chalk-mute">{o.d}</p>
                </div>
                {d.goal === o.v && <Icon name="check" size={18} className="text-ember-400" />}
              </div>
            </button>
          ))}
          <div className="pt-3">
            <Stepper
              label="Le poids que tu veux atteindre"
              hint="On vise environ 250 g par semaine, pas plus."
              value={d.targetWeightKg}
              onChange={(v) => patch({ targetWeightKg: v })}
              min={45}
              max={120}
              step={0.5}
              decimals={1}
              unit="kg"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Ton point de départ",
      sub: "On mesurera le chemin parcouru à partir de là.",
      body: (
        <div className="space-y-3">
          <Stepper label="Ton poids aujourd'hui" value={d.weightKg} onChange={(v) => patch({ weightKg: v })} min={40} max={160} step={0.5} decimals={1} unit="kg" />
          <Stepper label="Ta taille" value={d.heightCm} onChange={(v) => patch({ heightCm: v })} min={140} max={215} unit="cm" />
          <Stepper label="Ton âge" value={d.age} onChange={(v) => patch({ age: v })} min={14} max={85} unit="ans" />
          <Stepper
            label="Tractions d'affilée"
            hint="Zéro est une réponse parfaitement normale."
            value={d.startPullUps}
            onChange={(v) => patch({ startPullUps: v })}
            min={0}
            max={30}
            unit=""
          />
          <Stepper label="Pompes d'affilée" value={d.startPushUps} onChange={(v) => patch({ startPushUps: v })} min={0} max={100} unit="" />
        </div>
      ),
    },
    {
      title: "Ce que je ferai pour toi",
      sub: "À chaque séance, tu n'auras rien à décider.",
      body: (
        <div className="space-y-2.5">
          {[
            { i: "search", t: "Où aller", d: "Je te montre à quoi ressemble la machine et comment la reconnaître." },
            { i: "eye", t: "Comment faire", d: "Le mouvement animé, puis expliqué étape par étape." },
            { i: "weight", t: "Quel poids essayer", d: "Calculé à partir de ce que tu as réussi la fois d'avant." },
            { i: "clock", t: "Combien de temps te reposer", d: "Le chrono démarre tout seul après chaque série." },
            { i: "arrowUp", t: "Quand augmenter", d: "Je te le dis quand tu maîtrises le poids actuel." },
            { i: "nutrition", t: "Quoi manger", d: "Des repas précis, avec les quantités et la préparation." },
          ].map((x, i) => (
            <motion.div
              key={x.t}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3 rounded-2xl border border-white/[.07] bg-white/[.03] px-4 py-3"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ember-500/12 text-ember-300">
                <Icon name={x.i} size={17} />
              </span>
              <div>
                <p className="text-[14px] font-semibold">{x.t}</p>
                <p className="mt-0.5 text-[12.5px] leading-snug text-chalk-mute">{x.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      title: "Tu n'as pas besoin de connaître la musculation",
      sub: "C'est mon travail, pas le tien.",
      body: (
        <div className="space-y-4">
          <Card className="overflow-hidden p-0">
            <div className="bg-gradient-to-br from-ember-500/20 via-transparent to-violet-glow/10 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ember-300">Ta semaine</p>
              <p className="mt-1 font-display text-2xl font-extrabold">4 séances, 3 jours de repos</p>
            </div>
            <div className="divide-y divide-white/[.06] border-t border-white/[.06]">
              {ALL_DAYS.map((day) => (
                <div key={day.id} className="flex items-center gap-3 p-3.5">
                  <span className="w-16 text-[12px] font-semibold text-chalk-mute">{WEEKDAY_LABELS[day.weekday]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">{day.name}</p>
                    <p className="text-[12px] text-ember-300/80">{day.focus}</p>
                  </div>
                  <span className="num text-[12px] text-chalk-mute">{day.estimatedMin} min</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Côté nourriture</p>
            <p className="mt-2 text-[15px] leading-relaxed">
              Environ <span className="font-bold text-chalk">{targets.kcal} kcal</span> et{" "}
              <span className="font-bold text-chalk">{targets.prot} g de protéines</span> par jour, répartis en quatre
              repas précis.
            </p>
          </Card>

          <p className="px-1 text-[12.5px] leading-relaxed text-chalk-mute">{SAFETY.estimateDisclaimer}</p>
        </div>
      ),
    },
  ];

  const last = step === steps.length - 1;
  const current = steps[step];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-6 pt-4">
      <div className="mb-6 flex items-center gap-3">
        {step > 0 ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="tap grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 text-chalk-dim"
            aria-label="Retour"
          >
            <Icon name="left" size={17} />
          </button>
        ) : (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-ember-400 to-ember-600 text-ink-950">
            <Icon name="bolt" size={17} strokeWidth={2.4} />
          </span>
        )}
        <ProgressBar value={(step + 1) / steps.length} height={6} className="flex-1" />
        <span className="num w-10 text-right text-xs text-chalk-mute">
          {step + 1}/{steps.length}
        </span>
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 22 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1"
      >
        <h1 className="font-display text-[30px] font-extrabold leading-[1.1]">{current.title}</h1>
        {current.sub && <p className="mt-1.5 text-sm text-chalk-dim">{current.sub}</p>}
        <div className="mt-6">{current.body}</div>
      </motion.div>

      <div className="sticky bottom-0 -mx-4 mt-8 bg-gradient-to-t from-ink-950 via-ink-950/95 to-transparent px-4 pb-[calc(8px+var(--safe-b))] pt-4">
        <Button
          size="xl"
          full
          icon={last ? "play" : undefined}
          iconRight={last ? undefined : "right"}
          disabled={current.valid === false}
          onClick={() => {
            if (!last) return setStep((s) => s + 1);
            setProfile({ ...d, createdAt: new Date().toISOString() });
            router.push("/");
          }}
        >
          {last ? "Commencer" : "Continuer"}
        </Button>
      </div>
    </div>
  );
}
