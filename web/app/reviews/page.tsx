import type { Metadata } from "next";
import Link from "next/link";
import { TESTIMONIALS } from "@/lib/testimonials";
import styles from "./Reviews.module.css";

export const metadata: Metadata = {
  title: "Customer Reviews | OOKA",
  description: "See what people are saying about OOKA Monk Fruit Sweetener. Real reviews from coffee enthusiasts, dietitians, home bakers, and more.",
};

export default function ReviewsPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <h1 className={styles.title}>What people are saying about us</h1>
        <p className={styles.lead}>
          Real reviews from real people who love OOKA.
        </p>

        <ul className={styles.list} aria-label="Customer reviews">
          {TESTIMONIALS.map((t, i) => (
            <li key={i} className={styles.card}>
              <blockquote>
                <p className={styles.quote}>&ldquo;{t.quote}&rdquo;</p>
                <footer className={styles.meta}>
                  <span className={styles.name}>{t.name}</span>
                  <span className={styles.role}>{t.role}</span>
                </footer>
              </blockquote>
            </li>
          ))}
        </ul>

        <div className={styles.cta}>
          <Link href="/#buy" className={styles.ctaLink}>
            Try OOKA
          </Link>
        </div>
      </div>
    </div>
  );
}
