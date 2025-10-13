// web/app/admin/orders/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPaise } from "@/lib/money";
import type { Prisma } from "@prisma/client";

/* --------- auth --------- */
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session as unknown as { role?: string })?.role;
  if (!session || role !== "admin") redirect("/login");
}

/* --------- types --------- */

type Status = "pending" | "paid" | "failed" | "refunded";

type OrderRow = Prisma.ordersGetPayload<{
  include: { product: { select: { name: true } } };
}>;

type OrderListItem = {
  id: string;
  order_number: string;
  created_at: Date;
  customer_name: string;
  user_email: string;
  product_name: string | null;
  size_label: string;
  quantity: number;
  total_paise: number;
  payment_status: Status;
};

function toListItem(r: OrderRow): OrderListItem {
  return {
    id: r.id,
    order_number: r.order_number,
    created_at: r.created_at,
    customer_name: r.customer_name,
    user_email: r.user_email,
    product_name: r.product?.name ?? null,
    size_label: r.size_label,
    quantity: Number(r.quantity),
    total_paise: Number(r.total_paise),
    payment_status: r.payment_status as Status,
  };
}

/* --------- page --------- */

export default async function OrdersAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const sp = await searchParams;
  const err = Array.isArray(sp.err) ? sp.err[0] : sp.err;
  const ok = Array.isArray(sp.ok) ? sp.ok[0] : sp.ok;
  const statusFilterRaw = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const statusFilter = (statusFilterRaw?.toLowerCase() ?? "") as Status | "";

  const rows = (await prisma.orders.findMany({
    where:
      statusFilter && (["pending", "paid", "failed", "refunded"] as const).includes(
        statusFilter as Status,
      )
        ? { payment_status: statusFilter as Status }
        : undefined,
    orderBy: { created_at: "desc" },
    include: { product: { select: { name: true } } },
  })) as OrderRow[];

  const list = rows.map(toListItem);

  return (
    <main className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Link className="underline" href="/admin">
          ← Admin
        </Link>
      </div>

      {ok ? <div className="rounded border p-3 bg-green-50 text-green-700">Saved ✓</div> : null}
      {err ? <div className="rounded border p-3 bg-red-50 text-red-700">{err}</div> : null}

      <form className="flex items-center gap-2">
        <label className="text-sm text-gray-700">Filter:</label>
        <select
          name="status"
          defaultValue={statusFilter || ""}
          className="border rounded-lg p-2 text-sm"
        >
          <option value="">All</option>
          <option value="pending">pending</option>
          <option value="paid">paid</option>
          <option value="failed">failed</option>
          <option value="refunded">refunded</option>
        </select>
        <button className="border rounded-lg px-3 py-2 text-sm">Apply</button>
      </form>

      {list.length === 0 ? (
        <p className="text-gray-600">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <table className="min-w-[800px] w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left p-3">Order #</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Product</th>
                <th className="text-left p-3">Size</th>
                <th className="text-right p-3">Qty</th>
                <th className="text-right p-3">Total</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3 font-mono">{o.order_number}</td>
                  <td className="p-3">{o.created_at.toLocaleString()}</td>
                  <td className="p-3">
                    <div className="font-medium">{o.customer_name}</div>
                    <div className="text-xs text-gray-600">{o.user_email}</div>
                  </td>
                  <td className="p-3">{o.product_name ?? "—"}</td>
                  <td className="p-3">{o.size_label}</td>
                  <td className="p-3 text-right">{o.quantity}</td>
                  <td className="p-3 text-right">{formatPaise(o.total_paise)}</td>
                  <td className="p-3">
                    <span className="rounded border px-2 py-1 text-xs">{o.payment_status}</span>
                  </td>
                  <td className="p-3">
                    <Link className="underline" href={`/admin/orders/${o.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
