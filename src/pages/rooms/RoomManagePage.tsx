import { useState } from "react";
import crown from "../../assets/rooms/crown.svg";
import tap from "../../assets/rooms/tap.svg";

type MemberRole = "host" | "member";

interface Member {
  id: number;
  name: string;
  color: string;
  role: MemberRole;
}

interface RoomManageProps {
  members?: Member[];
  currentUserIsHost?: boolean;
  onBack?: () => void;
  onProfileClick?: (member: Member) => void;
  onKick?: (member: Member) => void;
  onPoke?: (member: Member) => void;
}

export default function RoomManagePage({
  members: membersProp,
  currentUserIsHost = true,
  onBack,
  onProfileClick,
  onKick,
  onPoke,
}: RoomManageProps) {
  const [members] = useState<Member[]>(
    membersProp ?? [
      { id: 1, name: "홍길동",      color: "#F4B8C8", role: "host"   },
      { id: 2, name: "정바미",      color: "#F2DE8C", role: "member" },
      { id: 3, name: "책 먹는 여우", color: "#B5E061", role: "member" },
      { id: 4, name: "고길동",      color: "#8AB4F0", role: "member" },
      { id: 5, name: "김성신",      color: "#C99BE8", role: "member" },
    ]
  );

  const handleProfile = (m: Member) => {
    onProfileClick?.(m);
  };

  return (
    <div
      className="mx-auto flex min-h-screen w-full max-w-md flex-col"
      style={{ backgroundColor: "#F3EEE3", fontFamily: "'Pretendard', system-ui, sans-serif" }}
    >
      {/* 헤더 */}
      <header className="relative flex items-center justify-center px-4 py-5">
        <button
          onClick={() => onBack?.()}
          className="absolute left-4 flex h-9 w-9 items-center justify-center rounded-full transition active:scale-90"
          aria-label="뒤로가기"
          style={{ color: "#2A211C" }}
        >
          {/* ChevronLeft SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={26}
            height={26}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold" style={{ color: "#2A211C" }}>
          방 관리
        </h1>
      </header>

      {/* 섹션 타이틀 */}
      <div className="px-6 pt-2 pb-1">
        <h2
          className="flex items-center gap-2 text-base font-bold"
          style={{ color: "#2A211C" }}
        >
          <span className="text-xs">●</span>
          멤버 목록
        </h2>
      </div>

      {/* 멤버 리스트 */}
      <ul className="flex flex-col px-3 py-2">
        {members.map((m) => {
          const isHost = m.role === "host";
          return (
            <li key={m.id} className="flex items-center gap-3 px-3 py-3">
              {/* 프로필 (아바타 + 이름) → 클릭 시 유저 페이지 */}
              <button
                onClick={() => handleProfile(m)}
                className="flex flex-1 items-center gap-4 text-left transition active:opacity-60"
              >
                <span
                  className="h-9 w-9 shrink-0 rounded-full"
                  style={{
                    backgroundColor: m.color,
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
                  }}
                />
                <span
                  className="text-[15px] font-semibold"
                  style={{ color: "#2A211C" }}
                >
                  {m.name}
                </span>
              </button>

              {/* 오른쪽 액션 영역 */}
              <div className="flex shrink-0 items-center gap-2">
                {isHost ? (
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "#2A211C" }}
                    aria-label="방장"
                  >
                    <img src={crown} alt="방장" className="h-5 w-5" />
                  </span>
                ) : currentUserIsHost ? (

                  <>
                    <button
                      onClick={() => onKick?.(m)}
                      className="rounded-xl px-4 py-2.5 text-sm font-bold transition active:scale-95"
                      style={{ backgroundColor: "#E6E1D5", color: "#9C9482" }}
                    >
                      강퇴
                    </button>
                    <button
                      onClick={() => onPoke?.(m)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl transition active:scale-95"
                      style={{ backgroundColor: "#2A211C" }}
                      aria-label="콕 찌르기"
                    >
                      <img src={tap} alt="콕 찌르기" className="h-5 w-5" />
                    </button>
                  </>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}