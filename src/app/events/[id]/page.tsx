import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { categoryLabel, formatEventTime } from "@/lib/events";
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
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
        ← 목록으로
      </Link>

      <span className="mt-6 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
        {categoryLabel(event.category)}
      </span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{event.title}</h1>

      <dl className="mt-6 flex flex-col gap-2 text-sm">
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-gray-400">시간</dt>
          <dd>{formatEventTime(event.startAt, event.endAt)}</dd>
        </div>
        {event.location && (
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 text-gray-400">장소</dt>
            <dd>{event.location}</dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-gray-400">참여</dt>
          <dd>
            {event.capacity !== null
              ? `${count} / ${event.capacity}명${full ? " (마감)" : ""}`
              : `${count}명`}
          </dd>
        </div>
      </dl>

      {event.description && (
        <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
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