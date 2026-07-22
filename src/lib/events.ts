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

// ── Event artwork ─────────────────────────────────────────────
// Cosmic SVG banners served from /public. Seed events get a bespoke
// per-title illustration; everything else falls back to its category art.

const CATEGORY_IMAGE: Record<string, string> = {
  PERFORMANCE: "performance",
  BOOTH: "booth",
  EXPERIENCE: "experience",
  FOOD: "food",
  GENERAL: "general",
};

const EVENT_IMAGE: Record<string, string> = {
  "오프닝 공연 — 인디 밴드 라이브": "opening-live",
  "핸드메이드 마켓 부스": "handmade-market",
  "도예 원데이 클래스": "pottery-class",
  "푸드트럭 존 오픈": "foodtruck-zone",
  "재즈 나이트": "jazz-night",
  "가족 페이스페인팅": "face-painting",
  "클로징 불꽃놀이": "closing-fireworks",
};

export function categoryImage(category: string): string {
  return `/categories/${CATEGORY_IMAGE[category] ?? "general"}.svg`;
}

// Per-title illustration if we have one, else the category fallback.
export function eventImage(title: string, category: string): string {
  const slug = EVENT_IMAGE[title.trim()];
  return slug ? `/events/${slug}.svg` : categoryImage(category);
}