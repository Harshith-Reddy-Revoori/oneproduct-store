// web/app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import SignOutButton from "./SignOutButton";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  if (!session || role !== "admin") redirect("/login");

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <p>You're logged in as <b>admin</b>.</p>
      <SignOutButton />
    </main>
  );
}
