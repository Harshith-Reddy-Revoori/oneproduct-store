"use client";
import { useState, FormEvent } from "react";

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
<form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 360 }}>
<h1>Forgot password</h1>
<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" required />
<button type="submit">Send reset link</button>
{msg && <p>{msg}</p>}
</form>
);
}