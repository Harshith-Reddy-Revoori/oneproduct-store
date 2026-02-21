// web/app/admin/sizes/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { formatPaise } from "@/lib/money";
import type { Prisma } from "@prisma/client";
import { addSize, updateSize, deleteSize } from "./actions";
import styles from "@/components/Admin.module.css";

/* ------------ auth ------------ */
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session as unknown as { role?: string })?.role;
  if (!session || role !== "admin") redirect("/admin/login");
}

/* ------------ types ------------ */
type ProductRow = Prisma.productsGetPayload<true>;
type SizeRow = Prisma.product_sizesGetPayload<true>;

type AdminSize = {
  id: string;
  label: string;
  stock: number;
  price_override_paise: number | null;
  is_active: boolean;
};

function toAdminSizes(rows: SizeRow[]) {
  return rows.map((s) => ({
    id: s.id,
    label: s.label,
    stock: Number(s.stock),
    price_override_paise: s.price_override_paise == null ? null : Number(s.price_override_paise),
    is_active: s.is_active,
  })) as AdminSize[];
}

/* ------------ page ------------ */

export default async function SizesAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const sp = await searchParams;
  const ok = Array.isArray(sp.ok) ? sp.ok[0] : sp.ok;
  const err = Array.isArray(sp.err) ? sp.err[0] : sp.err;

  const p = (await prisma.products.findFirst({
    where: { active: true },
  })) as ProductRow | null;

  if (!p) {
    return (
      <>
        <h1 className={styles.pageTitle}>Sizes</h1>
        <p className={styles.emptyState}>No active product found. Create one in the admin.</p>
      </>
    );
  }

  const sizes = toAdminSizes(
    (await prisma.product_sizes.findMany({
      where: { product_id: p.id },
      orderBy: { label: "asc" },
    })) as SizeRow[],
  );

  return (
    <>
      <h1 className={styles.pageTitle}>Sizes — {p.name}</h1>

      {ok ? <div className={`${styles.alert} ${styles.alertSuccess}`}>Saved ✓</div> : null}
      {err ? <div className={`${styles.alert} ${styles.alertError}`}>{err}</div> : null}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Add size</h2>
        <form action={addSize} className={`${styles.formGrid} ${styles.formGrid2}`}>
          <input type="hidden" name="product_id" value={p.id} />
          <div className={styles.formGroup}>
            <input name="label" placeholder="Label (e.g., 250g)" className={styles.input} required />
          </div>
          <div className={styles.formGroup}>
            <input name="stock" type="number" min="0" step="1" placeholder="Stock" className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <input name="price_rupees" type="number" step="0.01" min="0" placeholder="Price override ₹ (optional)" className={styles.input} />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Add</button>
          </div>
        </form>
        <p className={styles.sectionHint}>Leave price blank to use product base price.</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Existing sizes</h2>
        {sizes.length === 0 ? (
          <p className={styles.emptyState}>No sizes yet.</p>
        ) : (
          <div className={styles.formGrid} style={{ gap: "12px" }}>
            {sizes.map((s) => (
              <div key={s.id} className={`${styles.formRow} ${styles.formRowSizes}`}>
                <div className={styles.rowMono}>{s.label}</div>

                <form action={updateSize} style={{ display: "contents" }}>
                  <input type="hidden" name="id" value={s.id} />
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={s.stock}
                    className={styles.formRowItem}
                  />
                  <input
                    name="price_rupees"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={s.price_override_paise == null ? "" : (s.price_override_paise / 100).toFixed(2)}
                    className={styles.formRowItem}
                  />
                  <label className={styles.checkboxRow}>
                    <input name="is_active" type="checkbox" defaultChecked={s.is_active} />
                    <span>Active</span>
                  </label>
                  <button type="submit" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>Save</button>
                </form>

                <div className={styles.rowMeta}>
                  {s.price_override_paise == null ? "Base price" : formatPaise(s.price_override_paise)} • {s.stock} in stock
                </div>

                <form action={deleteSize}>
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}>Delete</button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
