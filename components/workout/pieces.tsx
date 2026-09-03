"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Badge, Button, Card, Chip, cx, InfoNote, Sheet } from "@/components/ui/primitives";
import { ProgressRing } from "@/components/ui/progress";
import { ExerciseFigure } from "@/components/exercise/Figure";
import type { Exercise } from "@/lib/types";
import type { LoadRecommendation } from "@/lib/progression";
import { mmss } from "@/lib/format";
import { SAFETY } from "@/lib/copy";

/* ---------------- Sélecteur de charge ---------------- */

export function WeightStepper({
  value,
  onChange,
  increment,
  suffix,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  increment: number;
  suffix?: string;
  disabled?: boolean;
}) {
  const step = increment || 2.5;
  return (
    <div className="flex items-stretch gap-2">
      <button
        type="button"
        disabled={disabled || value <= 0}
        onClick={() => onChange(Math.max(0, Math.round((value - step) * 100) / 100))}
        className="tap grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[.05] text-chalk-dim transition active:scale-95 disabled:opacity-30"
        aria-label={`Retirer ${step} kg`}
      >
        <span className="num text-[13px] font-bold">−{step}</span>
      </button>
      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[.04]">
        <span className="num font-display text-[30px] font-extrabold leading-none">
          {value % 1 === 0 ? value : value.toFixed(1).replace(".", ",")}
          <span className="ml-1 text-sm font-semibold text-chalk-dim">kg</span>
        </span>
        {suffix && <span className="mt-0.5 text-[11px] text-chalk-mute">{suffix}</span>}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(Math.round((value + step) * 100) / 100)}
        className="tap grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[.05] text-chalk-dim transition active:scale-95"
        aria-label={`Ajouter ${step} kg`}
      >
        <span className="num text-[13px] font-bold">+{step}</span>
      </button>
    </div>
  );
}

/* ---------------- Pourquoi cette charge ---------------- */

export function WhyThisLoad({ reco }: { reco: LoadRecommendation }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="tap flex w-full items-center gap-2 rounded-2xl border border-white/8 bg-white/[.03] px-3.5 py-2.5 text-left"
      >
        <Icon name="info" size={15} className="text-ember-400" />
        <span className="flex-1 text-[12.5px] text-chalk-dim">Pourquoi cette charge ?</span>
        <Icon name="right" size={14} className="text-chalk-mute" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={reco.headline}>
        <div className="space-y-2.5 pb-4 pt-1">
          {reco.previousWeight !== null && (
            <div className="flex items-center justify-center gap-4 rounded-2xl border border-white/8 bg-white/[.03] p-4">
              <div className="text-center">
                <p className="text-[11px] text-chalk-mute">Précédent</p>
                <p className="num font-display text-xl font-bold text-chalk-dim">{reco.previousWeight} kg</p>
              </div>
              <Icon name="right" size={18} className="text-ember-400" />
              <div className="text-center">
                <p className="text-[11px] text-chalk-mute">Aujourd&apos;hui</p>
                <p className="num font-display text-xl font-extrabold text-ember-300">{reco.weight} kg</p>
              </div>
            </div>
          )}
          {reco.reasons.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-2.5 rounded-2xl bg-white/[.03] px-3.5 py-3"
            >
              <Icon
                name={r.ok ? "check" : "minus"}
                size={15}
                className={cx("mt-0.5 shrink-0", r.ok ? "text-volt-400" : "text-chalk-mute")}
              />
              <span className="text-[13px] leading-relaxed text-chalk-dim">{r.text}</span>
            </motion.div>
          ))}
          <InfoNote tone="warn">{SAFETY.loadNeverSafe}</InfoNote>
        </div>
      </Sheet>
    </>
  );
}

/* ---------------- Saisie de série ---------------- */

const RIR_OPTIONS = [
  { v: 4, emoji: "😌", label: "Facile", hint: "4+ reps en réserve" },
  { v: 3, emoji: "🙂", label: "Confortable", hint: "3 reps en réserve" },
  { v: 2, emoji: "👍", label: "Bien", hint: "2 reps en réserve" },
  { v: 1, emoji: "🥵", label: "Difficile", hint: "1 rep en réserve" },
  { v: 0, emoji: "💀", label: "Maximum", hint: "Plus rien dans le réservoir" },
];

