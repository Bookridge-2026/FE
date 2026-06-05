import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getMyPage } from "@/api/auth";

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const initLogin = async () => {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");

      if (!accessToken || !refreshToken) return;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      try {
        const data = await getMyPage();
        localStorage.setItem("userCode", data.user.userCode);

        navigate("/home", { replace: true });
      } catch (error) {
        console.error(error);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userCode");

        navigate("/login", { replace: true });
      }
    };

    initLogin();
  }, [searchParams, navigate]);

  return <div>Home</div>;
};

export default HomePage;