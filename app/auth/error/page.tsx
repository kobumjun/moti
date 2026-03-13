import Link from "next/link";

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-moti-bg">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-moti-text mb-2">
          로그인 중 오류가 발생했습니다
        </h1>
        <p className="text-moti-textDim mb-4">
          다시 시도해 주세요.
        </p>
        <Link
          href="/"
          className="text-moti-accent hover:underline"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
