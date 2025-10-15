// web/app/checkout/page.tsx
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPaise } from "@/lib/money";
import type { Prisma } from "@prisma/client";
import styles from "@/components/Checkout.module.css";


/* ---------- Types ---------- */

type ProductRow = Prisma.productsGetPayload<{
  include: { product_sizes: true };
}>;

type StoreSize = {
  id: string;
  label: string;
  stock: number;
  price_override_paise: number | null;
};

type StoreProduct = {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  base_price_paise: number;
  out_of_stock: boolean;
  product_sizes: StoreSize[];
};

type CouponRow = Prisma.couponsGetPayload<true>;
type CouponKind = "AMOUNT" | "PERCENT";

type ComputedTotals = {
  unit_paise: number;
  subtotal_paise: number;
  discount_paise: number;
  total_paise: number;
};

/* ---------- Helpers ---------- */

function toStoreProduct(row: ProductRow): StoreProduct {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    currency: row.currency,
    base_price_paise: Number(row.base_price_paise),
    out_of_stock: row.out_of_stock,
    product_sizes: row.product_sizes.map((s) => ({
      id: s.id,
      label: s.label,
      stock: Number(s.stock),
      price_override_paise: s.price_override_paise == null ? null : Number(s.price_override_paise),
    })),
  };
}

