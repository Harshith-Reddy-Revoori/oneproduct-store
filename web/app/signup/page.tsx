// app/signup/page.tsx
"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import styles from "@/components/Auth.module.css";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setOk(false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.ok) {
        setOk(true);
        setMsg("Account created! You can log in now.");
        setName(""); setEmail(""); setPassword(""); setAgree(false);
      } else {
        setMsg(data.error || "Could not sign up");
      }
    } catch {
      setMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authTheme}>
      <div className={styles.authWrap}>
        <form onSubmit={onSubmit} className={styles.card} noValidate>
          <h1 className={styles.title}>Create account</h1>

          <div className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>Full name</label>
              <input
                id="name"
                className={styles.input}
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.inputWrap}>
                <input
                  id="password"
                  className={styles.input}
                  type={showPwd ? "text" : "password"}
                  placeholder="At least 8 characters"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.showBtn}
                  onClick={() => setShowPwd((s) => !s)}
                  aria-pressed={showPwd}
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
              <p className={styles.hint}>Use 8+ characters with a mix of letters & numbers.</p>
            </div>

            <label className={styles.termsRow}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                required
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className={styles.link}>Terms</Link> and{" "}
                <Link href="/privacy" className={styles.link}>Privacy Policy</Link>.
              </span>
            </label>
          </div>

          {msg && (
            <p className={ok ? styles.success : styles.error} role="status" aria-live="polite">
              {msg}
            </p>
          )}

          <div className={styles.actions}>
            <button className={styles.submit} type="submit" disabled={loading || !agree}>
              {loading ? "Creating..." : "Sign up"}
            </button>
            <div className={styles.linkRow}>
              <span>Already have an account? <Link href="/login" className={styles.link}>Log in</Link></span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
