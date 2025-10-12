"use client";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", { password, redirect: false });
    if (res?.ok) window.location.href = "/admin";
    else setError("Invalid password");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border rounded-2xl p-6">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <input
          type="password"
          className="w-full border rounded-lg p-3"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error ? <p className="text-red-600 text-sm">{error}</p> : null}
        <button className="w-full rounded-xl p-3 font-semibold border">Sign in</button>
      </form>
    </main>
  );
}

