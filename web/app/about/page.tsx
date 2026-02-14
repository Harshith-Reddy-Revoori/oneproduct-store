import type { Metadata } from "next";
import Link from "next/link";
import styles from "./About.module.css";

export const metadata: Metadata = {
  title: "About Us | OOKA",
  description: "Learn about OOKA — our mission to bring natural sweetness that fits your life. Zero sugar, zero cavities.",
};

export default function AboutPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <h1 className={styles.title}>About OOKA</h1>
        <p className={styles.lead}>
          We believe sweetness should fit your life — without the guilt, the sugar crash, or the cavities.
        </p>

        <section className={styles.section}>
          <h2 className={styles.heading}>Our Story</h2>
          <p className={styles.body}>
            OOKA was born from a simple idea: what if you could enjoy the taste of sugar in your coffee, baking, and everyday life without the downsides? We set out to create a natural sweetener that tastes great, supports your wellness goals, and doesn’t feed the bacteria that cause tooth decay. Our Monk Fruit Allulose Sweetener is the result — plant-based, zero glycemic index, and designed to be the one sweetener you can reach for every day.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Our Mission</h2>
          <p className={styles.body}>
            Our mission is to make &quot;Sweetness that fits your life&quot; a reality for everyone. We want to help people enjoy desserts, drinks, and daily treats without worrying about blood sugar spikes, empty calories, or dental health. We’re committed to offering a product that is clean-label, scientifically backed, and easy to use — whether you’re managing sugar intake, living an active lifestyle, or simply choosing better ingredients for you and your family.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>What We Stand For</h2>
          <ul className={styles.list}>
            <li><strong>Zero sugar, zero cavities</strong> — Our sweetener doesn’t feed cavity-causing bacteria, so you can enjoy sweetness without the dental downside.</li>
            <li><strong>Natural &amp; plant-based</strong> — We use monk fruit and allulose from natural sources, with no artificial additives.</li>
            <li><strong>Backed by science</strong> — We formulate for zero glycemic impact and a taste that mirrors sugar, so switching is easy.</li>
            <li><strong>For everyday life</strong> — From your morning coffee to gym + dessert balance, 9–5 hustle to wellness era — OOKA is designed to fit in.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Our Agenda</h2>
          <p className={styles.body}>
            We’re here to redefine how people think about sweetness. Our agenda is to make natural, tooth-friendly sweeteners accessible and enjoyable — so that &quot;no added sugar&quot; doesn’t mean &quot;no fun.&quot; We will keep improving our product, listening to our community, and spreading the message that you can have sweetness that fits your life: no sugar crash, no guilt, no compromise.
          </p>
        </section>

        <div className={styles.cta}>
          <Link href="/#buy" className={styles.ctaLink}>
            Try OOKA
          </Link>
        </div>
      </div>
    </div>
  );
}
