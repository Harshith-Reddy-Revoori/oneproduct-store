import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

const Input = z.object({ email: z.string().email().toLowerCase() });

function sha256(s: string) {
return crypto.createHash("sha256").update(s).digest("hex");
}

export async function POST(req: Request) {
try {
const { email } = Input.parse(await req.json());
const user = await prisma.user.findUnique({ where: { email } });

// Always return 200 to avoid email enumeration
if (!user) return NextResponse.json({ ok: true });

const raw = crypto.randomBytes(32).toString("hex");
const token = sha256(raw);
const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 min

// one active token per email
await prisma.verificationToken.deleteMany({ where: { identifier: email } });
await prisma.verificationToken.create({ data: { identifier: email, token, expires } });

const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
const link = `${base}/reset-password?token=${raw}`;

await sendEmail({
to: email,
subject: "Reset your password",
html: `<p>Click the link to reset your password (valid for 15 minutes):</p>
<p><a href="${link}">${link}</a></p>`,
});

return NextResponse.json({ ok: true });
} catch (e) {
return NextResponse.json({ ok: true });
}
}