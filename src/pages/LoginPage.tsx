import { useNavigate } from "react-router-dom";
import mainLogo from "@/assets/main-logo.svg";

export default function LoginPage() {
  const navigate = useNavigate();

  // 개발 모드: 토큰 직접 입력
  const handleDevLogin = () => {
    const token = window.prompt("개발용 accessToken을 입력하세요 (JWT)");
    if (token?.trim()) {
      localStorage.setItem("accessToken", token.trim());
      navigate("/home");
    }
  };

  // 구글 로그인 (추후 구현)
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"}/api/oauth2/google`;
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-8 px-8 bg-main">
      {/* 로고 */}
      <div className="flex flex-col items-center gap-3">
        <img src={mainLogo} alt="Book Bridge" className="h-16" />
        <p className="text-sub-black text-sm text-center">
          함께 읽는 독서 모임 플랫폼
        </p>
      </div>

      {/* 버튼 영역 */}
      <div className="w-full flex flex-col gap-3 max-w-[300px]">
        {/* 구글 로그인 */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full h-14 flex items-center justify-center gap-3 bg-white rounded-2xl border border-[#EEEAE6] text-black text-base font-medium shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            <path
              d="M44.5 20H24v8.5h11.8C34.6 33.7 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.7 4.5 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
              fill="#FFC107"
            />
            <path
              d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.7 4.5 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z"
              fill="#FF3D00"
            />
            <path
              d="M24 46c5.5 0 10.5-1.9 14.4-5.1l-6.7-5.5C29.6 37 26.9 38 24 38c-5.7 0-10.5-3.3-11.8-8.4l-7 5.4C8.3 41.3 15.6 46 24 46z"
              fill="#4CAF50"
            />
            <path
              d="M44.5 20H24v8.5h11.8c-.6 2.8-2.3 5.1-4.6 6.7l6.7 5.5C42 37.5 46 31 46 24c0-1.3-.2-2.7-.5-4z"
              fill="#1976D2"
            />
          </svg>
          Google로 로그인
        </button>

        {/* 개발 모드 로그인 */}
        {import.meta.env.DEV && (
          <button
            type="button"
            onClick={handleDevLogin}
            className="w-full h-10 flex items-center justify-center bg-field rounded-2xl text-sub-black text-sm"
          >
            🛠 개발용 토큰으로 로그인
          </button>
        )}
      </div>
    </div>
  );
}
