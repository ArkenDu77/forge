"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, Card, Chip, cx, InfoNote } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/progress";
import { MuscleMap } from "@/components/exercise/MuscleMap";
import { useApp } from "@/lib/store";
import { buildDemoData } from "@/lib/seed";
import { computeTargets } from "@/lib/nutrition";
import { DEFAULT_PROGRAM } from "@/lib/data/program";
import { SAFETY } from "@/lib/copy";
import type { Diet, Equipment, Goal, Level, MuscleId, Profile } from "@/lib/types";
import { MUSCLE_GROUPS } from "@/lib/data/muscles";

type Draft = Omit<Profile, "createdAt">;

const DEFAULTS: Draft = {
  firstName: "",
  age: 25,
  sex: "h",
  heightCm: 178,
  weightKg: 70,
  level: "debutant",
  currentFrequency: 0,
  daysAvailable: 4,
  goal: "muscle-force",
  priorityMuscles: [],
  gymType: "salle",
  equipment: ["barre", "halteres", "machine", "poulie", "banc", "barre-traction", "poids-du-corps"],
  sessionMinutes: 75,
  diet: "omnivore",
  dislikedFoods: [],
  allergies: [],
  monthlyFoodBudget: 250,
  budgetTier: "standard",
  targetWeightKg: 76,
  sleepHours: 7.5,
  dailyActivity: "leger",
};

/* ---------------- Champs ---------------- */

function OptionCard({
  active,
  title,
  desc,
  icon,
  onClick,
  compact,
}: {
  active: boolean;
  title: string;
  desc?: string;
  icon?: string;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "tap group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all active:scale-[.98]",
        active ? "border-ember-500/60 bg-ember-500/[.09]" : "border-white/10 bg-white/[.03] hover:border-white/20"
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <span
            className={cx(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors",
              active ? "bg-ember-500/20 text-ember-300" : "bg-white/[.05] text-chalk-mute"
            )}
          >
            <Icon name={icon} size={19} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className={cx("font-semibold", compact ? "text-sm" : "text-[15px]")}>{title}</p>
          {desc && <p className="mt-0.5 text-[12.5px] leading-snug text-chalk-mute">{desc}</p>}
        </div>
        <span
          className={cx(
            "grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all",
            active ? "border-ember-400 bg-ember-500 text-ink-950" : "border-white/20"
          )}
        >
          {active && <Icon name="check" size={12} strokeWidth={3} />}
        </span>
      </div>
    </button>
  );
}

function Dial({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  decimals = 0,
}: {
  label: string;
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
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">{label}</p>
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
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#ff6b2c]"
        aria-label={label}
      />
    </div>
  );
}

function Counter({ label, value, onChange, min, max, unit }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; unit: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.03] px-4 py-3.5">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="tap grid h-9 w-9 place-items-center rounded-xl bg-white/[.06] active:scale-95" aria-label="Moins">
          <Icon name="minus" size={16} />
        </button>
        <span className="num w-16 text-center font-display text-xl font-bold">
          {value}
          <span className="ml-0.5 text-xs font-medium text-chalk-mute">{unit}</span>
        </span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="tap grid h-9 w-9 place-items-center rounded-xl bg-white/[.06] active:scale-95" aria-label="Plus">
          <Icon name="plus" size={16} />
        </button>
      </div>
    </div>
  );
}

/* ---------------- Écran ---------------- */

