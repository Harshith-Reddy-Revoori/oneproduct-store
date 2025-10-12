import { prisma } from "@/lib/prisma";
import { rupeesToPaise, formatPaise } from "@/lib/money";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

function toPlain<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === "bigint" ? Number(v) : v))
  );
}

// Server action to save updates
async function saveProduct(formData: FormData) {
  "use server";
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  if (!session || role !== "admin") {
    throw new Error("Unauthorized");
  }

  // We have exactly one product in this store
  const current = await prisma.products.findFirst({ where: { active: true } });
  if (!current) throw new Error("No active product found");

  const rupees = String(formData.get("price_rupees") || "").trim();
  const outOfStock = formData.get("out_of_stock") === "on";

  const base_price_paise = rupeesToPaise(rupees);

  await prisma.products.update({
    where: { id: current.id },
    data: {
      base_price_paise,
      out_of_stock: outOfStock,
      updated_at: new Date(),
    },
  });

  redirect("/admin/product?saved=1");
}

export default async function ProductAdminPage({
  searchParams,
}: {
  searchParams: { saved?: string };
}) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;
  if (!session || role !== "admin") redirect("/login");

  const product = await prisma.products.findFirst({
    where: { active: true },
    include: {
      product_sizes: {
        where: { is_active: true },
        orderBy: { label: "asc" },
      },
    },
  });

  if (!product) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">Product</h1>
        <p className="mt-4 text-red-600">No active product found. Create one in Supabase.</p>
      </main>
    );
  }

  const p = toPlain(product);
  const currentPrice = formatPaise(p.base_price_paise);

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Product</h1>

      {searchParams?.saved ? (
        <div className="rounded-lg border p-3 text-green-700 bg-green-50">
          Saved ✓
        </div>
      ) : null}

      <div className="rounded-2xl border p-6 space-y-4">
        <div className="grid gap-2">
          <div><span className="font-semibold">Name:</span> {p.name}</div>
          <div><span className="font-semibold">Currency:</span> {p.currency}</div>
          <div><span className="font-semibold">Current price:</span> {currentPrice}</div>
          <div><span className="font-semibold">Sizes:</span> {p.product_sizes?.map((s:any)=>s.label).join(", ") || "—"}</div>
          <div><span className="font-semibold">Out of stock:</span> {p.out_of_stock ? "Yes" : "No"}</div>
        </div>

        <form action={saveProduct} className="mt-4 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Price (₹ rupees)</span>
            <input
              name="price_rupees"
              type="number"
              step="0.01"
              min="0"
              defaultValue={(Number(p.base_price_paise) / 100).toFixed(2)}
              className="mt-1 w-full border rounded-lg p-3"
              required
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              name="out_of_stock"
              type="checkbox"
              defaultChecked={p.out_of_stock}
            />
            <span>Mark as out of stock</span>
          </label>

          <button className="rounded-xl border px-4 py-2 font-semibold">
            Save
          </button>
        </form>
      </div>
    </main>
  );
}
