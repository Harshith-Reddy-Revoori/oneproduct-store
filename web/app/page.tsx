import Storefront from "@/components/Storefront";
import { prisma } from "@/lib/prisma";
import type { StoreProduct } from "@/types/product";

export const revalidate = 60;

export default async function Page() {
  const db = await prisma.products.findFirst({
    where: { active: true, out_of_stock: false },
    include: { product_sizes: true },
    orderBy: { created_at: "desc" },
  });

  const product: StoreProduct | null =
    db === null
      ? null
      : {
          id: db.id,
          name: db.name,
          description: db.description ?? null,
          image_url: db.image_url ?? null,
          currency: db.currency,
          base_price_paise: Number(db.base_price_paise),   // bigint -> number
          out_of_stock: db.out_of_stock,                   // keep this (Storefront uses it)
          product_sizes: db.product_sizes.map((s) => ({
            id: s.id,
            product_id: s.product_id,
            label: s.label,
            stock: Number(s.stock),                        // bigint -> number
            price_override_paise:
              s.price_override_paise == null ? null : Number(s.price_override_paise),
            is_active: s.is_active,
          })),
        };

  return <Storefront product={product} />;
}
