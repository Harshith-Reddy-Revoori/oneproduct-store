import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "../../../../lib/prisma";

export default async function OrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // 👈 important for Next 15 types

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    redirect(`/login?callbackUrl=/account/orders/${id}`);
  }

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

  return (
    <div>
      <h1>Order #{order.order_number}</h1>
      <p>Date: {created}</p>
      <p>Status: {order.payment_status}</p>

      <hr />
      <h3>Item</h3>
      <div>
        {order.product.name} — size {order.size_label} × {qty}
        <div>Subtotal: ₹{subtotal.toFixed(2)}</div>
        {discount > 0 && <div>Discount: −₹{discount.toFixed(2)}</div>}
        <div><strong>Total: ₹{total.toFixed(2)}</strong></div>
      </div>

      {order.address_line1 && (
        <>
          <hr />
          <h3>Shipping</h3>
          <address style={{ whiteSpace: "pre-line" }}>
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
  );
}
