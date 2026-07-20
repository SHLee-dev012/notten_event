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
          ? "shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
          : "shrink-0 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
      }
    >
      {pending ? "처리 중…" : checkedIn ? "체크인 취소" : "체크인"}
    </button>
  );
}