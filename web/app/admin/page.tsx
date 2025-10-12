// web/app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "./SignOutButton";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  if (!session || role !== "admin") redirect("/login");

  return (
    <main className="p-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>
        <SignOutButton />
      </header>

      <p className="text-sm text-gray-600">
        You're logged in as <b>admin</b>.
      </p>

      <nav>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Link href="/admin/product" className="underline">
              Product
            </Link>
          </li>
          {/* Coming next:
          <li><Link href="/admin/sizes" className="underline">Sizes</Link></li>
          <li><Link href="/admin/coupons" className="underline">Coupons</Link></li>
          <li><Link href="/admin/orders" className="underline">Orders</Link></li>
          */}
        </ul>
      </nav>
    </main>
  );
}

