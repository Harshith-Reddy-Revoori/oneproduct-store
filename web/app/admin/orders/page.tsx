// web/app/admin/orders/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { formatPaise } from "@/lib/money";

/* ---------------- helpers ---------------- */

function toPlain<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === "bigint" ? Number(v) : v))
  );
}

const STATUSES = ["pending", "paid", "failed", "refunded"] as const;
type Status = typeof STATUSES[number];
function isStatus(s: any): s is Status {
  return typeof s === "string" && STATUSES.includes(s as Status);
}

function fmtDate(d: string | Date) {
  // show local date+time in a compact way
  const dt = new Date(d);
  return `${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`;
}

/* ------------- server-guard helpers ------------- */

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  if (!session || role !== "admin") redirect("/login");
}

/* ---------------- server actions ---------------- */

export async function updateOrderStatus(formData: FormData) {
  "use server";
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("payment_status") || "");
  if (!id) redirect("/admin/orders?err=Missing%20id");
  if (!isStatus(status)) redirect("/admin/orders?err=Invalid%20status");

  try {
    await prisma.orders.update({
      where: { id },
      data: { payment_status: status, updated_at: new Date() },
    });
  } catch {
    redirect("/admin/orders?err=Could%20not%20update%20status");
  }

  try {
    revalidatePath("/admin/orders");
  } catch {}
  redirect("/admin/orders?ok=1");
}

export async function saveAdminNote(formData: FormData) {
  "use server";
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const note = String(formData.get("admin_note") || "");
  if (!id) redirect("/admin/orders?err=Missing%20id");

  try {
    await prisma.orders.update({
      where: { id },
      data: { admin_note: note || null, updated_at: new Date() },
    });
  } catch {
    redirect("/admin/orders?err=Could%20not%20save%20note");
  }

  try {
    revalidatePath("/admin/orders");
  } catch {}
  redirect("/admin/orders?ok=1");
}

/* ---------------- page (list) ---------------- */

export default async function OrdersListPage({
  searchParams,
}: {
  // Next.js 15: searchParams is async
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const sp = await searchParams;
  const ok = Array.isArray(sp.ok) ? sp.ok[0] : sp.ok;
  const err = Array.isArray(sp.err) ? sp.err[0] : sp.err;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() || "";
  const status = (Array.isArray(sp.status) ? sp.status[0] : sp.status) || "";

  const where: any = {};
  if (q) {
    where.OR = [
      { order_number: { contains: q, mode: "insensitive" } },
      { user_email: { contains: q, mode: "insensitive" } },
      { customer_name: { contains: q, mode: "insensitive" } },
    ];
  }
  if (isStatus(status)) {
    where.payment_status = status;
  }

  const orders = await prisma.orders.findMany({
    where,
    orderBy: { created_at: "desc" },
    take: 50,
    include: {
      product: { select: { name: true } },
    },
  });

  const list = toPlain(orders);

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Orders</h1>

      {ok ? (
        <div className="rounded-lg border p-3 text-green-700 bg-green-50">Saved ✓</div>
      ) : null}
      {err ? (
        <div className="rounded-lg border p-3 text-red-700 bg-red-50">{err}</div>
      ) : null}

      {/* Filters */}
      <form className="flex flex-wrap gap-3 items-end border rounded-2xl p-4" action="/admin/orders" method="get">
        <label className="block">
          <span className="text-sm font-medium">Search</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Order #, email, or name"
            className="mt-1 border rounded-lg p-3"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Status</span>
          <select name="status" defaultValue={status} className="mt-1 border rounded-lg p-3">
            <option value="">(any)</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <button className="border rounded-xl px-4 py-2 font-semibold">Apply</button>
        <Link href="/admin/orders" className="underline text-sm">Clear</Link>
      </form>

      {/* List */}
      {list.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <div className="grid gap-3">
          {list.map((o: any) => (
            <div
              key={o.id}
              className="grid gap-3 md:grid-cols-[150px_1fr_1fr_110px_120px_220px_auto] items-start border rounded-xl p-3"
            >
              <div className="text-sm text-gray-600">
                <div className="font-mono">{o.order_number}</div>
                <div>{fmtDate(o.created_at)}</div>
              </div>

              <div>
                <div className="font-semibold">{o.customer_name}</div>
                <div className="text-sm text-gray-600">{o.user_email}</div>
                <div className="text-sm">Phone: {o.phone}</div>
              </div>

              <div className="text-sm">
                <div>{o.product?.name || "Product"}</div>
                <div>Size: {o.size_label} • Qty: {o.quantity}</div>
              </div>

              <div className="font-semibold">{formatPaise(o.total_paise)}</div>

              {/* Status update */}
              <form action={updateOrderStatus} className="flex gap-2 items-center">
                <input type="hidden" name="id" value={o.id} />
                <select name="payment_status" defaultValue={o.payment_status} className="border rounded-lg p-2">
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button className="border rounded-xl px-3 py-2 text-sm">Save</button>
              </form>

              {/* Note */}
              <form action={saveAdminNote} className="flex gap-2">
                <input type="hidden" name="id" value={o.id} />
                <input
                  name="admin_note"
                  defaultValue={o.admin_note || ""}
                  placeholder="Admin note"
                  className="border rounded-lg p-2 w-full"
                />
                <button className="border rounded-xl px-3 py-2 text-sm">Save</button>
              </form>

              <div>
                <Link href={`/admin/orders/${o.id}`} className="underline text-sm">View</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
