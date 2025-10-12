"use client";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="border rounded-xl px-4 py-2"
    >
      Sign out
    </button>
  );
}