export function SetLogger({
  target,
  suggested,
  onSubmit,
  onCancel,
}: {
  target: { repMin: number; repMax: number };
  suggested: number;
  onSubmit: (reps: number, rir: number, pain: boolean) => void;
  onCancel: () => void;
}) {
  const [reps, setReps] = useState<number | null>(null);
  const [rir, setRir] = useState<number | null>(null);
  const [pain, setPain] = useState(false);
  const span = target.repMax - target.repMin;
  const step = span > 6 ? 2 : 1;
  const options: number[] = [];
  for (let n = target.repMin - step; n <= target.repMax; n += step) if (n > 0) options.push(n);
  options.push(target.repMax + 1);
  const cols = options.length <= 4 ? options.length : options.length <= 6 ? 3 : 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ type: "spring", stiffness: 340, damping: 32 }}
      className="space-y-4"
    >
      <div>
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">
          Combien de répétitions ?
        </p>
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
          {options.map((n) => (
            <button
              key={n}
              onClick={() => setReps(n)}
              className={cx(
                "tap rounded-2xl border py-4 font-display text-xl font-bold transition-all active:scale-95",
                reps === n
                  ? "border-ember-500/70 bg-ember-500/15 text-ember-300"
                  : n >= target.repMin && n <= target.repMax
                    ? "border-white/12 bg-white/[.05] text-chalk"
                    : "border-white/8 bg-white/[.02] text-chalk-mute"
              )}
            >
              {n === target.repMax + 1 ? `${n}+` : n}
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-[11.5px] text-chalk-mute">
          Objectif : {target.repMin} à {target.repMax} répétitions · suggestion {suggested}
        </p>
      </div>

      <AnimatePresence>
        {reps !== null && (
          <motion.div className="overflow-hidden" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.28 }}>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">
              C&apos;était comment ?
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {RIR_OPTIONS.map((o) => (
                <button
                  key={o.v}
                  onClick={() => setRir(o.v)}
                  className={cx(
                    "tap flex flex-col items-center gap-1 rounded-2xl border px-1 py-3 transition-all active:scale-95",
                    rir === o.v ? "border-ember-500/70 bg-ember-500/15" : "border-white/10 bg-white/[.03]"
                  )}
                >
                  <span className="text-lg leading-none">{o.emoji}</span>
                  <span className={cx("text-[10px] font-semibold", rir === o.v ? "text-ember-300" : "text-chalk-mute")}>
                    {o.label}
                  </span>
                </button>
              ))}
            </div>
            {rir !== null && (
              <p className="mt-2 text-center text-[11.5px] text-chalk-mute">{RIR_OPTIONS.find((o) => o.v === rir)?.hint}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setPain((p) => !p)}
        className={cx(
          "tap flex w-full items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left text-[12.5px] transition",
          pain ? "border-danger/40 bg-danger/10 text-danger" : "border-white/8 bg-white/[.02] text-chalk-mute"
        )}
      >
        <Icon name="alert" size={15} />
        <span className="flex-1">J&apos;ai ressenti une douleur inhabituelle</span>
        {pain && <Icon name="check" size={15} />}
      </button>

      {pain && <InfoNote tone="warn">{SAFETY.sharpPain}</InfoNote>}

      <div className="flex gap-2">
        <Button variant="ghost" size="lg" onClick={onCancel}>
          Annuler
        </Button>
        <Button
          size="lg"
          full
          icon="check"
          disabled={reps === null || rir === null}
          onClick={() => reps !== null && rir !== null && onSubmit(reps, rir, pain)}
        >
          Valider la série
        </Button>
      </div>
    </motion.div>
  );
}

/* ---------------- Chrono de repos ---------------- */

export function RestTimer({
  endsAt,
  total,
  message,
  onSkip,
  onAdd,
  nextLabel,
}: {
  endsAt: number;
  total: number;
  message?: string;
  onSkip: () => void;
  onAdd: (s: number) => void;
  nextLabel?: string;
}) {
  const [remaining, setRemaining] = useState(() => Math.max(0, (endsAt - Date.now()) / 1000));
  const done = useRef(false);

  useEffect(() => {
    done.current = false;
    const id = setInterval(() => {
      const r = Math.max(0, (endsAt - Date.now()) / 1000);
      setRemaining(r);
      if (r <= 0 && !done.current) {
        done.current = true;
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([90, 60, 90]);
      }
    }, 200);
    return () => clearInterval(id);
  }, [endsAt]);

  const progress = total > 0 ? 1 - remaining / total : 1;
  const over = remaining <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="flex flex-col items-center"
    >
      <ProgressRing value={progress} size={210} stroke={12} tone={over ? "volt" : "ember"}>
        <div className="text-center">
          <p className="num font-display text-[52px] font-extrabold leading-none tabular-nums">{mmss(remaining)}</p>
          <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-chalk-mute">{over ? "C'est parti" : "Repos"}</p>
        </div>
      </ProgressRing>

      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-6 max-w-[32ch] text-center text-[14px] leading-relaxed text-chalk-dim"
        >
          {message}
        </motion.p>
      )}
      {nextLabel && <p className="mt-2 text-center text-[12.5px] text-chalk-mute">{nextLabel}</p>}

      <div className="mt-7 flex w-full max-w-sm gap-2">
        <Button variant="outline" size="lg" onClick={() => onAdd(30)} className="flex-1">
          +30 s
        </Button>
        <Button size="lg" onClick={onSkip} className="flex-[2]" iconRight="right">
          {over ? "Série suivante" : "Passer le repos"}
        </Button>
      </div>
    </motion.div>
  );
}

