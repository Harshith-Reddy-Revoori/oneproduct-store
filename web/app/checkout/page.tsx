// web/app/checkout/page.tsx
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { redirect } from "next/navigation";
import { formatPaise } from "@/lib/money";
import type { Prisma } from "@prisma/client"; // 👈 import the type for TransactionClient

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function toPlain<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === "bigint" ? Number(v) : v))
  );
}

/* ---------- helpers ---------- */

function calcUnitPricePaise(product: any, sizeRow: any): number {
  const override = sizeRow?.price_override_paise;
  if (override !== null && override !== undefined) return Number(override);
  return Number(product.base_price_paise);
}

function isCouponActiveNow(c: any) {
  const now = new Date();
  if (c.valid_from && new Date(c.valid_from) > now) return false;
  if (c.valid_to && new Date(c.valid_to) < now) return false;
  return c.is_active === true;
}

function applyCouponToAmount(paiseAmount: number, coupon: any): { discount: number; final: number } {
  if (!coupon) return { discount: 0, final: paiseAmount };
  if (coupon.kind === "PERCENT") {
    const pct = Math.max(0, Math.min(100, Number(coupon.value || 0)));
    const discount = Math.floor((paiseAmount * pct) / 100);
    return { discount, final: Math.max(0, paiseAmount - discount) };
  }
  // AMOUNT: coupon.value already in paise
  const amt = Math.max(0, Number(coupon.value || 0));
  const discount = Math.min(amt, paiseAmount);
  return { discount, final: Math.max(0, paiseAmount - discount) };
}

// 👇 Correctly type the transaction client here
async function generateOrderNumber(tx: Prisma.TransactionClient) {
  // Very simple: count this year's orders and pad
  const year = new Date().getFullYear();
  const start = new Date(`${year}-01-01T00:00:00Z`);
  const end = new Date(`${year + 1}-01-01T00:00:00Z`);
  const count = await tx.orders.count({ where: { created_at: { gte: start, lt: end } } });
  const next = count + 1;
  return `ORD-${year}-${String(next).padStart(4, "0")}`;
}

