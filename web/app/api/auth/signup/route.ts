import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { hashPassword } from "@/lib/hash";
import { sendEmail } from "@/lib/email";

const SignUpSchema = z.object({
name: z.string().min(1).max(100),
email: z.string().email().toLowerCase(),
password: z.string().min(8).max(72),
});

export async function POST(req: Request) {
try {
const json = await req.json();
const { name, email, password } = SignUpSchema.parse(json);

const existing = await prisma.user.findUnique({ where: { email } });
if (existing) {
return NextResponse.json({ ok: false, error: "Email already in use" }, { status: 400 });
}

const passwordHash = await hashPassword(password);
const user = await prisma.user.create({
data: { name, email, passwordHash, role: "customer" },
select: { id: true, email: true, name: true },
});

// fire-and-forget welcome email (no blocking)
sendEmail({
to: user.email!,
subject: "Welcome to OneProduct",
html: `<p>Hi ${name},</p><p>Your account is ready. You can now log in.</p>`,
}).catch(() => {});

return NextResponse.json({ ok: true });
} catch (err) {
console.error("/api/auth/signup", err);
return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
}
}