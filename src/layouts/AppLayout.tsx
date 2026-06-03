import { Outlet, useLocation } from "react-router-dom";
import { Header } from "@/components/common/Header";
import { BottomBar } from "@/components/common/BottomBar";

const HIDE_HEADER_PATHS = [
  /^\/rooms\/[^/]+/,  // /rooms/:roomId 이하 전부 헤더 가림
  /^\/notice/, 
  /^\/mypage\/rooms/,
  /^\/mypage\/books/,
];

export const AppLayout = () => {
  const { pathname } = useLocation();
  const hideHeader = HIDE_HEADER_PATHS.some((pattern) => pattern.test(pathname));

  return (
    <div className="min-h-dvh">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[390px] bg-white">
        {!hideHeader && <Header />}
      </div>
            
      <main className={hideHeader 
        ? "pb-[calc(var(--bottom-bar-height)+16px)]" 
        : "pt-[calc(var(--header-height)+16px)] pb-[calc(var(--bottom-bar-height)+16px)]"
      }>
        <Outlet />
        </main>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[390px] bg-white">
        <BottomBar />
      </div>
    </div>
  );
};