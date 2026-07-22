import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { roleFromHost } from "@/lib/role";

// Routes exclusive to the organizer service (port 3001).
const ORGANIZER_ONLY = [
  /^\/organizing(\/|$)/,
  /^\/dashboard(\/|$)/,
  /^\/events\/new(\/|$)/,
  /^\/events\/\d+\/participants(\/|$)/,
  /^\/events\/\d+\/edit(\/|$)/,
];

// Routes exclusive to the participant service (port 3000).
const PARTICIPANT_ONLY = [
  /^\/$/,
  /^\/schedule(\/|$)/,
  /^\/my(\/|$)/,
  /^\/signup(\/|$)/, // organizer service has no self-signup
  /^\/events\/\d+$/, // event detail (not the /participants sub-route)
];

export function proxy(req: NextRequest) {
  const role = roleFromHost(req.headers.get("host"));
  const { pathname } = req.nextUrl;

  // --- API gating (by role + method) ---
  if (pathname === "/api/events" && req.method === "POST" && role !== "organizer") {
    return NextResponse.json(
      { error: "not available on this service" },
      { status: 404 },
    );
  }
  // Self-signup exists only on the participant service.
  if (pathname === "/api/auth/signup" && req.method === "POST" && role !== "participant") {
    return NextResponse.json(
      { error: "not available on this service" },
      { status: 404 },
    );
  }
  // Mutating a specific event (edit/delete) is organizer-only.
  if (
    /^\/api\/events\/\d+$/.test(pathname) &&
    (req.method === "PATCH" || req.method === "DELETE") &&
    role !== "organizer"
  ) {
    return NextResponse.json(
      { error: "not available on this service" },
      { status: 404 },
    );
  }
  // Participant roster APIs (check-in, CSV export) are organizer-only.
  if (
    (/^\/api\/events\/\d+\/participants\/\d+$/.test(pathname) ||
      /^\/api\/events\/\d+\/participants\/export$/.test(pathname)) &&
    role !== "organizer"
  ) {
    return NextResponse.json(
      { error: "not available on this service" },
      { status: 404 },
    );
  }
  if (
    /^\/api\/events\/\d+\/participate$/.test(pathname) &&
    role !== "participant"
  ) {
    return NextResponse.json(
      { error: "not available on this service" },
      { status: 404 },
    );
  }

  // --- Page gating (redirect to the role's home) ---
  if (role === "participant" && ORGANIZER_ONLY.some((r) => r.test(pathname))) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (role === "organizer" && PARTICIPANT_ONLY.some((r) => r.test(pathname))) {
    return NextResponse.redirect(new URL("/organizing", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};