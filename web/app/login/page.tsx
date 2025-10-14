// "use client";
// import { FormEvent, useState } from "react";
// import { signIn } from "next-auth/react";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   async function onSubmit(e: FormEvent) {
//     e.preventDefault();
//     setError("");
//     const res = await signIn("credentials", { email, password, redirect: false });
//     if (res?.ok) window.location.href = "/admin";
//     else setError("Invalid email or password");
//   }

//   return (
//     <form onSubmit={onSubmit}>
//       <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
//       <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
//       <button type="submit">Sign in</button>
//       {error ? <p>{error}</p> : null}
//     </form>
//   );
// }

"use client";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [mode, setMode] = useState<"customer"|"admin">("customer");

async function onSubmit(e: FormEvent) {
e.preventDefault();
setError("");
const provider = mode === "admin" ? "admin" : "credentials";
const res = await signIn(provider, { email, password, redirect: false });

if (res?.ok) {
// route based on role; your admin area lives at /admin
window.location.href = mode === "admin" ? "/admin" : "/";
} else {
setError("Invalid email or password");
}
}

return (
<form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 360 }}>
<h1>Log in</h1>
<div style={{ display: "flex", gap: 8 }}>
<button type="button" onClick={()=>setMode("customer")} aria-pressed={mode==="customer"}>Customer</button>
<button type="button" onClick={()=>setMode("admin")} aria-pressed={mode==="admin"}>Admin</button>
</div>
<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" required />
<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" required />
<button type="submit">Sign in</button>
<a href="/forgot-password">Forgot password?</a>
<a href="/signup">Create an account</a>
{error ? <p>{error}</p> : null}
</form>
);
}