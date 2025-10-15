// web/components/Storefront.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import type { StoreProduct } from "@/types/product";
import styles from "./Storefront.module.css";
//import SignOutButton from "@/components/SignOutButton";

/** Local images (updated to use JIVINCHU product image) */

import patternImg from "@/app/assets/images/monk_pattern.png";
import productImg from "@/app/assets/images/monk_sweetener.jpeg";
import scienceImg from "@/app/assets/images/scientifically_proven.png";
import deliveryImg from "@/app/assets/images/easy_delivery.png";
import trustImg from "@/app/assets/images/trusted.png";

type SizeRow = StoreProduct["product_sizes"][number];

function formatPaise(p: number | null | undefined) {
  if (p == null) return "₹0.00";
  return `₹${(Number(p) / 100).toFixed(2)}`;
}

/** ---------- Icon grid data + icon component ---------- */
type IconName =
  | "leaf"
  | "shield"
  | "bolt"
  | "heart"
  | "check"
  | "star"
  | "battery"
  | "apple";

const iconFeatures: Array<{ label: string; icon: IconName }> = [
  { label: "Natural Sweetener", icon: "leaf" },
  { label: "Tooth-Friendly", icon: "shield" },
  { label: "Low Glycemic Index", icon: "bolt" },
  { label: "Clinically Studied", icon: "heart" },
  { label: "No Additives", icon: "check" },
  { label: "No Aftertaste", icon: "star" },
  { label: "Zero Energy Crash", icon: "battery" },
  { label: "Healthy Choice", icon: "apple" },
];

function FeatureIcon({ name }: { name: IconName }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "leaf":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path {...common} d="M4 14c2-6 8-8 14-10 0 6-2 12-8 14-4 2-6 0-6-4z" />
          <path {...common} d="M8 16l8-8" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path {...common} d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" />
        </svg>
      );
    case "bolt":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <polyline {...common} points="13 2 3 14 10 14 8 22 21 8 14 8 16 2" />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path
            {...common}
            d="M20 8.5c0-2.2-1.8-4-4-4-1.5 0-2.8.8-3.5 2-.7-1.2-2-2-3.5-2-2.2 0-4 1.8-4 4 0 6 7.5 9.5 8 9.5s7-3.5 7-9.5z"
          />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <rect {...common} x="3" y="3" width="18" height="18" rx="3" />
          <path {...common} d="M7 12l3 3 7-7" />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <polygon
            {...common}
            points="12 3 14.9 9.1 21.6 9.3 16 13.5 17.8 20 12 16.5 6.2 20 8 13.5 2.4 9.3 9.1 9.1 12 3"
          />
        </svg>
      );
    case "battery":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <rect {...common} x="2" y="9" width="18" height="6" rx="2" />
          <rect {...common} x="20" y="10.5" width="2" height="3" rx="0.5" />
          <path {...common} d="M6 10.5v3M9 10.5v3M12 10.5v3M15 10.5v3" />
        </svg>
      );
    case "apple":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path {...common} d="M16 8c.3-1.7 1.5-2.7 2.7-3-1.1-1.6-3.1-1.7-4.4-.8-1.3.9-1.9 2.4-1.8 3.8" />
          <path
            {...common}
            d="M12 7c-3.5 0-5.5 2.5-5.5 5.3 0 2.3 1.3 5.7 4.1 5.7 1 .1 1.8-.4 2.4-.4s1.4.5 2.4.4c2.8 0 4.1-3.4 4.1-5.7C19.5 9.5 17 7 13.5 7H12z"
          />
        </svg>
      );
  }
}

/** ---------- Benefit copy ---------- */
const noList: Array<{ t: string; d: string }> = [
  { t: "1. No Blood Sugar Spikes", d: "Steady energy—no sharp glucose swings." },
  { t: "2. No Fat Storage", d: "Supports a balanced approach to metabolism." },
  { t: "3. No Cravings or Crashes", d: "Sweetness without the rollercoaster." },
  { t: "4. No Skin Aging", d: "A smarter sweetener choice for glow-seekers." },
  { t: "5. No Cavities", d: "Doesn’t feed cavity-causing bacteria." },
  { t: "6. No Inflammation", d: "Antioxidant-forward ingredients, crafted with care." },
  { t: "7. No Cholesterol Spikes", d: "Helps keep things in a healthy range." },
  { t: "8. No Fatty Liver Risk", d: "Designed to be a gentler option for daily use." },
  { t: "9. No Hormone Chaos", d: "Keeps your routine calm and consistent." },
  { t: "10. No Gut Damage", d: "Gentle on the gut; doesn’t ferment or feed the bad guys." },
];

