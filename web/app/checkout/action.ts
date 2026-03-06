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
  discount_paise?: number;
}) {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  if (!userEmail) redirect("/login?callbackUrl=/checkout");

  const orderNumber = `OP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const subtotal = data.price_paise * data.quantity;
  const discount = data.discount_paise ?? 0;
  const total = Math.max(0, subtotal - discount);

  const order = await prisma.$transaction(async (tx) => {
    const sizeRow = await tx.product_sizes.findFirst({
      where: { product_id: data.productId, label: data.size },
    });
    if (!sizeRow) throw new Error("Invalid size");
    const currentStock = Number(sizeRow.stock);
    if (currentStock < data.quantity) {
      throw new Error("Insufficient stock");
    }

    await tx.product_sizes.update({
      where: { id: sizeRow.id },
      data: { stock: { decrement: data.quantity } },
    });

    return tx.orders.create({
      data: {
        order_number: orderNumber,
        user_email: userEmail,
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
        discount_paise: BigInt(discount),
        total_paise: BigInt(total),
        coupon_code: data.coupon_code || null,
        payment_status: "pending",
        payment_provider: "razorpay",
      },
      select: { id: true, order_number: true },
    });
  });

  return order;
}
