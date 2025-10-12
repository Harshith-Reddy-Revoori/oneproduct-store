// web/types/product.ts
export type StoreProduct = {
    id: string;
    name: string;
    description?: string | null;
    image_url?: string | null;
    currency: string;
    base_price_paise: number; // number (not bigint)
    out_of_stock: boolean;
    product_sizes: Array<{
      id: string;
      label: string;
      stock: number; // number (not bigint)
      price_override_paise: number | null; // number | null
    }>;
  };
  