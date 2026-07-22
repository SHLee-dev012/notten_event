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
        className="btn btn-primary"
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
            ? "btn btn-ghost"
            : "btn btn-primary"
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
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}