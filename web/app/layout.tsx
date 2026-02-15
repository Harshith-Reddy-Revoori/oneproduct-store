import "./globals.css";
import type { Metadata } from "next";
import { Inter, Syne, Orbitron } from "next/font/google";
import Providers from "./providers";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const inter = Inter({ subsets: ["latin"] });
const syne = Syne({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-hero" });
const orbitron = Orbitron({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-orbitron" });

export const metadata: Metadata = {
  title: "OOKA | Sweetness that fits your life",
  description: "Zero Sugar, Zero Cavities. OOKA Monk Fruit Allulose Sweetener — natural sweetness without the guilt.",
  metadataBase: new URL("http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${inter.className} ${syne.variable} ${orbitron.variable} min-h-dvh flex flex-col antialiased`} style={{ background: "var(--cream)", color: "var(--ink)" }}>
        <SiteHeader />

        {/* main grows to fill leftover space so the footer sits at the bottom */}
        <main className="flex-1 pt-[var(--nav-h,64px)]">
          <Providers>{children}</Providers>
        </main>

        <SiteFooter />
      </body>
    </html>
  );
}
