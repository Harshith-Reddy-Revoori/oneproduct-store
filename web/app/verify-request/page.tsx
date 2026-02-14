import Link from "next/link";
import styles from "@/components/Auth.module.css";

export default function VerifyRequest() {
  return (
    <div className={`${styles.authTheme} ${styles.authWrap}`}>
      <div className={styles.card} style={{ textAlign: "center" }}>
        <h1 className={styles.title}>Check your email</h1>
        <p style={{ color: "var(--ink-2)", margin: "0 0 16px" }}>
          We&apos;ve sent you a sign-in link. Open it on this device to continue.
        </p>
        <Link href="/login" className={styles.link}>Back to login</Link>
      </div>
    </div>
  );
}
