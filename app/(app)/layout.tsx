import type { ReactNode } from "react";
import { BottomNav, Gate, ServiceWorker } from "@/components/AppShell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ServiceWorker />
      <Gate>{children}</Gate>
      <BottomNav />
    </>
  );
}
