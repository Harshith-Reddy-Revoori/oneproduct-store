// web/app/admin/product/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { saveProduct } from "./actions";
import styles from "@/components/Admin.module.css";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session as unknown as { role?: string })?.role;
  if (!session || role !== "admin") redirect("/admin/login");
}

type ProductRow = Prisma.productsGetPayload<true>;

export default async function ProductAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const sp = await searchParams;
  const ok = Array.isArray(sp.ok) ? sp.ok[0] : sp.ok;
  const err = Array.isArray(sp.err) ? sp.err[0] : sp.err;

  const product = (await prisma.products.findFirst({
    where: { active: true },
  })) as ProductRow | null;

  return (
    <>
      <h1 className={styles.pageTitle}>Product</h1>

      {ok ? <div className={`${styles.alert} ${styles.alertSuccess}`}>Saved ✓</div> : null}
      {err ? <div className={`${styles.alert} ${styles.alertError}`}>{err}</div> : null}

      <section className={styles.section}>
        <form action={saveProduct} className={`${styles.formGrid} ${styles.formGrid2}`}>
          <input type="hidden" name="id" value={product?.id ?? ""} />
          <div className={styles.formGroupFull}>
            <label className={styles.label}>Name</label>
            <input
              name="name"
              defaultValue={product?.name ?? ""}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label}>Description</label>
            <textarea
              name="description"
              defaultValue={product?.description ?? ""}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Image URL</label>
            <input
              name="image_url"
              defaultValue={product?.image_url ?? ""}
              className={styles.input}
              placeholder="https://…"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Currency</label>
            <input
              name="currency"
              defaultValue={product?.currency ?? "INR"}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Base price (₹)</label>
            <input
              name="base_rupees"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product ? (Number(product.base_price_paise) / 100).toFixed(2) : "0.00"}
              className={styles.input}
            />
          </div>

          <div className={`${styles.formGroup} ${styles.checkboxRow}`}>
            <input name="out_of_stock" type="checkbox" defaultChecked={product?.out_of_stock ?? false} />
            <span>Out of stock</span>
          </div>

          <div className={`${styles.formGroup} ${styles.checkboxRow}`}>
            <input name="active" type="checkbox" defaultChecked={product?.active ?? true} />
            <span>Active (listed on site)</span>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Save product</button>
          </div>
        </form>
      </section>
    </>
  );
}
