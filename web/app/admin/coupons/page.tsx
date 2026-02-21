// web/app/admin/coupons/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { formatPaise } from "@/lib/money";
import type { Prisma } from "@prisma/client";
import { addCoupon, updateCoupon, deleteCoupon } from "./actions";
import styles from "@/components/Admin.module.css";

/* ---------------- helpers ---------------- */

function dateToInputValue(d?: string | Date | null): string {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const tzOffset = dt.getTimezoneOffset() * 60000;
  const local = new Date(dt.getTime() - tzOffset).toISOString().slice(0, 16);
  return local; // "YYYY-MM-DDTHH:mm"
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session as unknown as { role?: string })?.role;
  if (!session || role !== "admin") redirect("/admin/login");
}

/** Prisma coupon row type — use `true` for full row */
type CouponRow = Prisma.couponsGetPayload<true>;

/** Admin DTO with numbers (no bigint) and strict kind union */
type AdminCoupon = {
  id: string;
  code: string;
  kind: "AMOUNT" | "PERCENT";
  value: number;
  min_amount_paise: number;
  valid_from: Date | null;
  valid_to: Date | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

function toAdminCouponList(rows: CouponRow[]): AdminCoupon[] {
  return rows.map((c) => {
    const k = String(c.kind || "").toUpperCase();
    const kind: "AMOUNT" | "PERCENT" = k === "AMOUNT" ? "AMOUNT" : "PERCENT";
    return {
      id: c.id,
      code: c.code,
      kind,
      value: Number(c.value),
      min_amount_paise: Number(c.min_amount_paise ?? 0),
      valid_from: c.valid_from,
      valid_to: c.valid_to,
      usage_limit: c.usage_limit == null ? null : Number(c.usage_limit),
      used_count: Number(c.used_count ?? 0),
      is_active: c.is_active,
      created_at: c.created_at,
      updated_at: c.updated_at,
    };
  });
}

/* ---------------- page ---------------- */

export default async function CouponsAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const sp = await searchParams;
  const ok = Array.isArray(sp.ok) ? sp.ok[0] : sp.ok;
  const err = Array.isArray(sp.err) ? sp.err[0] : sp.err;

  const coupons = (await prisma.coupons.findMany({
    orderBy: { created_at: "desc" },
  })) as CouponRow[];

  const list: AdminCoupon[] = toAdminCouponList(coupons);

  return (
    <>
      <h1 className={styles.pageTitle}>Coupons</h1>

      {ok ? <div className={`${styles.alert} ${styles.alertSuccess}`}>Saved ✓</div> : null}
      {err ? <div className={`${styles.alert} ${styles.alertError}`}>{err}</div> : null}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Create coupon</h2>
        <form action={addCoupon} className={`${styles.formGrid} ${styles.formGrid2}`}>
          <div className={styles.formGroup}>
            <input
              name="code"
              placeholder="CODE (e.g., WELCOME10)"
              className={`${styles.input} ${styles.rowMono}`}
              style={{ textTransform: "uppercase" }}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <select name="kind" className={styles.select} defaultValue="PERCENT">
              <option value="PERCENT">PERCENT</option>
              <option value="AMOUNT">AMOUNT</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <input name="value" type="number" step="1" min="0" placeholder="Value" className={styles.input} required />
          </div>
          <div className={styles.formGroup}>
            <input name="min_rupees" type="number" step="0.01" min="0" placeholder="Min ₹ (optional)" className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <input name="valid_from" type="datetime-local" className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <input name="valid_to" type="datetime-local" className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <input name="usage_limit" type="number" min="0" step="1" placeholder="Usage limit (optional)" className={styles.input} />
          </div>
          <div className={`${styles.formGroup} ${styles.checkboxRow}`}>
            <input name="is_active" type="checkbox" defaultChecked />
            <span>Active</span>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Create</button>
          </div>
        </form>
        <p className={styles.sectionHint}>
          <b>PERCENT:</b> value is 1–100. <b>AMOUNT:</b> value is rupees (we store paise).
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Existing coupons</h2>

        {list.length === 0 ? (
          <p className={styles.emptyState}>No coupons yet.</p>
        ) : (
          <div className={styles.formGrid} style={{ gap: "12px" }}>
            {list.map((c: AdminCoupon) => (
              <div key={c.id} className={styles.section} style={{ marginBottom: "12px", padding: "16px" }}>
                <div className={styles.formGrid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", alignItems: "center", gap: "12px" }}>
                  <div className={styles.rowMono}>{c.code}</div>

                  <form action={updateCoupon} style={{ display: "contents" }}>
                    <input type="hidden" name="id" value={c.id} />
                    <select name="kind" className={styles.input} defaultValue={c.kind}>
                      <option value="PERCENT">PERCENT</option>
                      <option value="AMOUNT">AMOUNT</option>
                    </select>
                    <input
                      name="value"
                      type="number"
                      step="1"
                      min="0"
                      defaultValue={c.kind === "PERCENT" ? c.value : Math.round(c.value / 100)}
                      className={styles.input}
                    />
                    <input
                      name="min_rupees"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={(c.min_amount_paise / 100).toFixed(2)}
                      className={styles.input}
                    />
                    <input name="valid_from" type="datetime-local" defaultValue={dateToInputValue(c.valid_from ?? null)} className={styles.input} />
                    <input name="valid_to" type="datetime-local" defaultValue={dateToInputValue(c.valid_to ?? null)} className={styles.input} />
                    <input name="usage_limit" type="number" min="0" step="1" defaultValue={c.usage_limit ?? ""} className={styles.input} />
                    <label className={styles.checkboxRow}>
                      <input name="is_active" type="checkbox" defaultChecked={c.is_active} />
                      <span>Active</span>
                    </label>
                    <button type="submit" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>Save</button>
                  </form>

                  <div className={styles.rowMeta} style={{ gridColumn: "span 2" }}>
                    Used {c.used_count ?? 0}{c.usage_limit ? ` / ${c.usage_limit}` : ""} • {c.kind === "PERCENT" ? `${c.value}%` : formatPaise(c.value)}
                  </div>

                  <form action={deleteCoupon}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}>Delete</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
