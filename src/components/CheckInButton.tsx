"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  eventId: number;
  userId: number;
  status: string;
};

export function CheckInButton({ eventId, userId, status }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const checkedIn = status === "CHECKED_IN";

  async function toggle() {
    setPending(true);
    const res = await fetch(
      `/api/events/${eventId}/participants/${userId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: checkedIn ? "GOING" : "CHECKED_IN" }),
      },
    );
    setPending(false);
    if (res.ok) router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={
        checkedIn
          ? "btn btn-ghost shrink-0 px-3 py-1.5 text-xs"
          : "btn btn-primary shrink-0 px-3 py-1.5 text-xs"
      }
    >
      {pending ? "처리 중…" : checkedIn ? "체크인 취소" : "체크인"}
    </button>
  );
}