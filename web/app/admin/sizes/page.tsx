// web/app/admin/sizes/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { formatPaise } from "@/lib/money";
import type { Prisma } from "@prisma/client";
import { addSize, updateSize, deleteSize } from "./actions";

/* ------------ auth ------------ */
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session as unknown as { role?: string })?.role;
  if (!session || role !== "admin") redirect("/login");
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
      <main className="p-8">
        <h1 className="text-3xl font-bold">Sizes</h1>
        <p className="mt-4 text-gray-600">No active product found. Create one in the admin.</p>
      </main>
    );
  }

  const sizes = toAdminSizes(
    (await prisma.product_sizes.findMany({
      where: { product_id: p.id },
      orderBy: { label: "asc" },
    })) as SizeRow[],
  );

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Sizes — {p.name}</h1>

      {ok ? <div className="rounded border p-3 bg-green-50 text-green-700">Saved ✓</div> : null}
      {err ? <div className="rounded border p-3 bg-red-50 text-red-700">{err}</div> : null}

      {/* Add size */}
      <section className="rounded-2xl border p-6 space-y-3">
        <h2 className="text-xl font-semibold">Add size</h2>
        <form action={addSize} className="grid gap-3 md:grid-cols-[1fr_140px_160px_auto]">
          <input type="hidden" name="product_id" value={p.id} />
          <input name="label" placeholder="Label (e.g., 250g)" className="border rounded-lg p-3" required />
          <input name="stock" type="number" min="0" step="1" placeholder="Stock" className="border rounded-lg p-3" />
          <input name="price_rupees" type="number" step="0.01" min="0" placeholder="Price override ₹ (optional)" className="border rounded-lg p-3" />
          <button className="border rounded-xl px-4 py-2 font-semibold">Add</button>
        </form>
        <p className="text-xs text-gray-600">Leave price blank to use product base price.</p>
      </section>

      {/* List sizes */}
      <section className="rounded-2xl border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Existing sizes</h2>
        {sizes.length === 0 ? (
          <p className="text-gray-600">No sizes yet.</p>
        ) : (
          <div className="grid gap-3">
            {sizes.map((s) => (
              <div key={s.id} className="grid gap-3 md:grid-cols-[1fr_140px_160px_120px_auto] items-center border rounded-xl p-3">
                <div className="font-mono">{s.label}</div>

                <form action={updateSize} className="contents">
                  <input type="hidden" name="id" value={s.id} />

                  <input
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={s.stock}
                    className="border rounded-lg p-3"
                  />

                  <input
                    name="price_rupees"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={s.price_override_paise == null ? "" : (s.price_override_paise / 100).toFixed(2)}
                    className="border rounded-lg p-3"
                  />

                  <label className="flex items-center gap-2">
                    <input name="is_active" type="checkbox" defaultChecked={s.is_active} />
                    <span className="text-sm">Active</span>
                  </label>

                  <button className="border rounded-xl px-4 py-2 font-semibold">Save</button>
                </form>

                <div className="text-sm text-gray-600">
                  {s.price_override_paise == null ? "Base price" : formatPaise(s.price_override_paise)} • {s.stock} in stock
                </div>

                <form action={deleteSize}>
                  <input type="hidden" name="id" value={s.id} />
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
