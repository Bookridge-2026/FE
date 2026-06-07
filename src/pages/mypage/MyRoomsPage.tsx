import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import backButtonIcon from "@/assets/common/back-button.svg";
import { getMyRooms, getOngoingRooms, getClosedRooms, acceptMember, rejectMember, acceptInvite, rejectInvite, startRoom } from "@/api/mypage";
import { getFriendsForInvite, inviteFriend } from "@/api/friend"; // 추가 필요
import type { InvitedRoom, LeaderRoom, OtherRoom, OngoingRoom } from "@/types/myrooms";

type RoomStatus = "waiting" | "inProgress" | "ended";

interface FriendInvite {
  userId: number;
  nickname: string;
  inviteStatus: "none" | "invited" | "pending" | "attend";
}

const TABS: { key: RoomStatus; label: string }[] = [
  { key: "waiting", label: "대기 중인 방" },
  { key: "inProgress", label: "진행 중인 방" },
  { key: "ended", label: "종료된 방" },
];

const Divider = () => (
  <div className="relative h-[0.1px] bg-[#ffffff] overflow-visible after:content-[''] after:absolute after:left-0 after:right-0 after:top-0 after:h-[3px] after:bg-gradient-to-b after:from-black/[0.2] after:to-transparent" />
);

// ── 친구 초대 모달 ──
function InviteModal({
  roomId,
  onClose,
}: {
  roomId: number;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [friends, setFriends] = useState<FriendInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchFriends = (q: string) => {
    setLoading(true);
    getFriendsForInvite(roomId, q)
      .then((res) => {
        if (res.data.success) setFriends(res.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFriends("");
  }, [roomId]);

  const handleSearch = () => {
    setQuery(search);
    fetchFriends(search);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleInvite = (userId: number) => {
    inviteFriend(roomId, userId)
      .then(() => fetchFriends(query))
      .catch(console.error);
  };

  const statusButton = (friend: FriendInvite) => {
    switch (friend.inviteStatus) {
      case "none":
        return (
          <button
            onClick={() => handleInvite(friend.userId)}
            className="h-8 px-3 rounded-lg bg-[#291A00] text-white text-xs font-medium shrink-0 mr-2"
          >
            초대
          </button>
        );
      case "invited":
        return (
          <span className="h-8 px-3 rounded-lg bg-[#9D968C] text-white text-xs font-medium flex items-center shrink-0 mr-2">
            초대함
          </span>
        );
      case "pending":
        return (
          <span className="h-8 px-3 rounded-lg bg-[#9D968C] text-white text-xs font-medium flex items-center shrink-0 mr-2">
            참여요청
          </span>
        );
      case "attend":
        return (
          <span className="h-8 px-3 rounded-lg bg-[#9D968C] text-white text-xs font-medium flex items-center shrink-0 mr-2">
            참여
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl mx-6 w-full max-w-[340px] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 검색창 */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2 bg-[#F5F3EF] rounded-xl px-3 py-2.5">
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="친구 검색"
              className="flex-1 bg-transparent text-sm text-[#291A00] placeholder-[#9e9890] outline-none"
            />
            <button onClick={handleSearch} className="shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="#9e9890" strokeWidth="1.8" />
                <path d="M16.5 16.5l3.5 3.5" stroke="#9e9890" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* 친구 목록 */}
        <div className="max-h-[280px] overflow-y-auto px-4 pb-4">
          {loading ? (
            <p className="text-sm text-[#9e9890] text-center py-6">불러오는 중...</p>
          ) : friends.length === 0 ? (
            <p className="text-sm text-[#9e9890] text-center py-6">친구가 없습니다.</p>
          ) : (
            friends.map((friend) => (
              <div key={friend.userId} className="flex items-center justify-between py-3 ml-3">
                <span className="text-sm text-[#291A00] font-medium truncate mr-3">
                  {friend.nickname}
                </span>
                {statusButton(friend)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyRoomsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<RoomStatus>("waiting");
  const [expandedRooms, setExpandedRooms] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [titleModal, setTitleModal] = useState<string | null>(null);
  const [inviteRoomId, setInviteRoomId] = useState<number | null>(null); // 추가

  const [invitedRooms, setInvitedRooms] = useState<InvitedRoom[]>([]);
  const [leaderRooms, setLeaderRooms] = useState<LeaderRoom[]>([]);
  const [otherRooms, setOtherRooms] = useState<OtherRoom[]>([]);
  const [ongoingLeaderRooms, setOngoingLeaderRooms] = useState<OngoingRoom[]>([]);
  const [ongoingOtherRooms, setOngoingOtherRooms] = useState<OngoingRoom[]>([]);
  const [closedLeaderRooms, setClosedLeaderRooms] = useState<OngoingRoom[]>([]);
  const [closedOtherRooms, setClosedOtherRooms] = useState<OngoingRoom[]>([]);

  const [modal, setModal] = useState<{
    open: boolean;
    type: "start" | "accept" | "acceptInvite" | "reject" | "rejectInvite" | "enter" | null;
    roomId: number | null;
    memberId?: number;
    userId?: number;
  }>({ open: false, type: null, roomId: null });

  useEffect(() => {
    if (activeTab !== "waiting") return;
    setLoading(true);
    getMyRooms("waiting")
      .then((res) => {
        if (res.data.success) {
          setInvitedRooms(res.data.data.invitedRooms);
          setLeaderRooms(res.data.data.leaderRooms);
          setOtherRooms(res.data.data.otherRooms);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "inProgress") return;
    setLoading(true);
    getOngoingRooms()
      .then((res) => {
        if (res.data.success) {
          setOngoingLeaderRooms(res.data.data.leaderRooms);
          setOngoingOtherRooms(res.data.data.otherRooms);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "ended") return;
    setLoading(true);
    getClosedRooms()
      .then((res) => {
        if (res.data.success) {
          setClosedLeaderRooms(res.data.data.leaderRooms);
          setClosedOtherRooms(res.data.data.otherRooms);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeTab]);

  const toggleRoom = (roomId: number) =>
    setExpandedRooms((prev) => ({ ...prev, [roomId]: !prev[roomId] }));

  const openModal = (
    type: "start" | "accept" | "acceptInvite" | "reject" | "rejectInvite" | "enter",
    roomId: number,
    memberId?: number,
    userId?: number
  ) => setModal({ open: true, type, roomId, memberId, userId });

  const refreshWaiting = () => {
    setLoading(true);
    getMyRooms("waiting")
      .then((res) => {
        if (res.data.success) {
          setInvitedRooms(res.data.data.invitedRooms);
          setLeaderRooms(res.data.data.leaderRooms);
          setOtherRooms(res.data.data.otherRooms);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleConfirm = () => {
    const { type, roomId, userId } = modal;
    setModal({ open: false, type: null, roomId: null });

    if (type === "start") {
      if (!roomId) return;
      startRoom(roomId)
        .then(() => navigate(`/rooms/${roomId}`))  // 시작 성공 후 이동
        .catch(console.error);

    } else if (type === "enter") {
      navigate(`/rooms/${roomId}`);

    } else if ((type === "accept" || type === "reject") && roomId && userId) {
      const action = type === "accept"
        ? acceptMember(roomId, userId)
        : rejectMember(roomId, userId);
      action.then(refreshWaiting).catch(console.error);

    } else if (type === "acceptInvite" && roomId) {
      acceptInvite(roomId).then(refreshWaiting).catch(console.error);

    } else if (type === "rejectInvite" && roomId) {
      rejectInvite(roomId).then(refreshWaiting).catch(console.error);
    }
  };

  const modalMessage = () => {
    if (modal.type === "start") return "방을 시작하시겠습니까?";
    if (modal.type === "accept") return "입장 요청을 수락하시겠습니까?";
    if (modal.type === "reject") return "입장 요청을 거절하시겠습니까?";
    if (modal.type === "enter") return "방에 입장하시겠습니까?";
    if (modal.type === "acceptInvite") return "초대를 수락하시겠습니까?";
    if (modal.type === "rejectInvite") return "초대를 거절하시겠습니까?";
    return "";
  };

  const SectionHeader = ({ label }: { label: string }) => (
    <div className="flex items-center w-full pt-2 pb-3 px-4">
      <span className="text-lg font-semibold text-[#291A00]">• {label}</span>
    </div>
  );

  const RoomCardWithButton = ({ room, onTitleClick }: { room: OngoingRoom; onTitleClick: (title: string) => void }) => (
    <div>
      <div className="pl-6 flex items-center justify-between w-full py-4 px-4">
        <button
          className="text-sm text-[#291A00] font-semibold truncate mr-2 text-left"
          onClick={() => onTitleClick(`${room.book.title} | ${room.book.publisher}`)}
        >
          {room.book.title} | {room.book.publisher}
          {room.currentMembers != null && room.atLeastPeople != null
            ? ` (${room.currentMembers}/${room.atLeastPeople})`
            : ""}
        </button>
        <button
          onClick={() => navigate(`/rooms/${room.roomId}`)}
          className="h-8 px-3 rounded-lg bg-[#291A00] text-white text-xs font-medium shrink-0"
        >
          바로가기
        </button>
      </div>
      <Divider />
    </div>
  );

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      {/* 헤더 */}
      <header className="fixed top-0 left-1/2 z-50 flex h-[80px] w-full max-w-[390px] -translate-x-1/2 items-center bg-main px-4 box-border">
        <button
          type="button"
          onClick={() => navigate("/mypage")}
          aria-label="이전으로 가기"
          className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
        >
          <img src={backButtonIcon} alt="" className="block h-[24px] w-[24px]" />
        </button>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[17px] font-semibold text-primary">
          내 방 둘러보기
        </div>
      </header>

      {/* 탭 바 */}
      <div className="flex px-4 py-2 pt-[88px]">
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

        {/* ── 대기 중인 방 ── */}
        {activeTab === "waiting" && (
          <>
            {loading ? (
              <p className="text-sm text-[#9e9890] text-center py-8">불러오는 중...</p>
            ) : (
              <>
                {/* 초대 받은 방 */}
                <section className="mb-15">
                  <SectionHeader label="초대 받은 방" />
                  {invitedRooms.length === 0 ? (
                    <p className="text-sm text-[#9e9890] text-center py-4">초대 받은 방이 없습니다.</p>
                  ) : (
                    invitedRooms.map((room) => (
                      <div key={room.roomId}>
                        <div className="pl-6 flex items-center justify-between py-3 px-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-xs text-[#291A00] w-16 shrink-0 font-semibold truncate">{room.invitedBy}</span>
                            <button
                              className="text-sm text-[#291A00] truncate font-semibold text-left"
                              onClick={() => setTitleModal(`${room.book.title} | ${room.book.publisher}`)}
                            >
                              {room.book.title} | {room.book.publisher}
                            </button>
                          </div>
                          <div className="flex gap-2 shrink-0 ml-2">
                            <button
                              onClick={() => openModal("acceptInvite", room.roomId)}
                              className="h-8 px-3 rounded-lg bg-[#291A00] text-white text-xs font-medium"
                            >
                              수락
                            </button>
                            <button
                              onClick={() => openModal("rejectInvite", room.roomId)}
                              className="h-8 px-3 rounded-lg border border-[#c8c4bc] text-[#291A00] text-xs font-medium"
                            >
                              거절
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <Divider />
                </section>

                {/* 내가 만든 방 */}
                <section className="mb-15">
                  <SectionHeader label="내가 만든 방" />
                  {leaderRooms.length === 0 ? (
                    <>
                      <p className="text-sm text-[#9e9890] text-center py-4">방이 없습니다.</p>
                      <Divider />
                    </>
                  ) : (
                    leaderRooms.map((room) => {
                      const isExpanded = !!expandedRooms[room.roomId];
                      const label = `${room.book.title} | ${room.book.publisher}${
                        room.currentMembers != null && room.atLeastPeople != null
                          ? ` (${room.currentMembers}/${room.atLeastPeople})`
                          : ""
                      }`;
                      const hasPending = !!(room.pendingMembers && room.pendingMembers.length > 0);
                      const canStart = room.currentMembers != null &&
                        room.atLeastPeople != null &&
                        room.currentMembers >= room.atLeastPeople;

                      return (
                        <div key={room.roomId}>
                          <button
                            className="pl-6 flex items-center justify-between w-full py-4 px-4"
                            onClick={() => toggleRoom(room.roomId)}
                          >
                            <span className={`text-sm text-[#291A00] font-semibold mr-2 ${isExpanded ? "" : "truncate"}`}>
                              {label}
                            </span>
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
                              {hasPending ? (
                                <div className="flex flex-col gap-2 mb-3">
                                  {room.pendingMembers!.map((m) => (
                                    <div key={m.memberId} className="flex items-center justify-between py-1 pl-6">
                                      <span className="text-sm text-[#291A00]">{m.nickname}</span>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => openModal("accept", room.roomId, m.memberId, m.userId)}
                                          className="h-8 px-3 rounded-lg bg-[#291A00] text-white text-xs font-medium"
                                        >
                                          수락
                                        </button>
                                        <button
                                          onClick={() => openModal("reject", room.roomId, m.memberId, m.userId)}
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

                              {/* ── 친구 초대하기 버튼 ── */}
                              <div className="flex justify-center mb-3">
                                <button
                                  onClick={() => setInviteRoomId(room.roomId)}
                                  className="text-xs font-medium text-[#291A00] bg-[#FFFBEF] border border-[#e5e0d8] rounded-full px-3 py-1"
                                >
                                  친구 초대하기
                                </button>
                              </div>

                              <button
                                onClick={() => openModal("start", room.roomId)}
                                className={`w-full py-3.5 rounded-xl text-sm font-medium transition-colors
                                  ${!canStart
                                    ? "bg-[#9D968C] text-white cursor-not-allowed"
                                    : "bg-[#291A00] text-white"}`}
                                disabled={!canStart}
                              >
                                교환독서 시작
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </section>

                {/* 다른 사용자가 만든 방 */}
                <section className="mb-10">
                  <SectionHeader label="다른 사용자가 만든 방" />
                  {otherRooms.length === 0 ? (
                    <>
                      <p className="text-sm text-[#9e9890] text-center py-4">방이 없습니다.</p>
                      <Divider />
                    </>
                  ) : (
                    otherRooms.map((room) => {
                      const isExpanded = !!expandedRooms[room.roomId];
                      const label = `${room.book.title} | ${room.book.publisher}`;

                      return (
                        <div key={room.roomId}>
                          <button
                            className="pl-6 flex items-center justify-between w-full py-4 px-4"
                            onClick={() => toggleRoom(room.roomId)}
                          >
                            <span className={`text-sm text-[#291A00] font-semibold mr-2 ${isExpanded ? "" : "truncate"}`}>
                              {label}
                            </span>
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
                              <div className="flex items-center justify-between py-1 pl-6">
                                <span className="text-sm text-[#291A00]">{room.myNickname}</span>
                                {room.myState === "pending" ? (
                                  <span className="h-8 px-3 rounded-lg bg-[#9D968C] text-white text-xs font-medium flex items-center">
                                    대기 중
                                  </span>
                                ) : (
                                  <span className="h-8 px-3 rounded-lg border border-[#c8c4bc] text-[#291A00] text-xs font-medium flex items-center">
                                    참가완료
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </section>
              </>
            )}
          </>
        )}

        {/* ── 진행 중인 방 ── */}
        {activeTab === "inProgress" && (
          <>
            {loading ? (
              <p className="text-sm text-[#9e9890] text-center py-8">불러오는 중...</p>
            ) : (
              <>
                <section className="mb-15">
                  <SectionHeader label="내가 만든 방" />
                  {ongoingLeaderRooms.length === 0 ? (
                    <>
                      <p className="text-sm text-[#9e9890] text-center py-4">방이 없습니다.</p>
                      <Divider />
                    </>
                  ) : (
                    ongoingLeaderRooms.map((room) => (
                      <RoomCardWithButton key={room.roomId} room={room} onTitleClick={setTitleModal} />
                    ))
                  )}
                </section>

                <section className="mb-10">
                  <SectionHeader label="다른 사용자가 만든 방" />
                  {ongoingOtherRooms.length === 0 ? (
                    <>
                      <p className="text-sm text-[#9e9890] text-center py-4">방이 없습니다.</p>
                      <Divider />
                    </>
                  ) : (
                    ongoingOtherRooms.map((room) => (
                      <RoomCardWithButton key={room.roomId} room={room} onTitleClick={setTitleModal} />
                    ))
                  )}
                </section>
              </>
            )}
          </>
        )}

        {/* ── 종료된 방 ── */}
        {activeTab === "ended" && (
          <>
            {loading ? (
              <p className="text-sm text-[#9e9890] text-center py-8">불러오는 중...</p>
            ) : (
              <>
                <section className="mb-15">
                  <SectionHeader label="내가 만든 방" />
                  {closedLeaderRooms.length === 0 ? (
                    <>
                      <p className="text-sm text-[#9e9890] text-center py-4">방이 없습니다.</p>
                      <Divider />
                    </>
                  ) : (
                    closedLeaderRooms.map((room) => (
                      <RoomCardWithButton key={room.roomId} room={room} onTitleClick={setTitleModal} />
                    ))
                  )}
                </section>

                <section className="mb-10">
                  <SectionHeader label="다른 사용자가 만든 방" />
                  {closedOtherRooms.length === 0 ? (
                    <>
                      <p className="text-sm text-[#9e9890] text-center py-4">방이 없습니다.</p>
                      <Divider />
                    </>
                  ) : (
                    closedOtherRooms.map((room) => (
                      <RoomCardWithButton key={room.roomId} room={room} onTitleClick={setTitleModal} />
                    ))
                  )}
                </section>
              </>
            )}
          </>
        )}
      </div>

      {/* 제목 전체 보기 모달 */}
      {titleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setTitleModal(null)}
        >
          <div className="bg-white rounded-2xl px-6 py-5 mx-8 shadow-xl">
            <p className="text-sm text-[#291A00] font-medium text-center leading-relaxed">{titleModal}</p>
          </div>
        </div>
      )}

      {/* ── 친구 초대 모달 ── */}
      {inviteRoomId !== null && (
        <InviteModal
          roomId={inviteRoomId}
          onClose={() => {
            setInviteRoomId(null);
            refreshWaiting();
          }}
        />
      )}

      <ConfirmModal
        open={modal.open}
        message={modalMessage()}
        onCancel={() => setModal({ open: false, type: null, roomId: null })}
        onConfirm={handleConfirm}
      />
    </div>
  );
}