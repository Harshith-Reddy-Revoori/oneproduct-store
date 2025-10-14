import bcrypt from "bcryptjs";

export async function hashPassword(plain: string) {
// 10–12 rounds is a nice perf/secure balance for Node on Vercel
return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string) {
return bcrypt.compare(plain, hash);
}