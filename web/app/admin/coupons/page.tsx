// web/app/admin/coupons/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { formatPaise } from "@/lib/money";
import type { Prisma } from "@prisma/client";
import { addCoupon, updateCoupon, deleteCoupon } from "./actions";

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
  if (!session || role !== "admin") redirect("/login");
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
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Coupons</h1>

      {ok ? (
        <div className="rounded-lg border p-3 text-green-700 bg-green-50">Saved ✓</div>
      ) : null}
      {err ? (
        <div className="rounded-lg border p-3 text-red-700 bg-red-50">{err}</div>
      ) : null}

      {/* Create */}
      <section className="rounded-2xl border p-6 space-y-3">
        <h2 className="text-xl font-semibold">Create coupon</h2>
        <form
          action={addCoupon}
          className="grid gap-3 md:grid-cols-[1fr_160px_160px_160px_1fr_1fr_140px_auto]"
        >
          <input
            name="code"
            placeholder="CODE (e.g., WELCOME10)"
            className="border rounded-lg p-3 uppercase"
            required
          />
          <select name="kind" className="border rounded-lg p-3" defaultValue="PERCENT">
            <option value="PERCENT">PERCENT</option>
            <option value="AMOUNT">AMOUNT</option>
          </select>
          <input
            name="value"
            type="number"
            step="1"
            min="0"
            placeholder="Value"
            className="border rounded-lg p-3"
            required
          />
          <input
            name="min_rupees"
            type="number"
            step="0.01"
            min="0"
            placeholder="Min ₹ (optional)"
            className="border rounded-lg p-3"
          />
          <input name="valid_from" type="datetime-local" className="border rounded-lg p-3" />
          <input name="valid_to" type="datetime-local" className="border rounded-lg p-3" />
          <input
            name="usage_limit"
            type="number"
            min="0"
            step="1"
            placeholder="Usage limit (optional)"
            className="border rounded-lg p-3"
          />
          <label className="flex items-center justify-center gap-2">
            <input name="is_active" type="checkbox" defaultChecked />
            <span className="text-sm">Active</span>
          </label>
          <button className="border rounded-xl px-4 py-2 font-semibold">Create</button>
        </form>
        <p className="text-xs text-gray-600">
          <b>PERCENT:</b> value is 1–100. <b>AMOUNT:</b> value is rupees (we store paise).
        </p>
      </section>

      {/* List / Edit */}
      <section className="rounded-2xl border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Existing coupons</h2>

        {list.length === 0 ? (
          <p className="text-gray-600">No coupons yet.</p>
        ) : (
          <div className="grid gap-3">
            {list.map((c: AdminCoupon) => (
              <div
                key={c.id}
                className="grid gap-3 md:grid-cols-[160px_160px_160px_160px_1fr_1fr_140px_120px_auto] items-center border rounded-xl p-3"
              >
                <div className="font-mono">{c.code}</div>

                <form action={updateCoupon} className="contents">
                  <input type="hidden" name="id" value={c.id} />

                  <select name="kind" className="border rounded-lg p-3" defaultValue={c.kind}>
                    <option value="PERCENT">PERCENT</option>
                    <option value="AMOUNT">AMOUNT</option>
                  </select>

                  <input
                    name="value"
                    type="number"
                    step="1"
                    min="0"
                    defaultValue={c.kind === "PERCENT" ? c.value : Math.round(c.value / 100)}
                    className="border rounded-lg p-3"
                  />

                  <input
                    name="min_rupees"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={(c.min_amount_paise / 100).toFixed(2)}
                    className="border rounded-lg p-3"
                  />

                  <input
                    name="valid_from"
                    type="datetime-local"
                    defaultValue={dateToInputValue(c.valid_from ?? null)}
                    className="border rounded-lg p-3"
                  />
                  <input
                    name="valid_to"
                    type="datetime-local"
                    defaultValue={dateToInputValue(c.valid_to ?? null)}
                    className="border rounded-lg p-3"
                  />

                  <input
                    name="usage_limit"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={c.usage_limit ?? ""}
                    className="border rounded-lg p-3"
                  />

                  <label className="flex items-center gap-2">
                    <input name="is_active" type="checkbox" defaultChecked={c.is_active} />
                    <span className="text-sm">Active</span>
                  </label>

                  <button className="border rounded-xl px-4 py-2 font-semibold">Save</button>
                </form>

                <div className="text-sm text-gray-600">
                  Used {c.used_count ?? 0}
                  {c.usage_limit ? ` / ${c.usage_limit}` : ""} •{" "}
                  {c.kind === "PERCENT" ? `${c.value}%` : formatPaise(c.value)}
                </div>

                <form action={deleteCoupon}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="border rounded-xl px-3 py-2 text-sm" type="submit">
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
