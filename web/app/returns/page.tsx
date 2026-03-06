import type { Metadata } from "next";
import Link from "next/link";
import styles from "../about/About.module.css";

export const metadata: Metadata = {
  title: "Returns & Refunds | OOKA",
  description: "OOKA Returns and Refund Policy — how to return products and get a refund. Compliant with Consumer Protection Act, India.",
};

export default function ReturnsPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <h1 className={styles.title}>Returns & Refunds</h1>
        <p className={styles.lead}>
          We want you to be completely satisfied with your OOKA purchase. Please read our return and refund policy below.
        </p>

        <section className={styles.section}>
          <h2 className={styles.heading}>1. Return Eligibility</h2>
          <p className={styles.body}>
            You may request a return within <strong>7 days</strong> of delivery if:
          </p>
          <ul className={styles.list}>
            <li>The product is defective, damaged, or not as described</li>
            <li>You received the wrong product or size</li>
            <li>The product is unopened and in original packaging (for change-of-mind returns, subject to our discretion)</li>
          </ul>
          <p className={styles.body}>
            Due to the nature of food products, we cannot accept returns of opened or partially used items unless they are defective.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>2. How to Initiate a Return</h2>
          <p className={styles.body}>To request a return:</p>
          <ul className={styles.list}>
            <li>Email us at the contact address on our website with your order number and reason for return</li>
            <li>We will respond within 48 hours with return instructions</li>
            <li>Pack the product securely and ship it to the address we provide</li>
            <li>Once we receive and inspect the product, we will process your refund</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>3. Refund Process</h2>
          <p className={styles.body}>
            Refunds will be processed within <strong>7–14 business days</strong> after we receive the returned product and confirm eligibility. Refunds will be credited to the original payment method used for the purchase, in accordance with Reserve Bank of India guidelines.
          </p>
          <p className={styles.body}>
            For defective or incorrect items, we will also reimburse reasonable return shipping costs upon verification.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>4. Non-Refundable Situations</h2>
          <p className={styles.body}>We may not provide a refund if:</p>
          <ul className={styles.list}>
            <li>The product has been opened, used, or tampered with (except for defects)</li>
            <li>The return request is made after 7 days of delivery</li>
            <li>The product was damaged due to misuse or improper storage</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>5. Cancellation</h2>
          <p className={styles.body}>
            You may cancel your order before it is shipped at no charge. Once the order has been dispatched, cancellation may not be possible; in such cases, you may follow the return process after delivery.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>6. Grievance</h2>
          <p className={styles.body}>
            If you are not satisfied with our resolution, you may lodge a complaint with the relevant consumer forum under the Consumer Protection Act, 2019. We are committed to resolving disputes fairly and promptly.
          </p>
        </section>

        <div className={styles.cta}>
          <Link href="/" className={styles.ctaLink}>Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
