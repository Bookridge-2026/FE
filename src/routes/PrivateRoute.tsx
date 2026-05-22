// 후에 기능 추가 - > 로그인 여부 체크, 권한 체크

import { Outlet } from "react-router-dom";

export const PrivateRoute = () => {
  return <Outlet />;
};