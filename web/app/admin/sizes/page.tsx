// web/app/admin/sizes/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/* ---------------- helpers ---------------- */

function toPlain<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === "bigint" ? Number(v) : v))
  );
}

function rupeesToPaise(input: string): number | null {
  const clean = input.trim();
  if (!clean) return null; // treat empty as "no override"
  const n = Number(clean.replace(/[^\d.]/g, ""));
  if (Number.isNaN(n)) return null;
  return Math.round(n * 100);
}

function paiseToRupees(p?: number | bigint | null): string {
  if (p === null || p === undefined) return "";
  const n = typeof p === "bigint" ? Number(p) : p;
  return (n / 100).toFixed(2);
}

/* ------------- server-guard helpers ------------- */

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  if (!session || role !== "admin") redirect("/login");
}

async function getActiveProductId() {
  const prod = await prisma.products.findFirst({
    where: { active: true },
    select: { id: true },
  });
  if (!prod) throw new Error("No active product found");
  return prod.id;
}

/* ---------------- server actions ---------------- */

export async function addSize(formData: FormData) {
  "use server";
  await requireAdmin();
  const productId = await getActiveProductId();

  const label = String(formData.get("label") || "").trim().toUpperCase();
  const stock = parseInt(String(formData.get("stock") || "0"), 10) || 0;
  const priceOverridePaise = rupeesToPaise(
    String(formData.get("price_rupees") || "")
  );

  if (!label) {
    redirect("/admin/sizes?err=Label%20is%20required");
  }

  try {
    await prisma.product_sizes.create({
      data: {
        product_id: productId,
        label,
        stock,
        price_override_paise: priceOverridePaise ?? null,
        is_active: true,
      },
    });
  } catch (e: any) {
    if (e?.code === "P2002") {
      redirect("/admin/sizes?err=That%20size%20already%20exists");
    }
    redirect("/admin/sizes?err=Could%20not%20add%20size");
  }

  // Do not wrap redirect in try/catch (it throws an internal redirect)
  try {
    revalidatePath("/admin/sizes");
  } catch {
    // ignore revalidation errors in dev
  }
  redirect("/admin/sizes?ok=1");
}

export async function updateSize(formData: FormData) {
  "use server";
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin/sizes?err=Missing%20id");

  const stock = parseInt(String(formData.get("stock") || "0"), 10);
  const isActive = String(formData.get("is_active") || "") === "on";
  const priceOverridePaise = rupeesToPaise(
    String(formData.get("price_rupees") || "")
  );

  try {
    await prisma.product_sizes.update({
      where: { id },
      data: {
        stock: Number.isFinite(stock) ? stock : 0,
        is_active: isActive,
        // null clears override
        price_override_paise: priceOverridePaise,
        updated_at: new Date(),
      },
    });
  } catch {
    redirect("/admin/sizes?err=Could%20not%20update%20size");
  }

  try {
    revalidatePath("/admin/sizes");
  } catch {
    // ignore
  }
  redirect("/admin/sizes?ok=1");
}

export async function deleteSize(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin/sizes?err=Missing%20id");

  try {
    await prisma.product_sizes.delete({ where: { id } });
  } catch {
    redirect("/admin/sizes?err=Could%20not%20delete%20size");
  }

  try {
    revalidatePath("/admin/sizes");
  } catch {
    // ignore
  }
  redirect("/admin/sizes?ok=1");
}

/* --------------------- page --------------------- */

export default async function SizesAdminPage({
  searchParams,
}: {
  // Next.js 15: searchParams is async
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  // Await once, then use
  const sp = await searchParams;
  const ok = Array.isArray(sp.ok) ? sp.ok[0] : sp.ok;
  const err = Array.isArray(sp.err) ? sp.err[0] : sp.err;

  const product = await prisma.products.findFirst({
    where: { active: true },
    select: {
      id: true,
      name: true,
      product_sizes: { orderBy: { label: "asc" } },
    },
  });

  if (!product) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">Sizes</h1>
        <p className="mt-4 text-red-600">No active product found.</p>
      </main>
    );
  }

  const p = toPlain(product);

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Sizes — {p.name}</h1>

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

      {/* Add size */}
      <section className="rounded-2xl border p-6 space-y-3">
        <h2 className="text-xl font-semibold">Add a size</h2>
        <form
          action={addSize}
          className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]"
        >
          <input
            name="label"
            placeholder="Label (e.g., S, M, L)"
            className="border rounded-lg p-3"
            required
          />
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            placeholder="Stock"
            className="border rounded-lg p-3"
            required
          />
          <input
            name="price_rupees"
            type="number"
            step="0.01"
            min="0"
            placeholder="Price override ₹ (optional)"
            className="border rounded-lg p-3"
          />
          <button className="border rounded-xl px-4 py-2 font-semibold">
            Add
          </button>
        </form>
        <p className="text-xs text-gray-600">
          Leave “Price override” empty to use the base product price.
        </p>
      </section>

      {/* Existing sizes */}
      <section className="rounded-2xl border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Existing sizes</h2>

        {p.product_sizes.length === 0 ? (
          <p className="text-gray-600">No sizes yet.</p>
        ) : (
          <div className="grid gap-3">
            {p.product_sizes.map((s: any) => (
              <div
                key={s.id}
                className="grid gap-3 md:grid-cols-[100px_1fr_1fr_140px_auto] items-center border rounded-xl p-3"
              >
                <div className="font-mono">{s.label}</div>

                <form action={updateSize} className="contents">
                  <input type="hidden" name="id" value={s.id} />

                  <label className="block">
                    <span className="sr-only">Stock</span>
                    <input
                      name="stock"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={s.stock}
                      className="w-full border rounded-lg p-3"
                    />
                  </label>

                  <label className="block">
                    <span className="sr-only">Price override</span>
                    <input
                      name="price_rupees"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={paiseToRupees(s.price_override_paise)}
                      placeholder="₹ override (optional)"
                      className="w-full border rounded-lg p-3"
                    />
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      name="is_active"
                      type="checkbox"
                      defaultChecked={s.is_active}
                    />
                    <span className="text-sm">Active</span>
                  </label>

                  <button className="border rounded-xl px-4 py-2 font-semibold">
                    Save
                  </button>
                </form>

                <form action={deleteSize}>
                  <input type="hidden" name="id" value={s.id} />
                  <button
                    className="border rounded-xl px-3 py-2 text-sm"
                    type="submit"
                  >
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
