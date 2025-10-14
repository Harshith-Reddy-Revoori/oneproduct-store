import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/account")}`);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, padding: 24 }}>
      <aside style={{ display: "grid", gap: 8 }}>
        <strong>My account</strong>
        <Link href="/account">Overview</Link>
        <Link href="/account/orders">Orders</Link>
        {/* add Profile, Addresses, etc. later */}
      </aside>
      <main>{children}</main>
    </div>
  );
}
