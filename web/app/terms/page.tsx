import type { Metadata } from "next";
import Link from "next/link";
import styles from "../about/About.module.css";

export const metadata: Metadata = {
  title: "Terms of Service | OOKA",
  description: "OOKA Terms of Service — terms and conditions for using our website and purchasing products. Compliant with Consumer Protection (E-Commerce) Rules, India.",
};

export default function TermsPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.lead}>
          Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <section className={styles.section}>
          <h2 className={styles.heading}>1. Acceptance of Terms</h2>
          <p className={styles.body}>
            By accessing or using the OOKA website and services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our services. These terms comply with the Consumer Protection (E-Commerce) Rules, 2020 and the Consumer Protection Act, 2019.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>2. Use of Our Website</h2>
          <p className={styles.body}>You agree to:</p>
          <ul className={styles.list}>
            <li>Provide accurate and complete information when creating an account or placing an order</li>
            <li>Use the website only for lawful purposes</li>
            <li>Not misuse, disrupt, or attempt to gain unauthorised access to our systems or data</li>
            <li>Not use our services if you are under 18 years of age without parental consent</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>3. Products and Pricing</h2>
          <p className={styles.body}>
            All prices are displayed in Indian Rupees (₹) and include applicable taxes unless otherwise stated. We reserve the right to correct pricing errors and to modify prices. Discounts and coupons are subject to their specific terms. The final price payable is shown at checkout before you confirm the order.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>4. Orders and Payment</h2>
          <p className={styles.body}>
            Placing an order constitutes an offer to purchase. We reserve the right to accept or decline orders. Payment is processed through secure third-party payment gateways. By completing a purchase, you confirm that you have read and accepted our Return and Refund Policy and Shipping Policy, which are displayed on our website and linked at checkout.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>5. Returns, Refunds, and Cancellation</h2>
          <p className={styles.body}>
            Our Return and Refund Policy is available at <Link href="/returns" style={{ color: "var(--red)", fontWeight: 600, textDecoration: "underline" }}>/returns</Link>. By placing an order, you acknowledge that you have read and understood this policy. We do not impose cancellation charges on consumers for cancelling orders before dispatch, except where we bear similar charges for unilateral cancellations by us.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>6. Intellectual Property</h2>
          <p className={styles.body}>
            All content on this website, including text, logos, images, and design, is owned by OOKA or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or use our content without prior written permission.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>7. Limitation of Liability</h2>
          <p className={styles.body}>
            To the fullest extent permitted by law, OOKA shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services. Our liability for any claim shall not exceed the amount you paid for the product or service in question. Nothing in these terms excludes or limits our liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded by law.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>8. Governing Law and Disputes</h2>
          <p className={styles.body}>
            These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India. You may also avail of the dispute resolution mechanism under the Consumer Protection Act, 2019.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>9. Changes</h2>
          <p className={styles.body}>
            We may update these Terms of Service from time to time. Material changes will be posted on this page with an updated date. Continued use of our services after changes constitutes acceptance of the revised terms.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>10. Contact</h2>
          <p className={styles.body}>
            For questions about these terms, please contact us through the contact details provided on our website.
          </p>
        </section>

        <div className={styles.cta}>
          <Link href="/" className={styles.ctaLink}>Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
