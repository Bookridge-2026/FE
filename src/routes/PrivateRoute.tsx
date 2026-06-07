import { Outlet, Navigate, useLocation } from "react-router-dom";

export const PrivateRoute = () => {
  const location = useLocation();

  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  const searchParams = new URLSearchParams(location.search);
  const queryAccessToken = searchParams.get("accessToken");
  const queryRefreshToken = searchParams.get("refreshToken");

  const hasToken =
    accessToken ||
    refreshToken ||
    (queryAccessToken && queryRefreshToken);

  if (!hasToken) return <Navigate to="/" replace />;

  return <Outlet />;
};
