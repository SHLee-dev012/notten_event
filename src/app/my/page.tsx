import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { categoryLabel, formatEventTime } from "@/lib/events";

export default async function MyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const participations = await prisma.participation.findMany({
    where: { userId: user.id },
    orderBy: { event: { startAt: "asc" } },
    include: { event: true },
  });

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">내 참여 이벤트</h1>
      <p className="mt-1 text-sm text-gray-500">{user.name}님이 참여 중인 이벤트입니다.</p>

      <section className="mt-8">
        {participations.length === 0 ? (
          <p className="text-sm text-gray-500">
            아직 참여한 이벤트가 없습니다.{" "}
            <Link href="/" className="underline hover:text-gray-900 dark:hover:text-gray-100">
              이벤트 둘러보기
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {participations.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/events/${p.event.id}`}
                  className="block rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-600"
                >
                  <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {categoryLabel(p.event.category)}
                  </span>
                  <h2 className="mt-2 font-semibold">{p.event.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatEventTime(p.event.startAt, p.event.endAt)}
                    {p.event.location && ` · ${p.event.location}`}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
