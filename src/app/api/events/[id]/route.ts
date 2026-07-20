import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Load an event and ensure the current user is its organizer.
// Returns either an error response or the owned event.
async function requireOwnedEvent(eventId: number) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ error: "authentication required" }, { status: 401 }) };
  }
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return { error: NextResponse.json({ error: "not found" }, { status: 404 }) };
  }
  if (event.organizerId !== user.id) {
    return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { event };
}

// GET /api/events/:id — event detail, including whether the current user joined.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const user = await getCurrentUser();
  let joined = false;
  if (user) {
    const participation = await prisma.participation.findUnique({
      where: { userId_eventId: { userId: user.id, eventId } },
    });
    joined = Boolean(participation);
  }

  return NextResponse.json({
    id: event.id,
    title: event.title,
    description: event.description,
    category: event.category,
    location: event.location,
    startAt: event.startAt,
    endAt: event.endAt,
    capacity: event.capacity,
    participantCount: event._count.participations,
    joined,
  });
}

// PATCH /api/events/:id — update an event (organizer only).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const owned = await requireOwnedEvent(eventId);
  if (owned.error) return owned.error;

  const body = await request.json();
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const startAt = body?.startAt ? new Date(body.startAt) : null;
  const endAt = body?.endAt ? new Date(body.endAt) : null;

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!startAt || Number.isNaN(startAt.getTime()) || !endAt || Number.isNaN(endAt.getTime())) {
    return NextResponse.json(
      { error: "valid startAt and endAt are required" },
      { status: 400 },
    );
  }
  if (endAt < startAt) {
    return NextResponse.json(
      { error: "endAt must be after startAt" },
      { status: 400 },
    );
  }

  const capacity =
    typeof body?.capacity === "number" && body.capacity > 0
      ? Math.floor(body.capacity)
      : null;

  const event = await prisma.event.update({
    where: { id: eventId },
    data: {
      title,
      description: typeof body?.description === "string" ? body.description : "",
      category:
        typeof body?.category === "string" && body.category.trim()
          ? body.category.trim()
          : "GENERAL",
      location: typeof body?.location === "string" ? body.location : "",
      startAt,
      endAt,
      capacity,
    },
  });

  return NextResponse.json(event);
}

// DELETE /api/events/:id — delete an event (organizer only). Participations
// cascade via the schema relation.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const owned = await requireOwnedEvent(eventId);
  if (owned.error) return owned.error;

  await prisma.event.delete({ where: { id: eventId } });
  return new NextResponse(null, { status: 204 });
}