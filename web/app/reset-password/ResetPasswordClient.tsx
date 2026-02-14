"use client";

import { useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";
import Link from "next/link";
import styles from "@/components/Auth.module.css";

export default function ResetPasswordClient() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/auth/password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (data.ok) setMsg("Password reset! You can log in now.");
    else setMsg(data.error || "Could not reset password");
  }

  if (!token) {
    return (
      <div className={`${styles.authTheme} ${styles.authWrap}`}>
        <div className={styles.card}>
          <p className={styles.error}>Invalid or missing reset link.</p>
          <Link href="/forgot-password" className={styles.link}>Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.authTheme} ${styles.authWrap}`}>
      <form onSubmit={onSubmit} className={styles.card}>
        <h1 className={styles.title}>Reset password</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password (min 8 characters)"
          minLength={8}
          className={styles.input}
          required
        />
        <button type="submit" className={styles.submit}>Update password</button>
        <div className={styles.linkRow}>
          <Link href="/login" className={styles.link}>Back to login</Link>
        </div>
        {msg && (
          <p className={msg.startsWith("Password reset") ? styles.success : styles.error}>{msg}</p>
        )}
      </form>
    </div>
  );
}
