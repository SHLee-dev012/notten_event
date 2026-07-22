import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { categoryLabel, dayKey, formatClock, formatDay } from "@/lib/events";

export default async function SchedulePage() {
  const events = await prisma.event.findMany({ orderBy: { startAt: "asc" } });

  // Group by calendar day.
  const groups: { key: string; day: Date; items: typeof events }[] = [];
  for (const e of events) {
    const key = dayKey(e.startAt);
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = { key, day: e.startAt, items: [] };
      groups.push(group);
    }
    group.items.push(e);
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight"><span className="text-nebula">타임테이블</span></h1>
      <p className="mt-1 text-sm muted">축제 일정을 시간순으로 확인하세요.</p>

      {groups.length === 0 ? (
        <p className="mt-8 text-sm muted">등록된 일정이 없습니다.</p>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          {groups.map((group) => (
            <section key={group.key}>
              <h2 className="text-sm font-semibold faint">
                {formatDay(group.day)}
              </h2>
              <ul className="mt-3 flex flex-col">
                {group.items.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/events/${e.id}`}
                      className="flex gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-white/5"
                    >
                      <span className="w-14 shrink-0 font-mono text-sm text-[color:var(--accent)]">
                        {formatClock(e.startAt)}
                      </span>
                      <span className="flex-1">
                        <span className="font-medium">{e.title}</span>
                        <span className="mt-1.5 flex flex-wrap items-center gap-2 text-xs muted">
                          <span className="tag" data-category={e.category}>
                            {categoryLabel(e.category)}
                          </span>
                          {e.location && <span>{e.location}</span>}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
