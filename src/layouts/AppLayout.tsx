import { Outlet } from "react-router-dom";
import { Header } from "@/components/common/Header";
import { BottomBar } from "@/components/common/BottomBar";

export const AppLayout = () => {
  return (
    <div className="min-h-dvh">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[390px] bg-white">
        <Header />
      </div>
      
      <main className="pt-[calc(var(--header-height))] pb-[calc(var(--bottom-bar-height))]">
        <Outlet />
        </main>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[390px] bg-white">
        <BottomBar />
      </div>
    </div>
  );
};