import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// POST /api/events/:id/participate — join an event (respects capacity).
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "authentication required" }, { status: 401 });
  }

  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { participations: true } } },
  });
  if (!event) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (event.capacity !== null && event._count.participations >= event.capacity) {
    return NextResponse.json({ error: "event is full" }, { status: 409 });
  }

  try {
    await prisma.participation.create({ data: { userId: user.id, eventId } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // Already joined — treat as success (idempotent).
      return NextResponse.json({ joined: true });
    }
    throw error;
  }

  return NextResponse.json({ joined: true }, { status: 201 });
}

// DELETE /api/events/:id/participate — cancel participation.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "authentication required" }, { status: 401 });
  }

  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  await prisma.participation.deleteMany({ where: { userId: user.id, eventId } });
  return NextResponse.json({ joined: false });
}