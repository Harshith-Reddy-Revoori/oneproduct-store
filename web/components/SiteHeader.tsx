"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./Storefront.module.css";

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const jump = (id: string) => {
    setMobileOpen(false);
    const onHome = pathname === "/" || pathname === "/home";
    if (onHome && typeof document !== "undefined") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push(`/#${id}`);
    }
  };

  return (
    <>
      <header className={styles.navbar}>
        <nav className={`${styles.navbarInner} ${styles.container}`}>
          <Link href="/" aria-label="OOKA Home" className={styles.brand} style={{ fontSize: "22px" }}>
            OOKA
          </Link>

          <div className={styles.navLinks} aria-label="Primary">
            <button type="button" onClick={() => jump("daily-favourites")}>Shop</button>
            <button type="button" onClick={() => jump("buy")}>Buy</button>
            <Link href="/reviews">Reviews</Link>
            <Link href="/about">About</Link>
            <Link href="/account">Account</Link>
          </div>

          <button
            className={styles.mobileToggle}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen(v => !v)}
            title="Toggle navigation"
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
        </nav>

        {mobileOpen && (
          <div id="mobile-menu" className={styles.mobileMenu}>
            <div className={styles.container}>
              <button type="button" onClick={() => jump("daily-favourites")}>Shop</button>
              <button type="button" onClick={() => jump("buy")}>Buy</button>
              <Link href="/reviews">Reviews</Link>
              <Link href="/about">About</Link>
              <Link href="/account">Account</Link>
            </div>
          </div>
        )}
      </header>

      {/* spacer so content doesn't sit under the fixed nav */}
      {/* <div aria-hidden className={styles.navbarShim} /> */}
    </>
  );
}
