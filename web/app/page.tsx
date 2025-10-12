// web/app/page.tsx
import { prisma } from "@/lib/prisma";
import Storefront from "../components/Strorefront";
import type { StoreProduct } from "../types/product";

export default async function HomePage() {
  const productRaw = await prisma.products.findFirst({
    where: { active: true },
    include: {
      product_sizes: {
        where: { is_active: true },
        orderBy: { label: "asc" },
      },
    },
  });

  let product: StoreProduct | null = null;

  if (productRaw) {
    product = {
      id: productRaw.id,
      name: productRaw.name,
      description: productRaw.description,
      image_url: productRaw.image_url,
      currency: productRaw.currency,
      base_price_paise: Number(productRaw.base_price_paise),
      out_of_stock: productRaw.out_of_stock,
      product_sizes: productRaw.product_sizes.map((s) => ({
        id: s.id,
        label: s.label,
        stock: Number(s.stock),
        price_override_paise:
          s.price_override_paise === null ? null : Number(s.price_override_paise),
      })),
    };
  }

  return <Storefront product={product} />;
}
