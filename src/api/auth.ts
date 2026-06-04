const ACCESS_KEY = "accessToken";

export const getToken = () => localStorage.getItem(ACCESS_KEY);
export const setToken = (t: string) => localStorage.setItem(ACCESS_KEY, t);
export const clearToken = () => localStorage.removeItem(ACCESS_KEY);

/**
 * 구글 로그인 콜백 이후 프론트가 토큰을 받는 부분.
 * 백엔드 콜백 핸들러가 어떻게 토큰을 넘기느냐에 따라 둘 중 하나를 씀.
 *
 * (A) 프론트로 리다이렉트 + 쿼리/해시에 토큰을 실어주는 경우:
 *     예) https://app.com/auth/callback?token=xxx
 */
export const captureTokenFromUrl = () => {
  const params = new URLSearchParams(window.location.search || window.location.hash.replace(/^#/, "?"));
  const token = params.get("token") ?? params.get("accessToken");
  if (token) {
    setToken(token);
    // URL에서 토큰 흔적 제거
    window.history.replaceState({}, "", window.location.pathname);
  }
  return token;
};