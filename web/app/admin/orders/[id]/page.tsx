// web/app/admin/orders/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatPaise } from "@/lib/money";
import type { Prisma } from "@prisma/client";
import { updateOrderStatus, saveAdminNote } from "./actions";
import styles from "@/components/Admin.module.css";

type Status = "pending" | "paid" | "failed" | "refunded";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session as unknown as { role?: string })?.role;
  if (!session || role !== "admin") redirect("/admin/login");
}

type OrderRow = Prisma.ordersGetPayload<{
  include: { product: { select: { name: true } } };
}>;

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
    quantity: Number(row.quantity),
    unit_price_paise: Number(row.unit_price_paise),
    discount_paise: Number(row.discount_paise),
    total_paise: Number(row.total_paise),
    payment_status: row.payment_status as Status,
    payment_provider: row.payment_provider,
    provider_order_id: row.provider_order_id,
    provider_payment_id: row.provider_payment_id,
    admin_note: row.admin_note,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

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
    <>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>Order {o.order_number}</h1>
        <Link className={styles.backLink} href="/admin/orders">← Back to Orders</Link>
      </div>

      {ok ? <div className={`${styles.alert} ${styles.alertSuccess}`}>Saved ✓</div> : null}
      {err ? <div className={`${styles.alert} ${styles.alertError}`}>{err}</div> : null}

      <section className={styles.detailGrid}>
        <div className={styles.detailBlock}>
          <h2>Customer</h2>
          <div>{o.customer_name}</div>
          <div className={styles.textMuted}>{o.user_email}</div>
          <div>Phone: {o.phone}</div>
          <div>
            {o.address_line1}
            {o.address_line2 ? `, ${o.address_line2}` : ""}, {o.city}, {o.state} {o.pincode}
          </div>
        </div>

        <div className={styles.detailBlock}>
          <h2>Order</h2>
          <div>Product: {o.product_name ?? "Product"}</div>
          <div>Size: {o.size_label} • Qty: {o.quantity}</div>
          <div>Unit: {formatPaise(o.unit_price_paise)}</div>
          <div>Discount: {formatPaise(o.discount_paise)}</div>
          <div style={{ fontWeight: 600 }}>Total: {formatPaise(o.total_paise)}</div>
          <div>Status: <b>{o.payment_status}</b></div>
          <div className={styles.textMuted}>Provider: {o.payment_provider ?? "—"}</div>
          <div className={styles.textMuted} style={{ fontSize: "0.75rem" }}>
            Order ID: {o.provider_order_id || "—"}
            <br />
            Payment ID: {o.provider_payment_id || "—"}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Update</h2>

        <form action={updateOrderStatus} className={styles.inlineFormRow}>
          <input type="hidden" name="id" value={o.id} />
          <select name="payment_status" defaultValue={o.payment_status} className={styles.select}>
            {(["pending", "paid", "failed", "refunded"] as const).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button type="submit" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>Save status</button>
        </form>

        <form action={saveAdminNote} className={styles.inlineFormRow}>
          <input type="hidden" name="id" value={o.id} />
          <textarea
            name="admin_note"
            defaultValue={o.admin_note || ""}
            placeholder="Internal admin note"
            className={styles.textarea}
          />
          <button type="submit" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>Save note</button>
        </form>
      </section>
    </>
  );
}
