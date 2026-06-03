import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "@/components/common/ConfirmModal";

type RoomStatus = "waiting" | "inProgress" | "ended";

interface Member {
  memberId: number;
  nickname: string;
}

interface Room {
  roomId: number;
  bookTitle: string;
  author: string;
  currentPage?: number;
  totalPage?: number;
  isOwner: boolean;
  ownerNickname?: string;
  pendingMembers?: Member[];
  myStatus?: "waiting" | "accepted";
  members?: Member[];
}

// ─── 목업 데이터 ─────────────────────────────────────────
const MOCK: Record<RoomStatus, { invited: Room[]; mine: Room[]; others: Room[] }> = {
  waiting: {
    invited: [
      {
        roomId: 1,
        bookTitle: "동물농장",
        author: "민음사",
        isOwner: false,
        ownerNickname: "닉네임",
      },
    ],
    mine: [
      {
        roomId: 2,
        bookTitle: "동물농장",
        author: "민음사",
        currentPage: 1,
        totalPage: 5,
        isOwner: true,
        pendingMembers: [
          { memberId: 1, nickname: "추리킬러" },
          { memberId: 2, nickname: "박코난" },
        ],
      },
      {
        roomId: 3,
        bookTitle: "앵무새 죽이기",
        author: "열린 책들",
        currentPage: 0,
        totalPage: 7,
        isOwner: true,
        pendingMembers: [],
      },
    ],
    others: [
      {
        roomId: 4,
        bookTitle: "죽은 시인의 사회",
        author: "서교출판사",
        isOwner: false,
        myStatus: "waiting",
        members: [{ memberId: 3, nickname: "홍길동" }],
      },
    ],
  },
  inProgress: {
    invited: [],
    mine: [
      {
        roomId: 5,
        bookTitle: "동물농장",
        author: "민음사",
        isOwner: true,
        pendingMembers: [],
      },
      {
        roomId: 6,
        bookTitle: "앵무새 죽이기",
        author: "열린 책들",
        isOwner: true,
        pendingMembers: [],
      },
    ],
    others: [
      {
        roomId: 7,
        bookTitle: "죽은 시인의 사회",
        author: "서교출판사",
        isOwner: false,
        myStatus: "accepted",
        members: [{ memberId: 3, nickname: "홍길동" }],
      },
    ],
  },
  ended: {
    invited: [],
    mine: [
      {
        roomId: 8,
        bookTitle: "파우스트",
        author: "민음사",
        isOwner: true,
        pendingMembers: [],
      },
    ],
    others: [
      {
        roomId: 9,
        bookTitle: "특일 교육 이야기",
        author: "21세기 북스",
        isOwner: false,
        myStatus: "accepted",
        members: [],
      },
    ],
  },
};

const TABS: { key: RoomStatus; label: string }[] = [
  { key: "waiting", label: "대기 중인 방" },
  { key: "inProgress", label: "진행 중인 방" },
  { key: "ended", label: "종료된 방" },
];

// 구분선 컴포넌트
const Divider = () => (
  <div className="relative h-[0.1px] bg-[#ffffff] overflow-visible after:content-[''] after:absolute after:left-0 after:right-0 after:top-0 after:h-[3px] after:bg-gradient-to-b after:from-black/[0.2] after:to-transparent" />
);

