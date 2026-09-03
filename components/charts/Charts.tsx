"use client";

import { motion } from "motion/react";
import { useId, useState } from "react";
import { cx } from "@/components/ui/primitives";

const TONES: Record<string, [string, string]> = {
  ember: ["#ffc48a", "#ff6b2c"],
  volt: ["#a8f5d5", "#34d399"],
  cyan: ["#a5e8ff", "#38bdf8"],
  violet: ["#c4b1ff", "#8b5cf6"],
};

export type Point = { label: string; value: number };

const W = 320;
const H = 130;
const PAD = { l: 6, r: 6, t: 10, b: 18 };

function scale(points: Point[]) {
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || Math.max(1, max * 0.1);
  const lo = min - span * 0.18;
  const hi = max + span * 0.18;
  const x = (i: number) =>
    PAD.l + (i / Math.max(1, points.length - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => H - PAD.b - ((v - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
  return { x, y, min, max };
}

/** Courbe lissée + aire dégradée, tracé animé. */
export function LineChart({
  points,
  tone = "ember",
  format = (v: number) => String(Math.round(v * 10) / 10),
  className,
  showDots = true,
}: {
  points: Point[];
  tone?: keyof typeof TONES;
  format?: (v: number) => string;
  className?: string;
  showDots?: boolean;
}) {
  const uid = useId().replace(/[:_]/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const [c1, c2] = TONES[tone];
  if (points.length < 2)
    return <div className={cx("grid h-32 place-items-center text-xs text-chalk-mute", className)}>Pas encore assez de données</div>;

  const { x, y } = scale(points);
  const d = points
    .map((p, i) => {
      const px = x(i);
      const py = y(p.value);
      if (i === 0) return `M${px},${py}`;
      const prevX = x(i - 1);
      const prevY = y(points[i - 1].value);
      const cx1 = prevX + (px - prevX) / 2;
      return `C${cx1},${prevY} ${cx1},${py} ${px},${py}`;
    })
    .join(" ");
  const area = `${d} L${x(points.length - 1)},${H - PAD.b} L${x(0)},${H - PAD.b} Z`;
  const active = hover ?? points.length - 1;

  return (
    <div className={cx("relative", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 140 }}>
        <defs>
          <linearGradient id={`a-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c2} stopOpacity="0.32" />
            <stop offset="100%" stopColor={c2} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`l-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PAD.l}
            x2={W - PAD.r}
            y1={PAD.t + f * (H - PAD.t - PAD.b)}
            y2={PAD.t + f * (H - PAD.t - PAD.b)}
            stroke="rgba(255,255,255,.05)"
            strokeWidth="1"
          />
        ))}
        <motion.path
          d={area}
          fill={`url(#a-${uid})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.35 }}
        />
        <motion.path
          d={d}
          fill="none"
          stroke={`url(#l-${uid})`}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          vectorEffect="non-scaling-stroke"
        />
        {showDots && (
          <motion.circle
            cx={x(active)}
            cy={y(points[active].value)}
            r="4"
            fill={c2}
            stroke="#0a0c11"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 400 }}
          />
        )}
        {points.map((_, i) => (
          <rect
            key={i}
            x={x(i) - (W / points.length) / 2}
            y={0}
            width={W / points.length}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      <div className="mt-1 flex items-baseline justify-between text-[11px] text-chalk-mute">
        <span>{points[0].label}</span>
        <span className="num rounded-lg bg-white/[.06] px-2 py-0.5 font-semibold text-chalk">
          {format(points[active].value)} <span className="text-chalk-mute">· {points[active].label}</span>
        </span>
        <span>{points[points.length - 1].label}</span>
      </div>
    </div>
  );
}

export function BarChart({
  points,
  tone = "violet",
  format = (v: number) => String(Math.round(v)),
  className,
  goal,
}: {
  points: Point[];
  tone?: keyof typeof TONES;
  format?: (v: number) => string;
  className?: string;
  goal?: number;
}) {
  const [c1, c2] = TONES[tone];
  const max = Math.max(...points.map((p) => p.value), goal ?? 0) || 1;
  return (
    <div className={cx("flex h-36 items-end gap-1.5", className)}>
      {points.map((p, i) => (
        <div key={p.label + i} className="flex flex-1 flex-col items-center gap-1.5">
          <motion.div
            className="relative w-full overflow-hidden rounded-t-lg rounded-b-sm"
            style={{ background: `linear-gradient(180deg, ${c1}, ${c2})` }}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(3, (p.value / max) * 100)}%` }}
            transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            title={format(p.value)}
          />
          <span className="text-[10px] text-chalk-mute">{p.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Sparkline({ values, tone = "volt", className }: { values: number[]; tone?: keyof typeof TONES; className?: string }) {
  const [, c2] = TONES[tone];
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const d = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i / (values.length - 1)) * 60},${18 - ((v - min) / span) * 16}`)
    .join(" ");
  return (
    <svg viewBox="0 0 60 20" className={cx("h-5 w-16", className)}>
      <path d={d} fill="none" stroke={c2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
