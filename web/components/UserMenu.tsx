"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function UserMenu() {
  const { data } = useSession();
  const user = data?.user;

  if (!user) {
    return <button onClick={() => signIn(undefined, { callbackUrl: "/account" })}>Sign in</button>;
  }

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <span>{user.name || user.email}</span>
      <Link href="/account">Account</Link>
      <Link href="/account/orders">Orders</Link>
      <button onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button>
    </div>
  );
}
