import Link from "next/link";
import styles from "./Storefront.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.siteFooter}>
      <div className={`${styles.container} ${styles.footerWrap}`}>
        <div className={styles.footerTop}>
          <div className={styles.brandCell}>
            <div className={styles.footerBrandText} aria-hidden>OOKA</div>
            <div className={styles.tagline}>Sweetness that fits your life.</div>
          </div>

          <div className={styles.footerCols}>
            <div>
              <div className={styles.footerHead}>Product</div>
              <ul className={styles.footerList}>
                <li><Link className={styles.footerLink} href="/#daily-favourites">Shop</Link></li>
                <li><Link className={styles.footerLink} href="/#buy">Buy</Link></li>
                <li><Link className={styles.footerLink} href="/#reviews">Reviews</Link></li>
              </ul>
            </div>
            <div>
              <div className={styles.footerHead}>Learn</div>
              <ul className={styles.footerList}>
                <li><Link className={styles.footerLink} href="/about">About us</Link></li>
                <li><Link className={styles.footerLink} href="/#daily-favourites">Daily favourites</Link></li>
                <li><Link className={styles.footerLink} href="/#reviews">What people say</Link></li>
                <li><Link className={styles.footerLink} href="/#buy">Get started</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.footerDivider} />

        <div className={styles.footerBottom}>
          <div className={styles.copy}>© {new Date().getFullYear()} OOKA</div>
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
