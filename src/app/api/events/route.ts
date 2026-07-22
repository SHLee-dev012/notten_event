import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth";

// GET /api/events — list events (optionally filter by ?category=), sorted by start time.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.trim();

  const events = await prisma.event.findMany({
    where: category ? { category } : undefined,
    orderBy: { startAt: "asc" },
    include: { _count: { select: { participations: true } } },
  });

  return NextResponse.json(
    events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      category: e.category,
      location: e.location,
      startAt: e.startAt,
      endAt: e.endAt,
      capacity: e.capacity,
      participantCount: e._count.participations,
    })),
  );
}

// POST /api/events — create an event (any logged-in user, e.g. organizer).
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "authentication required" }, { status: 401 });
  }
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

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

  const event = await prisma.event.create({
    data: {
      title,
      description: typeof body?.description === "string" ? body.description : "",
      category: typeof body?.category === "string" && body.category.trim() ? body.category.trim() : "GENERAL",
      location: typeof body?.location === "string" ? body.location : "",
      startAt,
      endAt,
      capacity,
      organizerId: user.id,
    },
  });

  return NextResponse.json(event, { status: 201 });
}