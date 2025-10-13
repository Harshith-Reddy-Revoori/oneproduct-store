"use client";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.ok) window.location.href = "/admin";
    else setError("Invalid email or password");
  }

  return (
    <form onSubmit={onSubmit}>
      <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
      <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
      <button type="submit">Sign in</button>
      {error ? <p>{error}</p> : null}
    </form>
  );
}

