// web/components/Storefront.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import type { StoreProduct } from "@/types/product";

type SizeRow = StoreProduct["product_sizes"][number];

function formatPaise(p: number | null | undefined) {
  if (p == null) return "₹0.00";
  return `₹${(Number(p) / 100).toFixed(2)}`;
}

const heroImages: { src: string; alt: string; w: number; h: number }[] = [
  {
    src: "https://images.unsplash.com/photo-1543165796-5426273eaab1?q=80&w=1400&auto=format&fit=crop",
    alt: "Fresh natural sweetener visual 1",
    w: 1200,
    h: 900,
  },
  {
    src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1400&auto=format&fit=crop",
    alt: "Fresh natural sweetener visual 2",
    w: 1200,
    h: 900,
  },
  {
    src: "https://images.unsplash.com/photo-1571772981739-b32c9c2ee0de?q=80&w=1400&auto=format&fit=crop",
    alt: "Fresh natural sweetener visual 3",
    w: 1200,
    h: 900,
  },
];

const featureChips: string[] = [
  "1️⃣ Zero Calories, Zero Sugar Spike",
  "2️⃣ Tastes Just Like Sugar — No Aftertaste",
  "3️⃣ Tooth-Friendly Sweetness",
  "4️⃣ Low Glycemic Index (GI ~ 0)",
  "5️⃣ Clinically Studied Ingredients",
  "6️⃣ No Artificial Additives",
];

const tenNoList: Array<{ t: string; d: string }> = [
  { t: "⚡ 1. No Blood Sugar Spikes", d: "Zero glycemic impact — keeps glucose & insulin balanced for stable energy all day." },
  { t: "💓 2. No Fat Storage", d: "Supports metabolism & fat burning instead of triggering weight gain." },
  { t: "🧠 3. No Cravings or Energy Crashes", d: "Natural sweetness without the addictive sugar-dopamine rollercoaster." },
  { t: "💎 4. No Skin Aging", d: "Helps reduce glycation-related collagen damage for a natural glow." },
  { t: "🦷 5. No Cavities", d: "Doesn’t feed mouth bacteria — your teeth stay clean & fresh." },
  { t: "💪 6. No Inflammation", d: "Monk fruit mogrosides are antioxidant-rich — calm inside, strong outside." },
  { t: "❤️ 7. No Cholesterol Spikes", d: "Helps maintain healthy triglyceride & cholesterol levels." },
  { t: "🧬 8. No Fatty Liver Risk", d: "Supports liver health & metabolic balance — allulose is liver-friendly." },
  { t: "⚖️ 9. No Hormone Chaos", d: "Keeps cortisol, insulin & hunger hormones balanced for better sleep & mood." },
  { t: "🌿 10. No Gut Damage", d: "Gut-friendly — doesn’t ferment or feed bad bacteria." },
];

