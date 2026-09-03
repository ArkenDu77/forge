"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { cx } from "./primitives";

const TONES: Record<string, [string, string]> = {
  ember: ["#ffc48a", "#ff6b2c"],
  volt: ["#a8f5d5", "#34d399"],
  cyan: ["#a5e8ff", "#38bdf8"],
  violet: ["#c4b1ff", "#8b5cf6"],
  chalk: ["#e8edf5", "#9aa6bb"],
};

/** Compteur animé — la valeur monte, jamais un simple affichage brut. */
export function Counter({
  value,
  decimals = 0,
  className,
  suffix,
  from = 0,
}: {
  value: number;
  decimals?: number;
  className?: string;
  suffix?: string;
  /** valeur de départ de l'animation (0 par défaut) */
  from?: number;
}) {
  const mv = useMotionValue(from);
  const spring = useSpring(mv, { stiffness: 90, damping: 20, mass: 0.6 });
  const text = useTransform(spring, (v) =>
    new Intl.NumberFormat("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v)
  );
  useEffect(() => {
    mv.set(value);
  }, [value, mv]);
  return (
    <span className={cx("num", className)}>
      <motion.span>{text}</motion.span>
      {suffix}
    </span>
  );
}

export function ProgressBar({
  value,
  tone = "ember",
  className,
  height = 8,
  delay = 0,
}: {
  value: number;
  tone?: keyof typeof TONES;
  className?: string;
  height?: number;
  delay?: number;
}) {
  const [c1, c2] = TONES[tone];
  return (
    <div
      className={cx("w-full overflow-hidden rounded-full bg-white/[.07]", className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 84,
  stroke = 8,
  tone = "ember",
  children,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: keyof typeof TONES;
  children?: ReactNode;
  label?: string;
}) {
  const [c1, c2] = TONES[tone];
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const id = `ring-${tone}-${size}`;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-label={label}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.08)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - Math.min(1, Math.max(0, value))) }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

/** Points de séances : ●●●○ */
export function Dots({ total, done, tone = "ember" }: { total: number; done: number; tone?: keyof typeof TONES }) {
  const [, c2] = TONES[tone];
  return (
    <div className="flex items-center gap-1.5" aria-label={`${done} séances sur ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05 * i, type: "spring", stiffness: 400, damping: 22 }}
          className="h-2.5 w-2.5 rounded-full"
          style={{
            background: i < done ? c2 : "rgba(255,255,255,.12)",
            boxShadow: i < done ? `0 0 12px ${c2}66` : undefined,
          }}
        />
      ))}
    </div>
  );
}

export function MacroBar({
  label,
  value,
  target,
  unit,
  tone,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  tone: keyof typeof TONES;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[12px] font-medium text-chalk-dim">{label}</span>
        <span className="num text-[12px] text-chalk-mute">
          <span className="font-semibold text-chalk">{Math.round(value)}</span> / {Math.round(target)} {unit}
        </span>
      </div>
      <ProgressBar value={target ? value / target : 0} tone={tone} height={7} />
    </div>
  );
}
