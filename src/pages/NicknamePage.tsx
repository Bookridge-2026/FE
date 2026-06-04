import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BottomButton } from "@/components/common/BottomButton";
import { registerOAuthUser } from "@/api/auth";
import defaultProfile from "@/assets/default-profile.jpg";

const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,6}$/;

const NicknamePage = () => {
  const [nickname, setNickname] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const validationMessage = useMemo(() => {
    if (!nickname) return "";

    if (nickname.length < 2 || nickname.length > 6) {
      return "2~6자 사이로 입력해주세요.";
    }

    if (!NICKNAME_REGEX.test(nickname)) {
      return "특수문자는 사용 불가능합니다.";
    }

    return "";
  }, [nickname]);

  const isValid = nickname.length > 0 && !validationMessage;

  const handleSubmit = async () => {
    if (!isValid || loading) return;

    const tempToken = searchParams.get("tempToken");

    if (!tempToken) {
      setServerError("가입 토큰이 없습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      setLoading(true);
      setServerError("");

      const result = await registerOAuthUser({
        tempToken,
        nickname,
      });

      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("refreshToken", result.refreshToken);

      navigate("/home", { replace: true });
    } catch (error: any) {
      const message =
        error.response?.data?.message ?? "회원가입에 실패했습니다.";

      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center bg-white px-6 pt-[170px]">
      <div className="relative">
        <img
          src={defaultProfile}
          alt="기본 프로필"
          className="h-[108px] w-[108px] rounded-full border-2 border-[#3B2E1E] object-cover"
        />
      </div>

      <div className="mt-10 w-full max-w-[340px]">
        <input
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value.trim());
            setServerError("");
          }}
          maxLength={6}
          placeholder="2~6자 사이의 닉네임을 입력해주세요"
          className="h-[46px] w-full rounded-xl bg-field px-4 text-center text-sm text-black outline-none placeholder:text-sub-black"
        />

        <div className="mt-2 min-h-[20px] text-center text-xs text-red-500">
          {validationMessage || serverError}
        </div>
      </div>

      <div className="mt-auto pb-[56px]">
        <BottomButton
          onClick={handleSubmit}
          disabled={!isValid || loading}
        >
          시작
        </BottomButton>
      </div>
    </div>
  );
};

export default NicknamePage;
