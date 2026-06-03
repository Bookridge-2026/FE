// 후에 기능 추가 - > 로그인 여부 체크, 권한 체크

import { Outlet, Navigate } from "react-router-dom";

export const PrivateRoute = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return <Navigate to="/" replace />;
  return <Outlet />;
};
