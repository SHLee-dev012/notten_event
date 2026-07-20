"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/lib/events";

const inputClass =
  "rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 dark:border-gray-700 dark:bg-transparent dark:focus:border-gray-100";
const labelClass = "text-sm font-medium";

export type EditableEvent = {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  startAt: string; // ISO
  endAt: string; // ISO
  capacity: number | null;
};

// Convert an ISO timestamp into the "YYYY-MM-DDTHH:mm" value a
// datetime-local input expects, in the viewer's local time.
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventForm({ event }: { event?: EditableEvent }) {
  const router = useRouter();
  const isEdit = Boolean(event);

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [category, setCategory] = useState<string>(event?.category ?? CATEGORIES[0].key);
  const [location, setLocation] = useState(event?.location ?? "");
  const [startAt, setStartAt] = useState(event ? toLocalInput(event.startAt) : "");
  const [endAt, setEndAt] = useState(event ? toLocalInput(event.endAt) : "");
  const [capacity, setCapacity] = useState(
    event?.capacity != null ? String(event.capacity) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("제목을 입력해주세요.");
    if (!startAt || !endAt) return setError("시작/종료 시간을 입력해주세요.");
    if (new Date(endAt) < new Date(startAt))
      return setError("종료 시간은 시작 시간 이후여야 합니다.");

    setPending(true);
    const res = await fetch(isEdit ? `/api/events/${event!.id}` : "/api/events", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description,
        category,
        location,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        capacity: capacity ? Number(capacity) : null,
      }),
    });
    setPending(false);

    if (res.ok) {
      const saved = await res.json();
      router.push(isEdit ? "/organizing" : `/events/${saved.id}`);
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data?.error ?? "이벤트를 저장하지 못했습니다.");
  }

  return (
    <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className={labelClass}>제목</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="이벤트 제목"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className={labelClass}>카테고리</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass}
        >
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className={labelClass}>장소</span>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="예: 메인 스테이지"
          className={inputClass}
        />
      </label>

      <div className="flex flex-col gap-4 sm:flex-row">
        <label className="flex flex-1 flex-col gap-1">
          <span className={labelClass}>시작 시간</span>
          <input
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className={labelClass}>종료 시간</span>
          <input
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className={labelClass}>정원 (선택 · 비우면 제한 없음)</span>
        <input
          type="number"
          min={1}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="예: 100"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className={labelClass}>설명</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="이벤트 소개"
          rows={4}
          className={inputClass}
        />
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
      >
        {pending ? "저장 중…" : isEdit ? "변경 사항 저장" : "이벤트 등록"}
      </button>
    </form>
  );
}