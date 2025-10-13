// web/app/admin/product/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { saveProduct } from "./actions";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session as unknown as { role?: string })?.role;
  if (!session || role !== "admin") redirect("/login");
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
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Product</h1>

      {ok ? <div className="rounded border p-3 bg-green-50 text-green-700">Saved ✓</div> : null}
      {err ? <div className="rounded border p-3 bg-red-50 text-red-700">{err}</div> : null}

      <section className="rounded-2xl border p-6 space-y-4">
        <form action={saveProduct} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={product?.id ?? ""} />
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Name</label>
            <input
              name="name"
              defaultValue={product?.name ?? ""}
              className="mt-1 border rounded-lg p-3 w-full"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              name="description"
              defaultValue={product?.description ?? ""}
              className="mt-1 border rounded-lg p-3 w-full min-h-[120px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Image URL</label>
            <input
              name="image_url"
              defaultValue={product?.image_url ?? ""}
              className="mt-1 border rounded-lg p-3 w-full"
              placeholder="https://…"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Currency</label>
            <input
              name="currency"
              defaultValue={product?.currency ?? "INR"}
              className="mt-1 border rounded-lg p-3 w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Base price (₹)</label>
            <input
              name="base_rupees"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product ? (Number(product.base_price_paise) / 100).toFixed(2) : "0.00"}
              className="mt-1 border rounded-lg p-3 w-full"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Out of stock</label>
            <input name="out_of_stock" type="checkbox" defaultChecked={product?.out_of_stock ?? false} />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Active (listed on site)</label>
            <input name="active" type="checkbox" defaultChecked={product?.active ?? true} />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button className="border rounded-xl px-5 py-3 font-semibold">Save product</button>
          </div>
        </form>
      </section>
    </main>
  );
}
