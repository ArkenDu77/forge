"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Respecte le réglage système « réduire les animations ». */
export function Motion({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