function parseQty(q: string | undefined): number {
  const n = parseInt((q || "").trim(), 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

function asKind(s: string | undefined): CouponKind | null {
  const k = (s || "").toUpperCase();
  return k === "AMOUNT" || k === "PERCENT" ? k : null;
}

function priceForSize(p: StoreProduct, size: StoreSize): number {
  return size.price_override_paise ?? p.base_price_paise;
}

function isCouponCurrentlyValid(c: CouponRow, now: Date, minSubtotalPaise: number): boolean {
  if (!c.is_active) return false;
  if (c.valid_from && now < c.valid_from) return false;
  if (c.valid_to && now > c.valid_to) return false;
  const min = Number(c.min_amount_paise ?? 0);
  if (min > 0 && minSubtotalPaise < min) return false;
  if (c.usage_limit != null) {
    const limit = Number(c.usage_limit);
    const used = Number(c.used_count ?? 0);
    if (used >= limit) return false;
  }
  return true;
}

function applyCoupon(subtotalPaise: number, coupon: CouponRow | null): number {
  if (!coupon) return 0;
  const kind = asKind(coupon.kind);
  if (!kind) return 0;

  if (kind === "PERCENT") {
    const pct = Number(coupon.value);
    if (!Number.isFinite(pct) || pct <= 0) return 0;
    const raw = Math.floor((subtotalPaise * pct) / 100);
    return Math.max(0, Math.min(raw, subtotalPaise));
  } else {
    const amt = Number(coupon.value);
    if (!Number.isFinite(amt) || amt <= 0) return 0;
    return Math.max(0, Math.min(amt, subtotalPaise));
  }
}

function computeTotals(product: StoreProduct, size: StoreSize, qty: number, coupon: CouponRow | null): ComputedTotals {
  const unit = priceForSize(product, size);
  const subtotal = unit * qty;
  const discount = applyCoupon(subtotal, coupon);
  const total = Math.max(0, subtotal - discount);
  return {
    unit_paise: unit,
    subtotal_paise: subtotal,
    discount_paise: discount,
    total_paise: total,
  };
}

/* ---------- Page ---------- */

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const sizeLabel = Array.isArray(sp.size) ? sp.size[0] : sp.size;
  const qtyParam = Array.isArray(sp.qty) ? sp.qty[0] : sp.qty;
  const couponCode = Array.isArray(sp.coupon) ? sp.coupon[0] : sp.coupon;

  if (!sizeLabel) redirect("/?err=Please%20select%20a%20size%20first");

  const productRow = await prisma.products.findFirst({
    where: { active: true },
    include: { product_sizes: { where: { is_active: true } } },
  });

  if (!productRow) redirect("/?err=Product%20not%20found");

  const product = toStoreProduct(productRow as ProductRow);
  const sizes = product.product_sizes;

  const chosen = sizes.find((s) => s.label === sizeLabel);
  if (!chosen) redirect("/?err=Invalid%20size%20selected");

  const qty = parseQty(qtyParam);
  if (chosen.stock < qty) {
    redirect(`/?err=Only%20${encodeURIComponent(String(chosen.stock))}%20left%20for%20${encodeURIComponent(chosen.label)}`);
  }

  let coupon: CouponRow | null = null;
  if (couponCode && couponCode.trim()) {
    const code = couponCode.trim().toUpperCase();
    const now = new Date();

    const row = (await prisma.coupons.findUnique({
      where: { code },
    })) as CouponRow | null;

    if (row) {
      const unitNow = priceForSize(product, chosen);
      const pretendSubtotal = unitNow * qty;
      if (isCouponCurrentlyValid(row, now, pretendSubtotal)) {
        coupon = row;
      }
    }
  }

  const totals = computeTotals(product, chosen, qty, coupon);

  return (
      <main className={`${styles.checkoutTheme} ${styles.container}`}>
        <div className={styles.topRow}>
          <h1 className={styles.title}>Checkout</h1>
          <Link href="/" className={styles.backLink}>← Keep shopping</Link>
        </div>
    
        <section className={styles.card}>
          <div className={styles.productHead}>
            <div className={styles.productName}>{product.name}</div>
            <div className={styles.unitPrice}>
              {formatPaise(totals.unit_paise)} <span className={styles.perUnit}>per unit</span>
            </div>
          </div>
    
          <div className={styles.meta}>Size: <strong>{chosen.label}</strong></div>
          <div className={styles.meta}>Quantity: <strong>{qty}</strong> (Stock left: {chosen.stock})</div>
    
          {coupon ? (
            <div className={styles.meta}>
              Coupon: <strong>{coupon.code}</strong> — {asKind(coupon.kind) === "PERCENT"
                ? `${Number(coupon.value)}%`
                : `${formatPaise(Number(coupon.value))}`} applied
            </div>
          ) : (
            <div className={styles.note}>No coupon applied</div>
          )}
    
          <hr className={styles.rule} />
    
          <div className={styles.row}>
            <span className={styles.rowLabel}>Subtotal</span>
            <span className={styles.rowValue}>{formatPaise(totals.subtotal_paise)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Discount</span>
            <span className={styles.rowValue}>−{formatPaise(totals.discount_paise)}</span>
          </div>
          <div className={`${styles.row} ${styles.totalRow}`}>
            <span className={styles.rowLabel}>Total</span>
            <span className={styles.rowValue}>{formatPaise(totals.total_paise)}</span>
          </div>
        </section>
    
        <section className={styles.card}>
          <h2 className={styles.productName}>Shipping details</h2>
          <p className={styles.note}>Payment flow will be added later. Button remains disabled.</p>
    
          <div className={styles.formGrid}>
  <input className={styles.input} name="fullName" placeholder="Full name" autoComplete="name" />
  <input className={styles.input} name="email" placeholder="Email" autoComplete="email" />
  <input className={styles.input} name="phone" placeholder="Phone" autoComplete="tel" />
  <input className={styles.input} name="pincode" placeholder="Pincode" autoComplete="postal-code" />
  <input className={`${styles.input} ${styles.span2}`} name="addr1" placeholder="Address line 1" autoComplete="address-line1" />
  <input className={`${styles.input} ${styles.span2}`} name="addr2" placeholder="Address line 2 (optional)" autoComplete="address-line2" />
  <input className={styles.input} name="city" placeholder="City" autoComplete="address-level2" />
  <input className={styles.input} name="state" placeholder="State" autoComplete="address-level1" />
</div>

        </section>
    
        <div className={styles.ctaRow}>
          <button disabled className={styles.primaryBtn} title="Payment flow to be added later">
            Continue to payment
          </button>
        </div>
      </main>
    );
    
}
