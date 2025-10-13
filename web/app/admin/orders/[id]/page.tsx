// web/app/admin/orders/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { formatPaise } from "@/lib/money";
import type { Prisma } from "@prisma/client";

type Status = "pending" | "paid" | "failed" | "refunded";
const STATUSES: Status[] = ["pending", "paid", "failed", "refunded"];
function isStatus(s: unknown): s is Status {
  return typeof s === "string" && (STATUSES as ReadonlyArray<string>).includes(s);
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session as unknown as { role?: string })?.role;
  if (!session || role !== "admin") redirect("/login");
}

/** Prisma row type for orders + product name */
type OrderRow = Prisma.ordersGetPayload<{
  include: { product: { select: { name: true } } };
}>;

/** Admin DTO with numbers for currency/quantity fields */
type AdminOrder = {
  id: string;
  order_number: string;
  user_email: string;
  customer_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  product_name: string | null;
  size_label: string;
  quantity: number;
  unit_price_paise: number;
  discount_paise: number;
  total_paise: number;
  payment_status: Status;
  payment_provider: string | null;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  admin_note: string | null;
  created_at: Date;
  updated_at: Date;
};

function toAdminOrder(row: OrderRow): AdminOrder {
  return {
    id: row.id,
    order_number: row.order_number,
    user_email: row.user_email,
    customer_name: row.customer_name,
    address_line1: row.address_line1,
    address_line2: row.address_line2,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    phone: row.phone,
    product_name: row.product?.name ?? null,
    size_label: row.size_label,
    quantity: Number(row.quantity), // bigint -> number
    unit_price_paise: Number(row.unit_price_paise), // bigint -> number
    discount_paise: Number(row.discount_paise), // bigint -> number
    total_paise: Number(row.total_paise), // bigint -> number
    payment_status: row.payment_status as Status,
    payment_provider: row.payment_provider,
    provider_order_id: row.provider_order_id,
    provider_payment_id: row.provider_payment_id,
    admin_note: row.admin_note,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
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

  try {
    revalidatePath(`/admin/orders/${id}`);
  } catch {}
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

  try {
    revalidatePath(`/admin/orders/${id}`);
  } catch {}
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

  const orderRow = (await prisma.orders.findUnique({
    where: { id },
    include: { product: { select: { name: true } } },
  })) as OrderRow | null;

  if (!orderRow) notFound();

  const o: AdminOrder = toAdminOrder(orderRow);

  return (
    <main className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Order {o.order_number}</h1>
        <Link className="underline" href="/admin/orders">
          ← Back to Orders
        </Link>
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
          <div>Product: {o.product_name ?? "Product"}</div>
          <div>
            Size: {o.size_label} • Qty: {o.quantity}
          </div>
          <div>Unit: {formatPaise(o.unit_price_paise)}</div>
          <div>Discount: {formatPaise(o.discount_paise)}</div>
          <div className="font-semibold">Total: {formatPaise(o.total_paise)}</div>
          <div>
            Status: <b>{o.payment_status}</b>
          </div>
          <div className="text-sm text-gray-600">Provider: {o.payment_provider ?? "—"}</div>
          <div className="text-xs text-gray-500">
            Order ID: {o.provider_order_id || "—"}
            <br />
            Payment ID: {o.provider_payment_id || "—"}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Update</h2>

        <form action={updateOrderStatus} className="flex gap-2 items-center">
          <input type="hidden" name="id" value={o.id} />
          <select
            name="payment_status"
            defaultValue={o.payment_status}
            className="border rounded-lg p-2"
          >
            {STATUSES.map((s: Status) => (
              <option key={s} value={s}>
                {s}
              </option>
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
