"use client";
import { useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";

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

  if (!token) return <p className="p-6">Missing token.</p>;

  return (
    <form onSubmit={onSubmit} className="grid gap-2 max-w-sm p-6">
      <h1 className="text-xl font-semibold">Reset password</h1>
      <input
        type="password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        placeholder="New password"
        className="border rounded p-3"
        required
      />
      <button type="submit" className="border rounded-xl p-3 font-semibold">
        Update password
      </button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
