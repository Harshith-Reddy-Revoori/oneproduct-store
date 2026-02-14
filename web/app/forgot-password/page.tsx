"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import styles from "@/components/Auth.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    await fetch("/api/auth/password/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setMsg("If that email exists, we sent a reset link.");
  }

  return (
    <div className={`${styles.authTheme} ${styles.authWrap}`}>
      <form onSubmit={onSubmit} className={styles.card}>
        <h1 className={styles.title}>Forgot password</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className={styles.input}
        />
        <button type="submit" className={styles.submit}>Send reset link</button>
        <div className={styles.linkRow}>
          <Link href="/login" className={styles.link}>Back to login</Link>
        </div>
        {msg && <p className={styles.success}>{msg}</p>}
      </form>
    </div>
  );
}
