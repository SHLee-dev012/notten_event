import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { roleFromHost } from "@/lib/role";
import { LogoutButton } from "@/components/LogoutButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "notten — 축제 이벤트",
  description: "오프라인 축제 이벤트를 조회하고, 안내받고, 참여하세요.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const role = roleFromHost((await headers()).get("host"));
  const isOrganizer = role === "organizer";
  const linkClass =
    "text-sm text-[color:var(--ink-muted)] transition-colors hover:text-[color:var(--ink)]";

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Cosmic backdrop */}
        <div className="cosmic-bg" aria-hidden>
          <span className="bloom v" />
          <span className="bloom c" />
        </div>

        <header className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-[color:var(--space-900)]/70 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
            <div className="flex items-center gap-5">
              <Link
                href={isOrganizer ? "/organizing" : "/"}
                className="flex items-center gap-2 text-lg font-bold tracking-tight"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[image:var(--accent-grad)] text-xs text-[#0a0c1c] shadow-[0_0_16px_-2px_rgba(129,140,248,0.8)]">
                  ✦
                </span>
                <span className="text-nebula">notten</span>
                {isOrganizer && (
                  <span className="tag">주최자</span>
                )}
              </Link>
              {isOrganizer ? (
                user && (
                  <>
                    <Link href="/organizing" className={linkClass}>
                      주최 관리
                    </Link>
                    <Link href="/dashboard" className={linkClass}>
                      대시보드
                    </Link>
                    <Link href="/events/new" className={linkClass}>
                      이벤트 등록
                    </Link>
                  </>
                )
              ) : (
                <>
                  <Link href="/schedule" className={linkClass}>
                    타임테이블
                  </Link>
                  {user && (
                    <Link href="/my" className={linkClass}>
                      내 참여
                    </Link>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm muted">{user.name}님</span>
                  <LogoutButton redirectTo={isOrganizer ? "/login" : "/"} />
                </>
              ) : (
                // The organizer service's entry point is the login page itself,
                // so no login link is shown there.
                !isOrganizer && (
                  <Link href="/login" className="btn btn-ghost">
                    로그인
                  </Link>
                )
              )}
            </div>
          </nav>
        </header>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}