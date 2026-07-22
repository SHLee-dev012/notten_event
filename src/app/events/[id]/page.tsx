import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { categoryLabel, eventImage, formatEventTime } from "@/lib/events";
import { ParticipateButton } from "@/components/ParticipateButton";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId)) notFound();

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { participations: true } } },
  });
  if (!event) notFound();

  const user = await getCurrentUser();
  const joined = user
    ? Boolean(
        await prisma.participation.findUnique({
          where: { userId_eventId: { userId: user.id, eventId } },
        }),
      )
    : false;

  const count = event._count.participations;
  const full = event.capacity !== null && count >= event.capacity;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link href="/" className="text-sm muted transition-colors hover:text-[color:var(--ink)]">
        ← 목록으로
      </Link>

      <div className="relative mt-6 overflow-hidden rounded-2xl border border-[color:var(--line-strong)] shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)]">
        <div
          className="h-56 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${eventImage(event.title, event.category)})` }}
        />
        <span className="tag absolute left-4 top-4" data-category={event.category}>
          {categoryLabel(event.category)}
        </span>
      </div>
      <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight"><span className="text-nebula">{event.title}</span></h1>

      <dl className="mt-7 flex flex-col gap-3 text-base">
        <div className="flex gap-3">
          <dt className="w-16 shrink-0 muted">시간</dt>
          <dd className="font-medium text-[color:var(--ink)]">{formatEventTime(event.startAt, event.endAt)}</dd>
        </div>
        {event.location && (
          <div className="flex gap-3">
            <dt className="w-16 shrink-0 muted">장소</dt>
            <dd className="font-medium text-[color:var(--ink)]">{event.location}</dd>
          </div>
        )}
        <div className="flex gap-3">
          <dt className="w-16 shrink-0 muted">참여</dt>
          <dd className="font-medium text-[color:var(--ink)]">
            {event.capacity !== null
              ? `${count} / ${event.capacity}명${full ? " (마감)" : ""}`
              : `${count}명`}
          </dd>
        </div>
      </dl>

      {event.description && (
        <p className="mt-8 whitespace-pre-wrap text-base leading-7 text-[color:var(--ink-muted)]">
          {event.description}
        </p>
      )}

      <div className="mt-8">
        <ParticipateButton
          eventId={event.id}
          joined={joined}
          isFull={full}
          loggedIn={Boolean(user)}
        />
      </div>
    </main>
  );
}