"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";

export default function AccountLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("email", { email, redirect: false });
    if (res?.ok) setSent(true);
    else setError("Could not send email. Check the address and try again.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-bold">Sign in with your email</h1>

        {sent ? (
          <p className="text-green-700">
            Check your inbox for a sign-in link.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <input
              type="email"
              className="w-full border rounded-lg p-3"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error ? <p className="text-red-600 text-sm">{error}</p> : null}
            <button className="w-full rounded-xl p-3 font-semibold border">Send magic link</button>
          </form>
        )}

        <p className="text-xs text-gray-500">
          Admin? Use the password form at <a href="/login" className="underline">/login</a>.
        </p>
      </div>
    </main>
  );
}
