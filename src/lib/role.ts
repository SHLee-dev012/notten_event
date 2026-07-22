// The service "role" tells the codebase which of the two services it is:
//   - participant service (browse / participate)
//   - organizer service  (create / manage / rosters)
// DB, auth and sessions are shared (cookies are scoped by role, not port).
//
// Resolution order:
//   1. NOTTEN_ROLE env var — set this per deployment (e.g. one container each).
//      Required behind a reverse proxy, where the public Host has no port.
//   2. Otherwise, the request port: 3001 → organizer, anything else →
//      participant. This is what the local dev servers rely on.

export type Role = "participant" | "organizer";

const PORT_ROLE: Record<string, Role> = {
  "3001": "organizer",
};

function forcedRole(): Role | null {
  const r = process.env.NOTTEN_ROLE;
  return r === "organizer" || r === "participant" ? r : null;
}

export function roleFromHost(host: string | null | undefined): Role {
  const forced = forcedRole();
  if (forced) return forced;
  const port = host?.split(":")[1] ?? "";
  return PORT_ROLE[port] ?? "participant";
}