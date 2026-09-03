"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Page, TopBar } from "@/components/AppShell";
import { ExerciseFigure } from "@/components/exercise/Figure";
import { Icon } from "@/components/ui/Icon";
import { Card, Chip, cx, InfoNote, SectionTitle, Segmented, Sheet } from "@/components/ui/primitives";
import { ProgressBar } from "@/components/ui/progress";
import { EXERCISES, ex } from "@/lib/data/exercises";
import { useApp } from "@/lib/store";
import { adjustFromFeedback, estimate1RM, estimateStartingLoad, loadForReps, strengthLevel, type Feedback } from "@/lib/estimator";
import { SAFETY } from "@/lib/copy";
import { kg } from "@/lib/format";
import type { Level } from "@/lib/types";

const MAIN = ["bench-press", "squat", "rdl", "overhead-press", "lat-pulldown", "leg-press", "incline-db-press", "hip-thrust"];

export default function SimulateurPage() {
  const profile = useApp((s) => s.profile)!;
  const [exerciseId, setExerciseId] = useState("bench-press");
  const [mode, setMode] = useState<"depart" | "1rm">("depart");
  const [level, setLevel] = useState<Level>(profile.level);
  const [experienced, setExperienced] = useState(false);
  const [knownWeight, setKnownWeight] = useState(40);
  const [knownReps, setKnownReps] = useState(8);
  const [knownRir, setKnownRir] = useState(2);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const exercise = ex(exerciseId);
  const base = useMemo(
    () => estimateStartingLoad(exercise, { ...profile, level }),
    [exercise, profile, level]
  );

  const oneRm = estimate1RM(knownWeight, knownReps, knownRir);
  const level5 = strengthLevel(exerciseId, oneRm, profile.weightKg, profile.sex);
  const adjusted = feedback ? adjustFromFeedback(base.weight, feedback, exercise.increment) : null;
  const recommended = experienced ? Math.round(loadForReps(oneRm, 8) / exercise.increment) * exercise.increment : base.weight;

  return (
    <Page>
      <TopBar title="Simulateur" subtitle="Estimer un point de départ prudent" back="/programme" />

      <button
        onClick={() => setPickerOpen(true)}
        className="tap mb-4 flex w-full items-center gap-3 rounded-3xl border border-white/10 bg-white/[.03] p-3 text-left"
      >
        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/[.03]">
          <ExerciseFigure media={exercise.media} className="h-full w-full" showTrail={false} frame={0.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wider text-chalk-mute">Exercice</p>
          <p className="truncate font-display text-[17px] font-bold">{exercise.name}</p>
        </div>
        <Icon name="down" size={17} className="text-chalk-mute" />
      </button>

      <Segmented
        className="mb-4"
        value={mode}
        onChange={setMode}
        options={[
          { value: "depart", label: "Charge de départ" },
          { value: "1rm", label: "1RM estimé" },
        ]}
      />

      {mode === "depart" ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-4 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Ton niveau sur cet exercice</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(
                [
                  ["jamais", "Jamais fait"],
                  ["debutant", "Débutant"],
                  ["intermediaire", "Intermédiaire"],
                  ["avance", "Avancé"],
                ] as [Level, string][]
              ).map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setLevel(v)}
                  className={cx(
                    "tap rounded-2xl border py-3 text-[13px] font-semibold transition active:scale-95",
                    level === v ? "border-ember-500/60 bg-ember-500/[.10] text-ember-300" : "border-white/10 bg-white/[.03] text-chalk-dim"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
            <button
              onClick={() => setExperienced((e) => !e)}
              className={cx(
                "tap mt-3 flex w-full items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left text-[13px]",
                experienced ? "border-ember-500/40 bg-ember-500/[.08] text-ember-300" : "border-white/8 bg-white/[.02] text-chalk-dim"
              )}
            >
              <Icon name={experienced ? "check" : "plus"} size={15} />
              J&apos;ai déjà une performance connue sur cet exercice
            </button>
          </Card>

          {experienced && (
            <Card className="mb-4 space-y-4 p-5">
              <Slider label="Dernière charge" value={knownWeight} onChange={setKnownWeight} min={0} max={220} step={exercise.increment} unit="kg" />
              <Slider label="Répétitions réalisées" value={knownReps} onChange={setKnownReps} min={1} max={20} step={1} unit="reps" />
              <Slider label="Répétitions en réserve" value={knownRir} onChange={setKnownRir} min={0} max={5} step={1} unit="RIR" />
            </Card>
          )}

          <Card className="mb-4 overflow-hidden p-0">
            <div className="bg-gradient-to-br from-ember-500/15 to-transparent p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ember-300">{SAFETY.estimateLabel}</p>
              <p className="mt-2 font-display text-[40px] font-extrabold leading-none">
                {adjusted ? adjusted.weight : recommended}
                <span className="ml-1.5 text-lg font-semibold text-chalk-dim">kg</span>
              </p>
              <p className="mt-1.5 text-[13.5px] text-chalk-dim">
                {base.bodyweightOnly ? base.display : `Pour une série de 8 répétitions confortables`}
              </p>
            </div>
            <div className="space-y-2 p-5">
              {base.notes.map((n) => (
                <p key={n} className="flex gap-2 text-[12.5px] text-chalk-mute">
                  <Icon name="info" size={14} className="mt-0.5 shrink-0" />
                  {n}
                </p>
              ))}
              {adjusted && (
                <p className="rounded-2xl border border-ember-500/25 bg-ember-500/[.07] px-3.5 py-3 text-[13px] text-ember-300/90">
                  {adjusted.message}
                </p>
              )}
            </div>
          </Card>

          <SectionTitle>Après ta première série d&apos;essai</SectionTitle>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {(
              [
                ["trop-facile", "Trop facile", "arrowUp"],
                ["correcte", "Correcte", "check"],
                ["trop-lourde", "Trop lourde", "arrowDown"],
                ["douleur", "Douleur", "alert"],
              ] as [Feedback, string, string][]
            ).map(([v, l, i]) => (
              <button
                key={v}
                onClick={() => setFeedback(v)}
                className={cx(
                  "tap flex items-center gap-2.5 rounded-2xl border px-4 py-3.5 text-[13.5px] font-semibold transition active:scale-95",
                  feedback === v
                    ? v === "douleur"
                      ? "border-danger/50 bg-danger/10 text-danger"
                      : "border-ember-500/60 bg-ember-500/[.10] text-ember-300"
                    : "border-white/10 bg-white/[.03] text-chalk-dim"
                )}
              >
                <Icon name={i} size={16} />
                {l}
              </button>
            ))}
          </div>

          <InfoNote tone="warn">{SAFETY.estimateDisclaimer}</InfoNote>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-4 space-y-4 p-5">
            <Slider label="Charge soulevée" value={knownWeight} onChange={setKnownWeight} min={0} max={250} step={exercise.increment} unit="kg" />
            <Slider label="Répétitions" value={knownReps} onChange={setKnownReps} min={1} max={15} step={1} unit="reps" />
            <Slider label="Répétitions en réserve" value={knownRir} onChange={setKnownRir} min={0} max={5} step={1} unit="RIR" />
          </Card>

          <Card className="mb-4 p-5 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">1RM estimé</p>
            <p className="mt-2 font-display text-[44px] font-extrabold leading-none text-gradient-ember">
              {Math.round(oneRm)}
              <span className="ml-1.5 text-lg font-semibold text-chalk-dim">kg</span>
            </p>
            <p className="mt-2 text-[12.5px] text-chalk-mute">
              Formule d&apos;Epley — fiable jusqu&apos;à environ 10 répétitions. Ce n&apos;est pas une valeur à tester
              systématiquement.
            </p>
          </Card>

          <Card className="mb-4 p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-chalk-mute">Niveau de force</p>
              <span className="text-[13px] font-bold text-ember-300">{level5.label}</span>
            </div>
            <ProgressBar value={(level5.index + level5.progress) / 5} className="mt-2.5" />
            <div className="mt-2 flex justify-between text-[10.5px] text-chalk-mute">
              {["Débutant", "Novice", "Intermédiaire", "Confirmé", "Avancé"].map((l) => (
                <span key={l}>{l.slice(0, 4)}</span>
              ))}
            </div>
            <p className="mt-3 text-[12.5px] text-chalk-mute">
              {level5.ratio.toFixed(2).replace(".", ",")} × ton poids de corps ({profile.weightKg} kg).
            </p>
          </Card>

          <SectionTitle>Charges de travail correspondantes</SectionTitle>
          <Card className="divide-y divide-white/[.05] p-0">
            {[3, 5, 8, 10, 12, 15].map((r) => (
              <div key={r} className="flex items-center justify-between px-4 py-3">
                <span className="num text-[13px] text-chalk-dim">{r} répétitions</span>
                <span className="num text-[14px] font-semibold">
                  {kg(Math.round(loadForReps(oneRm, r) / exercise.increment) * exercise.increment)}
                </span>
              </div>
            ))}
          </Card>
          <div className="mt-4">
            <InfoNote tone="warn">{SAFETY.loadNeverSafe}</InfoNote>
          </div>
        </motion.div>
      )}

      <Sheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Choisir un exercice">
        <div className="pb-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {MAIN.map((id) => (
              <Chip
                key={id}
                active={exerciseId === id}
                onClick={() => {
                  setExerciseId(id);
                  setPickerOpen(false);
                }}
              >
                {ex(id).shortName ?? ex(id).name}
              </Chip>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {EXERCISES.filter((e) => e.loadModel !== "bodyweight").map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  setExerciseId(e.id);
                  setPickerOpen(false);
                }}
                className={cx(
                  "tap rounded-2xl border p-2.5 text-left",
                  exerciseId === e.id ? "border-ember-500/50 bg-ember-500/[.08]" : "border-white/8 bg-white/[.02]"
                )}
              >
                <div className="h-14 w-full overflow-hidden rounded-xl">
                  <ExerciseFigure media={e.media} className="h-full w-full" showTrail={false} frame={0.5} />
                </div>
                <p className="mt-1.5 truncate text-[12px] font-medium">{e.shortName ?? e.name}</p>
              </button>
            ))}
          </div>
        </div>
      </Sheet>
    </Page>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[12.5px] text-chalk-dim">{label}</span>
        <span className="num font-display text-lg font-bold">
          {value}
          <span className="ml-1 text-[11px] font-medium text-chalk-mute">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1.5 w-full appearance-none rounded-full bg-white/10 accent-[#ff6b2c]"
        aria-label={label}
      />
    </div>
  );
}
