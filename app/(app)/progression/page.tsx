"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Page, TopBar } from "@/components/AppShell";
import { BarChart, LineChart, Sparkline } from "@/components/charts/Charts";
import { Icon } from "@/components/ui/Icon";
import { Button, Card, cx, EmptyState, InfoNote, SectionTitle, Segmented, Sheet } from "@/components/ui/primitives";
import { Counter, ProgressBar } from "@/components/ui/progress";
import { useApp } from "@/lib/store";
import { EXERCISES, ex } from "@/lib/data/exercises";
import { historyFor, weeklySessions, workingWeight } from "@/lib/progression";
import { progressSinceStart, volume } from "@/lib/coach";
import { estimate1RM } from "@/lib/estimator";
import { unlockedAchievements } from "@/lib/gamification";
import { timeline, weeksSince } from "@/lib/projection";
import { frDate, kg, relativeDay, tons } from "@/lib/format";

type Tab = "force" | "corps" | "regularite";

export default function ProgressionPage() {
  const profile = useApp((s) => s.profile)!;
  const sessions = useApp((s) => s.sessions);
  const weights = useApp((s) => s.weights);
  const measurements = useApp((s) => s.measurements);
  const addWeight = useApp((s) => s.addWeight);
  const addMeasurement = useApp((s) => s.addMeasurement);
  const [tab, setTab] = useState<Tab>("force");
  const [weightOpen, setWeightOpen] = useState(false);
  const [measureOpen, setMeasureOpen] = useState(false);
  const [draftWeight, setDraftWeight] = useState(weights[weights.length - 1]?.kg ?? profile.weightKg);
  const [draftM, setDraftM] = useState(measurements[measurements.length - 1] ?? { date: "" });

  const trained = useMemo(
    () =>
      EXERCISES.map((e) => ({ e, h: historyFor(sessions, e.id) }))
        .filter((x) => x.h.length >= 2)
        .map((x) => ({ ...x, prog: progressSinceStart(sessions, x.e.id) }))
        .sort((a, b) => ((b.prog?.to ?? 0) - (b.prog?.from ?? 0)) - ((a.prog?.to ?? 0) - (a.prog?.from ?? 0))),
    [sessions]
  );

  const weeks = useMemo(
    () =>
      [5, 4, 3, 2, 1, 0].map((w) => {
        const list = weeklySessions(sessions, w);
        return {
          label: w === 0 ? "S0" : `-${w}`,
          sessions: list.length,
          volume: list.reduce((a, s) => a + volume(s), 0),
        };
      }),
    [sessions]
  );

  const achievements = unlockedAchievements(sessions);
  const done = sessions.filter((s) => s.completed);
  const totalVolume = done.reduce((a, s) => a + volume(s), 0);
  const allPrs = done.flatMap((s) => s.prs.map((p) => ({ ...p, date: s.date }))).sort((a, b) => (a.date < b.date ? 1 : -1));

  if (!done.length)
    return (
      <Page>
        <TopBar title="Progression" />
        <EmptyState
          icon="chart"
          title="Rien à afficher pour l'instant"
          body="Termine ta première séance : les graphiques de force, de volume et de régularité se construisent automatiquement à partir de tes séries."
          action={<Button href="/programme" icon="play">Voir mon programme</Button>}
        />
      </Page>
    );

  return (
    <Page>
      <TopBar title="Progression" subtitle={`${done.length} séances · ${tons(totalVolume)} soulevées`} />

      <div className="mb-5 grid grid-cols-3 gap-2">
        {[
          { l: "Séances", v: done.length },
          { l: "Records", v: allPrs.length },
          { l: "Volume", v: tons(totalVolume) },
        ].map((s) => (
          <Card key={s.l} className="p-4 text-center">
            <p className="num font-display text-xl font-extrabold text-gradient-ember">{s.v}</p>
            <p className="mt-0.5 text-[11px] text-chalk-mute">{s.l}</p>
          </Card>
        ))}
      </div>

      <Segmented
        className="mb-5"
        value={tab}
        onChange={setTab}
        options={[
          { value: "force", label: "Force" },
          { value: "corps", label: "Corps" },
          { value: "regularite", label: "Régularité" },
        ]}
      />

      {tab === "force" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <SectionTitle>Progression par exercice</SectionTitle>
          <div className="mb-6 space-y-2">
            {trained.slice(0, 8).map(({ e, h, prog }) => (
              <Link key={e.id} href={`/progression/${e.id}`} className="tap block">
                <Card className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">{e.shortName ?? e.name}</p>
                    <p className="num text-[12px] text-chalk-mute">
                      {workingWeight(h[0].sets)} kg · 1RM estimé {Math.round(prog?.to ?? 0)} kg
                    </p>
                  </div>
                  <Sparkline values={h.slice().reverse().map((x) => Math.max(...x.sets.map((s) => estimate1RM(s.weight, s.reps))))} />
                  {prog && (
                    <span className={cx("num shrink-0 text-[13px] font-bold", prog.pct > 0 ? "text-volt-400" : "text-chalk-mute")}>
                      {prog.pct > 0 ? "+" : ""}
                      {prog.pct.toFixed(0)} %
                    </span>
                  )}
                </Card>
              </Link>
            ))}
          </div>

          <SectionTitle>Records</SectionTitle>
          <div className="space-y-2">
            {allPrs.slice(0, 6).map((pr, i) => (
              <Card key={i} className="flex items-center gap-3 p-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ember-500/12 text-ember-300">
                  <Icon name="trophy" size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold">{ex(pr.exerciseId).shortName ?? ex(pr.exerciseId).name}</p>
                  <p className="text-[11.5px] text-chalk-mute">{relativeDay(pr.date.slice(0, 10))}</p>
                </div>
                <span className="num text-[13px] font-bold text-ember-300">
                  {pr.kind === "reps" ? `${pr.value} reps` : kg(pr.value)}
                </span>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {tab === "corps" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <SectionTitle action={<button onClick={() => setWeightOpen(true)} className="text-[12px] text-ember-400">Ajouter</button>}>
            Poids corporel
          </SectionTitle>
          <Card className="mb-5 p-4">
            {weights.length > 1 ? (
              <LineChart
                points={weights.slice(-16).map((w) => ({ label: frDate(w.date, { day: "numeric", month: "short" }), value: w.kg }))}
                tone="volt"
                format={(v) => `${v.toFixed(1).replace(".", ",")} kg`}
              />
            ) : (
              <p className="py-6 text-center text-sm text-chalk-mute">Ajoute au moins deux pesées pour voir la tendance.</p>
            )}
            <div className="mt-3 flex items-center justify-between text-[12.5px]">
              <span className="text-chalk-mute">Objectif {kg(profile.targetWeightKg)}</span>
              <span className="num font-semibold">
                {weights.length ? `${(weights[weights.length - 1].kg - weights[0].kg > 0 ? "+" : "")}${(weights[weights.length - 1].kg - weights[0].kg).toFixed(1).replace(".", ",")} kg depuis le début` : ""}
              </span>
            </div>
          </Card>

          <SectionTitle action={<button onClick={() => setMeasureOpen(true)} className="text-[12px] text-ember-400">Ajouter</button>}>
            Mensurations
          </SectionTitle>
          <Card className="mb-5 p-5">
            {measurements.length ? (
              <div className="space-y-3">
                {(
                  [
                    ["brasCm", "Bras"],
                    ["poitrineCm", "Poitrine"],
                    ["epaulesCm", "Épaules"],
                    ["tailleCm", "Taille"],
                    ["cuisseCm", "Cuisse"],
                  ] as const
                ).map(([k, label]) => {
                  const first = measurements[0][k];
                  const latest = measurements[measurements.length - 1][k];
                  if (latest === undefined) return null;
                  const delta = first !== undefined ? latest - first : 0;
                  return (
                    <div key={k} className="flex items-center gap-3">
                      <span className="w-20 text-[12.5px] text-chalk-dim">{label}</span>
                      <span className="num w-16 font-display text-[15px] font-bold">{latest.toFixed(1).replace(".", ",")}</span>
                      <ProgressBar value={0.4 + delta * 0.15} tone="cyan" className="flex-1" height={6} />
                      <span className={cx("num w-14 text-right text-[12px] font-semibold", delta > 0 ? "text-volt-400" : "text-chalk-mute")}>
                        {delta > 0 ? "+" : ""}
                        {delta.toFixed(1).replace(".", ",")}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-chalk-mute">Aucune mensuration enregistrée.</p>
            )}
          </Card>

          <SectionTitle>Repères</SectionTitle>
          <Card className="p-5">
            <div className="space-y-4">
              {timeline(profile, weeksSince(profile.createdAt)).map((m, i) => (
                <div key={m.weeks} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cx(
                        "grid h-6 w-6 place-items-center rounded-full border text-[10px]",
                        m.done ? "border-ember-500 bg-ember-500 text-ink-950" : "border-white/15 text-chalk-mute"
                      )}
                    >
                      {m.done ? <Icon name="check" size={11} strokeWidth={3} /> : i + 1}
                    </span>
                    {i < 5 && <span className="my-1 w-px flex-1 bg-white/10" />}
                  </div>
                  <div className="pb-1">
                    <p className="text-[11px] uppercase tracking-wider text-chalk-mute">{m.weeks}</p>
                    <p className="text-[14px] font-semibold">{m.title}</p>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-chalk-dim">{m.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {tab === "regularite" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <SectionTitle>Séances par semaine</SectionTitle>
          <Card className="mb-5 p-5">
            <BarChart points={weeks.map((w) => ({ label: w.label, value: w.sessions }))} tone="ember" goal={profile.daysAvailable} />
            <p className="mt-3 text-center text-[12px] text-chalk-mute">Objectif : {profile.daysAvailable} séances par semaine</p>
          </Card>

          <SectionTitle>Volume hebdomadaire</SectionTitle>
          <Card className="mb-5 p-5">
            <BarChart points={weeks.map((w) => ({ label: w.label, value: Math.round(w.volume / 1000) }))} tone="violet" format={(v) => `${v} t`} />
            <p className="mt-3 text-center text-[12px] text-chalk-mute">En tonnes soulevées</p>
          </Card>

          <SectionTitle>Badges</SectionTitle>
          <div className="grid grid-cols-2 gap-2.5">
            {achievements.map((a) => (
              <Card key={a.id} className={cx("flex items-center gap-3 p-3.5", !a.unlocked && "opacity-40")}>
                <span
                  className={cx(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                    a.tier === "or" ? "bg-ember-500/15 text-ember-300" : a.tier === "argent" ? "bg-white/10 text-chalk-dim" : "bg-white/[.06] text-chalk-mute"
                  )}
                >
                  <Icon name={a.unlocked ? a.icon : "lock"} size={17} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-semibold">{a.name}</p>
                  <p className="truncate text-[11px] text-chalk-mute">{a.desc}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-5">
            <InfoNote>
              La régularité pèse davantage que la perfection d&apos;une séance : trois semaines complètes valent mieux
              qu&apos;une séance parfaite suivie de deux semaines vides.
            </InfoNote>
          </div>
        </motion.div>
      )}

      {/* --- Ajout de poids --- */}
      <Sheet open={weightOpen} onClose={() => setWeightOpen(false)} title="Ajouter une pesée">
        <div className="space-y-4 pb-4">
          <div className="rounded-3xl border border-white/10 bg-white/[.03] p-5 text-center">
            <p className="num font-display text-4xl font-extrabold">
              <Counter value={draftWeight} decimals={1} from={draftWeight} />
              <span className="ml-1 text-lg text-chalk-dim">kg</span>
            </p>
            <input
              type="range"
              min={40}
              max={160}
              step={0.1}
              value={draftWeight}
              onChange={(e) => setDraftWeight(Number(e.target.value))}
              className="mt-4 h-1.5 w-full appearance-none rounded-full bg-white/10 accent-[#ff6b2c]"
            />
          </div>
          <p className="text-center text-[12px] text-chalk-mute">
            Pèse-toi au même moment de la journée, idéalement le matin à jeun.
          </p>
          <Button
            full
            size="lg"
            icon="check"
            onClick={() => {
              addWeight(Math.round(draftWeight * 10) / 10);
              setWeightOpen(false);
            }}
          >
            Enregistrer
          </Button>
        </div>
      </Sheet>

      {/* --- Mensurations --- */}
      <Sheet open={measureOpen} onClose={() => setMeasureOpen(false)} title="Mensurations">
        <div className="space-y-3 pb-4">
          {(
            [
              ["brasCm", "Bras (contracté)"],
              ["poitrineCm", "Poitrine"],
              ["epaulesCm", "Épaules"],
              ["tailleCm", "Taille"],
              ["cuisseCm", "Cuisse"],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.03] px-4 py-3">
              <span className="flex-1 text-[13.5px]">{label}</span>
              <input
                type="number"
                step={0.5}
                value={draftM[k] ?? ""}
                onChange={(e) => setDraftM({ ...draftM, [k]: Number(e.target.value) })}
                className="num w-20 rounded-xl bg-white/[.06] px-3 py-1.5 text-right text-sm outline-none"
              />
              <span className="text-[12px] text-chalk-mute">cm</span>
            </label>
          ))}
          <Button
            full
            size="lg"
            icon="check"
            onClick={() => {
              addMeasurement({ ...draftM, date: new Date().toISOString().slice(0, 10) });
              setMeasureOpen(false);
            }}
          >
            Enregistrer
          </Button>
          <p className="text-center text-[11.5px] text-chalk-mute">
            Mesure toujours au même endroit et dans les mêmes conditions.
          </p>
        </div>
      </Sheet>
    </Page>
  );
}
