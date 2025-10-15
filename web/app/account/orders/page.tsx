import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "@/components/Account.module.css";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) redirect("/login?callbackUrl=/account/orders");

  const orders = await prisma.orders.findMany({
    where: { user_email: email },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      order_number: true,
      total_paise: true,
      payment_status: true,
      created_at: true,
    },
  });

  return (
    <div className={styles.pageWrap}>
      <h1 className={styles.pageTitle}>Your orders</h1>

      {orders.length === 0 ? (
        <p className={styles.muted}>No orders yet.</p>
      ) : (
        <ul className={styles.orderList}>
          {orders.map((o) => {
            const total = Number(o.total_paise) / 100;
            const date = new Date(o.created_at).toLocaleDateString();
            const statusKey = (o.payment_status || "").toLowerCase().replace(/\s+/g, "-");
            return (
              <li key={o.id} className={styles.orderCard}>
                <div className={styles.orderHead}>
                  <div className={styles.orderMeta}>
                    <div>Order <strong>#{o.order_number}</strong></div>
                    <div className={styles.muted}>{date}</div>
                  </div>
                  <div className={styles.orderPrice}>
                    <div className={styles.total}>₹{total.toFixed(2)}</div>
                    <div className={`${styles.status} ${styles[`is-${statusKey}`] || ""}`}>
                      {o.payment_status}
                    </div>
                  </div>
                </div>

                <div className={styles.orderActions}>
                  <Link className={styles.sideLink} href={`/account/orders/${o.id}`}>
                    View details
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
