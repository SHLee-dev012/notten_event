// Shared helpers for the festival event domain.

export const CATEGORIES = [
  { key: "PERFORMANCE", label: "공연" },
  { key: "BOOTH", label: "부스" },
  { key: "EXPERIENCE", label: "체험" },
  { key: "FOOD", label: "먹거리" },
  { key: "GENERAL", label: "기타" },
] as const;

export function categoryLabel(key: string): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

// Participation lifecycle. GOING = signed up, CHECKED_IN = arrived on-site.
export const PARTICIPATION_STATUSES = ["GOING", "CHECKED_IN"] as const;
export type ParticipationStatus = (typeof PARTICIPATION_STATUSES)[number];

export function statusLabel(status: string): string {
  return status === "CHECKED_IN" ? "체크인 완료" : "참여 예정";
}

const timeFmt = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const clockFmt = new Intl.DateTimeFormat("ko-KR", {
  hour: "2-digit",
  minute: "2-digit",
});

// e.g. "7월 20일 오후 02:00 – 03:30"
export function formatEventTime(start: Date, end: Date): string {
  return `${timeFmt.format(start)} – ${clockFmt.format(end)}`;
}

export function formatClock(d: Date): string {
  return clockFmt.format(d);
}

// "7월 20일" style day header for the schedule view.
const dayFmt = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "short",
});

export function formatDay(d: Date): string {
  return dayFmt.format(d);
}

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}