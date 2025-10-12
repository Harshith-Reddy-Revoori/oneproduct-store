// web/app/admin/coupons/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { rupeesToPaise, formatPaise } from "@/lib/money";

/* ---------------- helpers ---------------- */

function toPlain<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === "bigint" ? Number(v) : v))
  );
}

function parseKind(input: string | null | undefined): "AMOUNT" | "PERCENT" | null {
  const k = (input || "").trim().toUpperCase();
  if (k === "AMOUNT" || k === "PERCENT") return k;
  return null;
}

function asIntOrNull(x: string | null | undefined): number | null {
  if (!x) return null;
  const n = parseInt(String(x), 10);
  return Number.isFinite(n) ? n : null;
}

function parseDateOrNull(x: string | null | undefined): Date | null {
  const s = (x || "").trim();
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function dateToInputValue(d?: string | Date | null): string {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  const tzOffset = dt.getTimezoneOffset() * 60000;
  const local = new Date(dt.getTime() - tzOffset).toISOString().slice(0, 16);
  return local; // "YYYY-MM-DDTHH:mm"
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  if (!session || role !== "admin") redirect("/login");
}

/* ---------------- server actions ---------------- */

export async function addCoupon(formData: FormData) {
  "use server";
  await requireAdmin();

  const codeRaw = String(formData.get("code") || "").trim().toUpperCase();
  const kind = parseKind(String(formData.get("kind")));
  const valueStr = String(formData.get("value") || "").trim();
  const minRupees = String(formData.get("min_rupees") || "").trim();
  const validFrom = parseDateOrNull(String(formData.get("valid_from") || ""));
  const validTo = parseDateOrNull(String(formData.get("valid_to") || ""));
  const usageLimit = asIntOrNull(String(formData.get("usage_limit") || ""));
  const isActive = String(formData.get("is_active") || "") === "on";

  if (!codeRaw) redirect("/admin/coupons?err=Code%20is%20required");
  if (!kind) redirect("/admin/coupons?err=Kind%20must%20be%20AMOUNT%20or%20PERCENT");

  let value: number;
  if (kind === "PERCENT") {
    const pct = parseInt(valueStr, 10);
    if (!Number.isFinite(pct) || pct < 1 || pct > 100) {
      redirect("/admin/coupons?err=Percent%20must%20be%201-100");
    }
    value = pct;
  } else {
    const paise = rupeesToPaise(valueStr);
    if (!Number.isFinite(paise) || paise < 0) {
      redirect("/admin/coupons?err=Amount%20must%20be%20a%20valid%20number");
    }
    value = paise;
  }

  const min_amount_paise = minRupees ? rupeesToPaise(minRupees) : 0;

  try {
    await prisma.coupons.create({
      data: {
        code: codeRaw,
        kind,
        value,
        min_amount_paise,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: usageLimit,
        is_active: isActive,
        // used_count defaults to 0 in DB
        updated_at: new Date(),
      },
    });
  } catch (e: any) {
    if (e?.code === "P2002") {
      redirect("/admin/coupons?err=Coupon%20code%20already%20exists");
    }
    redirect("/admin/coupons?err=Could%20not%20create%20coupon");
  }

  try {
    revalidatePath("/admin/coupons");
  } catch {}
  redirect("/admin/coupons?ok=1");
}

export async function updateCoupon(formData: FormData) {
  "use server";
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin/coupons?err=Missing%20id");

  const kind = parseKind(String(formData.get("kind")));
  const valueStr = String(formData.get("value") || "").trim();
  const minRupees = String(formData.get("min_rupees") || "").trim();
  const validFrom = parseDateOrNull(String(formData.get("valid_from") || ""));
  const validTo = parseDateOrNull(String(formData.get("valid_to") || ""));
  const usageLimit = asIntOrNull(String(formData.get("usage_limit") || ""));
  const isActive = String(formData.get("is_active") || "") === "on";

  if (!kind) redirect("/admin/coupons?err=Kind%20must%20be%20AMOUNT%20or%20PERCENT");

  let value: number;
  if (kind === "PERCENT") {
    const pct = parseInt(valueStr, 10);
    if (!Number.isFinite(pct) || pct < 1 || pct > 100) {
      redirect("/admin/coupons?err=Percent%20must%20be%201-100");
    }
    value = pct;
  } else {
    const paise = rupeesToPaise(valueStr);
    if (!Number.isFinite(paise) || paise < 0) {
      redirect("/admin/coupons?err=Amount%20must%20be%20a%20valid%20number");
    }
    value = paise;
  }

  const min_amount_paise = minRupees ? rupeesToPaise(minRupees) : 0;

  try {
    await prisma.coupons.update({
      where: { id },
      data: {
        kind,
        value,
        min_amount_paise,
        valid_from: validFrom,
        valid_to: validTo,
        usage_limit: usageLimit,
        is_active: isActive,
        updated_at: new Date(),
      },
    });
  } catch {
    redirect("/admin/coupons?err=Could%20not%20update%20coupon");
  }

  try {
    revalidatePath("/admin/coupons");
  } catch {}
  redirect("/admin/coupons?ok=1");
}

export async function deleteCoupon(formData: FormData) {
  "use server";
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin/coupons?err=Missing%20id");

  try {
    await prisma.coupons.delete({ where: { id } });
  } catch {
    redirect("/admin/coupons?err=Could%20not%20delete%20coupon");
  }

  try {
    revalidatePath("/admin/coupons");
  } catch {}
  redirect("/admin/coupons?ok=1");
}

/* ---------------- page ---------------- */

export default async function CouponsAdminPage({
  searchParams,
}: {
  // Next.js 15: searchParams is async
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const sp = await searchParams;
  const ok = Array.isArray(sp.ok) ? sp.ok[0] : sp.ok;
  const err = Array.isArray(sp.err) ? sp.err[0] : sp.err;

  const coupons = await prisma.coupons.findMany({
    orderBy: { created_at: "desc" },
  });

  const list = toPlain(coupons);

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Coupons</h1>

      {ok ? (
        <div className="rounded-lg border p-3 text-green-700 bg-green-50">
          Saved ✓
        </div>
      ) : null}
      {err ? (
        <div className="rounded-lg border p-3 text-red-700 bg-red-50">
          {err}
        </div>
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
          <input
            name="valid_from"
            type="datetime-local"
            className="border rounded-lg p-3"
            placeholder="Valid from"
          />
          <input
            name="valid_to"
            type="datetime-local"
            className="border rounded-lg p-3"
            placeholder="Valid to"
          />
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
            {list.map((c: any) => (
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
                    defaultValue={c.kind === "PERCENT" ? c.value : (Number(c.value) / 100).toFixed(0)}
                    className="border rounded-lg p-3"
                  />

                  <input
                    name="min_rupees"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={(Number(c.min_amount_paise) / 100).toFixed(2)}
                    className="border rounded-lg p-3"
                  />

                  <input
                    name="valid_from"
                    type="datetime-local"
                    defaultValue={dateToInputValue(c.valid_from)}
                    className="border rounded-lg p-3"
                  />
                  <input
                    name="valid_to"
                    type="datetime-local"
                    defaultValue={dateToInputValue(c.valid_to)}
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
