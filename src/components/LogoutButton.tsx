"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton({ redirectTo = "/" }: { redirectTo?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push(redirectTo);
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