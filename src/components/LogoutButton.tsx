"use client";

import { useState } from "react";

export function LogoutButton({ redirectTo = "/" }: { redirectTo?: string }) {
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    // Full navigation (not router.push): a client-side push preserves the
    // shared root layout, so the header would keep showing the user's name and
    // logout button. A document load re-renders it in the logged-out state.
    window.location.assign(redirectTo);
  }

  return (
    <button
      onClick={logout}
      disabled={pending}
      className="text-sm text-[color:var(--ink-muted)] transition-colors hover:text-[color:var(--ink)] disabled:opacity-50"
    >
      로그아웃
    </button>
  );
}