"use client";
import { useState, FormEvent } from "react";

export default function SignUpPage() {
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [msg, setMsg] = useState<string | null>(null);

async function onSubmit(e: FormEvent) {
e.preventDefault();
setMsg(null);
const res = await fetch("/api/auth/signup", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ name, email, password }),
});
const data = await res.json();
if (data.ok) setMsg("Account created! You can log in now.");
else setMsg(data.error || "Could not sign up");
}

return (
<form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 360 }}>
<h1>Create account</h1>
<input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} required />
<input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
<input type="password" placeholder="Password (min 8)" value={password} onChange={(e)=>setPassword(e.target.value)} required />
<button type="submit">Sign up</button>
{msg && <p>{msg}</p>}
</form>
);
}