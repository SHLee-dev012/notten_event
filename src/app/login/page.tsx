import { headers } from "next/headers";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { roleFromHost } from "@/lib/role";

export default async function LoginPage() {
  const role = roleFromHost((await headers()).get("host"));
  const isOrganizer = role === "organizer";

  return (
    <main className="mx-auto w-full max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight">
        {isOrganizer ? "주최자 로그인" : "로그인"}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {isOrganizer
          ? "관리자 계정으로만 로그인할 수 있습니다."
          : "축제 이벤트에 참여하려면 로그인하세요."}
      </p>
      <AuthForm mode="login" organizer={isOrganizer} />
      {!isOrganizer && (
        <p className="mt-6 text-sm text-gray-500">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="underline hover:text-gray-900 dark:hover:text-gray-100">
            회원가입
          </Link>
        </p>
      )}
    </main>
  );
}
