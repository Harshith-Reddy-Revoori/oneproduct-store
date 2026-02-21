// web/app/admin/orders/[id]/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type Status = "pending" | "paid" | "failed" | "refunded";
const STATUSES: Status[] = ["pending", "paid", "failed", "refunded"];

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session as unknown as { role?: string })?.role;
  if (!session || role !== "admin") redirect("/admin/login");
}

function isStatus(s: unknown): s is Status {
  return typeof s === "string" && (STATUSES as ReadonlyArray<string>).includes(s);
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("payment_status") || "");
  if (!id) redirect("/admin/orders?err=Missing%20id");
  if (!isStatus(status)) redirect(`/admin/orders/${id}?err=Invalid%20status`);

  try {
    await prisma.orders.update({
      where: { id },
      data: { payment_status: status, updated_at: new Date() },
    });
  } catch {
    redirect(`/admin/orders/${id}?err=Could%20not%20update%20status`);
  }

  try {
    revalidatePath(`/admin/orders/${id}`);
  } catch {}
  redirect(`/admin/orders/${id}?ok=1`);
}

export async function saveAdminNote(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const note = String(formData.get("admin_note") || "");
  if (!id) redirect("/admin/orders?err=Missing%20id");

  try {
    await prisma.orders.update({
      where: { id },
      data: { admin_note: note || null, updated_at: new Date() },
    });
  } catch {
    redirect(`/admin/orders/${id}?err=Could%20not%20save%20note`);
  }

  try {
    revalidatePath(`/admin/orders/${id}`);
  } catch {}
  redirect(`/admin/orders/${id}?ok=1`);
}
