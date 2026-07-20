import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";

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