export default function Storefront({ product }: { product: StoreProduct | null }) {
  const router = useRouter();
  const prefersReduced = useReducedMotion();

  const sizes = useMemo<StoreProduct["product_sizes"]>(
    () => (product?.product_sizes ?? []) as StoreProduct["product_sizes"],
    [product]
  );

  const priceFor = useCallback(
    (s: SizeRow): number => (s.price_override_paise ?? (product?.base_price_paise ?? 0)) as number,
    [product?.base_price_paise]
  );

  const prices: number[] = sizes.map(priceFor);
  const minPricePaise: number = prices.length > 0 ? Math.min(...prices) : (product?.base_price_paise ?? 0);
  const hasVariedPrices: boolean = prices.length > 1 && prices.some((p) => p !== prices[0]);

  const inStockSizes = sizes.filter((s) => s.stock > 0);
  const defaultLabel = inStockSizes[0]?.label ?? sizes[0]?.label ?? "";
  const [size, setSize] = useState<string>(defaultLabel);
  const [qty, setQty] = useState<number>(1);
  const [coupon, setCoupon] = useState<string>("");

  const unitPaise = useMemo(() => {
    if (!product) return 0;
    const row = sizes.find((s) => s.label === size);
    return (row ? priceFor(row) : product.base_price_paise) as number;
  }, [product, sizes, size, priceFor]);

  const handleBuy = () => {
    if (!size) {
      alert("Please choose a size.");
      return;
    }
    router.push(
      `/checkout?size=${encodeURIComponent(size)}&qty=${qty}${
        coupon ? `&coupon=${encodeURIComponent(coupon)}` : ""
      }`
    );
  };

  const isDisabled = !product || product.out_of_stock || !size;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top glow background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[820px] rounded-full blur-[120px] bg-gradient-to-br from-emerald-300/30 via-fuchsia-300/30 to-sky-300/30" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/60 border-b">
        <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          {/* Use Link instead of <a href="/"> */}
          <Link href="/" className="font-extrabold tracking-tight text-xl">
            SugarPro
          </Link>
          <div className="hidden sm:flex items-center gap-6 text-sm">
            <a href="#benefits" className="hover:underline">Benefits</a>
            <a href="#science" className="hover:underline">Science</a>
            <a href="#buy" className="hover:underline">Buy</a>
            <Link href="/account" className="hover:underline">Account</Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <motion.h1
            initial={prefersReduced ? undefined : { opacity: 0, y: 20 }}
            whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-extrabold leading-tight"
          >
            Sweet. Smart. <span className="bg-gradient-to-r from-emerald-600 to-fuchsia-600 bg-clip-text text-transparent">SugarPro</span>
          </motion.h1>

          <motion.p
            initial={prefersReduced ? undefined : { opacity: 0, y: 12 }}
            whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ delay: 0.08, duration: 0.5 }}
            className="mt-4 text-lg text-gray-700"
          >
            Your body deserves sweetness without side effects. <br />
            100% Natural • Zero Sugar • Zero Guilt
          </motion.p>

          {/* Feature chips */}
          <ul className="mt-6 grid gap-2">
            {featureChips.map((c, i) => (
              <motion.li
                key={c}
                initial={prefersReduced ? undefined : { opacity: 0, x: -10 }}
                whileInView={prefersReduced ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ delay: 0.05 * i, duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm bg-white/70"
              >
                {c}
              </motion.li>
            ))}
          </ul>

          {/* Price + CTA (shows "From ₹…" if varied) */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="text-2xl font-bold">
              {hasVariedPrices ? <>From {formatPaise(minPricePaise)}</> : <>{formatPaise(minPricePaise)}</>}
            </div>
            <button
              onClick={() =>
                document.getElementById("buy")?.scrollIntoView({ behavior: "smooth", block: "center" })
              }
              className="rounded-xl border px-4 py-2 font-semibold hover:shadow"
            >
              Choose size
            </button>
          </div>
        </div>

        {/* Image collage (use next/image) */}
        <div className="grid grid-cols-2 gap-4">
          {heroImages.map((img, i) => (
            <motion.div
              key={img.src}
              initial={prefersReduced ? undefined : { opacity: 0, scale: 0.98 }}
              whileInView={prefersReduced ? undefined : { opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.08 * i, duration: 0.5 }}
              className="overflow-hidden rounded-2xl border"
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={img.w}
                height={img.h}
                className="h-48 md:h-64 w-full object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
                priority={i === 0}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* 10× NO benefits */}
      <section id="benefits" className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Natural sweetener</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {tenNoList.map((item, i) => (
            <motion.div
              key={item.t}
              initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
              whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: i * 0.03, duration: 0.35 }}
              className="rounded-2xl border p-4 hover:shadow-sm bg-white/70"
            >
              <div className="font-semibold">{item.t}</div>
              <div className="text-sm text-gray-700 mt-1">{item.d}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Science blurb */}
      <section id="science" className="mx-auto max-w-6xl px-4 pb-6">
        <div className="rounded-2xl border p-5 bg-white/70">
          <h3 className="text-xl font-semibold">Why it works</h3>
          <p className="mt-2 text-sm text-gray-700">
            Crafted with clinically studied, low-GI sweetening ingredients for clean sweetness and stable energy—
            no blood sugar spikes, crashes, or cravings. No artificial additives.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            *General wellness information, not medical advice. For specific conditions, consult a qualified professional.
          </p>
        </div>
      </section>

      {/* BUY CARD */}
      <section id="buy" className="mx-auto max-w-6xl px-4 py-10 md:py-16 grid md:grid-cols-[1.2fr_.8fr] gap-8 items-start">
        {/* Left */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold">Make the switch today</h2>
          <ul className="grid gap-2 text-sm text-gray-700">
            <li>• Zero Calories, Zero Sugar Spike</li>
            <li>• Tastes Just Like Sugar — No Aftertaste</li>
            <li>• Tooth-Friendly, Low GI (~0)</li>
            <li>• No Artificial Additives</li>
          </ul>
          {product?.description ? <p className="text-gray-700">{product.description}</p> : null}
        </div>

        {/* Right: purchase card */}
        <div className="md:sticky md:top-20 rounded-2xl border p-5 bg-white/80 backdrop-blur">
          <div className="flex items-baseline justify-between">
            <div className="text-lg font-semibold">{product?.name ?? "Your Product"}</div>
            <div className="text-xl font-bold">{formatPaise(unitPaise)}</div>
          </div>

          {/* Size with visible price per size */}
          <div className="mt-4">
            <label className="text-sm font-medium">Choose size</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {sizes.length === 0 ? (
                <span className="text-sm text-gray-500">No sizes configured.</span>
              ) : sizes.map((s: SizeRow) => {
                  const sp = priceFor(s);
                  return (
                    <button
                      key={s.id}
                      disabled={s.stock <= 0}
                      onClick={() => setSize(s.label)}
                      className={[
                        "rounded-xl border px-3 py-2 text-sm text-left",
                        size === s.label ? "border-gray-900" : "border-gray-300",
                        s.stock <= 0 ? "opacity-50 cursor-not-allowed" : "hover:shadow"
                      ].join(" ")}
                      aria-pressed={size === s.label}
                    >
                      <div className="font-mono">{s.label}</div>
                      <div className="text-xs text-gray-600">
                        {formatPaise(sp)} • {s.stock} left
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Qty */}
          <div className="mt-4">
            <label className="text-sm font-medium">Quantity</label>
            <div className="mt-2">
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || "1", 10)))}
                className="w-24 border rounded-lg p-2"
              />
            </div>
          </div>

          {/* Coupon */}
          <div className="mt-4">
            <label className="text-sm font-medium">Coupon (optional)</label>
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              placeholder="WELCOME10"
              className="mt-2 border rounded-lg p-2 w-full"
            />
          </div>

          <button
            onClick={handleBuy}
            disabled={isDisabled}
            className="mt-6 w-full rounded-xl border px-4 py-3 font-semibold disabled:opacity-50 hover:shadow"
          >
            {product?.out_of_stock ? "Out of stock" : "Buy now"}
          </button>

          <p className="mt-2 text-xs text-gray-500">Ships fast • Easy returns • Secure checkout</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-sm text-gray-600">
        <div className="border-t pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>© {new Date().getFullYear()} SugarPro</div>
          <nav className="flex gap-4">
            <Link className="hover:underline" href="/privacy">Privacy</Link>
            <Link className="hover:underline" href="/returns">Returns</Link>
            <Link className="hover:underline" href="/shipping">Shipping</Link>
            <Link className="hover:underline" href="/terms">Terms</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