/* ---------- server action: place order (pending) ---------- */
export async function placeOrder(formData: FormData) {
  "use server";

  // read from form
  const size_label = String(formData.get("size_label") || "").trim().toUpperCase();
  const qty = Math.max(1, parseInt(String(formData.get("quantity") || "1"), 10) || 1);
  const coupon_code_raw = String(formData.get("coupon_code") || "").trim().toUpperCase() || null;

  const user_email = String(formData.get("user_email") || "").trim();
  const customer_name = String(formData.get("customer_name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address_line1 = String(formData.get("address_line1") || "").trim();
  const address_line2 = String(formData.get("address_line2") || "").trim() || null;
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const pincode = String(formData.get("pincode") || "").trim();

  if (!size_label) redirect("/checkout?err=Choose%20a%20size");
  if (!user_email || !customer_name || !phone || !address_line1 || !city || !state || !pincode) {
    redirect("/checkout?err=Please%20fill%20all%20required%20fields");
  }

  // Transaction: verify stock, compute totals, create order, decrement stock, bump coupon usage
  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.products.findFirst({
      where: { active: true },
      include: { product_sizes: { where: { label: size_label, is_active: true }, take: 1 } },
    });
    if (!product) throw new Error("No active product");
    if (product.out_of_stock) throw new Error("Product out of stock");

    const sizeRow = product.product_sizes[0];
    if (!sizeRow) throw new Error("Size not available");

    // atomic stock decrement (SQL conditional update)
    const changed: any = await tx.$executeRawUnsafe(
      `update product_sizes set stock = stock - $1 where id = $2 and stock >= $1`,
      qty,
      sizeRow.id
    );
    if (changed === 0) throw new Error("Not enough stock");

    // coupon (optional)
    let coupon: any = null;
    if (coupon_code_raw) {
      coupon = await tx.coupons.findUnique({ where: { code: coupon_code_raw } });
      if (!coupon || !isCouponActiveNow(coupon)) throw new Error("Invalid coupon");
    }

    const unit_price_paise = calcUnitPricePaise(product, sizeRow);
    const subtotal = unit_price_paise * qty;

    if (coupon) {
      // min amount
      const min = Number(coupon.min_amount_paise || 0);
      if (subtotal < min) throw new Error("Coupon minimum not met");
      // usage limit
      if (coupon.usage_limit !== null && coupon.usage_limit !== undefined) {
        if (Number(coupon.used_count || 0) >= Number(coupon.usage_limit)) {
          throw new Error("Coupon usage limit reached");
        }
      }
    }

    const { discount, final } = applyCouponToAmount(subtotal, coupon);
    const order_number = await generateOrderNumber(tx);

    const order = await tx.orders.create({
      data: {
        order_number,
        user_email,
        customer_name,
        address_line1,
        address_line2,
        city,
        state,
        pincode,
        phone,
        product_id: product.id,
        size_label,
        quantity: qty,
        unit_price_paise,
        discount_paise: discount,
        total_paise: final,
        coupon_code: coupon ? coupon.code : null,
        payment_status: "pending",
        payment_provider: "manual",
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    if (coupon) {
      await tx.coupons.update({
        where: { id: coupon.id },
        data: { used_count: Number(coupon.used_count || 0) + 1, updated_at: new Date() },
      });
    }

    return { order, product };
  });

  // emails (best-effort; ignore failures)
  try {
    if (resend) {
      const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
      const adminTo = process.env.ADMIN_EMAIL || "admin@example.com";
      const { order, product } = result as any;

      const orderHtml = `
        <div style="font-family:Arial,sans-serif">
          <h2>Order ${order.order_number} received</h2>
          <p>Hi ${order.customer_name},</p>
          <p>Thank you for your order. We’ll contact you with shipping details.</p>
          <ul>
            <li>Product: ${product.name}</li>
            <li>Size: ${order.size_label}</li>
            <li>Qty: ${order.quantity}</li>
            <li>Total: ₹${(Number(order.total_paise) / 100).toFixed(2)}</li>
            <li>Status: ${order.payment_status}</li>
          </ul>
        </div>
      `;

      const adminHtml = `
        <div style="font-family:Arial,sans-serif">
          <h2>New order ${order.order_number}</h2>
          <ul>
            <li>Customer: ${order.customer_name} (${order.user_email})</li>
            <li>Phone: ${order.phone}</li>
            <li>Address: ${order.address_line1}${order.address_line2 ? ", " + order.address_line2 : ""}, ${order.city}, ${order.state} ${order.pincode}</li>
            <li>Product: ${product.name} • Size ${order.size_label} • Qty ${order.quantity}</li>
            <li>Total: ₹${(Number(order.total_paise) / 100).toFixed(2)}</li>
          </ul>
        </div>
      `;

      await Promise.allSettled([
        resend.emails.send({ from, to: order.user_email, subject: `Order ${order.order_number} received`, html: orderHtml }),
        resend.emails.send({ from, to: adminTo, subject: `New order ${order.order_number}`, html: adminHtml }),
      ]);
    }
  } catch {
    // ignore email errors for now
  }

  redirect(`/order/${(result as any).order.order_number}`);
}

/* ---------- page ---------- */

export default async function CheckoutPage({
  searchParams,
}: {
  // Next 15: searchParams is async
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const size_label = (Array.isArray(sp.size) ? sp.size[0] : sp.size)?.toUpperCase() || "";
  const qty = Math.max(1, parseInt(String(Array.isArray(sp.qty) ? sp.qty[0] : sp.qty || "1"), 10) || 1);
  const coupon = (Array.isArray(sp.coupon) ? sp.coupon[0] : sp.coupon || "").toUpperCase();
  const err = Array.isArray(sp.err) ? sp.err[0] : sp.err;

  const product = await prisma.products.findFirst({
    where: { active: true },
    include: { product_sizes: { where: { is_active: true }, orderBy: { label: "asc" } } },
  });

  if (!product) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-red-600 mt-4">No active product found.</p>
      </main>
    );
  }

  const p = toPlain(product);
  const sizeRow = p.product_sizes.find((s: any) => s.label.toUpperCase() === size_label);

  let displayError = err || "";
  if (!sizeRow) displayError = displayError || "Please choose a valid size.";
  if (p.out_of_stock) displayError = "Product is out of stock.";

  const unit = sizeRow ? calcUnitPricePaise(p, sizeRow) : 0;
  const subtotal = unit * qty;

  // show coupon preview (not authoritative; we re-validate on submit)
  let previewDiscount = 0;
  let previewFinal = subtotal;
  if (coupon) {
    const c = await prisma.coupons.findUnique({ where: { code: coupon } });
    if (c && isCouponActiveNow(c) && subtotal >= Number(c.min_amount_paise || 0)) {
      const res = applyCouponToAmount(subtotal, c);
      previewDiscount = res.discount;
      previewFinal = res.final;
    }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Checkout</h1>

      {displayError ? (
        <div className="rounded-lg border p-3 text-red-700 bg-red-50">{displayError}</div>
      ) : null}

      {/* Summary */}
      <section className="rounded-2xl border p-6 space-y-2">
        <h2 className="text-xl font-semibold">Order summary</h2>
        <div>Product: {p.name}</div>
        <div>Size: {size_label || "—"}</div>
        <div>Quantity: {qty}</div>
        <div>Unit: {formatPaise(unit)}</div>
        <div>Subtotal: {formatPaise(subtotal)}</div>
        {coupon ? (
          <div>Coupon: <b>{coupon}</b> → −{formatPaise(previewDiscount)}</div>
        ) : null}
        <div className="font-semibold">Total: {formatPaise(previewFinal)}</div>

        {/* Update coupon without losing selection */}
        <form action="/checkout" method="get" className="flex items-center gap-2 mt-3">
          <input type="hidden" name="size" value={size_label} />
          <input type="hidden" name="qty" value={qty} />
          <input name="coupon" defaultValue={coupon} placeholder="Coupon code" className="border rounded-lg p-2" />
          <button className="border rounded-xl px-3 py-2 text-sm">Apply</button>
        </form>
      </section>

      {/* Customer form → places order (pending) */}
      <section className="rounded-2xl border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Shipping details</h2>
        <form action={placeOrder} className="grid gap-3">
          {/* Hidden selections */}
          <input type="hidden" name="size_label" value={size_label} />
          <input type="hidden" name="quantity" value={qty} />
          <input type="hidden" name="coupon_code" value={coupon} />

          <div className="grid md:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Full name</span>
              <input name="customer_name" className="mt-1 border rounded-lg p-3 w-full" required />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input name="user_email" type="email" className="mt-1 border rounded-lg p-3 w-full" required />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium">Phone</span>
            <input name="phone" className="mt-1 border rounded-lg p-3 w-full" required />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Address line 1</span>
            <input name="address_line1" className="mt-1 border rounded-lg p-3 w-full" required />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Address line 2 (optional)</span>
            <input name="address_line2" className="mt-1 border rounded-lg p-3 w-full" />
          </label>

          <div className="grid md:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-sm font-medium">City</span>
              <input name="city" className="mt-1 border rounded-lg p-3 w-full" required />
            </label>
            <label className="block">
              <span className="text-sm font-medium">State</span>
              <input name="state" className="mt-1 border rounded-lg p-3 w-full" required />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Pincode</span>
              <input name="pincode" className="mt-1 border rounded-lg p-3 w-full" required />
            </label>
          </div>

          <button className="rounded-xl border px-4 py-2 font-semibold">
            Place order (pending)
          </button>
        </form>
      </section>
    </main>
  );
}
