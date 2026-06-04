import mainLogo from "@/assets/main-logo.svg";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href =
      `${import.meta.env.VITE_API_BASE_URL}/api/oauth2/login/google`;
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-8 px-8 bg-main">
      <div className="flex flex-col items-center gap-3">
        <img
          src={mainLogo}
          alt="Book Bridge"
          className="h-16"
        />

        <p className="text-sub-black text-sm text-center">
          함께 읽는 독서 모임 플랫폼
        </p>
      </div>

      <div className="w-full max-w-[300px]">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full h-14 flex items-center justify-center gap-3 rounded-2xl border border-[#EEEAE6] bg-white text-base font-medium text-black shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            ...
          </svg>

          Google로 로그인
        </button>
      </div>
    </div>
  );
}
