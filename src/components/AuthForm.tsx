"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClass =
  "rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 dark:border-gray-700 dark:bg-transparent dark:focus:border-gray-100";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isSignup = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        isSignup ? { name, email, password } : { email, password },
      ),
    });

    setPending(false);
    if (res.ok) {
      router.refresh();
      router.push("/");
      return;
    }

    const data = await res.json().catch(() => ({}));
    const messages: Record<string, string> = {
      "email already in use": "이미 사용 중인 이메일입니다.",
      "invalid email or password": "이메일 또는 비밀번호가 올바르지 않습니다.",
      "password must be at least 6 characters": "비밀번호는 6자 이상이어야 합니다.",
    };
    setError(messages[data?.error] ?? "요청을 처리하지 못했습니다.");
  }

  return (
    <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
      {isSignup && (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          className={inputClass}
        />
      )}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일"
        className={inputClass}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        className={inputClass}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
      >
        {pending ? "처리 중…" : isSignup ? "가입하기" : "로그인"}
      </button>
    </form>
  );
}