"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  eventId: number;
  joined: boolean;
  isFull: boolean;
  loggedIn: boolean;
};

export function ParticipateButton({ eventId, joined, isFull, loggedIn }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loggedIn) {
    return (
      <a
        href="/login"
        className="inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
      >
        로그인하고 참여하기
      </a>
    );
  }

  async function toggle() {
    setPending(true);
    setError(null);
    const res = await fetch(`/api/events/${eventId}/participate`, {
      method: joined ? "DELETE" : "POST",
    });
    setPending(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error === "event is full" ? "정원이 가득 찼습니다." : "잠시 후 다시 시도해주세요.");
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={toggle}
        disabled={pending || (!joined && isFull)}
        className={
          joined
            ? "rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
            : "rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
        }
      >
        {pending
          ? "처리 중…"
          : joined
            ? "참여 취소"
            : isFull
              ? "정원 마감"
              : "참여하기"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}