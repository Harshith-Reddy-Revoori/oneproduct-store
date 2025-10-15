import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import styles from "@/components/Account.module.css";

export default async function AccountHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login?callbackUrl=/account");

  return (
    <div className={styles.pageWrap}>
      <h1 className={styles.pageTitle}>
        Welcome{session.user?.name ? `, ${session.user.name}` : ""}!
      </h1>
      <p className={styles.muted}>Use the sidebar to view your orders.</p>
    </div>
  );
}
