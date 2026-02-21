"use client";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import styles from "@/components/Auth.module.css";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("admin", { email, password, redirect: false });
    if (res?.ok) {
      window.location.href = "/admin";
    } else {
      setError("Invalid email or password");
    }
  }

  return (
    <div className={`${styles.authTheme} ${styles.authWrap}`}>
      <form onSubmit={onSubmit} className={styles.card}>
        <h1 className={styles.title}>Log in</h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className={styles.input}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className={styles.input}
        />

        <button type="submit" className={styles.submit}>
          Sign in
        </button>

        <div className={styles.linkRow}>
          <Link href="/" className={styles.link}>
            Back to store
          </Link>
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}
      </form>
    </div>
  );
}
