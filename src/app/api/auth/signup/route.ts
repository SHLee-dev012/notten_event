import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";

// POST /api/auth/signup — create an account and start a session
export async function POST(request: Request) {
  const body = await request.json();
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !name || !password) {
    return NextResponse.json(
      { error: "email, name, password are required" },
      { status: 400 },
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "password must be at least 6 characters" },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.create({
      data: { email, name, passwordHash: await hashPassword(password) },
    });
    await createSession(user.id);
    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "email already in use" },
        { status: 409 },
      );
    }
    throw error;
  }
}