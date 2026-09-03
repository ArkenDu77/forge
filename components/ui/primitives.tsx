"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/* ---------------- Surfaces ---------------- */

export function Card({
  className,
  children,
  as = "div",
  ...rest
}: { className?: string; children: ReactNode; as?: "div" | "section" | "article" } & ComponentProps<"div">) {
  const Tag = as;
  return (
    <Tag className={cx("glass rounded-3xl", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-mute">{children}</h2>
      {action}
    </div>
  );
}

/* ---------------- Boutons ---------------- */

type ButtonProps = {
  variant?: "primary" | "ghost" | "outline" | "danger" | "surface";
  size?: "sm" | "md" | "lg" | "xl";
  icon?: string;
  iconRight?: string;
  full?: boolean;
  children?: ReactNode;
  className?: string;
  href?: string;
} & Omit<ComponentProps<"button">, "ref">;

const VARIANTS = {
  primary:
    "bg-gradient-to-br from-ember-400 to-ember-600 text-ink-950 font-semibold shadow-[0_10px_30px_-10px_rgba(255,107,44,.75)] hover:brightness-110 active:brightness-95",
  surface: "glass-strong text-chalk hover:bg-white/10",
  outline: "border border-white/15 text-chalk hover:bg-white/5",
  ghost: "text-chalk-dim hover:text-chalk hover:bg-white/5",
  danger: "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/20",
};

const SIZES = {
  sm: "h-9 px-3.5 text-[13px] rounded-xl gap-1.5",
  md: "h-11 px-4 text-sm rounded-2xl gap-2",
  lg: "h-14 px-6 text-[15px] rounded-2xl gap-2.5",
  xl: "h-16 px-7 text-base rounded-[22px] gap-3",
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  full,
  children,
  className,
  href,
  ...rest
}: ButtonProps) {
  const cls = cx(
    "tap inline-flex select-none items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none active:scale-[.97]",
    VARIANTS[variant],
    SIZES[size],
    full && "w-full",
    className
  );
  const inner = (
    <>
      {icon && <Icon name={icon} size={size === "xl" ? 22 : size === "lg" ? 20 : 17} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "xl" ? 22 : 18} />}
    </>
  );
  if (href)
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  return (
    <button className={cls} {...rest}>
      {inner}
    </button>
  );
}

/* ---------------- Chips & segments ---------------- */

export function Chip({
  active,
  children,
  onClick,
  icon,
  className,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  icon?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "tap inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-all active:scale-95",
        active
          ? "border-ember-500/60 bg-ember-500/15 text-ember-300"
          : "border-white/10 bg-white/[.03] text-chalk-dim hover:text-chalk",
        className
      )}
    >
      {icon && <Icon name={icon} size={15} />}
      {children}
    </button>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string; hint?: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cx("flex gap-1 rounded-2xl border border-white/10 bg-white/[.03] p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cx(
            "tap relative flex-1 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
            value === o.value ? "text-ink-950" : "text-chalk-dim hover:text-chalk"
          )}
        >
          {value === o.value && (
            <motion.span
              layoutId={`seg-${options.map((x) => x.value).join()}`}
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-ember-400 to-ember-600"
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            />
          )}
          <span className="relative z-10">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------------- Data display ---------------- */

export function Stat({
  label,
  value,
  unit,
  hint,
  accent,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-chalk-mute">{label}</p>
      <p className={cx("num mt-1 font-display text-2xl font-extrabold leading-none", accent && "text-gradient-ember")}>
        {value}
        {unit && <span className="ml-1 text-sm font-semibold text-chalk-dim">{unit}</span>}
      </p>
      {hint && <p className="mt-1 text-xs text-chalk-mute">{hint}</p>}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  icon,
}: {
  children: ReactNode;
  tone?: "neutral" | "ember" | "volt" | "violet" | "danger";
  icon?: string;
}) {
  const tones = {
    neutral: "bg-white/[.06] text-chalk-dim border-white/10",
    ember: "bg-ember-500/12 text-ember-300 border-ember-500/25",
    volt: "bg-volt-500/12 text-volt-400 border-volt-500/25",
    violet: "bg-violet-glow/12 text-violet-glow border-violet-glow/25",
    danger: "bg-danger/12 text-danger border-danger/25",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        tones[tone]
      )}
    >
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        "animate-shimmer rounded-2xl bg-[linear-gradient(90deg,rgba(255,255,255,.04),rgba(255,255,255,.10),rgba(255,255,255,.04))] bg-[length:200%_100%]",
        className
      )}
    />
  );
}

export function EmptyState({
  icon = "spark",
  title,
  body,
  action,
}: {
  icon?: string;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center px-6 py-10 text-center">
      <div className="relative mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-ember-400/20 to-violet-glow/10">
        <span className="absolute inset-0 animate-pulse-ring rounded-3xl border border-ember-500/30" />
        <Icon name={icon} size={26} className="text-ember-300" />
      </div>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="mt-1.5 max-w-[34ch] text-sm text-chalk-dim">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

/* ---------------- Accordéon ---------------- */

export function Accordion({
  title,
  children,
  icon,
  defaultOpen = false,
  tone,
}: {
  title: ReactNode;
  children: ReactNode;
  icon?: string;
  defaultOpen?: boolean;
  tone?: "danger";
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[.02]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="tap flex w-full items-center gap-3 px-4 py-3.5 text-left"
        aria-expanded={open}
      >
        {icon && <Icon name={icon} size={18} className={tone === "danger" ? "text-danger" : "text-ember-400"} />}
        <span className="flex-1 text-sm font-semibold">{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }} className="text-chalk-mute">
          <Icon name="down" size={17} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-4 pb-4 text-sm text-chalk-dim">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Bottom sheet ---------------- */

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            aria-label="Fermer"
            className="absolute inset-0 bg-ink-950/75 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="glass-strong relative z-10 max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-[28px] pb-[calc(20px+var(--safe-b))] sm:rounded-[28px] sm:pb-6"
          >
            <div className="sticky top-0 z-10 flex items-center gap-3 rounded-t-[28px] bg-gradient-to-b from-ink-900/95 to-ink-900/60 px-5 pb-3 pt-4 backdrop-blur-xl">
              <span className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/20 sm:hidden" />
              {title && <h3 className="flex-1 font-display text-lg font-bold">{title}</h3>}
              <button onClick={onClose} className="tap ml-auto rounded-full p-2 text-chalk-mute hover:bg-white/10" aria-label="Fermer">
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="px-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Divers ---------------- */

export function Pill({ children }: { children: ReactNode }) {
  return <span className="rounded-lg bg-white/[.06] px-2 py-0.5 text-[11px] font-semibold text-chalk-dim">{children}</span>;
}

export function InfoNote({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "warn" }) {
  return (
    <p
      className={cx(
        "flex gap-2.5 rounded-2xl border px-3.5 py-3 text-[12.5px] leading-relaxed",
        tone === "warn"
          ? "border-ember-500/25 bg-ember-500/[.07] text-ember-300/90"
          : "border-white/8 bg-white/[.03] text-chalk-mute"
      )}
    >
      <Icon name={tone === "warn" ? "alert" : "info"} size={15} className="mt-px shrink-0" />
      <span>{children}</span>
    </p>
  );
}
