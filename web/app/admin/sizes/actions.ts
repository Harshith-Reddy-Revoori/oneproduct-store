// web/app/admin/sizes/actions.ts
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
  if (!session || role !== "admin") redirect("/login");
}

export async function addSize(formData: FormData) {
  await requireAdmin();

  const productId = String(formData.get("product_id") || "");
  const label = String(formData.get("label") || "").trim();
  const stockStr = String(formData.get("stock") || "0").trim();
  const priceRupees = String(formData.get("price_rupees") || "").trim();

  if (!productId) redirect("/admin/sizes?err=Missing%20product");
  if (!label) redirect("/admin/sizes?err=Label%20is%20required");

  const stock = Math.max(0, parseInt(stockStr, 10) || 0);
  const price_override_paise = priceRupees ? rupeesToPaise(priceRupees) : null;

  try {
    await prisma.product_sizes.create({
      data: {
        product_id: productId,
        label,
        stock,
        price_override_paise,
        is_active: true,
      },
    });
  } catch {
    redirect("/admin/sizes?err=Could%20not%20add%20size");
  }

  try {
    revalidatePath("/admin/sizes");
    revalidatePath("/");
  } catch {}
  redirect("/admin/sizes?ok=1");
}

export async function updateSize(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const stockStr = String(formData.get("stock") || "").trim();
  const priceRupees = String(formData.get("price_rupees") || "").trim();
  const isActive = String(formData.get("is_active") || "") === "on";

  if (!id) redirect("/admin/sizes?err=Missing%20id");

  const stock = stockStr === "" ? undefined : Math.max(0, parseInt(stockStr, 10) || 0);
  const price_override_paise =
    priceRupees === "" ? undefined : rupeesToPaise(priceRupees);

  try {
    await prisma.product_sizes.update({
      where: { id },
      data: {
        ...(stock !== undefined ? { stock } : {}),
        ...(price_override_paise !== undefined ? { price_override_paise } : {}),
        is_active: isActive,
        updated_at: new Date(),
      },
    });
  } catch {
    redirect("/admin/sizes?err=Could%20not%20update%20size");
  }

  try {
    revalidatePath("/admin/sizes");
    revalidatePath("/");
  } catch {}
  redirect("/admin/sizes?ok=1");
}

export async function deleteSize(formData: FormData) {
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
    revalidatePath("/");
  } catch {}
  redirect("/admin/sizes?ok=1");
}
