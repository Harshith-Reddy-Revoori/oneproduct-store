import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JVINCHU",
  description: "A clean, fast storefront",
  metadataBase: new URL("http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      {/* make body a flex column that fills the screen */}
      <body className={`${inter.className} min-h-dvh flex flex-col bg-white text-gray-900 antialiased`}>
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
