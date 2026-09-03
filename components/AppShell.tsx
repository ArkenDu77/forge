"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { Icon } from "./ui/Icon";
import { cx, Skeleton } from "./ui/primitives";
import { useApp } from "@/lib/store";

const TABS = [
  { href: "/", label: "Accueil", icon: "home" },
  { href: "/programme", label: "Programme", icon: "dumbbell" },
  { href: "/nutrition", label: "Nutrition", icon: "nutrition" },
  { href: "/progression", label: "Progression", icon: "chart" },
  { href: "/profil", label: "Profil", icon: "user" },
];

export function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-ink-950/80 backdrop-blur-2xl"
      style={{ paddingBottom: "var(--safe-b)" }}
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-1.5">
        {TABS.map((t) => {
          const active = isActive(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cx(
                "tap relative flex min-w-[62px] flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-medium transition-colors",
                active ? "text-ember-400" : "text-chalk-mute hover:text-chalk-dim"
              )}
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <motion.span
                  layoutId="tab-glow"
                  className="absolute inset-0 rounded-2xl bg-ember-500/10"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon name={t.icon} size={21} className="relative z-10" />
              <span className="relative z-10">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Attend l'hydratation du store avant de rendre : évite tout flash et tout mismatch SSR. */
export function Gate({ children, skeleton }: { children: ReactNode; skeleton?: ReactNode }) {
  const hydrated = useApp((s) => s.hydrated);
  const profile = useApp((s) => s.profile);
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !profile) router.replace("/onboarding");
  }, [hydrated, profile, router]);

  if (!hydrated || !profile)
    return (
      <div className="mx-auto w-full max-w-lg space-y-4 px-4 pt-6">
        {skeleton ?? (
          <>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-44 w-full rounded-3xl" />
            <Skeleton className="h-28 w-full rounded-3xl" />
            <Skeleton className="h-28 w-full rounded-3xl" />
          </>
        )}
      </div>
    );

  return <>{children}</>;
}

export function Page({
  children,
  className,
  wide,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cx("mx-auto w-full px-4 pb-28 pt-5", wide ? "max-w-3xl" : "max-w-lg", className)}
    >
      {children}
    </motion.main>
  );
}

export function TopBar({
  title,
  subtitle,
  back,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  back?: string;
  action?: ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="mb-5 flex items-center gap-3">
      {back !== undefined && (
        <button
          onClick={() => (back ? router.push(back) : router.back())}
          className="tap -ml-1 grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[.04] text-chalk-dim hover:text-chalk"
          aria-label="Retour"
        >
          <Icon name="left" size={19} />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-[22px] font-extrabold leading-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 truncate text-[13px] text-chalk-mute">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function ServiceWorker() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
