// web/app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "@/components/Admin.module.css";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session as unknown as { role?: string })?.role;
  if (!session || role !== "admin") redirect("/admin/login");
}

export default async function AdminIndexPage() {
  await requireAdmin();

  return (
    <>
      <h1 className={styles.pageTitle}>Admin</h1>
      <div className={styles.cardGrid}>
        <Link className={styles.dashCard} href="/admin/product">
          Product
        </Link>
        <Link className={styles.dashCard} href="/admin/sizes">
          Sizes
        </Link>
        <Link className={styles.dashCard} href="/admin/coupons">
          Coupons
        </Link>
        <Link className={styles.dashCard} href="/admin/orders">
          Orders
        </Link>
      </div>
    </>
  );
}
