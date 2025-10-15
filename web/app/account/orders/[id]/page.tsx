import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "../../../../lib/prisma";
import styles from "@/components/Account.module.css";

export default async function OrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) redirect(`/login?callbackUrl=/account/orders/${id}`);

  const order = await prisma.orders.findFirst({
    where: { id, user_email: email },
    include: { product: true },
  });

  if (!order) return notFound();

  const qty = Number(order.quantity);
  const unit = Number(order.unit_price_paise);
  const subtotal = (unit * qty) / 100;
  const discount = Number(order.discount_paise) / 100;
  const total = Number(order.total_paise) / 100;
  const created = new Date(order.created_at).toLocaleString();
  const statusKey = (order.payment_status || "").toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={styles.pageWrap}>
      <h1 className={styles.pageTitle}>Order #{order.order_number}</h1>

      <div className={styles.detailCard}>
        <div className={`${styles.status} ${styles[`is-${statusKey}`] || ""}`}>
          {order.payment_status}
        </div>
        <div className={styles.muted}>Date: {created}</div>
        <div className={styles.muted}>Status: {order.payment_status}</div>

        <hr />

        <h3 className={styles.sectionTitle}>Item</h3>
        <div>
          {order.product.name} — size {order.size_label} × {qty}
          <div>Subtotal: ₹{subtotal.toFixed(2)}</div>
          {discount > 0 && <div>Discount: −₹{discount.toFixed(2)}</div>}
          <div><strong>Total: ₹{total.toFixed(2)}</strong></div>
        </div>

        {order.address_line1 && (
          <>
            <hr />
            <h3 className={styles.sectionTitle}>Shipping</h3>
            <address className={styles.address}>
              {order.customer_name}
              {"\n"}
              {order.address_line1}
              {order.address_line2 ? `\n${order.address_line2}` : ""}
              {"\n"}
              {order.city}, {order.state} {order.pincode}
              {"\n"}
              {order.phone}
            </address>
          </>
        )}
      </div>
    </div>
  );
}
