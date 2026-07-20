import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PARTICIPATION_STATUSES } from "@/lib/events";

// PATCH /api/events/:id/participants/:userId — organizer updates a
// participant's status (on-site check-in: GOING <-> CHECKED_IN).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  const { id, userId } = await params;
  const eventId = Number(id);
  const targetUserId = Number(userId);
  if (!Number.isInteger(eventId) || !Number.isInteger(targetUserId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "authentication required" }, { status: 401 });
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (event.organizerId !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const status = body?.status;
  if (!PARTICIPATION_STATUSES.includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  try {
    const participation = await prisma.participation.update({
      where: { userId_eventId: { userId: targetUserId, eventId } },
      data: { status },
    });
    return NextResponse.json({
      userId: participation.userId,
      status: participation.status,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "not a participant" }, { status: 404 });
    }
    throw error;
  }
}