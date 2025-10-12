// web/app/admin/orders/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { formatPaise } from "@/lib/money";

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

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  if (!session || role !== "admin") redirect("/login");
}

/* actions */

export async function updateOrderStatus(formData: FormData) {
  "use server";
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("payment_status") || "");
  if (!id) redirect("/admin/orders?err=Missing%20id");
  if (!isStatus(status)) redirect(`/admin/orders/${id}?err=Invalid%20status`);

  try {
    await prisma.orders.update({
      where: { id },
      data: { payment_status: status, updated_at: new Date() },
    });
  } catch {
    redirect(`/admin/orders/${id}?err=Could%20not%20update%20status`);
  }

  try { revalidatePath(`/admin/orders/${id}`); } catch {}
  redirect(`/admin/orders/${id}?ok=1`);
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
    redirect(`/admin/orders/${id}?err=Could%20not%20save%20note`);
  }

  try { revalidatePath(`/admin/orders/${id}`); } catch {}
  redirect(`/admin/orders/${id}?ok=1`);
}

/* page */

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const { id } = await params;
  const sp = await searchParams;
  const ok = Array.isArray(sp.ok) ? sp.ok[0] : sp.ok;
  const err = Array.isArray(sp.err) ? sp.err[0] : sp.err;

  const order = await prisma.orders.findUnique({
    where: { id },
    include: { product: { select: { name: true } } },
  });

  if (!order) notFound();

  const o = toPlain(order);

  return (
    <main className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Order {o.order_number}</h1>
        <Link className="underline" href="/admin/orders">← Back to Orders</Link>
      </div>

      {ok ? (
        <div className="rounded-lg border p-3 text-green-700 bg-green-50">Saved ✓</div>
      ) : null}
      {err ? (
        <div className="rounded-lg border p-3 text-red-700 bg-red-50">{err}</div>
      ) : null}

      <section className="rounded-2xl border p-6 grid md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Customer</h2>
          <div>{o.customer_name}</div>
          <div className="text-sm text-gray-600">{o.user_email}</div>
          <div className="text-sm">Phone: {o.phone}</div>
          <div className="text-sm">
            {o.address_line1}
            {o.address_line2 ? `, ${o.address_line2}` : ""}, {o.city}, {o.state} {o.pincode}
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Order</h2>
          <div>Product: {o.product?.name}</div>
          <div>Size: {o.size_label} • Qty: {o.quantity}</div>
          <div>Unit: {formatPaise(o.unit_price_paise)}</div>
          <div>Discount: {formatPaise(o.discount_paise)}</div>
          <div className="font-semibold">Total: {formatPaise(o.total_paise)}</div>
          <div>Status: <b>{o.payment_status}</b></div>
          <div className="text-sm text-gray-600">Provider: {o.payment_provider}</div>
          <div className="text-xs text-gray-500">
            Order ID: {o.provider_order_id || "—"}<br />
            Payment ID: {o.provider_payment_id || "—"}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Update</h2>

        <form action={updateOrderStatus} className="flex gap-2 items-center">
          <input type="hidden" name="id" value={o.id} />
          <select name="payment_status" defaultValue={o.payment_status} className="border rounded-lg p-2">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className="border rounded-xl px-3 py-2 text-sm">Save status</button>
        </form>

        <form action={saveAdminNote} className="flex gap-2 items-start">
          <input type="hidden" name="id" value={o.id} />
          <textarea
            name="admin_note"
            defaultValue={o.admin_note || ""}
            placeholder="Internal admin note"
            className="border rounded-lg p-2 w-full min-h-[90px]"
          />
          <button className="border rounded-xl px-3 py-2 text-sm">Save note</button>
        </form>
      </section>
    </main>
  );
}
