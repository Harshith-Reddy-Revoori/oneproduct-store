// web/app/admin/product/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { rupeesToPaise } from "@/lib/money";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session as unknown as { role?: string })?.role;
  if (!session || role !== "admin") redirect("/admin/login");
}

function boolFromCheckbox(v: FormDataEntryValue | null): boolean {
  return String(v || "") === "on";
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const image_url = String(formData.get("image_url") || "").trim();
  const currency = String(formData.get("currency") || "INR").trim().toUpperCase();
  const base_rupees = String(formData.get("base_rupees") || "").trim();
  const out_of_stock = boolFromCheckbox(formData.get("out_of_stock"));
  const active = boolFromCheckbox(formData.get("active"));

  if (!name) redirect("/admin/product?err=Name%20is%20required");

  const base_price_paise = rupeesToPaise(base_rupees || "0");

  try {
    if (id) {
      await prisma.products.update({
        where: { id },
        data: {
          name,
          description: description || null,
          image_url: image_url || null,
          currency,
          base_price_paise,
          out_of_stock,
          active,
          updated_at: new Date(),
        },
      });
    } else {
      await prisma.products.create({
        data: {
          name,
          description: description || null,
          image_url: image_url || null,
          currency,
          base_price_paise,
          out_of_stock,
          active,
        },
      });
    }
  } catch {
    redirect("/admin/product?err=Could%20not%20save%20product");
  }

  try {
    revalidatePath("/admin");
    revalidatePath("/");
  } catch {}
  redirect("/admin/product?ok=1");
}
