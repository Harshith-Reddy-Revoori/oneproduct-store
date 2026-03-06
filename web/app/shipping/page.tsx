import type { Metadata } from "next";
import Link from "next/link";
import styles from "../about/About.module.css";

export const metadata: Metadata = {
  title: "Shipping & Delivery | OOKA",
  description: "OOKA Shipping Policy — delivery timelines, shipping charges, and coverage across India.",
};

export default function ShippingPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <h1 className={styles.title}>Shipping & Delivery</h1>
        <p className={styles.lead}>
          We deliver OOKA across India. Here&apos;s what you need to know about shipping and delivery.
        </p>

        <section className={styles.section}>
          <h2 className={styles.heading}>1. Delivery Coverage</h2>
          <p className={styles.body}>
            We currently ship to all serviceable pin codes across India. Delivery timelines may vary based on your location and the logistics partner assigned to your order.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>2. Delivery Timelines</h2>
          <p className={styles.body}>
            Standard delivery: <strong>3–7 business days</strong> from the date of dispatch, depending on your location.
          </p>
          <ul className={styles.list}>
            <li><strong>Metro cities:</strong> Typically 3–5 business days</li>
            <li><strong>Other locations:</strong> 5–7 business days</li>
            <li>Delivery times are estimates and may be affected by unforeseen circumstances (e.g., weather, logistics delays)</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>3. Order Processing</h2>
          <p className={styles.body}>
            Orders are processed within 1–2 business days after payment confirmation. You will receive an email with tracking details once your order is shipped.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>4. Shipping Charges</h2>
          <p className={styles.body}>
            Shipping charges, if any, are displayed at checkout before you complete your purchase. We may offer free shipping on orders above a certain value — check the product or checkout page for current offers.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>5. Tracking</h2>
          <p className={styles.body}>
            Once your order is dispatched, you will receive a tracking link via email. You can use this to monitor your shipment until delivery.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>6. Delivery Attempts</h2>
          <p className={styles.body}>
            Our logistics partner will attempt delivery at the address provided. Please ensure someone is available to receive the package, or provide alternate instructions (e.g., leave with security) if applicable. If delivery cannot be completed, the courier may contact you to reschedule.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>7. Damaged or Lost Shipments</h2>
          <p className={styles.body}>
            If your order arrives damaged or is lost in transit, please contact us within 48 hours of the expected delivery date with your order number and details. We will work with the logistics partner to resolve the issue and arrange a replacement or refund as appropriate.
          </p>
        </section>

        <div className={styles.cta}>
          <Link href="/" className={styles.ctaLink}>Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
