"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteEventButton({ eventId }: { eventId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!confirm("이 이벤트를 삭제할까요? 참여 신청 내역도 함께 삭제됩니다.")) return;
    setPending(true);
    setError(null);
    const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/organizing");
      router.refresh();
      return;
    }
    setPending(false);
    setError("삭제하지 못했습니다.");
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={remove}
        disabled={pending}
        className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
      >
        {pending ? "삭제 중…" : "이벤트 삭제"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}