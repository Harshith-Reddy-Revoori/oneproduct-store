import Link from "next/link";
import styles from "./Storefront.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.siteFooter} style={{background: 'linear-gradient(40deg, #FFFAFA 0%, #FFF3DD 40%, #FFE7C8 100%)'}}>
      <div className={`${styles.container} ${styles.footerWrap}`}>
        <div className={styles.footerTop}>
          <div className={styles.brandCell}>
            <div className={styles.brandMark} aria-hidden>
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
                <li><Link className={styles.footerLink} href="/#benefits">Benefits</Link></li>
                <li><Link className={styles.footerLink} href="/#buy">Buy</Link></li>
                <li><Link className={styles.footerLink} href="/faq">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <div className={styles.footerHead}>Learn</div>
              <ul className={styles.footerList}>
                <li><Link className={styles.footerLink} href="/#science">Science</Link></li>
                <li><Link className={styles.footerLink} href="/#reviews">Reviews</Link></li>
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
  );
}
