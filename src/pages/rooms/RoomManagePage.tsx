import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import crown from "../../assets/rooms/crown.svg";
import tap from "../../assets/rooms/tap.svg";
import backButtonIcon from "@/assets/common/back-button.svg";

import { getRoomMembers, kickMember, pokeMember } from "@/api/member";
import type { RoomMember } from "@/types/member";
import { useToastContext } from "@/components/common/ToastProvider";

export default function RoomManagePage() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const location = useLocation();
  const roomState = (location.state as { roomState?: string } | null)?.roomState;
  const { show } = useToastContext();

  const [members, setMembers] = useState<RoomMember[]>([]);
  const [loadingMemberId, setLoadingMemberId] = useState<number | null>(null);

  const currentRoomId = Number(roomId);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await getRoomMembers(currentRoomId);
        setMembers(data);
      } catch {
        show("멤버 목록을 불러오지 못했습니다.");
      }
    };

    if (currentRoomId) fetchMembers();
  }, [currentRoomId, show]);

  const handleProfile = (member: RoomMember) => {
    navigate(`/users/${member.userId}`);
  };

  const handlePoke = async (member: RoomMember) => {
    try {
      setLoadingMemberId(member.memberId);

      const res = await pokeMember(currentRoomId, member.memberId);
      const { pokeCount, poke, canKick } = res.data;

      show(`${member.user.nickname}님을 콕 찔렀습니다. (${pokeCount}/${poke})`);

      setMembers((prev) =>
        prev.map((m) =>
          m.memberId === member.memberId
            ? {
                ...m,
                pokeCount,
                poke,
                canKick,
              }
            : m
        )
      );
    } catch {
      show("콕 찌르기에 실패했습니다.");
    } finally {
      setLoadingMemberId(null);
    }
  };

  const handleKick = async (member: RoomMember) => {
    if (!member.canKick) {
      show("아직 강퇴 조건을 만족하지 않았습니다.");
      return;
    }

    try {
      setLoadingMemberId(member.memberId);

      const res = await kickMember(currentRoomId, member.memberId);

      show(res.message || "멤버를 강퇴했습니다.");

      setMembers((prev) =>
        prev.filter((m) => m.memberId !== member.memberId)
      );
    } catch {
      show("강퇴에 실패했습니다.");
    } finally {
      setLoadingMemberId(null);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
      <header className="fixed top-0 left-1/2 z-50 flex h-[80px] w-full max-w-[390px] -translate-x-1/2 items-center bg-main px-4 box-border">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="이전으로 가기"
          className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
        >
          <img src={backButtonIcon} alt="" className="block h-[24px] w-[24px]" />
        </button>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[17px] font-semibold text-primary">
          방 관리
        </div>
      </header>

      <div className="px-6 pb-1 pt-[96px]">
        <h2 className="flex items-center gap-2 text-base font-bold text-primary">
          • 멤버 목록
        </h2>
      </div>

      <ul className="flex flex-col px-3 py-2">
        {members.map((m) => {
          const isHost = m.role === "leader";
          const isLoading = loadingMemberId === m.memberId;

          return (
            <li key={m.memberId} className="flex items-center gap-3 px-3 py-3">
              <button
                onClick={() => handleProfile(m)}
                className="flex flex-1 items-center gap-4 text-left transition active:opacity-60"
              >
                <span
                  className="block h-9 w-9 shrink-0 rounded-full border border-sub-black"
                  style={{
                    backgroundColor: (m.color ?? "#E6E1D5").trim(),
                  }}
                  aria-hidden="true"
                />

                <span className="text-[15px] font-semibold text-primary">
                  {m.user.nickname}
                </span>
              </button>

              <div className="flex shrink-0 items-center gap-2">
                {isHost ? (
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary"
                    aria-label="방장"
                  >
                    <img src={crown} alt="방장" className="h-5 w-5" />
                  </span>
                ) : (
                  <>
                    {roomState !== "closed" && (
                      <button
                        onClick={() => handleKick(m)}
                        disabled={!m.canKick || isLoading}
                        className="rounded-xl px-4 py-2.5 text-sm font-bold transition active:scale-95 disabled:opacity-40"
                        style={{
                          backgroundColor: m.canKick ? "#2A211C" : "#E6E1D5",
                          color: m.canKick ? "#FFFFFF" : "#9C9482",
                        }}
                      >
                        강퇴
                      </button>
                    )}

                    {roomState !== "closed" && (
                      <button
                        onClick={() => handlePoke(m)}
                        disabled={isLoading}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary transition active:scale-95 disabled:opacity-40"
                        aria-label="콕 찌르기"
                      >
                        <img src={tap} alt="콕 찌르기" className="h-5 w-5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}