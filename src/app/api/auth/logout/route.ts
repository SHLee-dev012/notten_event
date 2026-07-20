import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

// POST /api/auth/logout — end the current session
export async function POST() {
  await destroySession();
  return new NextResponse(null, { status: 204 });
}