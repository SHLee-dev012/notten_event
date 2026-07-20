import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { categoryLabel, formatEventTime } from "@/lib/events";

function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const events = await prisma.event.findMany({
    where: { organizerId: user.id },
    orderBy: { startAt: "asc" },
    include: { participations: { select: { status: true } } },
  });

  const stats = events.map((e) => {
    const total = e.participations.length;
    const checkedIn = e.participations.filter(
      (p) => p.status === "CHECKED_IN",
    ).length;
    return {
      id: e.id,
      title: e.title,
      category: e.category,
      startAt: e.startAt,
      endAt: e.endAt,
      capacity: e.capacity,
      total,
      checkedIn,
      checkInRate: pct(checkedIn, total),
      fillRate: e.capacity ? pct(total, e.capacity) : null,
    };
  });

  const totalParticipants = stats.reduce((s, e) => s + e.total, 0);
  const totalCheckedIn = stats.reduce((s, e) => s + e.checkedIn, 0);

  const summary = [
    { label: "주최 이벤트", value: `${events.length}개` },
    { label: "총 참여", value: `${totalParticipants}명` },
    { label: "총 체크인", value: `${totalCheckedIn}명` },
    { label: "평균 체크인율", value: `${pct(totalCheckedIn, totalParticipants)}%` },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
      <p className="mt-1 text-sm text-gray-500">
        {user.name}님이 주최한 이벤트 통계입니다.
      </p>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summary.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
          >
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{s.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-gray-500">이벤트별 통계</h2>
        {stats.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            아직 주최한 이벤트가 없습니다.{" "}
            <Link href="/events/new" className="underline hover:text-gray-900 dark:hover:text-gray-100">
              이벤트 등록하기
            </Link>
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {stats.map((e) => (
              <li
                key={e.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      {categoryLabel(e.category)}
                    </span>
                    <h3 className="mt-2 font-semibold">
                      <Link
                        href={`/events/${e.id}/participants`}
                        className="hover:underline"
                      >
                        {e.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatEventTime(e.startAt, e.endAt)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-sm">
                    <p className="font-semibold">{e.total}명 참여</p>
                    <p className="text-xs text-gray-500">체크인 {e.checkedIn}명</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <StatBar
                    label="체크인율"
                    value={e.checkInRate}
                    caption={`${e.checkedIn}/${e.total}`}
                  />
                  {e.fillRate !== null ? (
                    <StatBar
                      label="정원 충족률"
                      value={e.fillRate}
                      caption={`${e.total}/${e.capacity}`}
                    />
                  ) : (
                    <p className="text-xs text-gray-400">정원 제한 없음</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function StatBar({
  label,
  value,
  caption,
}: {
  label: string;
  value: number;
  caption: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-500">
          {caption} · <span className="font-medium text-gray-900 dark:text-gray-100">{value}%</span>
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className="h-full rounded-full bg-gray-900 dark:bg-gray-100"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
