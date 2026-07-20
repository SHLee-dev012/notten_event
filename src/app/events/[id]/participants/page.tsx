import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatEventTime, statusLabel } from "@/lib/events";
import { CheckInButton } from "@/components/CheckInButton";

const joinFmt = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function ParticipantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId)) notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) notFound();

  // Only the organizer may view the participant list.
  if (event.organizerId !== user.id) {
    redirect(`/events/${eventId}`);
  }

  const participants = await prisma.participation.findMany({
    where: { eventId },
    orderBy: { createdAt: "asc" },
    include: { user: true },
  });

  const checkedInCount = participants.filter(
    (p) => p.status === "CHECKED_IN",
  ).length;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link
        href={`/events/${eventId}`}
        className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
      >
        ← 이벤트로
      </Link>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">참여자 명단</h1>
          <p className="mt-1 text-sm text-gray-500">
            {event.title} · {formatEventTime(event.startAt, event.endAt)}
          </p>
        </div>
        {participants.length > 0 && (
          <a
            href={`/api/events/${eventId}/participants/export`}
            download
            className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            CSV 내보내기
          </a>
        )}
      </div>
      <p className="mt-4 text-sm">
        총 <span className="font-semibold">{participants.length}</span>명
        {event.capacity !== null && ` / 정원 ${event.capacity}명`}
        <span className="text-gray-500">
          {" · "}체크인 <span className="font-semibold">{checkedInCount}</span>명
        </span>
      </p>

      <section className="mt-6">
        {participants.length === 0 ? (
          <p className="text-sm text-gray-500">아직 참여자가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {participants.map((p, i) => {
              const checkedIn = p.status === "CHECKED_IN";
              return (
                <li key={p.id} className="flex items-center gap-4 py-3">
                  <span className="w-6 shrink-0 text-sm text-gray-400">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{p.user.name}</p>
                      <span
                        className={
                          checkedIn
                            ? "rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-950 dark:text-green-400"
                            : "rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        }
                      >
                        {statusLabel(p.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{p.user.email}</p>
                    <time className="text-xs text-gray-400">
                      {joinFmt.format(p.createdAt)} 신청
                    </time>
                  </div>
                  <CheckInButton
                    eventId={eventId}
                    userId={p.userId}
                    status={p.status}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}