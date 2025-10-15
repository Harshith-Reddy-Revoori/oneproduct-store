import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers"; // 👈 add this
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "../components/Storefront.module.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JVINCHU",
  description: "A clean, fast storefront",
  metadataBase: new URL("http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-white text-gray-900 antialiased`}>
        <SiteHeader/>
        <Providers>
          {children}
        </Providers>
        <SiteFooter/>
      </body>
    </html>
  );
}