export default function Onboarding() {
  const router = useRouter();
  const setProfile = useApp((s) => s.setProfile);
  const importDemo = useApp((s) => s.importDemo);
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(DEFAULTS);
  const patch = (p: Partial<Draft>) => setD((prev) => ({ ...prev, ...p }));

  const targets = useMemo(() => computeTargets({ ...d, createdAt: new Date().toISOString() }), [d]);

  const steps: { title: string; sub?: string; body: React.ReactNode; valid?: boolean }[] = [
    {
      title: "Bienvenue",
      sub: "Deux minutes pour construire ton programme.",
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
          <div className="grid gap-2.5">
            {[
              { icon: "target", t: "Un programme adapté à ton niveau" },
              { icon: "dumbbell", t: "Chaque séance guidée, série par série" },
              { icon: "chart", t: "Les charges calculées à partir de ton historique" },
              { icon: "nutrition", t: "Une nutrition simple, chiffrée et tenable" },
            ].map((x) => (
              <div key={x.t} className="flex items-center gap-3 rounded-2xl border border-white/[.06] bg-white/[.02] px-4 py-3">
                <Icon name={x.icon} size={18} className="text-ember-400" />
                <span className="text-[13.5px] text-chalk-dim">{x.t}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              const demo = buildDemoData();
              importDemo({ ...demo, profile: { ...demo.profile } });
              router.push("/");
            }}
            className="tap w-full text-center text-[13px] text-chalk-mute underline underline-offset-4 hover:text-chalk-dim"
          >
            Explorer d&apos;abord avec des données de démonstration
          </button>
        </div>
      ),
    },
    {
      title: "Ton profil",
      sub: "Ces valeurs servent à estimer tes charges et tes besoins.",
      body: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: "h", l: "Homme" },
              { v: "f", l: "Femme" },
              { v: "na", l: "Ne pas préciser" },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => patch({ sex: o.v as Profile["sex"] })}
                className={cx(
                  "tap rounded-2xl border px-2 py-3 text-[13px] font-semibold transition-all active:scale-95",
                  d.sex === o.v ? "border-ember-500/60 bg-ember-500/[.10] text-ember-300" : "border-white/10 bg-white/[.03] text-chalk-dim"
                )}
              >
                {o.l}
              </button>
            ))}
          </div>
          <Counter label="Âge" value={d.age} onChange={(v) => patch({ age: v })} min={14} max={85} unit="ans" />
          <Dial label="Taille" value={d.heightCm} onChange={(v) => patch({ heightCm: v })} min={140} max={215} unit="cm" />
          <Dial label="Poids actuel" value={d.weightKg} onChange={(v) => patch({ weightKg: v })} min={40} max={180} step={0.5} decimals={1} unit="kg" />
          <InfoNote>Le sexe n&apos;est utilisé que pour ajuster les estimations de départ. Tu peux ne pas le préciser.</InfoNote>
        </div>
      ),
    },
    {
      title: "Ton expérience",
      sub: "Sois honnête : c'est ce qui rend les charges de départ sûres.",
      body: (
        <div className="space-y-2.5">
          {(
            [
              { v: "jamais", t: "Jamais fait de musculation", d: "On part de la barre à vide et on apprend chaque mouvement." },
              { v: "debutant", t: "Débutant", d: "Moins d'un an de pratique régulière." },
              { v: "intermediaire", t: "Intermédiaire", d: "1 à 3 ans, tu connais tes charges de travail." },
              { v: "avance", t: "Avancé", d: "Plus de 3 ans de pratique structurée." },
            ] as { v: Level; t: string; d: string }[]
          ).map((o) => (
            <OptionCard key={o.v} active={d.level === o.v} title={o.t} desc={o.d} onClick={() => patch({ level: o.v })} />
          ))}
          <div className="pt-2">
            <Counter label="Séances par semaine actuellement" value={d.currentFrequency} onChange={(v) => patch({ currentFrequency: v })} min={0} max={7} unit="" />
          </div>
        </div>
      ),
    },
    {
      title: "Ton objectif",
      body: (
        <div className="space-y-2.5">
          {(
            [
              { v: "muscle", t: "Prendre du muscle", d: "Priorité au volume et aux répétitions de 6 à 15.", i: "dumbbell" },
              { v: "muscle-force", t: "Muscle et force", d: "Le meilleur des deux : lourd sur les bases, volume sur le reste.", i: "bolt" },
              { v: "force", t: "Gagner en force", d: "Priorité aux séries lourdes de 3 à 6 répétitions.", i: "weight" },
            ] as { v: Goal; t: string; d: string; i: string }[]
          ).map((o) => (
            <OptionCard key={o.v} active={d.goal === o.v} title={o.t} desc={o.d} icon={o.i} onClick={() => patch({ goal: o.v })} />
          ))}
          <div className="pt-3">
            <Dial
              label="Objectif de poids"
              value={d.targetWeightKg}
              onChange={(v) => patch({ targetWeightKg: v })}
              min={40}
              max={180}
              step={0.5}
              decimals={1}
              unit="kg"
            />
          </div>
          <p className="px-1 text-center text-xs text-chalk-mute">
            {d.targetWeightKg > d.weightKg
              ? `Soit +${(d.targetWeightKg - d.weightKg).toFixed(1).replace(".", ",")} kg à construire.`
              : d.targetWeightKg < d.weightKg
                ? `Soit ${(d.targetWeightKg - d.weightKg).toFixed(1).replace(".", ",")} kg à perdre.`
                : "Maintien du poids actuel."}
          </p>
        </div>
      ),
    },
    {
      title: "Ta disponibilité",
      sub: "Le programme s'adapte au temps que tu as vraiment.",
      body: (
        <div className="space-y-4">
          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Jours par semaine</p>
            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => patch({ daysAvailable: n })}
                  className={cx(
                    "tap rounded-2xl border py-4 font-display text-xl font-bold transition-all active:scale-95",
                    d.daysAvailable === n ? "border-ember-500/60 bg-ember-500/[.10] text-ember-300" : "border-white/10 bg-white/[.03] text-chalk-dim"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <Dial label="Temps par séance" value={d.sessionMinutes} onChange={(v) => patch({ sessionMinutes: v })} min={30} max={120} step={5} unit="min" />
          {d.sessionMinutes < 50 && <InfoNote tone="warn">Sous 50 minutes, on réduira le nombre d&apos;exercices accessoires pour garder l&apos;essentiel.</InfoNote>}
        </div>
      ),
    },
    {
      title: "Zones à développer",
      sub: "Optionnel — on ajoutera un peu de volume dessus.",
      body: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {MUSCLE_GROUPS.flatMap((g) => g.members).map((m) => (
              <Chip
                key={m}
                active={d.priorityMuscles.includes(m)}
                onClick={() =>
                  patch({
                    priorityMuscles: d.priorityMuscles.includes(m)
                      ? d.priorityMuscles.filter((x) => x !== m)
                      : [...d.priorityMuscles, m].slice(0, 3),
                  })
                }
              >
                {labelOf(m)}
              </Chip>
            ))}
          </div>
          <p className="text-xs text-chalk-mute">3 zones maximum : au-delà, ce n&apos;est plus une priorité.</p>
          <div className="mx-auto h-56">
            <MuscleMap primary={d.priorityMuscles} side="front" />
          </div>
        </div>
      ),
    },
    {
      title: "Ton équipement",
      body: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            <OptionCard active={d.gymType === "salle"} title="Salle de sport" icon="dumbbell" compact onClick={() => patch({ gymType: "salle", equipment: DEFAULTS.equipment })} />
            <OptionCard active={d.gymType === "home"} title="Home gym" icon="home" compact onClick={() => patch({ gymType: "home", equipment: ["halteres", "poids-du-corps"] })} />
          </div>
          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Ce dont tu disposes</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["barre", "Barre olympique"],
                  ["halteres", "Haltères"],
                  ["machine", "Machines"],
                  ["poulie", "Poulies"],
                  ["banc", "Banc"],
                  ["barre-traction", "Barre de traction"],
                  ["poids-du-corps", "Poids du corps"],
                ] as [Equipment, string][]
              ).map(([v, l]) => (
                <Chip
                  key={v}
                  active={d.equipment.includes(v)}
                  onClick={() =>
                    patch({ equipment: d.equipment.includes(v) ? d.equipment.filter((x) => x !== v) : [...d.equipment, v] })
                  }
                >
                  {l}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Ton alimentation",
      body: (
        <div className="space-y-4">
          <div className="grid gap-2">
            {(
              [
                ["omnivore", "Omnivore"],
                ["vegetarien", "Végétarien"],
                ["pescetarien", "Pescétarien"],
                ["sans-lactose", "Sans lactose"],
                ["sans-porc", "Sans porc"],
              ] as [Diet, string][]
            ).map(([v, l]) => (
              <OptionCard key={v} active={d.diet === v} title={l} compact onClick={() => patch({ diet: v })} />
            ))}
          </div>
          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Aliments que tu refuses</p>
            <div className="flex flex-wrap gap-2">
              {["Poisson", "Saumon", "Thon", "Fromage blanc", "Brocoli", "Avocat", "Lentilles", "Œufs", "Pois chiches"].map((f) => (
                <Chip
                  key={f}
                  active={d.dislikedFoods.includes(f)}
                  onClick={() =>
                    patch({ dislikedFoods: d.dislikedFoods.includes(f) ? d.dislikedFoods.filter((x) => x !== f) : [...d.dislikedFoods, f] })
                  }
                >
                  {f}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Allergies</p>
            <div className="flex flex-wrap gap-2">
              {["Lactose", "Gluten", "Fruits à coque", "Arachide", "Œuf", "Crustacés"].map((f) => (
                <Chip
                  key={f}
                  active={d.allergies.includes(f)}
                  onClick={() => patch({ allergies: d.allergies.includes(f) ? d.allergies.filter((x) => x !== f) : [...d.allergies, f] })}
                >
                  {f}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Ton budget",
      sub: "Les recettes proposées s'y adapteront.",
      body: (
        <div className="space-y-3">
          {[
            { v: "economique", t: "Économique", d: "≈ 45-55 € de courses par semaine." },
            { v: "standard", t: "Standard", d: "≈ 60-70 € par semaine." },
            { v: "flexible", t: "Flexible", d: "≈ 75-90 € par semaine, plus de poisson et de variété." },
          ].map((o) => (
            <OptionCard
              key={o.v}
              active={d.budgetTier === o.v}
              title={o.t}
              desc={o.d}
              onClick={() => patch({ budgetTier: o.v as Draft["budgetTier"], monthlyFoodBudget: o.v === "economique" ? 200 : o.v === "standard" ? 260 : 340 })}
            />
          ))}
          <div className="pt-2">
            <Dial label="Budget mensuel alimentation" value={d.monthlyFoodBudget} onChange={(v) => patch({ monthlyFoodBudget: v })} min={100} max={600} step={10} unit="€" />
          </div>
        </div>
      ),
    },
    {
      title: "Sommeil et activité",
      sub: "La récupération conditionne la progression.",
      body: (
        <div className="space-y-4">
          <Dial label="Sommeil moyen" value={d.sleepHours} onChange={(v) => patch({ sleepHours: v })} min={4} max={11} step={0.5} decimals={1} unit="h" />
          <div className="grid gap-2">
            {[
              { v: "sedentaire", t: "Sédentaire", d: "Bureau, peu de marche." },
              { v: "leger", t: "Légèrement actif", d: "Un peu de marche quotidienne." },
              { v: "actif", t: "Actif", d: "Debout ou en mouvement une bonne partie de la journée." },
              { v: "tres-actif", t: "Très actif", d: "Travail physique ou beaucoup de sport en plus." },
            ].map((o) => (
              <OptionCard key={o.v} active={d.dailyActivity === o.v} title={o.t} desc={o.d} compact onClick={() => patch({ dailyActivity: o.v as Draft["dailyActivity"] })} />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Ton programme est prêt",
      sub: `${DEFAULT_PROGRAM.name} · adapté à ton profil`,
      body: (
        <div className="space-y-4">
          <Card className="overflow-hidden p-0">
            <div className="bg-gradient-to-br from-ember-500/20 via-transparent to-violet-glow/10 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ember-300">Programme</p>
              <p className="mt-1 font-display text-2xl font-extrabold">Muscle &amp; Force</p>
              <p className="mt-1 text-sm text-chalk-dim">
                {d.daysAvailable} séances par semaine · {d.sessionMinutes} min · progression automatique
              </p>
            </div>
            <div className="grid grid-cols-2 divide-x divide-white/[.06] border-t border-white/[.06]">
              {DEFAULT_PROGRAM.days.slice(0, 4).map((day) => (
                <div key={day.id} className="border-b border-white/[.06] p-4">
                  <p className="text-[11px] text-chalk-mute">Jour {day.index}</p>
                  <p className="text-sm font-semibold">{day.name}</p>
                  <p className="text-xs text-ember-300/80">{day.focus}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Nutrition estimée</p>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              {[
                { l: "kcal", v: targets.kcal },
                { l: "Prot.", v: `${targets.prot} g` },
                { l: "Gluc.", v: `${targets.carbs} g` },
                { l: "Lip.", v: `${targets.fat} g` },
              ].map((x) => (
                <div key={x.l} className="rounded-2xl bg-white/[.04] py-3">
                  <p className="num font-display text-lg font-bold">{x.v}</p>
                  <p className="text-[11px] text-chalk-mute">{x.l}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-chalk-mute">
              Maintenance estimée à {targets.maintenance} kcal, surplus de {targets.surplus > 0 ? "+" : ""}
              {targets.surplus} kcal.
            </p>
          </Card>

          <InfoNote tone="warn">{SAFETY.estimateDisclaimer}</InfoNote>
        </div>
      ),
    },
  ];

  const last = step === steps.length - 1;
  const current = steps[step];

  const finish = (withDemo: boolean) => {
    const profile: Profile = { ...d, createdAt: new Date().toISOString() };
    if (withDemo) {
      const demo = buildDemoData(profile);
      importDemo({ ...demo, profile });
    } else {
      setProfile(profile);
    }
    router.push("/");
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-6 pt-4">
      <div className="mb-6 flex items-center gap-3">
        {step > 0 ? (
          <button onClick={() => setStep((s) => s - 1)} className="tap grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 text-chalk-dim" aria-label="Retour">
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
        {last ? (
          <div className="space-y-2.5">
            <Button size="xl" full icon="play" onClick={() => finish(false)}>
              Commencer
            </Button>
            <button onClick={() => finish(true)} className="tap w-full text-center text-[13px] text-chalk-mute underline underline-offset-4">
              Démarrer avec 6 semaines d&apos;historique de démonstration
            </button>
          </div>
        ) : (
          <Button size="xl" full iconRight="right" disabled={current.valid === false} onClick={() => setStep((s) => s + 1)}>
            Continuer
          </Button>
        )}
      </div>
    </div>
  );
}

function labelOf(m: MuscleId) {
  const map: Record<string, string> = {
    pectoraux: "Pectoraux",
    dorsaux: "Dorsaux",
    trapezes: "Trapèzes",
    "deltoide-ant": "Épaules avant",
    "deltoide-lat": "Épaules côté",
    "deltoide-post": "Épaules arrière",
    biceps: "Biceps",
    triceps: "Triceps",
    "avant-bras": "Avant-bras",
    abdominaux: "Abdos",
    obliques: "Obliques",
    lombaires: "Lombaires",
    fessiers: "Fessiers",
    quadriceps: "Quadriceps",
    ischios: "Ischios",
    adducteurs: "Adducteurs",
    mollets: "Mollets",
  };
  return map[m] ?? m;
}
