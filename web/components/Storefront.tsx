// web/components/Storefront.tsx – 52sundaze-style, red/white theme, carousel, lifestyle-tote
"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import type { StoreProduct } from "@/types/product";
import styles from "./Storefront.module.css";

type SizeRow = StoreProduct["product_sizes"][number];

function formatPaise(p: number | null | undefined) {
  if (p == null) return "₹0.00";
  return `₹${(Number(p) / 100).toFixed(2)}`;
}

const BADGES = [
  "✧ ZERO GLYCEMIC INDEX ✧",
  "✧ PLANT BASED ✧",
  "✧ NO ADDED SUGAR ✧",
];

const MARQUEE_PHRASES = [
  "Sweetness that fits your life.",
  "Zero Sugar, Zero Cavities.",
  "Sweetness from nature's purest source.",
];

const CAROUSEL_IMAGES = [
  { src: "/ooka/hero-face.png", alt: "OOKA – Zero Sugar, Zero Cavities" },
  { src: "/ooka/coffee-pour.png", alt: "OOKA sweetener with coffee" },
  { src: "/ooka/active-run.png", alt: "OOKA active lifestyle" },
];

const TESTIMONIALS = [
  { quote: "This is my new favorite monk fruit blend! No aftertaste at all.", name: "Anna S.", role: "Coffee enthusiast" },
  { quote: "Finally a sweetener I can use daily. Doesn't feed dental bacteria.", name: "Brian L.", role: "Dietitian" },
  { quote: "Perfect 1:1 sugar replacement for my baking. Game changer.", name: "Jillian C.", role: "Home baker" },
  { quote: "So easy to order and it arrived fast. Loving it.", name: "David M.", role: "Fitness coach" },
];

const fadeInUp = { opacity: 0, y: 28 };
const fadeInUpEnd = { opacity: 1, y: 0 };
const fadeIn = { opacity: 0 };
const fadeInEnd = { opacity: 1 };
const transitionFast = { duration: 0.4, ease: "easeOut" as const };
const transitionSlow = { duration: 0.7, ease: "easeOut" as const };

