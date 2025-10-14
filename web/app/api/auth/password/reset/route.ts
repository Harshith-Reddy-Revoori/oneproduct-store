import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { hashPassword } from "@/lib/hash";

const Input = z.object({ token: z.string().min(10), password: z.string().min(8).max(72) });
function sha256(s: string) { return crypto.createHash("sha256").update(s).digest("hex"); }

export async function POST(req: Request) {
try {
const { token: raw, password } = Input.parse(await req.json());
const token = sha256(raw);

const vt = await prisma.verificationToken.findFirst({ where: { token } });
if (!vt || vt.expires < new Date()) {
return NextResponse.json({ ok: false, error: "Invalid or expired token" }, { status: 400 });
}

await prisma.user.update({
where: { email: vt.identifier },
data: { passwordHash: await hashPassword(password) },
});

await prisma.verificationToken.delete({ where: { identifier_token: { identifier: vt.identifier, token } } });

return NextResponse.json({ ok: true });
} catch (e) {
return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
}
}