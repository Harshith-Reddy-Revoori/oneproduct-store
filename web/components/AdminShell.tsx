"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminSignOutButton from "@/app/admin/SignOutButton";
import styles from "@/components/Admin.module.css";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/product", label: "Product" },
    { href: "/admin/sizes", label: "Sizes" },
    { href: "/admin/coupons", label: "Coupons" },
    { href: "/admin/orders", label: "Orders" },
  ];

  return (
    <div className={styles.adminRoot}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>Admin</div>
        <nav className={styles.sidebarNav} aria-label="Admin">
          {navItems.map(({ href, label }) => {
            const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className={styles.sidebarFooter}>
          <AdminSignOutButton className={styles.signOutBtn} />
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