export default function Storefront({ product }: { product: StoreProduct | null }) {
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const noMotion = !!prefersReduced;

  const [carouselIndex, setCarouselIndex] = useState(0);

  const sizes = useMemo<StoreProduct["product_sizes"]>(
    () => (product?.product_sizes ?? []) as StoreProduct["product_sizes"],
    [product]
  );

  const priceFor = useCallback(
    (s: SizeRow): number => (s.price_override_paise ?? (product?.base_price_paise ?? 0)) as number,
    [product?.base_price_paise]
  );

  const prices = sizes.map(priceFor);
  const minPricePaise = prices.length > 0 ? Math.min(...prices) : (product?.base_price_paise ?? 0);
  const hasVariedPrices = prices.length > 1 && prices.some((p) => p !== prices[0]);

  const inStockSizes = sizes.filter((s) => s.stock > 0);
  const defaultLabel = inStockSizes[0]?.label ?? sizes[0]?.label ?? "";
  const [size, setSize] = useState<string>(defaultLabel);
  const [qty, setQty] = useState<number>(1);
  const [coupon, setCoupon] = useState<string>("");

  useEffect(() => {
    if (noMotion) return;
    const t = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % CAROUSEL_IMAGES.length);
    }, 4500);
    return () => clearInterval(t);
  }, [noMotion]);

  const handleBuy = () => {
    if (!size) {
      alert("Please choose a size.");
      return;
    }
    router.push(
      `/checkout?size=${encodeURIComponent(size)}&qty=${qty}${coupon ? `&coupon=${encodeURIComponent(coupon)}` : ""}`
    );
  };

  const scrollTo = (id: string) => {
    if (typeof document !== "undefined") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const isDisabled = !product || product.out_of_stock || !size;

  return (
    <div className={styles.page}>
      {/* Hero – desktop: full-bleed product_hero, text + Shop Now overlay. Mobile: stacked text → jar (product_hero_m) → button. */}
      <section className={styles.heroSection} aria-label="Hero">
        {/* Desktop hero: product_hero full-bleed, text + button on top */}
        <div className={styles.heroDesktop}>
          <div className={styles.heroBg}>
            <Image
              src="/ooka/product_hero.png"
              alt=""
              fill
              className={styles.heroBgImage}
              priority
              sizes="(max-width: 899px) 0px, 100vw"
            />
            <div className={styles.heroOverlay} aria-hidden />
          </div>
          <div className={styles.heroContentWrap}>
            <motion.h1
              className={styles.heroTitle}
              initial={noMotion ? fadeInUp : undefined}
              animate={noMotion ? fadeInUpEnd : undefined}
              transition={{ ...transitionSlow, delay: 0.1 }}
            >
              OOKA<span className={styles.tm}>™</span>
            </motion.h1>
            <motion.p
              className={styles.heroTagline}
              initial={noMotion ? fadeInUp : undefined}
              animate={noMotion ? fadeInUpEnd : undefined}
              transition={{ ...transitionSlow, delay: 0.2 }}
            >
              Zero Sugar, Zero Cavities
            </motion.p>
            <motion.p
              className={styles.heroSub}
              initial={noMotion ? fadeIn : undefined}
              animate={noMotion ? fadeInEnd : undefined}
              transition={{ ...transitionSlow, delay: 0.3 }}
            >
              Doesn&apos;t feed dental bacteria that cause decay.
            </motion.p>
            <motion.div
              className={styles.heroCtaWrap}
              initial={noMotion ? fadeInUp : undefined}
              animate={noMotion ? fadeInUpEnd : undefined}
              transition={{ ...transitionSlow, delay: 0.4 }}
            >
              <motion.button
                className={styles.heroShopBtn}
                onClick={() => scrollTo("buy")}
                whileHover={noMotion ? undefined : { scale: 1.03 }}
                whileTap={noMotion ? undefined : { scale: 0.98 }}
              >
                Shop Now
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Mobile hero: product_hero_m as full-bleed background, text + Shop Now overlaid on top */}
        <div className={styles.heroMobile}>
          <div className={styles.heroMobileBg}>
            <Image
              src="/ooka/product_hero_m.png"
              alt=""
              fill
              className={styles.heroMobileBgImage}
              sizes="100vw"
              priority
            />
            <div className={styles.heroMobileOverlay} aria-hidden />
          </div>
          <div className={styles.heroMobileContent}>
            <div className={styles.heroMobileCopy}>
              <motion.h1
                className={styles.heroMobileTitle}
                initial={noMotion ? fadeInUp : undefined}
                animate={noMotion ? fadeInUpEnd : undefined}
                transition={{ ...transitionSlow, delay: 0.1 }}
              >

              </motion.h1>
              <motion.p
                className={styles.heroMobileTagline}
                initial={noMotion ? fadeInUp : undefined}
                animate={noMotion ? fadeInUpEnd : undefined}
                transition={{ ...transitionSlow, delay: 0.2 }}
              >
                Zero Sugar, Zero Cavities
              </motion.p>
              <motion.p
                className={styles.heroMobileSub}
                initial={noMotion ? fadeIn : undefined}
                animate={noMotion ? fadeInEnd : undefined}
                transition={{ ...transitionSlow, delay: 0.3 }}
              >
                Doesn&apos;t feed dental bacteria that cause decay.
              </motion.p>
            </div>
            <motion.div
              className={styles.heroMobileCta}
              initial={noMotion ? fadeInUp : undefined}
              animate={noMotion ? fadeInUpEnd : undefined}
              transition={{ ...transitionSlow, delay: 0.4 }}
            >
              <motion.button
                className={styles.heroShopBtn}
                onClick={() => scrollTo("buy")}
                whileHover={noMotion ? undefined : { scale: 1.03 }}
                whileTap={noMotion ? undefined : { scale: 0.98 }}
              >
                Shop Now
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className={styles.marqueeSection} aria-hidden>
        <div className={styles.marqueeTrack}>
          {[...MARQUEE_PHRASES, ...MARQUEE_PHRASES].map((phrase, i) => (
            <span key={i} className={styles.marqueeItem}>
              {phrase}
            </span>
          ))}
        </div>
      </section>

      {/* Badges row */}
      <motion.section
        className={styles.badgesSection}
        initial={noMotion ? { opacity: 0, y: 20 } : undefined}
        whileInView={noMotion ? { opacity: 1, y: 0 } : undefined}
        viewport={{ once: true, amount: 0.5 }}
        transition={transitionSlow}
      >
        <div className={styles.badgesWrap}>
          {BADGES.map((badge, i) => (
            <motion.span
              key={badge}
              className={styles.badgePill}
              initial={noMotion ? { opacity: 0, scale: 0.95 } : undefined}
              whileInView={noMotion ? { opacity: 1, scale: 1 } : undefined}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, ...transitionFast }}
            >
              {badge}
            </motion.span>
          ))}
        </div>
      </motion.section>

      {/* Image carousel – hero-face, coffee-pour, active-run */}
      <section className={styles.carouselSection} aria-label="Gallery">
        <div className={styles.carouselWrap}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={carouselIndex}
              className={styles.carouselSlide}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Image
                src={CAROUSEL_IMAGES[carouselIndex].src}
                alt={CAROUSEL_IMAGES[carouselIndex].alt}
                fill
                className={styles.carouselImage}
                sizes="100vw"
              />
            </motion.div>
          </AnimatePresence>
          <div className={styles.carouselDots}>
            {CAROUSEL_IMAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                className={styles.carouselDot}
                aria-current={i === carouselIndex}
                onClick={() => setCarouselIndex(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Lipstick-style section: Daily favourites with horizontal strip animation (52sundaze) */}
      <section className={styles.lipstickSection} id="daily-favourites">
        <div className={styles.container}>
          <motion.div
            className={styles.lipstickHeader}
            initial={noMotion ? undefined : { opacity: 0, y: 24 }}
            whileInView={noMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={transitionSlow}
          >
            <span className={styles.lipstickLabel}>DAILy favourites</span>
            <h2 className={styles.lipstickTitle}>Backed by Science</h2>
            <p className={styles.lipstickSub}>SWEETENER REIMAGINED</p>
          </motion.div>
          <motion.div
            className={styles.lipstickStrip}
            initial={noMotion ? undefined : { opacity: 0 }}
            whileInView={noMotion ? undefined : { opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              className={styles.lipstickCard}
              initial={noMotion ? undefined : { opacity: 0, x: -40 }}
              whileInView={noMotion ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ ...transitionSlow, delay: 0.3 }}
              onClick={() => scrollTo("buy")}
            >
              <div className={styles.lipstickCardImage}>
                <Image
                  src="/ooka/product-jar.png"
                  alt="OOKA Monk Fruit Sweetener"
                  width={240}
                  height={280}
                  className={styles.roundedImage}
                />
              </div>
              <div className={styles.lipstickCardInfo}>
                <span className={styles.lipstickCardTitle}>Monk Fruit Allulose Sweetener</span>
                <span className={styles.lipstickCardPrice}>
                  {hasVariedPrices ? `From ${formatPaise(minPricePaise)}` : formatPaise(minPricePaise)}
                </span>
                <motion.span
                  className={styles.quickAddBtn}
                  whileHover={noMotion ? undefined : { scale: 1.02 }}
                  whileTap={noMotion ? undefined : { scale: 0.98 }}
                >
                  Quick add
                </motion.span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Sweetness comparison table */}
      <section className={styles.comparisonSection} aria-labelledby="comparison-heading">
        <div className={styles.container}>
          <motion.div
            className={styles.comparisonHeader}
            initial={noMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={noMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={transitionSlow}
          >
            <h2 id="comparison-heading" className={styles.comparisonTitle}>
              How OOKA Compares
            </h2>
            <p className={styles.comparisonSub}>
              See how our monk fruit + allulose blend stacks up against sugar and other sweeteners.
            </p>
          </motion.div>
          <motion.div
            className={styles.comparisonImageWrap}
            initial={noMotion ? undefined : { opacity: 0, y: 24 }}
            whileInView={noMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ ...transitionSlow, delay: 0.15 }}
          >
            <Image
              src="/ooka/sweetness_comparision.jpeg"
              alt="Sweetness comparison: OOKA monk fruit allulose vs sugar, stevia, and other sweeteners"
              width={900}
              height={600}
              className={styles.comparisonImage}
              sizes="(max-width: 900px) 100vw, 900px"
            />
          </motion.div>
        </div>
      </section>

      {/* Lifestyle-tote – standalone section with heading and animation */}
      <section className={styles.toteSection}>
        <motion.div
          className={styles.toteInner}
          initial={noMotion ? undefined : { opacity: 0 }}
          whileInView={noMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.toteImageWrap}>
            <Image
              src="/ooka/lifestyle-tote.png"
              alt="Sweetness that fits your life – OOKA in your everyday"
              fill
              className={styles.toteImage}
              sizes="100vw"
            />
            <div className={styles.toteOverlay} />
          </div>
          <div className={styles.toteContent}>
            <motion.h2
              className={styles.toteHeading}
              initial={noMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={noMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...transitionSlow, delay: 0.2 }}
            >
              Sweetness that fits your life.
            </motion.h2>
            <motion.p
              className={styles.toteSub}
              initial={noMotion ? undefined : { opacity: 0, y: 12 }}
              whileInView={noMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...transitionSlow, delay: 0.35 }}
            >
              Sugar cravings · Dessert addiction · 9–5 hustle · Wellness era · Gym + dessert balance · No sugar crash
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* Embrace section */}
      <section className={styles.embraceSection}>
        <div className={styles.embraceInner}>
          <motion.p
            className={styles.embraceLead}
            initial={noMotion ? fadeInUp : undefined}
            whileInView={noMotion ? fadeInUpEnd : undefined}
            viewport={{ once: true }}
            transition={transitionSlow}
          >
            Embrace the sweetness with us.
          </motion.p>
          <motion.p
            className={styles.embraceSub}
            initial={noMotion ? fadeIn : undefined}
            whileInView={noMotion ? fadeInEnd : undefined}
            viewport={{ once: true }}
            transition={{ ...transitionSlow, delay: 0.1 }}
          >
            Redefining sweetness. Through nature & fun.
          </motion.p>
          <motion.a
            href="#buy"
            className={styles.embraceLink}
            onClick={(e) => { e.preventDefault(); scrollTo("buy"); }}
            initial={noMotion ? fadeInUp : undefined}
            whileInView={noMotion ? fadeInUpEnd : undefined}
            viewport={{ once: true }}
            transition={{ ...transitionSlow, delay: 0.2 }}
          >
            ABOUT US
          </motion.a>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className={styles.section}>
        <div className={styles.container}>
          <motion.h2
            className={styles.testimonialHeading}
            initial={noMotion ? fadeInUp : undefined}
            whileInView={noMotion ? fadeInUpEnd : undefined}
            viewport={{ once: true }}
            transition={transitionFast}
          >
            This is literally what people are saying about us
          </motion.h2>
          <div className={styles.tGrid}>
            {TESTIMONIALS.map((t, i) => (
              <motion.blockquote
                key={i}
                className={styles.tCard}
                initial={noMotion ? { opacity: 0, y: 24 } : undefined}
                whileInView={noMotion ? { opacity: 1, y: 0 } : undefined}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.08, ...transitionFast }}
              >
                <p className={styles.tQuote}>&ldquo;{t.quote}&rdquo;</p>
                <footer className={styles.tMeta}>
                  <span className={styles.tName}>{t.name}</span>
                  <span className={styles.tRole}>{t.role}</span>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Buy section */}
      <section id="buy" className={styles.buySection}>
        <div className={styles.container}>
          <div className={styles.buyGrid}>
            <motion.div
              className={styles.buyImageWrap}
              initial={noMotion ? { opacity: 0, x: -24 } : undefined}
              whileInView={noMotion ? { opacity: 1, x: 0 } : undefined}
              viewport={{ once: true, amount: 0.2 }}
              transition={transitionSlow}
            >
              <Image
                src="/ooka/product-jar.png"
                alt={product?.name ?? "OOKA Monk Fruit Sweetener"}
                width={520}
                height={620}
                className={styles.roundedImage}
              />
            </motion.div>
            <div className={styles.buyFormWrap}>
              <h2 className={styles.buyTitle}>{product?.name ?? "OOKA Monk Fruit Allulose Sweetener"}</h2>
              <p className={styles.buyPrice}>
                {hasVariedPrices ? `From ${formatPaise(minPricePaise)}` : formatPaise(minPricePaise)}
              </p>
              <ul className={styles.buyBullets}>
                <li>Zero calories, zero sugar spike</li>
                <li>Tastes like sugar — no aftertaste</li>
                <li>Tooth-friendly, zero glycemic</li>
                <li>Plant based, no artificial additives</li>
              </ul>
              {product?.description && <p className={styles.buyDesc}>{product.description}</p>}
              <div className={styles.buyCard}>
                <div className={styles.formField}>
                  <label>Choose size</label>
                  <div className={styles.sizeRow}>
                    {sizes.length === 0 ? (
                      <span className={styles.muted}>No sizes configured.</span>
                    ) : (
                      sizes.map((s: SizeRow) => {
                        const selected = s.label === size;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            disabled={s.stock <= 0}
                            onClick={() => setSize(s.label)}
                            className={styles.sizeBtn}
                            aria-pressed={selected}
                          >
                            <span className={styles.sizeLabel}>{s.label}</span>
                            <span className={styles.sizeSub}>{formatPaise(priceFor(s))} · {s.stock} left</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
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
                <div className={styles.formField}>
                  <label>Coupon (optional)</label>
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    placeholder="WELCOME10"
                    className={styles.input}
                  />
                </div>
                <motion.button
                  onClick={handleBuy}
                  disabled={isDisabled}
                  className={styles.primaryBtn}
                  whileHover={noMotion ? undefined : { scale: 1.02 }}
                  whileTap={noMotion ? undefined : { scale: 0.98 }}
                >
                  {product?.out_of_stock ? "Out of stock" : "Buy now"}
                </motion.button>
                <p className={styles.buyFine}>Ships fast · Easy returns · Secure checkout</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
