// web/app/order/[orderNumber]/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPaise } from "@/lib/money";
import styles from "@/components/OrderSuccess.module.css";

function toPlain<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === "bigint" ? Number(v) : v))
  );
}

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  const order = await prisma.orders.findUnique({
    where: { order_number: orderNumber },
    include: { product: { select: { name: true } } },
  });

  if (!order) {
    return (
      <main className={`${styles.orderTheme} ${styles.notFoundWrap}`}>
        <h1 className={styles.notFoundTitle}>Order not found</h1>
        <p className={styles.muted}>
          We couldn&apos;t find that order.{" "}
          <Link href="/" className={styles.notFoundLink}>Go back home</Link>
        </p>
      </main>
    );
  }

  const o = toPlain(order);

  return (
    <main className={`${styles.orderTheme} ${styles.wrap}`}>
      <h1 className={styles.pageTitle}>Thanks! Order {o.order_number}</h1>
      <p className={styles.subtitle}>
        We&apos;ve emailed your confirmation. We&apos;ll update you when it ships.
      </p>

      <section className={styles.card}>
        <div style={{ display: "grid", gap: 12 }}>
          <h2 className={styles.sectionTitle}>Summary</h2>
          <div className={styles.summaryRow}>
            <span>Product</span>
            <strong>{o.product?.name}</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Size · Qty</span>
            <strong>{o.size_label} × {o.quantity}</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Unit price</span>
            <strong>{formatPaise(o.unit_price_paise)}</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Discount</span>
            <strong>{formatPaise(o.discount_paise)}</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Total</span>
            <strong>{formatPaise(o.total_paise)}</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Status</span>
            <strong>{o.payment_status}</strong>
          </div>
        </div>

        <hr className={styles.rule} />

        <div style={{ display: "grid", gap: 8 }}>
          <h2 className={styles.sectionTitle}>Shipping to</h2>
          <div>{o.customer_name}</div>
          <div className={styles.muted}>{o.user_email}</div>
          <div className={styles.muted}>Phone: {o.phone}</div>
          <div className={styles.muted}>
            {o.address_line1}
            {o.address_line2 ? `, ${o.address_line2}` : ""}, {o.city}, {o.state} {o.pincode}
          </div>
        </div>
      </section>

      <Link href="/" className={styles.backLink}>← Continue shopping</Link>
    </main>
  );
}