/* ---------------- Substitutions ---------------- */

export function SubstituteSheet({
  open,
  onClose,
  exercise,
  options,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  exercise: Exercise;
  options: Exercise[];
  onPick: (id: string) => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Machine occupée ?">
      <div className="space-y-3 pb-4">
        <p className="text-[13px] text-chalk-dim">
          Ces alternatives gardent le même groupe musculaire et le même schéma de mouvement que{" "}
          <span className="font-semibold text-chalk">{exercise.name}</span>.
        </p>
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => {
              onPick(o.id);
              onClose();
            }}
            className="tap flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-3 text-left transition active:scale-[.98]"
          >
            <div className="h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-white/[.04]">
              <ExerciseFigure media={o.media} className="h-full w-full" showTrail={false} frame={0.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold">{o.name}</p>
              <p className="truncate text-[12px] text-chalk-mute">{o.equipment.join(" · ")}</p>
            </div>
            <Icon name="swap" size={17} className="text-ember-400" />
          </button>
        ))}
      </div>
    </Sheet>
  );
}

/* ---------------- Bandeau d'exercice terminé ---------------- */

export function ExerciseDone({ name, xp, pr }: { name: string; xp: number; pr?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      className="flex flex-col items-center gap-3 py-8 text-center"
    >
      <motion.span
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 16 }}
        className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-volt-400 to-volt-500 text-ink-950"
      >
        <Icon name="check" size={38} strokeWidth={2.6} />
      </motion.span>
      <p className="font-display text-xl font-extrabold">{name} terminé</p>
      <Badge tone="ember" icon="spark">
        +{xp} XP
      </Badge>
      {pr && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="mt-2 px-5 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-ember-300">Record personnel</p>
            <p className="mt-0.5 font-display text-lg font-bold">{pr}</p>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ---------------- En-tête de séance ---------------- */

export function WorkoutHeader({
  title,
  focus,
  progress,
  current,
  total,
  onExit,
}: {
  title: string;
  focus: string;
  progress: number;
  current: number;
  total: number;
  onExit: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 -mx-4 border-b border-white/[.06] bg-ink-950/85 px-4 pb-3 pt-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <button onClick={onExit} className="tap grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 text-chalk-dim" aria-label="Quitter la séance">
          <Icon name="x" size={17} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold uppercase tracking-[0.12em]">
            {title} <span className="text-ember-400">— {focus}</span>
          </p>
        </div>
        <span className="num shrink-0 text-[12px] font-semibold text-chalk-mute">
          {current}/{total}
        </span>
      </div>
      <div className="mx-auto mt-2.5 flex max-w-lg items-center gap-2.5">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[.07]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-ember-400 to-ember-600"
            animate={{ width: `${Math.round(progress * 100)}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <span className="num w-9 text-right text-[11px] font-semibold text-chalk-mute">{Math.round(progress * 100)}%</span>
      </div>
    </header>
  );
}

export { RIR_OPTIONS, Chip };
