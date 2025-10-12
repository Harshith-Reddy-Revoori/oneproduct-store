// web/app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  if (!session || role !== "admin") redirect("/login");

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <Link href="/admin/product" className="underline">
            Product
          </Link>
        </li>
        <li>
          <Link href="/admin/sizes" className="underline">
            Sizes
          </Link>
        </li>
        <li>
          <Link href="/admin/coupons" className="underline">
            Coupons
          </Link>
        </li>
      </ul>
    </main>
  );
}
