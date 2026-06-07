import { Outlet } from "react-router-dom";

export const BaseLayout = () => {
  return (
    <div className="min-h-dvh bg-neutral-100 flex justify-center">
      <div className="relative w-full max-w-[390px] min-h-dvh bg-white">
        <Outlet />
      </div>
    </div>
  );
};