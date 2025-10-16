import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import styles from "@/components/Account.module.css";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/account")}`);
  }

  return (
    <div className={`${styles.accountTheme} ${styles.accountGrid}`}>
      <aside className={styles.sidebar}>
        <div className={styles.sideTitle}>My account</div>
        <nav className={styles.sideNav}>
          <Link className={styles.sideLink} href="/account">Overview</Link>
          <Link className={styles.sideLink} href="/account/orders">Orders</Link>
        </nav>
        <SignOutButton className={styles.signOut} />
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
