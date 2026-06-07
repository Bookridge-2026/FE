import mainLogo from "@/assets/main-logo.svg";
import googleIcon from "@/assets/google-logo.svg";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href =
      `${import.meta.env.VITE_API_BASE_URL}/api/oauth2/login/google`;
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-8 px-8 bg-white">
      <div className="flex flex-col items-center gap-3">
        <img
          src={mainLogo}
          alt="Book Bridge"
          className="h-18"
        />

        <p className="text-sub-black text-base text-center">
          함께 읽는 독서 모임 플랫폼
        </p>
      </div>

      <div className="mt-10 w-full max-w-[300px]">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full h-12 flex items-center justify-center gap-3 rounded-2xl border border-[#EEEAE6] bg-primary text-base font-normal text-white shadow-sm"
        >
          <img src={googleIcon} alt="Google" className="w-5 h-5" />

          구글로 로그인
        </button>
      </div>
    </div>
  );
}
