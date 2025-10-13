// web/app/admin/coupons/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { rupeesToPaise } from "@/lib/money";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session as unknown as { role?: string })?.role;
  if (!session || role !== "admin") redirect("/login");
}

function parseKind(input: string | null | undefined): "AMOUNT" | "PERCENT" | null {
  const k = (input || "").trim().toUpperCase();
  return k === "AMOUNT" || k === "PERCENT" ? k : null;
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
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function addCoupon(formData: FormData) {
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
        updated_at: new Date(),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
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
      redirect(`/admin/coupons?err=Percent%20must%20be%201-100`);
    }
    value = pct;
  } else {
    const paise = rupeesToPaise(valueStr);
    if (!Number.isFinite(paise) || paise < 0) {
      redirect(`/admin/coupons?err=Amount%20must%20be%20a%20valid%20number`);
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
    redirect(`/admin/coupons?err=Could%20not%20update%20coupon`);
  }

  try {
    revalidatePath("/admin/coupons");
  } catch {}
  redirect(`/admin/coupons?ok=1`);
}

export async function deleteCoupon(formData: FormData) {
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
