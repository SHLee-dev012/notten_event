import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, categoryLabel, formatEventTime } from "@/lib/events";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = category?.trim() || undefined;

  const events = await prisma.event.findMany({
    where: active ? { category: active } : undefined,
    orderBy: { startAt: "asc" },
    include: { _count: { select: { participations: true } } },
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">축제 이벤트</h1>
      <p className="mt-1 text-sm text-gray-500">
        참여하고 싶은 이벤트를 찾아보세요.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip label="전체" href="/" activeLabel={!active} />
        {CATEGORIES.map((c) => (
          <FilterChip
            key={c.key}
            label={c.label}
            href={`/?category=${c.key}`}
            activeLabel={active === c.key}
          />
        ))}
      </div>

      <section className="mt-8">
        {events.length === 0 ? (
          <p className="text-sm text-gray-500">
            {active ? "이 카테고리에는 아직 이벤트가 없습니다." : "아직 등록된 이벤트가 없습니다."}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {events.map((e) => {
              const full = e.capacity !== null && e._count.participations >= e.capacity;
              return (
                <li key={e.id}>
                  <Link
                    href={`/events/${e.id}`}
                    className="block rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-600"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          {categoryLabel(e.category)}
                        </span>
                        <h2 className="mt-2 font-semibold">{e.title}</h2>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatEventTime(e.startAt, e.endAt)}
                          {e.location && ` · ${e.location}`}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-gray-400">
                        {e.capacity !== null
                          ? `${e._count.participations}/${e.capacity}${full ? " · 마감" : ""}`
                          : `${e._count.participations}명 참여`}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

function FilterChip({
  label,
  href,
  activeLabel,
}: {
  label: string;
  href: string;
  activeLabel: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        activeLabel
          ? "rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white dark:bg-gray-100 dark:text-gray-900"
          : "rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:border-gray-500 dark:border-gray-700 dark:text-gray-300"
      }
    >
      {label}
    </Link>
  );
}
