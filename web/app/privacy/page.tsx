import type { Metadata } from "next";
import Link from "next/link";
import styles from "../about/About.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy | OOKA",
  description: "OOKA Privacy Policy — how we collect, use, and protect your personal data. Compliant with India's DPDP Act.",
};

export default function PrivacyPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.lead}>
          Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <section className={styles.section}>
          <h2 className={styles.heading}>1. Introduction</h2>
          <p className={styles.body}>
            OOKA (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and disclose your information when you use our website and services. We comply with the Information Technology Act, 2000, and the Digital Personal Data Protection Act, 2023 (DPDP Act) of India.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>2. Data We Collect</h2>
          <p className={styles.body}>We may collect the following categories of personal data:</p>
          <ul className={styles.list}>
            <li><strong>Account information:</strong> Name, email address, password (hashed)</li>
            <li><strong>Order information:</strong> Shipping address, phone number, payment details (processed securely by our payment provider)</li>
            <li><strong>Usage data:</strong> IP address, browser type, device information, pages visited</li>
            <li><strong>Communications:</strong> Emails and messages you send to us</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>3. Purpose of Processing</h2>
          <p className={styles.body}>We use your data to:</p>
          <ul className={styles.list}>
            <li>Process and fulfil your orders</li>
            <li>Create and manage your account</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Respond to your queries and provide customer support</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>4. Data Retention</h2>
          <p className={styles.body}>
            We retain your personal data only for as long as necessary to fulfil the purposes for which it was collected, or as required by law. Order and account data are retained for a reasonable period to support warranty, returns, and legal compliance.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>5. Data Sharing</h2>
          <p className={styles.body}>
            We do not sell your personal data. We may share data with: (a) payment processors (e.g., Razorpay) to process payments; (b) logistics partners for order delivery; (c) service providers who assist our operations under strict confidentiality; (d) authorities when required by law.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>6. Your Rights</h2>
          <p className={styles.body}>Under the DPDP Act and applicable laws, you have the right to:</p>
          <ul className={styles.list}>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request erasure of your data (subject to legal retention requirements)</li>
            <li>Withdraw consent where processing is consent-based</li>
            <li>Lodge a complaint with the Data Protection Board of India</li>
          </ul>
          <p className={styles.body}>To exercise these rights, contact us at the grievance address below.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>7. Security</h2>
          <p className={styles.body}>
            We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>8. Grievance Redressal</h2>
          <p className={styles.body}>
            For any privacy-related complaints or queries, contact our Grievance Officer at the email provided on our website. We will acknowledge your complaint within 48 hours and endeavour to resolve it within 30 days, as per applicable guidelines.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>9. Changes</h2>
          <p className={styles.body}>
            We may update this Privacy Policy from time to time. The updated version will be posted on this page with a revised &quot;Last updated&quot; date. Continued use of our services after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <div className={styles.cta}>
          <Link href="/" className={styles.ctaLink}>Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
