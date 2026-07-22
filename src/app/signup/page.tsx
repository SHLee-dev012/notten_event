import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight"><span className="text-nebula">회원가입</span></h1>
      <p className="mt-1 text-sm muted">
        계정을 만들고 축제를 즐겨보세요.
      </p>
      <AuthForm mode="signup" />
      <p className="mt-6 text-sm muted">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-[color:var(--accent)] hover:underline">
          로그인
        </Link>
      </p>
    </main>
  );
}