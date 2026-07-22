import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { roleFromHost } from "@/lib/role";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

// The participant (:3000) and organizer (:3001) services run on the same host,
// so cookies aren't isolated by port. Using a role-specific cookie name keeps
// their login sessions fully separate — each service reads/writes only its own.
async function sessionCookieName(): Promise<string> {
  const role = roleFromHost((await headers()).get("host"));
  return `notten_session_${role}`;
}

// The organizer service has a single fixed admin account (no self-signup).
// The admin user's `email` field stores this id.
export const ADMIN_ID = "tenadmin";

// --- Password hashing (scrypt, no external deps) ---

function scryptAsync(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (err, derived) => {
      if (err) reject(err);
      else resolve(derived);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(password, salt);
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = await scryptAsync(password, salt);
  const keyBuffer = Buffer.from(key, "hex");
  if (keyBuffer.length !== derived.length) return false;
  return timingSafeEqual(keyBuffer, derived);
}

// --- Sessions ---

export async function createSession(userId: number): Promise<void> {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({ data: { id, userId, expiresAt } });

  const cookieStore = await cookies();
  cookieStore.set(await sessionCookieName(), id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const cookieName = await sessionCookieName();
  const id = cookieStore.get(cookieName)?.value;
  if (id) {
    await prisma.session.deleteMany({ where: { id } });
    cookieStore.delete(cookieName);
  }
}

export type SessionUser = {
  id: number;
  email: string;
  name: string;
};

// Returns the logged-in user, or null. Cleans up expired sessions.
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const id = cookieStore.get(await sessionCookieName())?.value;
  if (!id) return null;

  const session = await prisma.session.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.deleteMany({ where: { id } });
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}

// Whether the given user is the fixed organizer/admin account.
export function isAdmin(user: SessionUser | null): boolean {
  return user?.email === ADMIN_ID;
}