// The service "role" is derived from the port the request came in on, so the
// same codebase can be run as two separate services:
//   - port 3000 → participant service (browse / participate)
//   - port 3001 → organizer service  (create / manage / rosters)
// DB, auth and sessions are shared (cookies are scoped by host, not port).

export type Role = "participant" | "organizer";

const PORT_ROLE: Record<string, Role> = {
  "3001": "organizer",
};

export function roleFromHost(host: string | null | undefined): Role {
  const port = host?.split(":")[1] ?? "";
  return PORT_ROLE[port] ?? "participant";
}