const testimonials = [
  { quote: "This is my new favorite monk fruit blend!", name: "Anna S.", role: "Coffee Enthusiast" },
  { quote: "No aftertaste—finally a sweetener I trust.", name: "Brian L.", role: "Dietitian" },
  { quote: "So easy to order and it arrived fast.", name: "Jillian C.", role: "Home Baker" },
  { quote: "Perfect 1:1 sugar replacement.", name: "David M.", role: "Fitness Coach" },
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

  const [mobileOpen, setMobileOpen] = useState(false);
  const scrollTo = (id: string) => {
    setMobileOpen(false);
    if (typeof document !== "undefined") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const isDisabled = !product || product.out_of_stock || !size;

  return (
    <div className={`${styles.page} ${styles.theme}`}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: `url(${patternImg.src})`, backgroundRepeat: 'repeat', backgroundSize: '220px', opacity: '0.3', pointerEvents: 'none' }} />
      {/* Background blobs */}
      <div aria-hidden className={styles.bgWrap}>
        <div className={styles.blobOne} />
        <div className={styles.blobTwo} />
      </div>

      {/* Header */}
      <header className={styles.navbar}  style={{background: 'linear-gradient(80deg, #FFFAFA 30%, #FFF3DD 40%, #FFE7C8 100%)'}}>
      
        <nav className={`${styles.navbarInner} ${styles.container}`}>
          <Link href="/" aria-label="JIVINCHU Home" className={styles.brand} style={{color:"#c89f16", fontSize:"22px"}}>
            JIVINCHU
          </Link>

          <div className={styles.navLinks} aria-label="Primary">
            <button onClick={() => scrollTo("benefits")}>Benefits</button>
            {/* <button onClick={() => scrollTo("science")}>Science</button> */}
            <button onClick={() => scrollTo("buy")}>Buy</button>
            <Link href="/account">Account</Link>
            {/* <SignOutButton className={styles.linkLikeButton} /> */}
          </div>

          <button
            className={styles.mobileToggle}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen(v => !v)}
            title="Toggle navigation"
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
        </nav>

        {mobileOpen && (
          <div id="mobile-menu" className={styles.mobileMenu}>
            <div className={styles.container}>
              <button onClick={() => scrollTo("benefits")}>Benefits</button>
              <button onClick={() => scrollTo("science")}>Science</button>
              <button onClick={() => scrollTo("buy")}>Buy</button>
              <Link href="/account">Account</Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className={`${styles.section} ${styles.container} ${styles.hero}`} style={{ position: "relative" }}>

          <motion.div
          initial={prefersReduced ? undefined : { opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={prefersReduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={styles.heroContent} style={{ position: 'relative', zIndex: 1 }}
        >
          <motion.h1
            initial={prefersReduced ? undefined : { opacity: 0, y: 14 }}
            animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.5 }}
            className={styles.heroTitle}
            whileHover={prefersReduced ? undefined : { scale: 1.01 }}
          >
            JIVINCHU<span className={styles.dot}>.</span>
          </motion.h1>

          <motion.h2
            initial={prefersReduced ? undefined : { opacity: 0, y: 10 }}
            animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.45 }}
            className={styles.heroKicker}
          >
            Monk Fruit Sweetener - total solution for sweetness.
          </motion.h2>

          <motion.p
            initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
            animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45 }}
            className={styles.heroLead}
          >
            A modern way to enjoy sweet flavor - Monk Fruit + Allulose blend for sugar-like taste without the guilt.
          </motion.p>

          <motion.div
            initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
            animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className={styles.heroBadges}
          >
            <span className={styles.badge}>Trusted by thousands</span>
          </motion.div>

          <motion.div
            initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
            animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.4 }}
            className={styles.heroCtaRow}
          >
            <motion.button
              whileHover={prefersReduced ? undefined : { scale: 1.03 }}
              whileTap={prefersReduced ? undefined : { scale: 0.98 }}
              onClick={() => scrollTo("buy")}
              className={styles.primaryBtn}
              aria-label="Shop Now"
            >
              Shop Now
            </motion.button>

            <div className={styles.price}>
              {hasVariedPrices ? <>From {formatPaise(minPricePaise)}</> : <>{formatPaise(minPricePaise)}</>}
            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* ALTERNATING MEDIA SECTION (3 rows) */}
      <section className={`${styles.section} ${styles.mediaSection}`}>
        <div className={styles.container}>
          {/* Row 1: text left, product image right (updated) */}
          <div className={styles.mediaRow}>
            <div className={styles.mediaText}>
              <h3 className={styles.mediaTitle}>Trusted by thousands.</h3>
              <p className={styles.mediaDesc}>
                JIVINCHU Monk Fruit Sweetener offers a new way to enjoy sweet flavors without compromising health or taste.
              </p>
            </div>
            <div className={styles.mediaImage}>
              <Image
                src={trustImg}
                alt="JIVINCHU Monk Fruit Sweetener packaging"
                width={1200}
                height={900}
                className={styles.mediaImgEl}
                priority
              />
            </div>
          </div>

          {/* Row 2: image left, text right */}
          <div className={`${styles.mediaRow} ${styles.reverse}`}>
            <div className={styles.mediaImage}>
              <Image
                src={scienceImg}
                alt="Scientifically formulated illustration"
                width={1200}
                height={900}
                className={styles.mediaImgEl}
              />
            </div>
            <div className={styles.mediaText}>
              <h3 className={styles.mediaTitle}>Scientifically formulated.</h3>
              <p className={styles.mediaDesc}>
                Modern, natural sweetening approach designed for everyday use.
              </p>
            </div>
          </div>

          {/* Row 3: text left, image right */}
          <div className={styles.mediaRow}>
            <div className={styles.mediaText}>
              <h3 className={styles.mediaTitle}>Easy to buy.</h3>
              <p className={styles.mediaDesc}>
                Order online and get it delivered fast—simple and reliable.
              </p>
            </div>
            <div className={styles.mediaImage}>
              <Image
                src={deliveryImg}
                alt="Fast, reliable delivery"
                width={1200}
                height={900}
                className={styles.mediaImgEl}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Sweet. Smart. JIVINCHU.</h2>
          <p className={styles.sectionLead}>
            Enjoy the sugar-like taste with zero guilt and a feel-good routine.
          </p>
          <div className={styles.benefitGrid}>
            {noList.map((item) => (
              <div key={item.t} className={styles.benefitCard}>
                <div className={styles.benefitTitle}>{item.t}</div>
                <div className={styles.benefitDesc}>{item.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ICON GRID */}
      <section className={`${styles.section} ${styles.iconGridSection}`}>
        <div className={styles.container}>
          <div className={styles.iconGrid}>
            {iconFeatures.map((f) => (
              <div key={f.label} className={styles.iconItem}>
                <div className={styles.featureIcon}>
                  <FeatureIcon name={f.icon} />
                </div>
                <div className={styles.iconLabel}>{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials — now anchorable from footer */}
      <section id="reviews" className={styles.section}>
        <div className={`${styles.container} ${styles.testimonials}`}>
          <div className={styles.tHeadingWrap}>
            <h3 className={styles.tHeading}>What customers say.</h3>
            <p className={styles.tSub}>Real reviews, real results.</p>
          </div>

          <div className={styles.tGrid}>
            {testimonials.map((t, i) => (
              <motion.blockquote
                key={i}
                className={styles.tCard}
                initial={prefersReduced ? undefined : { opacity: 0, y: 20, scale: 0.98 }}
                whileInView={prefersReduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
              >
                <p className={styles.tQuote}>“{t.quote}”</p>
                <footer className={styles.tMeta}>
                  <span className={styles.tName}>{t.name}</span>
                  <span className={styles.tSep}>&nbsp;•&nbsp;</span>
                  <span className={styles.tRole}>{t.role}</span>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>
      
      {/* BUY */}
      <section id="buy" className={styles.section}>
        <div className={styles.container}>
          
          <div className={styles.buyGrid}>
            {/* Product hero image */}
  <div className={styles.mediaImage}>
            <Image
              src={productImg}
              alt="JIVINCHU Monk Fruit Sweetener retail pouch"
              width={1200}
              height={1200}
              className={styles.mediaImgEl}
              priority
            />
          </div>
            <div>
              <h2 className={styles.sectionTitle}>Buy JIVINCHU Monk Fruit Sweetener</h2>
              <ul className={styles.buyBullets}>
                <li>• Zero Calories, Zero Sugar Spike</li>
                <li>• Tastes Like Sugar — No Aftertaste</li>
                <li>• Tooth-Friendly, Low GI (~0)</li>
                <li>• No Artificial Additives</li>
              </ul>
              {product?.description ? (
                <p className={styles.buyDesc}>{product.description}</p>
              ) : (
                <p className={styles.buyDesc}>Monk Fruit + Allulose blend. 1:1 sugar replacement for tea, coffee, baking & Indian sweets.</p>
              )}
              <div className={styles.buyCard}>
              <div className={styles.buyHeader}>
                <div className={styles.buyTitle}>{product?.name ?? "JIVINCHU's Monk Fruit Sweetener"}</div>
                <div className={styles.buyPrice}>{formatPaise(unitPaise)}</div>
              </div>
              
              {/* Sizes */}
              <div className={styles.formField}>
                <label>Choose size</label>
                <div className={styles.sizeRow}>
                  {sizes.length === 0 ? (
                    <span className={styles.muted}>No sizes configured.</span>
                  ) : (
                    sizes.map((s: SizeRow) => {
                      const sp = priceFor(s);
                      const selected = s.label === size;
                      return (
                        <button
                          key={s.id}
                          disabled={s.stock <= 0}
                          onClick={() => setSize(s.label)}
                          className={styles.sizeBtn}
                          aria-pressed={selected}
                          title={s.stock <= 0 ? "Out of stock" : s.label}
                        >
                          <div className={styles.sizeLabel}>{s.label}</div>
                          <div className={styles.sizeSub}>
                            {formatPaise(sp)} • {s.stock} left
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Qty */}
              <div className={styles.formField}>
                <label>Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || "1", 10)))}
                  className={`${styles.input} ${styles.inputSmall}`}
                />
              </div>

              {/* Coupon */}
              <div className={styles.formField}>
                <label>Coupon (optional)</label>
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="WELCOME10"
                  className={styles.input}
                />
              </div>

              <button
                onClick={handleBuy}
                disabled={isDisabled}
                className={styles.primaryBtn}
                aria-disabled={isDisabled}
              >
                {product?.out_of_stock ? "Out of stock" : "Buy now"}
              </button>

              <p className={styles.buyFine}>Ships fast • Easy returns • Secure checkout</p>
            </div>
          </div>
        </div>
            </div>


            {/* Purchase card */}
            
      </section>

      {/* FOOTER — redesigned */}
      <footer className={styles.siteFooter} style={{background: 'linear-gradient(40deg, #FFFAFA 0%, #FFF3DD 40%, #FFE7C8 100%)'}}>
        
        <div className={`${styles.container} ${styles.footerWrap}`}>
          <div className={styles.footerTop}>
            <div className={styles.brandCell}>
              <div className={styles.brandMark} aria-hidden>
                {/* simple brand glyph: square, circle, triangle */}
                <svg viewBox="0 0 64 24">
                  <rect x="0" y="12" width="10" height="10" rx="2" fill="#d4d4d8" />
                  <circle cx="22" cy="17" r="6" fill="#d4d4d8" />
                  <polygon points="40,22 48,8 56,22" fill="#d4d4d8" />
                </svg>
              </div>
              <div className={styles.tagline}>Sweet. Smart. JIVINCHU.</div>
            </div>

            <div className={styles.footerCols}>
              <div>
                <div className={styles.footerHead}>Product</div>
                <ul className={styles.footerList}>
                  <li><a className={styles.footerLink} href="#benefits">Benefits</a></li>
                  <li><a className={styles.footerLink} href="#buy">Buy</a></li>
                  <li><Link className={styles.footerLink} href="/faq">FAQ</Link></li>
                </ul>
              </div>
              <div>
                <div className={styles.footerHead}>Learn</div>
                <ul className={styles.footerList}>
                  <li><a className={styles.footerLink} href="#science">Science</a></li>
                  <li><a className={styles.footerLink} href="#reviews">Reviews</a></li>
                  <li><Link className={styles.footerLink} href="/how-it-works">How It Works</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.footerDivider} />

          <div className={styles.footerBottom}>
            <div className={styles.copy}>© {new Date().getFullYear()} JIVINCHU</div>
            <nav className={styles.legalNav}>
              <Link className={styles.footerLink} href="/privacy">Privacy</Link>
              <Link className={styles.footerLink} href="/returns">Returns</Link>
              <Link className={styles.footerLink} href="/shipping">Shipping</Link>
              <Link className={styles.footerLink} href="/terms">Terms</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
