"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { Page, TopBar } from "@/components/AppShell";
import { ExerciseFigure } from "@/components/exercise/Figure";
import { MuscleMap } from "@/components/exercise/MuscleMap";
import { Icon } from "@/components/ui/Icon";
import { Accordion, Badge, Button, Card, Chip, cx, InfoNote, SectionTitle, Sheet } from "@/components/ui/primitives";
import { ProgressBar } from "@/components/ui/progress";
import { getExerciseBySlug, substitutionsFor } from "@/lib/data/exercises";
import { ALL_DAYS } from "@/lib/data/program";
import { muscleName } from "@/lib/data/muscles";
import { useApp } from "@/lib/store";
import { historyFor, recommendLoad, workingWeight } from "@/lib/progression";
import { estimate1RM, strengthLevel } from "@/lib/estimator";
import { SAFETY, principle } from "@/lib/copy";
import { kg, mmss, relativeDay } from "@/lib/format";

export default function ExercisePage({ params }: PageProps<"/exercice/[slug]">) {
  const { slug } = use(params);
  const exercise = getExerciseBySlug(slug);
  const profile = useApp((s) => s.profile);
  const sessions = useApp((s) => s.sessions);
  const seen = useApp((s) => s.seenExercises);
  const markSeen = useApp((s) => s.markSeen);
  const [playing, setPlaying] = useState(true);
  const [firstTimeOpen, setFirstTimeOpen] = useState(false);

  if (!exercise) notFound();

  const plan =
    ALL_DAYS.flatMap((d) => d.exercises).find((p) => p.exerciseId === exercise.id) ??
    { sets: 3, repMin: 8, repMax: 12, restSec: 120, targetRir: 1, exerciseId: exercise.id, kind: "hypertrophie" as const };
  const history = historyFor(sessions, exercise.id);
  const reco = profile ? recommendLoad(exercise, plan, history, profile) : null;
  const best = history.flatMap((h) => h.sets).reduce((b, s) => Math.max(b, estimate1RM(s.weight, s.reps)), 0);
  const level = profile && best > 0 ? strengthLevel(exercise.id, best, profile.weightKg, profile.sex) : null;
  const isNew = !seen.includes(exercise.id) && history.length === 0;

  return (
    <Page>
      <TopBar title={exercise.name} subtitle={exercise.equipment.join(" · ")} back="" />

      {/* Animation */}
      <Card className="mb-3 overflow-hidden p-0">
        <div className="relative">
          <ExerciseFigure media={exercise.media} playing={playing} className="aspect-[16/11] w-full" />
          <button
            onClick={() => setPlaying((p) => !p)}
            className="tap absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-ink-900/70 text-chalk-dim backdrop-blur"
            aria-label={playing ? "Mettre en pause" : "Lancer l'animation"}
          >
            <Icon name={playing ? "pause" : "play"} size={17} />
          </button>
        </div>
        <div className="grid grid-cols-3 divide-x divide-white/[.06] border-t border-white/[.06]">
          {[
            { label: exercise.media.captions?.[0] ?? "Départ", frame: 0 },
            { label: "Milieu", frame: 0.5 },
            { label: exercise.media.captions?.[1] ?? "Fin", frame: 1 },
          ].map((f) => (
            <div key={f.label} className="p-2">
              <ExerciseFigure media={exercise.media} frame={f.frame} showTrail={false} className="aspect-[4/3] w-full" accent="cyan" />
              <p className="truncate text-center text-[10px] uppercase tracking-wider text-chalk-mute">{f.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Muscles */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {exercise.primary.map((m) => (
          <Badge key={m} tone="ember">
            {muscleName(m)}
          </Badge>
        ))}
        {exercise.secondary.map((m) => (
          <Badge key={m}>{muscleName(m)}</Badge>
        ))}
      </div>

      {/* Chiffres clés */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        <Card className="p-4">
          <p className="text-[10.5px] uppercase tracking-[0.14em] text-chalk-mute">Séries</p>
          <p className="num mt-1 font-display text-xl font-extrabold">
            {plan.sets} × {plan.repMin}-{plan.repMax}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[10.5px] uppercase tracking-[0.14em] text-chalk-mute">Charge du jour</p>
          <p className="num mt-1 font-display text-xl font-extrabold text-gradient-ember">
            {reco ? reco.display : "—"}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[10.5px] uppercase tracking-[0.14em] text-chalk-mute">Repos</p>
          <p className="num mt-1 font-display text-xl font-extrabold">{mmss(plan.restSec)}</p>
        </Card>
      </div>

      {isNew && (
        <button
          onClick={() => {
            setFirstTimeOpen(true);
            markSeen(exercise.id);
          }}
          className="tap mb-3 flex w-full items-center gap-3 rounded-2xl border border-ember-500/30 bg-ember-500/[.08] px-4 py-3.5 text-left"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ember-500/20 text-ember-300">
            <Icon name="spark" size={17} />
          </span>
          <span className="flex-1 text-[13.5px] font-semibold text-ember-300">
            Première fois que je fais cet exercice
          </span>
          <Icon name="right" size={16} className="text-ember-400" />
        </button>
      )}

      {/* Comment faire */}
      <section className="mb-4">
        <SectionTitle>Comment faire</SectionTitle>
        <Card className="p-5">
          <ol className="space-y-3">
            {[...exercise.setup, ...exercise.execution].slice(0, 6).map((s, i) => (
              <motion.li
                key={s}
                initial={{ opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="flex gap-3"
              >
                <span className="num grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-ember-500/15 text-[12px] font-bold text-ember-300">
                  {i + 1}
                </span>
                <span className="text-[14px] leading-relaxed text-chalk-dim">{s}</span>
              </motion.li>
            ))}
          </ol>
        </Card>
      </section>

      {/* À éviter */}
      <section className="mb-4">
        <SectionTitle>À éviter</SectionTitle>
        <Card className="space-y-2 p-5">
          {exercise.mistakes.map((m) => (
            <div key={m} className="flex items-center gap-2.5">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-danger/15 text-danger">
                <Icon name="x" size={12} strokeWidth={2.6} />
              </span>
              <span className="text-[13.5px] text-chalk-dim">{m}</span>
            </div>
          ))}
        </Card>
      </section>

      {/* Sensation */}
      <Card className="mb-4 flex items-start gap-3 p-4">
        <div className="h-24 w-14 shrink-0">
          <MuscleMap primary={exercise.primary} secondary={exercise.secondary} side={exercise.primary.some((m) => ["dorsaux", "trapezes", "ischios", "fessiers", "triceps"].includes(m)) ? "back" : "front"} />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-chalk-mute">Tu dois sentir</p>
          <p className="mt-1 font-display text-[17px] font-bold">{exercise.feel}</p>
          <p className="mt-2 text-[12px] leading-relaxed text-chalk-mute">{SAFETY.sharpPain}</p>
        </div>
      </Card>

      {/* Technique */}
      <section className="mb-4">
        <SectionTitle>Technique</SectionTitle>
        <div className="space-y-2">
          <Accordion title="Placement et amplitude" icon="target" defaultOpen>
            <dl className="space-y-2.5">
              {[
                ["Amplitude", exercise.rom],
                ["Mains", exercise.handPlacement],
                ["Pieds", exercise.footPlacement],
                ["Dos", exercise.backPosition],
                ["Réglage machine", exercise.machineSetup],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k as string}>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-chalk-mute">{k}</dt>
                    <dd className="text-[13.5px] leading-relaxed text-chalk-dim">{v}</dd>
                  </div>
                ))}
            </dl>
          </Accordion>
          <Accordion title="Respiration et tempo" icon="clock">
            <p className="text-[13.5px] leading-relaxed">{exercise.breathing}</p>
            <p className="mt-2 text-[13.5px] leading-relaxed">Tempo recommandé : {exercise.tempo}</p>
          </Accordion>
          {exercise.tips.length > 0 && (
            <Accordion title="Conseils" icon="spark">
              <ul className="space-y-2">
                {exercise.tips.map((t) => (
                  <li key={t} className="flex gap-2.5 text-[13.5px] leading-relaxed">
                    <Icon name="check" size={14} className="mt-1 shrink-0 text-volt-400" />
                    {t}
                  </li>
                ))}
              </ul>
            </Accordion>
          )}
          {exercise.needsSpotter && (
            <Accordion title="Sécurité" icon="alert" tone="danger">
              <p className="text-[13.5px] leading-relaxed">{SAFETY.spotter}</p>
              <p className="mt-2 text-[13.5px] leading-relaxed">{SAFETY.learnWithSomeone}</p>
            </Accordion>
          )}
          {exercise.sources?.map((s) => (
            <Accordion key={s.label} title={s.label} icon="book">
              <p className="text-[13.5px] leading-relaxed">{s.note}</p>
            </Accordion>
          ))}
          <Accordion title="Principe appliqué" icon="info">
            <p className="text-[13.5px] leading-relaxed">{principle("surcharge")?.note}</p>
          </Accordion>
        </div>
      </section>

      {/* Niveau de force */}
      {level && profile && (
        <Card className="mb-4 p-5">
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-chalk-mute">Force actuelle</p>
            <span className="text-[13px] font-bold text-ember-300">{level.label}</span>
          </div>
          <ProgressBar value={(level.index + level.progress) / 5} className="mt-2.5" tone="ember" />
          <p className="mt-2 text-[12px] text-chalk-mute">
            1RM estimé {kg(Math.round(best))} · {level.ratio.toFixed(2).replace(".", ",")} × ton poids de corps
          </p>
        </Card>
      )}

      {/* Historique */}
      {history.length > 0 && (
        <section className="mb-4">
          <SectionTitle
            action={
              <Link href={`/progression/${exercise.id}`} className="text-[12px] text-chalk-mute">
                Tout voir
              </Link>
            }
          >
            Historique
          </SectionTitle>
          <Card className="divide-y divide-white/[.05] p-0">
            {history.slice(0, 3).map((h) => (
              <div key={h.date} className="flex items-center justify-between px-4 py-3">
                <span className="text-[13px] text-chalk-dim">{relativeDay(h.date.slice(0, 10))}</span>
                <span className="num text-[13px] font-semibold">
                  {workingWeight(h.sets)} kg × {h.sets.map((s) => s.reps).join("/")}
                </span>
              </div>
            ))}
          </Card>
        </section>
      )}

      {/* Substitutions */}
      <section className="mb-2">
        <SectionTitle>Alternatives</SectionTitle>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {substitutionsFor(exercise.id).map((s) => (
            <Link
              key={s.id}
              href={`/exercice/${s.slug}`}
              className="tap w-[136px] shrink-0 rounded-2xl border border-white/8 bg-white/[.03] p-2.5"
            >
              <div className="h-16 w-full overflow-hidden rounded-xl bg-white/[.03]">
                <ExerciseFigure media={s.media} className="h-full w-full" showTrail={false} frame={0.5} accent="violet" />
              </div>
              <p className="mt-1.5 truncate text-[12px] font-medium">{s.shortName ?? s.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <Sheet open={firstTimeOpen} onClose={() => setFirstTimeOpen(false)} title={`Première fois : ${exercise.name}`}>
        <div className="space-y-3 pb-4">
          <InfoNote tone="warn">{SAFETY.loadNeverSafe}</InfoNote>
          <ol className="space-y-3">
            {(exercise.firstTime ?? [
              "Commence avec une charge très légère pour sentir le mouvement.",
              "Fais une série d'échauffement de 8 à 10 répétitions.",
              "Augmente progressivement jusqu'à trouver une charge difficile mais propre.",
            ]).map((s, i) => (
              <li key={s} className="flex gap-3">
                <span className="num grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-ember-500/15 text-[12px] font-bold text-ember-300">
                  {i + 1}
                </span>
                <span className="text-[14px] leading-relaxed text-chalk-dim">{s}</span>
              </li>
            ))}
          </ol>
          <div className="rounded-2xl border border-white/8 bg-white/[.03] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-chalk-mute">Effort normal</p>
            <p className="mt-1 text-[13px] text-chalk-dim">{SAFETY.normalEffort}</p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-danger">Signal anormal</p>
            <p className="mt-1 text-[13px] text-chalk-dim">{SAFETY.abnormalPain}</p>
          </div>
          <p className="text-center text-[11.5px] text-chalk-mute">{SAFETY.noDiagnosis}</p>
          <Button full size="lg" onClick={() => setFirstTimeOpen(false)}>
            C&apos;est compris
          </Button>
        </div>
      </Sheet>

      <div className="mt-4 flex gap-2">
        <Chip icon="dumbbell" className="flex-1 justify-center">
          Technique {exercise.technical}/5
        </Chip>
        <Chip icon="clock" className="flex-1 justify-center">
          Repos {mmss(plan.restSec)}
        </Chip>
      </div>
      <p className={cx("mt-4 text-center text-[11px] text-chalk-mute")}>{SAFETY.notMedical}</p>
    </Page>
  );
}
