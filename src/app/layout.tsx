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
    "text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100";

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-gray-200 dark:border-gray-800">
          <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <Link
                href={isOrganizer ? "/organizing" : "/"}
                className="flex items-center gap-2 text-lg font-bold tracking-tight"
              >
                notten
                {isOrganizer && (
                  <span className="rounded bg-gray-900 px-1.5 py-0.5 text-[10px] font-medium text-white dark:bg-gray-100 dark:text-gray-900">
                    주최자
                  </span>
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
                  <span className="text-sm text-gray-500">{user.name}님</span>
                  <LogoutButton redirectTo={isOrganizer ? "/login" : "/"} />
                </>
              ) : (
                // The organizer service's entry point is the login page itself,
                // so no login link is shown there.
                !isOrganizer && (
                  <Link
                    href="/login"
                    className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    로그인
                  </Link>
                )
              )}
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}