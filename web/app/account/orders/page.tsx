import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  // Guard instead of using non-null assertions
  if (!email) {
    redirect("/login?callbackUrl=/account/orders");
  }

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
    <div>
      <h1>Your orders</h1>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <ul style={{ display: "grid", gap: 12, padding: 0, listStyle: "none" }}>
          {orders.map((o) => {
            const total = Number(o.total_paise) / 100;
            const date = new Date(o.created_at).toLocaleDateString();
            return (
              <li key={o.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div>Order <strong>#{o.order_number}</strong></div>
                    <div style={{ color: "#666" }}>{date}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div><strong>₹{total.toFixed(2)}</strong></div>
                    <div style={{ color: "#666" }}>{o.payment_status}</div>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Link href={`/account/orders/${o.id}`}>View details</Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
