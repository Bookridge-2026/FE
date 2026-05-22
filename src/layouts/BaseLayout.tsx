import { Outlet } from "react-router-dom";

export const BaseLayout = () => {
  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center">
      <div className="relative w-full max-w-[390px] bg-white overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};