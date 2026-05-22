import { Outlet } from "react-router-dom";
import { Header } from "@/components/common/Header";
import { BottomBar } from "@/components/common/BottomBar";

export const AppLayout = () => {
  return (
    <div className="h-full flex flex-col">
      <Header />

      <main className="flex-1 p-4 overflow-y-auto">
        <Outlet />
      </main>

      <BottomBar />
    </div>
  );
};