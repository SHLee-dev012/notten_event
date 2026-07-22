import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_ID, createSession, verifyPassword } from "@/lib/auth";
import { roleFromHost } from "@/lib/role";

// POST /api/auth/login — verify credentials and start a session
export async function POST(request: Request) {
  const body = await request.json();
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 },
    );
  }

  // The organizer service only accepts the fixed admin account.
  const role = roleFromHost(request.headers.get("host"));
  if (role === "organizer" && email !== ADMIN_ID) {
    return NextResponse.json(
      { error: "organizer login required" },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      { error: "invalid email or password" },
      { status: 401 },
    );
  }

  await createSession(user.id);
  return NextResponse.json({ id: user.id, email: user.email, name: user.name });
}