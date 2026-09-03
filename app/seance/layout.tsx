import type { ReactNode } from "react";
import { Gate } from "@/components/AppShell";

/** Mode séance : pas de navigation basse, mais la même garde d'hydratation. */
export default function SeanceLayout({ children }: { children: ReactNode }) {
  return <Gate>{children}</Gate>;
}
