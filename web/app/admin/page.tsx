// web/app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session as unknown as { role?: string })?.role;
  if (!session || role !== "admin") redirect("/login");
}

export default async function AdminIndexPage() {
  await requireAdmin();

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Admin</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link className="rounded-xl border p-6 hover:shadow" href="/admin/product">
          Product
        </Link>
        <Link className="rounded-xl border p-6 hover:shadow" href="/admin/sizes">
          Sizes
        </Link>
        <Link className="rounded-xl border p-6 hover:shadow" href="/admin/coupons">
          Coupons
        </Link>
        <Link className="rounded-xl border p-6 hover:shadow" href="/admin/orders">
          Orders
        </Link>
      </div>
    </main>
  );
}
