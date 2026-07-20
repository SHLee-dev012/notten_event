import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { EventForm } from "@/components/EventForm";
import { DeleteEventButton } from "@/components/DeleteEventButton";

export default async function EditEventPage({
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

  // Only the organizer may edit their own event.
  if (event.organizerId !== user.id) {
    redirect("/organizing");
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link
        href="/organizing"
        className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
      >
        ← 주최 관리로
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">이벤트 수정</h1>
      <p className="mt-1 text-sm text-gray-500">{event.title}</p>

      <EventForm
        event={{
          id: event.id,
          title: event.title,
          description: event.description,
          category: event.category,
          location: event.location,
          startAt: event.startAt.toISOString(),
          endAt: event.endAt.toISOString(),
          capacity: event.capacity,
        }}
      />

      <div className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-800">
        <p className="text-xs text-gray-400">위험 구역</p>
        <div className="mt-2">
          <DeleteEventButton eventId={event.id} />
        </div>
      </div>
    </main>
  );
}