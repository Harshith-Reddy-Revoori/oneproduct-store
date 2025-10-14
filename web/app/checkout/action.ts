"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";

export async function createOrder(data: {
  productId: string;
  size: string;
  quantity: number;
  customer: { name: string; phone: string; address1: string; address2?: string; city: string; state: string; pincode: string };
  price_paise: number;
  coupon_code?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login?callbackUrl=/checkout");

  const orderNumber = `OP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const order = await prisma.orders.create({
    data: {
      order_number: orderNumber,
      user_email: session.user.email,
      customer_name: data.customer.name,
      address_line1: data.customer.address1,
      address_line2: data.customer.address2 || null,
      city: data.customer.city,
      state: data.customer.state,
      pincode: data.customer.pincode,
      phone: data.customer.phone,
      product_id: data.productId,
      size_label: data.size,
      quantity: BigInt(data.quantity),
      unit_price_paise: BigInt(data.price_paise),
      total_paise: BigInt(data.price_paise * data.quantity),
      coupon_code: data.coupon_code || null,
      payment_status: "pending",
      payment_provider: "razorpay",
    },
    select: { id: true, order_number: true },
  });

  return order; // return { id, order_number } for your payment step
}
