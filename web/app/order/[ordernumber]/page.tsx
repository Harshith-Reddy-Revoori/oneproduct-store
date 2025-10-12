// web/app/order/[orderNumber]/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPaise } from "@/lib/money";

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
      <main className="p-8">
        <h1 className="text-3xl font-bold">Order not found</h1>
        <p className="mt-4">
          We couldn’t find that order.{" "}
          <Link href="/" className="underline">Go back</Link>
        </p>
      </main>
    );
  }

  const o = toPlain(order);

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">Thanks! Order {o.order_number}</h1>
      <p>We’ve emailed your confirmation. We’ll update you when it ships.</p>

      <section className="rounded-2xl border p-6 grid md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Summary</h2>
          <div>Product: {o.product?.name}</div>
          <div>Size: {o.size_label} • Qty: {o.quantity}</div>
          <div>Unit: {formatPaise(o.unit_price_paise)}</div>
          <div>Discount: {formatPaise(o.discount_paise)}</div>
          <div className="font-semibold">Total: {formatPaise(o.total_paise)}</div>
          <div>Status: <b>{o.payment_status}</b></div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Shipping to</h2>
          <div>{o.customer_name}</div>
          <div className="text-sm text-gray-600">{o.user_email}</div>
          <div className="text-sm">Phone: {o.phone}</div>
          <div className="text-sm">
            {o.address_line1}
            {o.address_line2 ? `, ${o.address_line2}` : ""}, {o.city}, {o.state} {o.pincode}
          </div>
        </div>
      </section>

      <Link href="/" className="underline">← Continue shopping</Link>
    </main>
  );
}
