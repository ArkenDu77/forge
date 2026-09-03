import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Motion } from "@/components/Motion";

const display = Archivo({ variable: "--font-display", subsets: ["latin"], weight: ["600", "700", "800", "900"] });
const sans = Inter({ variable: "--font-sans-var", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono-var", subsets: ["latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "Forge — Coach musculation",
  description: "Ton programme de prise de masse et de force, guidé séance après séance.",
  applicationName: "Forge",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Forge" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#06070a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Motion>{children}</Motion>
      </body>
    </html>
  );
}
