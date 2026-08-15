import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "hossein-library-super-secret-key-change-me"
);

const FAMILY_PASSWORD = process.env.FAMILY_PASSWORD || "hossein1403";

export async function login(password: string): Promise<boolean> {
  // Simple shared family password
  const isValid = password === FAMILY_PASSWORD || (await bcrypt.compare(password, await bcrypt.hash(FAMILY_PASSWORD, 10)));
  if (!isValid && password !== FAMILY_PASSWORD) return false;

  const token = await new SignJWT({ role: "family" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return true;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return false;

    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function requireAuth() {
  const ok = await isAuthenticated();
  if (!ok) {
    throw new Error("Unauthorized");
  }
}