export default function MyRoomsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<RoomStatus>("waiting");
  const [expandedRooms, setExpandedRooms] = useState<Record<number, boolean>>({});
  const [modal, setModal] = useState<{
    open: boolean;
    type: "start" | "accept" | "reject" | "enter" | null;
    roomId: number | null;
    memberNickname?: string;
  }>({ open: false, type: null, roomId: null });

  const rooms = MOCK[activeTab];

  const toggleRoom = (roomId: number) =>
    setExpandedRooms((prev) => ({ ...prev, [roomId]: !prev[roomId] }));

  const openModal = (
    type: "start" | "accept" | "reject" | "enter",
    roomId: number,
    memberNickname?: string
  ) => setModal({ open: true, type, roomId, memberNickname });

  const handleConfirm = () => {
    const { type, roomId } = modal;
    setModal({ open: false, type: null, roomId: null });
    if (type === "start" || type === "enter") navigate(`/rooms/${roomId}`);
  };

  const modalMessage = () => {
    if (modal.type === "start") return "방을 시작하시겠습니까?";
    if (modal.type === "accept") return "입장 요청을 수락하시겠습니까?";
    if (modal.type === "reject") return "입장 요청을 거절하시겠습니까?";
    if (modal.type === "enter") return "방에 입장하시겠습니까?";
    return "";
  };

  const SectionHeader = ({label}: {label: string;}) => (
    <button className="flex items-center w-full pt-2 pb-3 px-4">
      <span className="text-lg font-semibold text-[#291A00]">• {label}</span>
    </button>
  );

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      {/* 헤더 */}
      <div className="flex items-center px-4 pt-9 pb-6 gap-2 bg-[#FFFBEF]">
        <button className="flex items-center pl-4" onClick={() => navigate("/mypage")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#291A00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="flex-1 text-center text-base font-medium text-[#0F0F0F]">
          내 방 돌려보기
        </span>
        <div className="w-6" />
      </div>

      {/* 탭 바 */}
      <div className="flex px-4 py-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 text-sm py-2.5 font-semibold border-b-3 transition-colors
              ${activeTab === tab.key
                ? "border-[#291A00] text-[#0F0F0F]"
                : "border-transparent text-[#9e9890]"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 리스트 */}
      <div className="flex flex-col pt-5 pb-6">

        {activeTab === "waiting" && (
          <section className="mb-15">
            <SectionHeader label="초대 받은 방" />
            <div>
              {rooms.invited.length === 0 ? (
                <p className="text-sm text-[#9e9890] text-center py-4">초대 받은 방이 없습니다.</p>
              ) : (
                rooms.invited.map((room) => (
                  <div key={room.roomId}>
                    <div className="pl-6 flex items-center justify-between py-3 px-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xs text-[#291A00] shrink-0 font-semibold">{room.ownerNickname}</span>
                        <span className="text-sm text-[#291A00] truncate font-semibold">
                          {room.bookTitle} | {room.author}
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0 ml-2">
                        <button
                          onClick={() => openModal("accept", room.roomId)}
                          className="h-8 px-3 rounded-lg bg-[#291A00] text-white text-xs font-medium"
                        >
                          수락
                        </button>
                        <button
                          onClick={() => openModal("reject", room.roomId)}
                          className="h-8 px-3 rounded-lg border border-[#c8c4bc] text-[#291A00] text-xs font-medium"
                        >
                          거절
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Divider />
          </section>
      )}

        {/* ── 내가 만든 방 ── */}
        <section className="mb-15">
          <SectionHeader label="내가 만든 방" />
            <div>
              {rooms.mine.length === 0 ? (
                <p className="text-sm text-[#9e9890] text-center py-4">방이 없습니다.</p>
              ) : (
                rooms.mine.map((room) => {
                  const isExpanded = !!expandedRooms[room.roomId];
                  const label = `${room.bookTitle} | ${room.author}${room.totalPage != null ? ` (${room.currentPage}/${room.totalPage})` : ""}`;

                  return (
                    <div key={room.roomId}>
                      {(activeTab === "inProgress" || activeTab === "ended") ? (
                        <>
                          <div className="pl-6 flex items-center justify-between w-full py-3 px-4">
                            <span className="text-sm text-[#291A00] font-semibold">{label}</span>
                            <button
                              onClick={() => navigate(`/rooms/${room.roomId}`)}
                              className="h-8 px-3 rounded-lg bg-[#291A00] text-white text-xs font-medium shrink-0"
                            >
                              바로가기
                            </button>
                          </div>
                          <Divider />
                        </>
                      ) : (
                        <>
                          <button
                            className="pl-6 flex items-center justify-between w-full py-3 px-4"
                            onClick={() => toggleRoom(room.roomId)}
                          >
                            <span className="text-sm text-[#291A00] font-semibold">{label}</span>
                            <svg
                              width="16" height="16" viewBox="0 0 24 24" fill="none"
                              className={`shrink-0 ml-2 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                            >
                              <path d="M6 9l6 6 6-6" stroke="#9e9890" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <Divider />

                          {isExpanded && (
                            <div className="px-4 pb-4 pt-2">
                              {room.pendingMembers && room.pendingMembers.length > 0 ? (
                                <div className="flex flex-col gap-2 mb-3">
                                  {room.pendingMembers.map((m) => (
                                    <div key={m.memberId} className="flex items-center justify-between py-1 pl-6">
                                      <span className="text-sm text-[#291A00]">{m.nickname}</span>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => openModal("accept", room.roomId, m.nickname)}
                                          className="h-8 px-3 rounded-lg bg-[#291A00] text-white text-xs font-medium"
                                        >
                                          수락
                                        </button>
                                        <button
                                          onClick={() => openModal("reject", room.roomId, m.nickname)}
                                          className="h-8 px-3 rounded-lg border border-[#c8c4bc] text-[#291A00] text-xs font-medium"
                                        >
                                          거절
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-[#9e9890] text-center py-3 mb-1">새로운 요청이 없습니다</p>
                              )}

                              <div className="flex justify-center mb-3">
                                <button className="text-xs font-medium text-[#291A00] bg-[#FFFBEF] border border-[#e5e0d8] rounded-full px-3 py-1">
                                  친구 초대하기
                                </button>
                              </div>

                              <button
                                onClick={() => openModal("start", room.roomId)}
                                className={`w-full py-3.5 rounded-xl text-sm font-medium transition-colors
                                  ${room.pendingMembers && room.pendingMembers.length > 0
                                    ? "bg-[#9D968C] text-white cursor-not-allowed"
                                    : "bg-[#291A00] text-white"}`}
                                disabled={!!(room.pendingMembers && room.pendingMembers.length > 0)}
                              >
                                방 시작
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
        </section>

        {/* ── 다른 사용자가 만든 방 ── */}
        <section className="mb-10">
          <SectionHeader label="다른 사용자가 만든 방" />
            <div>
              {rooms.others.length === 0 ? (
                <p className="text-sm text-[#9e9890] text-center py-4">방이 없습니다.</p>
              ) : (
                rooms.others.map((room) => {
                  const isExpanded = !!expandedRooms[room.roomId];
                  const label = `${room.bookTitle} | ${room.author}`;

                  return (
                    <div key={room.roomId}>
                      {(activeTab === "inProgress" || activeTab === "ended") ? (
                        <>
                          <div className="pl-6 flex items-center justify-between w-full py-3 px-4">
                            <span className="text-sm text-[#291A00] font-semibold">{label}</span>
                            <button
                              onClick={() => navigate(`/rooms/${room.roomId}`)}
                              className="h-8 px-3 rounded-lg bg-[#291A00] text-white text-xs font-medium shrink-0"
                            >
                              바로가기
                            </button>
                          </div>
                          <Divider />
                        </>
                      ) : (
                        <>
                          <button
                            className="pl-6 flex items-center justify-between w-full py-3 px-4"
                            onClick={() => toggleRoom(room.roomId)}
                          >
                            <span className="text-sm text-[#291A00] font-semibold">{label}</span>
                            <svg
                              width="16" height="16" viewBox="0 0 24 24" fill="none"
                              className={`shrink-0 ml-2 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                            >
                              <path d="M6 9l6 6 6-6" stroke="#9e9890" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <Divider />

                          {isExpanded && (
                            <div className="px-4 pb-4 pt-2">
                              {room.members && room.members.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                  {room.members.map((m) => (
                                    <div key={m.memberId} className="flex items-center justify-between py-1 pl-6">
                                      <span className="text-sm text-[#291A00]">{m.nickname}</span>
                                      {room.myStatus === "waiting" && (
                                        <span className="h-8 px-3 rounded-lg bg-[#9D968C] text-white text-xs font-medium flex items-center">
                                          대기 중
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-[#9e9890] text-center py-2">멤버가 없습니다.</p>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
        </section>
      </div>

      <ConfirmModal
        open={modal.open}
        message={modalMessage()}
        onCancel={() => setModal({ open: false, type: null, roomId: null })}
        onConfirm={handleConfirm}
      />
    </div>
  );
}