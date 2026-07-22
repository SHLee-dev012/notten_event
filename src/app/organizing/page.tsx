import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { categoryLabel, formatEventTime } from "@/lib/events";

export default async function OrganizingPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) redirect("/login");

  const events = await prisma.event.findMany({
    where: { organizerId: user.id },
    orderBy: { startAt: "asc" },
    include: { _count: { select: { participations: true } } },
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><span className="text-nebula">내가 주최한 이벤트</span></h1>
          <p className="mt-1 text-sm muted">
            {user.name}님이 등록한 이벤트를 관리하세요.
          </p>
        </div>
        <Link
          href="/events/new"
          className="btn btn-primary"
        >
          새 이벤트
        </Link>
      </div>

      <section className="mt-8">
        {events.length === 0 ? (
          <p className="text-sm muted">
            아직 주최한 이벤트가 없습니다.{" "}
            <Link href="/events/new" className="text-[color:var(--accent)] hover:underline">
              이벤트 등록하기
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {events.map((e) => {
              const full = e.capacity !== null && e._count.participations >= e.capacity;
              return (
                <li
                  key={e.id}
                  className="card p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="tag" data-category={e.category}>
                        {categoryLabel(e.category)}
                      </span>
                      <h2 className="mt-2 font-semibold">
                        <Link
                          href={`/events/${e.id}/participants`}
                          className="hover:underline"
                        >
                          {e.title}
                        </Link>
                      </h2>
                      <p className="mt-1 text-sm muted">
                        {formatEventTime(e.startAt, e.endAt)}
                        {e.location && ` · ${e.location}`}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs faint">
                      {e.capacity !== null
                        ? `${e._count.participations}/${e.capacity}${full ? " · 마감" : ""}`
                        : `${e._count.participations}명 참여`}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-4 text-sm">
                    <Link
                      href={`/events/${e.id}/participants`}
                      className="text-[color:var(--accent)] hover:underline"
                    >
                      참여자 명단
                    </Link>
                    <Link
                      href={`/events/${e.id}/edit`}
                      className="text-[color:var(--accent)] hover:underline"
                    >
                      수정
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}