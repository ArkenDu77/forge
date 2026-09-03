"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import { ExerciseFigure } from "@/components/exercise/Figure";
import { Icon } from "@/components/ui/Icon";
import { Badge, Button, Card, cx, Sheet, Skeleton } from "@/components/ui/primitives";
import {
  ExerciseDone,
  RestTimer,
  SetLogger,
  SubstituteSheet,
  WeightStepper,
  WhyThisLoad,
  WorkoutHeader,
} from "@/components/workout/pieces";
import { getDay } from "@/lib/data/program";
import { ex, substitutionsFor } from "@/lib/data/exercises";
import { useApp } from "@/lib/store";
import { detectPRs, historyFor, recommendLoad, workingWeight } from "@/lib/progression";
import { postSetLine, preExerciseLine, sessionSummaryLine, volume } from "@/lib/coach";
import { kg, mmss, nf, tons } from "@/lib/format";
import type { WorkoutSession } from "@/lib/types";
import { muscleName } from "@/lib/data/muscles";

export default function WorkoutPage({ params }: PageProps<"/seance/[dayId]">) {
  const { dayId } = use(params);
  const router = useRouter();
  const hydrated = useApp((s) => s.hydrated);
  const profile = useApp((s) => s.profile);
  const sessions = useApp((s) => s.sessions);
  const active = useApp((s) => s.active);
  const { startWorkout, logSet, skipRest, addRest, finishWorkout, abortWorkout, substitute, skipExercise, goToExercise } =
    useApp.getState();

  const [logging, setLogging] = useState(false);
  const [override, setOverride] = useState<{ key: string; value: number } | null>(null);
  const [celebrating, setCelebrating] = useState<{ name: string; xp: number; pr?: string } | null>(null);
  const [summary, setSummary] = useState<WorkoutSession | null>(null);
  const [subOpen, setSubOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [lastLine, setLastLine] = useState<string | undefined>();

  const day = getDay(dayId);

  useEffect(() => {
    if (!hydrated || !day) return;
    if (!active || active.dayId !== dayId) startWorkout(dayId);
  }, [hydrated, active, dayId, day, startWorkout]);

  const plan = day && active ? day.exercises[active.exIndex] : null;
  const exercise = plan ? ex(active!.substitutions[plan.exerciseId] ?? plan.exerciseId) : null;
  const history = useMemo(
    () => (exercise ? historyFor(sessions, exercise.id) : []),
    [sessions, exercise]
  );
  const reco = useMemo(
    () => (exercise && plan && profile ? recommendLoad(exercise, plan, history, profile) : null),
    [exercise, plan, history, profile]
  );

  if (!hydrated || !profile) return <Skeleton className="m-4 h-64" />;
  if (!day) return <div className="p-8 text-center text-chalk-dim">Séance introuvable.</div>;
  if (!active || !plan || !exercise || !reco) return <Skeleton className="m-4 h-64" />;

  // La charge affichée suit la recommandation, sauf ajustement manuel sur cet exercice.
  const weightKey = `${active.exIndex}-${exercise.id}-${active.entries[active.exIndex].sets.length}`;
  const weight = override && override.key === weightKey ? override.value : reco.weight;

  const entry = active.entries[active.exIndex];
  const setsDone = entry.sets.length;
  const totalSets = day.exercises.reduce((a, e) => a + e.sets, 0);
  const doneSets = active.entries.reduce((a, e) => a + e.sets.length, 0);
  const progress = totalSets ? Math.min(1, doneSets / totalSets) : 0;
  const allDone = day.exercises.every((p, i) => active.entries[i].sets.length >= p.sets || active.entries[i].skipped);
  const resting = active.restEndsAt !== null && !celebrating;
  const preLine = preExerciseLine(exercise, plan, history, reco);
  const lastPerf = history[0];

  const handleSubmit = (reps: number, rir: number, pain: boolean) => {
    const isLast = setsDone + 1 >= plan.sets;
    const line = postSetLine(reps, plan, rir, plan.sets - setsDone - 1);
    setLastLine(line.text);
    logSet({ reps, weight, rir, pain });
    setLogging(false);
    if (isLast) {
      const allSets = [
        ...entry.sets,
        { setIndex: setsDone, reps, weight, rir, pain, ts: new Date().toISOString() },
      ];
      const [pr] = detectPRs(exercise.id, allSets, history);
      setCelebrating({
        name: exercise.shortName ?? exercise.name,
        xp: plan.sets * 18 + 40,
        pr: pr
          ? pr.kind === "reps"
            ? `${pr.value} répétitions à ${kg(weight)}`
            : pr.kind === "charge"
              ? `${kg(pr.value)} — nouvelle charge maximale`
              : `${kg(pr.value)} de 1RM estimé`
          : undefined,
      });
      setTimeout(() => setCelebrating(null), pr ? 2800 : 2000);
    }
  };

  const finish = () => {
    const s = finishWorkout();
    if (s) setSummary(s);
    else router.push("/");
  };

  /* ---------------- Résumé de fin ---------------- */
  if (summary) {
    const line = sessionSummaryLine(summary, sessions.filter((x) => x.id !== summary.id));
    return (
      <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-10 pt-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.span
            initial={{ scale: 0, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 15 }}
            className="mx-auto grid h-24 w-24 place-items-center rounded-[28px] bg-gradient-to-br from-ember-400 to-ember-600 text-ink-950"
          >
            <Icon name="check" size={46} strokeWidth={2.6} />
          </motion.span>
          <h1 className="mt-5 font-display text-3xl font-extrabold">Séance terminée</h1>
          <p className="mt-2 text-[14px] text-chalk-dim">{line.text}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-7 grid grid-cols-3 gap-2"
        >
          {[
            { l: "XP gagnés", v: `+${summary.xp}` },
            { l: "Durée", v: `${Math.max(1, Math.round(summary.durationSec / 60))} min` },
            { l: "Volume", v: tons(volume(summary)) },
          ].map((s) => (
            <Card key={s.l} className="p-4 text-center">
              <p className="num font-display text-xl font-extrabold text-gradient-ember">{s.v}</p>
              <p className="mt-0.5 text-[11px] text-chalk-mute">{s.l}</p>
            </Card>
          ))}
        </motion.div>

        {summary.prs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-4 space-y-2">
            {summary.prs.slice(0, 3).map((pr, i) => (
              <Card key={i} className="flex items-center gap-3 p-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-ember-500/15 text-ember-300">
                  <Icon name="trophy" size={19} />
                </span>
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-ember-300">Nouveau record</p>
                  <p className="text-sm font-semibold">{ex(pr.exerciseId).shortName ?? ex(pr.exerciseId).name}</p>
                </div>
                <span className="num font-display text-lg font-bold">
                  {pr.kind === "reps" ? `${pr.value} reps` : kg(pr.value)}
                </span>
              </Card>
            ))}
            {summary.prs.length > 3 && (
              <p className="pt-1 text-center text-[12.5px] text-chalk-mute">
                et {summary.prs.length - 3} autres records sur cette séance.
              </p>
            )}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-4 space-y-2">
          {summary.entries.map((e) => (
            <div key={e.exerciseId} className="flex items-center gap-3 rounded-2xl border border-white/[.06] bg-white/[.02] px-4 py-3">
              <Icon name="check" size={15} className="text-volt-400" />
              <span className="flex-1 truncate text-[13.5px]">{ex(e.exerciseId).shortName ?? ex(e.exerciseId).name}</span>
              <span className="num text-[12px] text-chalk-mute">
                {e.sets.length} × {e.sets.map((s) => s.reps).join("/")} @ {workingWeight(e.sets)} kg
              </span>
            </div>
          ))}
        </motion.div>

        <div className="mt-7 space-y-2">
          <Button size="xl" full href="/" icon="home">
            Retour à l&apos;accueil
          </Button>
          <Button variant="ghost" full href="/progression">
            Voir ma progression
          </Button>
        </div>
      </main>
    );
  }

  /* ---------------- Mode séance ---------------- */
  return (
    <main className="mx-auto min-h-dvh w-full px-4 pb-8">
      <WorkoutHeader
        title={day.name}
        focus={day.focus}
        progress={progress}
        current={active.exIndex + 1}
        total={day.exercises.length}
        onExit={() => setExitOpen(true)}
      />

      <div className="mx-auto max-w-lg">
        <div>
          {celebrating ? (
            <ExerciseDone key="done" {...celebrating} />
          ) : resting ? (
            <motion.div
              key="rest"
              className="pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <RestTimer
                endsAt={active.restEndsAt!}
                total={active.restTotal}
                message={lastLine}
                nextLabel={
                  allDone
                    ? "Dernière série de la séance : il ne reste qu'à valider."
                    : setsDone >= plan.sets
                      ? `Ensuite : ${ex(day.exercises[active.exIndex].exerciseId).name}`
                      : `Série ${setsDone + 1} sur ${plan.sets} · ${exercise.shortName ?? exercise.name}`
                }
                onSkip={skipRest}
                onAdd={addRest}
              />
              {lastPerf && (
                <p className="mt-8 text-center text-[12.5px] text-chalk-mute">
                  Lors de ta dernière séance : {workingWeight(lastPerf.sets)} kg ×{" "}
                  {lastPerf.sets.filter((s) => s.weight === workingWeight(lastPerf.sets)).map((s) => s.reps).join("/")}
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`ex-${active.exIndex}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="pt-4"
            >
              {/* Animation */}
              <div className="relative overflow-hidden rounded-3xl border border-white/[.07] bg-gradient-to-b from-white/[.05] to-transparent">
                <ExerciseFigure media={exercise.media} accent={day.accent} className="aspect-[16/10] w-full" />
                <div className="absolute left-3 top-3 flex gap-1.5">
                  {entry.substitutedFor && <Badge tone="violet" icon="swap">Remplacé</Badge>}
                </div>
                <Link
                  href={`/exercice/${exercise.slug}`}
                  className="tap absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-ink-900/70 text-chalk-dim backdrop-blur"
                  aria-label="Fiche technique"
                >
                  <Icon name="book" size={16} />
                </Link>
              </div>

              <div className="mt-4">
                <h2 className="font-display text-[26px] font-extrabold leading-tight">{exercise.name}</h2>
                <p className="mt-1 text-[13px] text-chalk-mute">{exercise.primary.map((m) => muscleName(m)).join(" · ")}</p>
              </div>

              {/* Séries */}
              <div className="mt-4 flex items-center gap-2">
                {Array.from({ length: plan.sets }).map((_, i) => (
                  <div
                    key={i}
                    className={cx(
                      "flex h-11 flex-1 items-center justify-center rounded-xl border text-[12.5px] font-semibold transition-all",
                      i < setsDone
                        ? "border-volt-500/40 bg-volt-500/12 text-volt-400"
                        : i === setsDone
                          ? "border-ember-500/60 bg-ember-500/12 text-ember-300"
                          : "border-white/8 bg-white/[.02] text-chalk-mute"
                    )}
                  >
                    {i < setsDone ? (
                      <span className="num">
                        {entry.sets[i].reps} × {nf(entry.sets[i].weight, entry.sets[i].weight % 1 === 0 ? 0 : 1)}
                      </span>
                    ) : (
                      `Série ${i + 1}`
                    )}
                  </div>
                ))}
              </div>

              {setsDone > 0 && !logging ? (
                <p className="mt-4 rounded-2xl border border-white/8 bg-white/[.02] px-3.5 py-3 text-[13px] leading-relaxed text-chalk-dim">
                  Série précédente : {entry.sets[setsDone - 1].reps} répétitions à{" "}
                  {kg(entry.sets[setsDone - 1].weight)}
                  {entry.sets[setsDone - 1].rir === 0 ? " — menée jusqu'à la limite." : "."}
                </p>
              ) : preLine && !logging ? (
                <p
                  className={cx(
                    "mt-4 rounded-2xl border px-3.5 py-3 text-[13px] leading-relaxed",
                    preLine.tone === "positif"
                      ? "border-ember-500/25 bg-ember-500/[.07] text-ember-300/90"
                      : preLine.tone === "attention"
                        ? "border-white/10 bg-white/[.03] text-chalk-dim"
                        : "border-white/8 bg-white/[.02] text-chalk-dim"
                  )}
                >
                  {preLine.text}
                </p>
              ) : null}

              <div>
                {logging ? (
                  <motion.div key="logger" className="mt-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                    <SetLogger
                      target={plan}
                      suggested={plan.repMax}
                      onSubmit={handleSubmit}
                      onCancel={() => setLogging(false)}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Card className="p-4">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-chalk-mute">Objectif</p>
                        <p className="num mt-1 font-display text-xl font-extrabold">
                          {plan.repMin}-{plan.repMax}
                          <span className="ml-1 text-xs font-semibold text-chalk-dim">reps</span>
                        </p>
                      </Card>
                      <Card className="p-4">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-chalk-mute">Repos</p>
                        <p className="num mt-1 font-display text-xl font-extrabold">{mmss(plan.restSec)}</p>
                      </Card>
                    </div>

                    {exercise.loadModel !== "bodyweight" && (
                      <>
                        <WeightStepper
                          value={weight}
                          onChange={(v) => setOverride({ key: weightKey, value: v })}
                          increment={exercise.increment}
                          suffix={
                            exercise.loadModel === "dumbbell-pair"
                              ? "par haltère"
                              : exercise.loadModel === "bodyweight-loaded"
                                ? "de lest"
                                : undefined
                          }
                        />
                        <WhyThisLoad reco={reco} />
                      </>
                    )}

                    {setsDone < plan.sets ? (
                      <Button size="xl" full icon="check" onClick={() => setLogging(true)}>
                        Série {setsDone + 1} terminée
                      </Button>
                    ) : allDone ? (
                      <Button size="xl" full icon="trophy" onClick={finish}>
                        Terminer la séance
                      </Button>
                    ) : (
                      <Button
                        size="xl"
                        full
                        iconRight="right"
                        onClick={() => {
                          const next = day.exercises.findIndex(
                            (p, i) => active.entries[i].sets.length < p.sets && !active.entries[i].skipped
                          );
                          if (next >= 0) goToExercise(next);
                        }}
                      >
                        Exercice suivant
                      </Button>
                    )}

                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" icon="swap" onClick={() => setSubOpen(true)} className="flex-1">
                        Machine occupée ?
                      </Button>
                      <Button variant="ghost" size="sm" icon="skip" onClick={skipExercise} className="flex-1">
                        Passer l&apos;exercice
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Sommaire des exercices */}
              <div className="mt-6">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Séance</p>
                <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
                  {day.exercises.map((p, i) => {
                    const e = ex(active.substitutions[p.exerciseId] ?? p.exerciseId);
                    const done = active.entries[i].sets.length >= p.sets;
                    return (
                      <button
                        key={p.exerciseId + i}
                        onClick={() => goToExercise(i)}
                        className={cx(
                          "tap w-[124px] shrink-0 rounded-2xl border p-2.5 text-left transition",
                          i === active.exIndex
                            ? "border-ember-500/50 bg-ember-500/[.08]"
                            : done
                              ? "border-volt-500/25 bg-volt-500/[.05]"
                              : "border-white/8 bg-white/[.02]"
                        )}
                      >
                        <div className="h-12 w-full overflow-hidden rounded-lg">
                          <ExerciseFigure media={e.media} className="h-full w-full" showTrail={false} frame={0.5} accent={done ? "volt" : "ember"} />
                        </div>
                        <p className="mt-1.5 truncate text-[11.5px] font-medium">{e.shortName ?? e.name}</p>
                        <p className="num text-[10.5px] text-chalk-mute">
                          {active.entries[i].sets.length}/{p.sets} séries
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {allDone && setsDone < plan.sets && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                  <Button size="xl" full icon="trophy" onClick={finish}>
                    Terminer la séance
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <SubstituteSheet
        open={subOpen}
        onClose={() => setSubOpen(false)}
        exercise={exercise}
        options={substitutionsFor(plan.exerciseId)}
        onPick={(id) => substitute(plan.exerciseId, id)}
      />

      <Sheet open={exitOpen} onClose={() => setExitOpen(false)} title="Quitter la séance ?">
        <div className="space-y-2 pb-4">
          <p className="text-[13px] text-chalk-dim">
            {doneSets > 0
              ? `Tu as déjà validé ${doneSets} série${doneSets > 1 ? "s" : ""}. Tu peux enregistrer la séance telle quelle.`
              : "Aucune série enregistrée pour le moment."}
          </p>
          {doneSets > 0 && (
            <Button size="lg" full icon="check" onClick={() => { setExitOpen(false); finish(); }}>
              Enregistrer et terminer
            </Button>
          )}
          <Button size="lg" full variant="outline" onClick={() => { setExitOpen(false); router.push("/"); }}>
            Reprendre plus tard
          </Button>
          <Button size="lg" full variant="danger" onClick={() => { abortWorkout(); router.push("/"); }}>
            Abandonner la séance
          </Button>
        </div>
      </Sheet>
    </main>
  );
}

