import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { EventForm } from "@/components/EventForm";

export default async function NewEventPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) redirect("/login");

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link
        href="/"
        className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
      >
        ← 목록으로
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">이벤트 등록</h1>
      <p className="mt-1 text-sm text-gray-500">
        축제에서 진행할 이벤트를 등록하세요.
      </p>
      <EventForm />
    </main>
  );
}
