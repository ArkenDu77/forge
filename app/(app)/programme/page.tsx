"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Page, TopBar } from "@/components/AppShell";
import { ExerciseFigure } from "@/components/exercise/Figure";
import { Icon } from "@/components/ui/Icon";
import { Badge, Card, Chip, cx, SectionTitle } from "@/components/ui/primitives";
import { ALL_DAYS, DEFAULT_PROGRAM } from "@/lib/data/program";
import { EXERCISES, ex } from "@/lib/data/exercises";
import { MUSCLE_GROUPS, muscleName } from "@/lib/data/muscles";
import { useApp } from "@/lib/store";
import { lastSessionFor, nextDay } from "@/lib/session";
import { relativeDay } from "@/lib/format";

export default function ProgrammePage() {
  const sessions = useApp((s) => s.sessions);
  const profile = useApp((s) => s.profile)!;
  const upcoming = nextDay(sessions);
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
      <TopBar title="Programme" subtitle={`${DEFAULT_PROGRAM.name} · objectif ${goalLabel(profile.goal)}`} />

      <div className="mb-6 space-y-3">
        {ALL_DAYS.map((day, i) => {
          const last = lastSessionFor(sessions, day.id);
          const isNext = day.id === upcoming.id;
          return (
            <motion.div key={day.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={`/programme/${day.id}`} className="tap block">
                <Card className={cx("relative overflow-hidden p-0", isNext && "ring-1 ring-ember-500/40")}>
                  <div className="pointer-events-none absolute -right-4 -top-4 h-36 w-36 opacity-35">
                    <ExerciseFigure media={ex(day.exercises[0].exerciseId).media} accent={day.accent} className="h-full w-full" showTrail={false} frame={0.5} />
                  </div>
                  <div className="relative p-5">
                    <div className="flex items-center gap-2">
                      <span className="num text-[11px] font-bold uppercase tracking-[0.18em] text-chalk-mute">Jour {day.index}</span>
                      {isNext && <Badge tone="ember">Prochaine</Badge>}
                    </div>
                    <h2 className="mt-1.5 font-display text-[22px] font-extrabold leading-tight">{day.name}</h2>
                    <p className="text-[14px] font-semibold text-ember-300">{day.focus}</p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-chalk-mute">
                      <span className="flex items-center gap-1.5">
                        <Icon name="clock" size={13} /> {day.estimatedMin} min
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="dumbbell" size={13} /> {day.exercises.length} exercices
                      </span>
                      {last && (
                        <span className="flex items-center gap-1.5">
                          <Icon name="calendar" size={13} /> {relativeDay(last.date.slice(0, 10))}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <Link href="/simulateur" className="tap mb-6 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[.03] px-4 py-3.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-glow/15 text-violet-glow">
          <Icon name="target" size={17} />
        </span>
        <div className="flex-1">
          <p className="text-[13.5px] font-semibold">Simulateur de charge</p>
          <p className="text-[12px] text-chalk-mute">Estimer un point de départ sur n&apos;importe quel exercice</p>
        </div>
        <Icon name="right" size={16} className="text-chalk-mute" />
      </Link>

      <SectionTitle>Bibliothèque · {EXERCISES.length} exercices</SectionTitle>
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
                <ExerciseFigure media={e.media} className="h-full w-full" showTrail={false} frame={0.5} />
              </div>
              <div className="p-3">
                <p className="truncate text-[13px] font-semibold">{e.shortName ?? e.name}</p>
                <p className="truncate text-[11.5px] text-chalk-mute">{e.primary.map((m) => muscleName(m)).join(", ")}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && <p className="py-8 text-center text-sm text-chalk-mute">Aucun exercice ne correspond.</p>}
    </Page>
  );
}

function goalLabel(g: string) {
  return g === "muscle" ? "prise de muscle" : g === "force" ? "force" : "muscle et force";
}
