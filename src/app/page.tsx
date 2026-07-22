import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, categoryLabel, eventImage, formatEventTime } from "@/lib/events";

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
    <main className="mx-auto w-full max-w-4xl px-6 py-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-[color:var(--line)] px-8 py-14 text-center glass">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-[color:var(--accent)]">
          NOTTEN · OFFLINE FESTIVAL
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          우주에서 열리는 <span className="text-nebula">축제의 순간</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed muted">
          공연, 부스, 체험, 먹거리까지 — 참여하고 싶은 이벤트를 찾아 별자리처럼 이어보세요.
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
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
          <p className="card px-5 py-8 text-center text-sm muted">
            {active ? "이 카테고리에는 아직 이벤트가 없습니다." : "아직 등록된 이벤트가 없습니다."}
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {events.map((e) => {
              const full = e.capacity !== null && e._count.participations >= e.capacity;
              return (
                <li key={e.id}>
                  <Link
                    href={`/events/${e.id}`}
                    className="card-link flex h-full flex-col overflow-hidden"
                  >
                    <div className="relative h-40 w-full">
                      <div
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${eventImage(e.title, e.category)})` }}
                      />
                      <span
                        className="tag absolute left-3 top-3"
                        data-category={e.category}
                      >
                        {categoryLabel(e.category)}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-lg font-semibold tracking-tight">{e.title}</h2>
                        <span className="shrink-0 text-xs faint">
                          {e.capacity !== null
                            ? `${e._count.participations}/${e.capacity}${full ? " · 마감" : ""}`
                            : `${e._count.participations}명 참여`}
                        </span>
                      </div>
                      <p className="mt-2 text-sm muted">
                        {formatEventTime(e.startAt, e.endAt)}
                        {e.location && ` · ${e.location}`}
                      </p>
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
    <Link href={href} className={activeLabel ? "chip chip--active" : "chip"}>
      {label}
    </Link>
  );
}
