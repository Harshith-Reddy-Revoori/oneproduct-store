"use client";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import styles from "@/components/Auth.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"customer" | "admin">("customer");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const provider = mode === "admin" ? "admin" : "credentials";
    const res = await signIn(provider, { email, password, redirect: false });
    if (res?.ok) {
      window.location.href = mode === "admin" ? "/admin" : "/";
    } else {
      setError("Invalid email or password");
    }
  }

  return (
    <div className={`${styles.authTheme} ${styles.authWrap}`}>
      <form onSubmit={onSubmit} className={styles.card}>
        <h1 className={styles.title}>Log in</h1>

        <div className={styles.modeRow}>
          <button
            type="button"
            onClick={() => setMode("customer")}
            aria-pressed={mode === "customer"}
            className={styles.modeBtn}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setMode("admin")}
            aria-pressed={mode === "admin"}
            className={styles.modeBtn}
          >
            Admin
          </button>
        </div>

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

        <button type="submit" className={styles.submit}>Sign in</button>

        <div className={styles.linkRow}>
          <a href="/forgot-password" className={styles.link}>Forgot password?</a>
          <a href="/signup" className={styles.link}>Create an account</a>
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}
      </form>
    </div>
  );
}
