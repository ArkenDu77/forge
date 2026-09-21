"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Page, TopBar } from "@/components/AppShell";
import { ExerciseMedia } from "@/components/exercise/ExerciseMedia";
import { Icon } from "@/components/ui/Icon";
import { Badge, Card, Chip, cx } from "@/components/ui/primitives";
import { adaptForWeek, ALL_DAYS, WEEKDAY_LABELS } from "@/lib/data/program";
import { EXERCISES, ex } from "@/lib/data/exercises";
import { MUSCLE_GROUPS, muscleName } from "@/lib/data/muscles";
import { coachingFor } from "@/lib/data/coaching";
import { useApp } from "@/lib/store";
import { dayForToday, lastSessionFor } from "@/lib/session";
import { relativeDay } from "@/lib/format";
import { weeksSince } from "@/lib/projection";

const REST_DAYS = [2, 4, 6];

export default function ProgrammePage() {
  const sessions = useApp((s) => s.sessions);
  const profile = useApp((s) => s.profile);
  // Même semaine de programme que les fiches de séance : sans ça, la liste
  // annoncerait une durée que l'écran suivant contredit.
  const week = profile ? weeksSince(profile.createdAt) + 1 : 99;
  const today = dayForToday(week);
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<string>("tous");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const members = MUSCLE_GROUPS.find((g) => g.id === group)?.members;
    return EXERCISES.filter((e) => {
      if (needle && !e.name.toLowerCase().includes(needle)) return false;
      if (members && !e.primary.some((m) => members.includes(m))) return false;
      return true;
    });
  }, [q, group]);

  return (
    <Page>
      <TopBar title="Ma semaine" subtitle="4 séances, 3 jours de repos" />

      <div className="mb-6 space-y-2.5">
        {WEEKDAY_LABELS.map((label, weekday) => {
          const raw = ALL_DAYS.find((d) => d.weekday === weekday);
          const day = raw ? adaptForWeek(raw, week) : undefined;
          const isToday = today?.weekday === weekday || (!today && false);
          const isRest = REST_DAYS.includes(weekday);

          if (!day) {
            return (
              <div
                key={label}
                className={cx(
                  "flex items-center gap-3 rounded-2xl border border-white/[.05] bg-white/[.015] px-4 py-3",
                  isRest && new Date().getDay() === (weekday + 1) % 7 && "ring-1 ring-white/10"
                )}
              >
                <span className="w-20 text-[12px] font-semibold text-chalk-mute">{label}</span>
                <span className="text-[13px] text-chalk-mute">Repos</span>
              </div>
            );
          }

          const last = lastSessionFor(sessions, day.id);
          return (
            <motion.div key={day.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Link href={`/programme/${day.id}`} className="tap block">
                <Card className={cx("relative overflow-hidden p-0", isToday && "ring-1 ring-ember-500/50")}>
                  <div className="pointer-events-none absolute -right-2 -top-2 h-32 w-32 opacity-35">
                    <ExerciseMedia exercise={ex(day.exercises[0].exerciseId)} accent={day.accent} className="h-full w-full" frame={0.5} />
                  </div>
                  <div className="relative p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-chalk-mute">{label}</span>
                      {isToday && <Badge tone="ember">Aujourd&apos;hui</Badge>}
                    </div>
                    <h2 className="mt-1 font-display text-[20px] font-extrabold leading-tight">{day.name}</h2>
                    <p className="text-[13.5px] font-semibold text-ember-300">{day.focus}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-chalk-mute">
                      <span className="flex items-center gap-1.5">
                        <Icon name="clock" size={13} /> {day.estimatedMin} min
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="dumbbell" size={13} /> {day.exercises.length} exercices
                      </span>
                      {last && <span>fait {relativeDay(last.date.slice(0, 10)).toLowerCase()}</span>}
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <Link
        href="/simulateur"
        className="tap mb-6 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[.03] px-4 py-3.5"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-glow/15 text-violet-glow">
          <Icon name="target" size={17} />
        </span>
        <div className="flex-1">
          <p className="text-[13.5px] font-semibold">Quel poids mettre ?</p>
          <p className="text-[12px] text-chalk-mute">Une estimation prudente pour un exercice que tu n&apos;as jamais fait</p>
        </div>
        <Icon name="right" size={16} className="text-chalk-mute" />
      </Link>

      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-mute">
        Tous les exercices · {EXERCISES.length}
      </p>
      <div className="relative mb-3">
        <Icon name="search" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk-mute" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Chercher un exercice"
          className="h-11 w-full rounded-2xl border border-white/10 bg-white/[.03] pl-10 pr-4 text-sm outline-none placeholder:text-chalk-mute focus:border-ember-500/40"
        />
      </div>
      <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
        <Chip active={group === "tous"} onClick={() => setGroup("tous")}>
          Tout
        </Chip>
        {MUSCLE_GROUPS.map((g) => (
          <Chip key={g.id} active={group === g.id} onClick={() => setGroup(g.id)}>
            {g.name}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {filtered.map((e) => (
          <Link key={e.id} href={`/exercice/${e.slug}`} className="tap">
            <Card className="h-full overflow-hidden p-0">
              <div className="aspect-[4/3] w-full bg-white/[.02]">
                <ExerciseMedia exercise={e} className="h-full w-full" frame={0.5} />
              </div>
              <div className="p-3">
                <p className="truncate text-[13px] font-semibold">{e.shortName ?? e.name}</p>
                <p className="line-clamp-2 text-[11px] leading-snug text-chalk-mute">
                  {coachingFor(e.id).why !== "Exercice complémentaire du programme."
                    ? coachingFor(e.id).why
                    : e.primary.map((m) => muscleName(m)).join(", ")}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && <p className="py-8 text-center text-sm text-chalk-mute">Aucun exercice ne correspond.</p>}
    </Page>
  );
}
