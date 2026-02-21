// web/app/admin/orders/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPaise } from "@/lib/money";
import type { Prisma } from "@prisma/client";
import styles from "@/components/Admin.module.css";

/* --------- auth --------- */
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session as unknown as { role?: string })?.role;
  if (!session || role !== "admin") redirect("/admin/login");
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

  const statusClass = (s: string) => {
    switch (s) {
      case "paid": return styles.statusPaid;
      case "pending": return styles.statusPending;
      case "failed": return styles.statusFailed;
      case "refunded": return styles.statusRefunded;
      default: return "";
    }
  };

  return (
    <>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>Orders</h1>
        <Link className={styles.backLink} href="/admin">← Admin</Link>
      </div>

      {ok ? <div className={`${styles.alert} ${styles.alertSuccess}`}>Saved ✓</div> : null}
      {err ? <div className={`${styles.alert} ${styles.alertError}`}>{err}</div> : null}

      <form className={styles.filterRow} method="get">
        <span className={styles.label}>Filter:</span>
        <select name="status" defaultValue={statusFilter || ""} className={styles.select} style={{ width: "auto", minWidth: "120px" }}>
          <option value="">All</option>
          <option value="pending">pending</option>
          <option value="paid">paid</option>
          <option value="failed">failed</option>
          <option value="refunded">refunded</option>
        </select>
        <button type="submit" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>Apply</button>
      </form>

      {list.length === 0 ? (
        <p className={styles.emptyState}>No orders yet.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Size</th>
                <th className={styles.textRight}>Qty</th>
                <th className={styles.textRight}>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id}>
                  <td className={styles.cellMono}>{o.order_number}</td>
                  <td>{o.created_at.toLocaleString()}</td>
                  <td>
                    <div className={styles.cellCustomerName}>{o.customer_name}</div>
                    <div className={styles.cellCustomerEmail}>{o.user_email}</div>
                  </td>
                  <td>{o.product_name ?? "—"}</td>
                  <td>{o.size_label}</td>
                  <td className={styles.textRight}>{o.quantity}</td>
                  <td className={styles.textRight}>{formatPaise(o.total_paise)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${statusClass(o.payment_status)}`}>{o.payment_status}</span>
                  </td>
                  <td>
                    <Link className={styles.tableLink} href={`/admin/orders/${o.id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
