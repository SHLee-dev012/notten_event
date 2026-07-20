"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/");
  }

  return (
    <button
      onClick={logout}
      disabled={pending}
      className="text-sm text-gray-500 hover:text-gray-900 disabled:opacity-50 dark:hover:text-gray-100"
    >
      로그아웃
    </button>
  );
}