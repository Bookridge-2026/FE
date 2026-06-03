import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms, joinRoom, type RoomSummary } from "@/api/rooms";
import plusIcon from "@/assets/common/plus-icon.svg";

// 페이지네이션
function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (p: number) => void;
}) {
  if (total <= 1) return null;
  const start = Math.max(1, current - 2);
  const end = Math.min(total, start + 4);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1 mt-8 mb-4">
      <button
        type="button"
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="w-8 h-8 flex items-center justify-center text-sub-black disabled:opacity-30 text-base"
      >
        {"<"}
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${p === current ? "bg-black text-white" : "text-black"}`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="w-8 h-8 flex items-center justify-center text-sub-black disabled:opacity-30 text-base"
      >
        {">"}
      </button>
    </div>
  );
}

// 방 카드
function RoomCard({
  room,
  onClick,
}: {
  room: RoomSummary;
  onClick: () => void;
}) {
  const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max) + "..." : text;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-4 py-4 border-b border-[#EEEAE6] text-left active:bg-field/50 transition-colors"
    >
      <img
        src={room.book.thumbnail || ""}
        alt={room.book.title}
        className="w-[80px] h-[110px] object-cover rounded-lg shrink-0 bg-field"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
        }}
      />
      <div className="flex flex-col gap-[6px] flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-black leading-snug">
          {room.book.title}
        </p>
        <p className="text-sm text-sub-black">
          {room.book.author} · {room.book.publisher}
        </p>
        {room.detail && (
          <p className="text-sm text-sub-black">{truncate(room.detail, 18)}</p>
        )}
        <span className="mt-[2px] self-start px-3 py-[5px] rounded-full border border-[#D4CFC9] text-sm text-black leading-none">
          {room.currentMembers} / {room.atLeastPeople}
        </span>
      </div>
    </button>
  );
}

// 방 검색 페이지
const RoomSearchPage = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [meta, setMeta] = useState({
    totalPages: 1,
    currentPage: 1,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const [selectedRoom, setSelectedRoom] = useState<RoomSummary | null>(null);
  const [joining, setJoining] = useState(false);

  const fetchRooms = async (kw: string, page: number) => {
    setLoading(true);

    try {
      const res = await getRooms({
        keyword: kw || undefined,
        page,
        size: 10,
      });

      setRooms(res.rooms);
      setMeta(res.meta);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialRooms = async () => {
      setLoading(true);

      try {
        const res = await getRooms({
          page: 1,
          size: 10,
        });

        setRooms(res.rooms);
        setMeta(res.meta);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadInitialRooms();
  }, []);

  const handleSearch = () => {
    setSubmittedKeyword(keyword);
    fetchRooms(keyword, 1);
  };

  const handleJoinConfirm = async () => {
    if (!selectedRoom) return;
    setJoining(true);
    try {
      await joinRoom(selectedRoom.roomId);
      setSelectedRoom(null);
      navigate(`/rooms/${selectedRoom.roomId}`);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "참여에 실패했습니다.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="relative">
      <div className="px-4 py-2">
        {/* 검색바 */}
        <div className="flex items-center gap-2 bg-field rounded-2xl px-4 h-12 mb-5">
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="책 제목을 검색해보세요"
            className="flex-1 bg-transparent outline-none text-[15px] text-black placeholder:text-sub-black"
          />
          <button type="button" onClick={handleSearch} className="p-1 -mr-1">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="#291A00" strokeWidth="1.8" />
              <path
                d="M14 14L18 18"
                stroke="#291A00"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* 목록 */}
        {loading ? (
          <div className="flex flex-col">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex gap-4 py-4 border-b border-[#EEEAE6]"
              >
                <div className="w-[80px] h-[110px] rounded-lg bg-field animate-pulse shrink-0" />
                <div className="flex-1 flex flex-col gap-2 pt-1">
                  <div className="h-4 bg-field rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-field rounded animate-pulse w-1/2" />
                  <div className="h-3 bg-field rounded animate-pulse w-3/4 mt-1" />
                  <div className="h-7 bg-field rounded-full animate-pulse w-14 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <p className="text-center text-sub-black text-sm mt-16">
            검색 결과가 없어요.
          </p>
        ) : (
          <>
            {rooms.map((room) => (
              <RoomCard
                key={room.roomId}
                room={room}
                onClick={() => setSelectedRoom(room)}
              />
            ))}
            <Pagination
              current={meta.currentPage}
              total={meta.totalPages}
              onChange={(p) => {
                setSubmittedKeyword(submittedKeyword);
                fetchRooms(submittedKeyword, p);
              }}
            />
          </>
        )}

        {/* FAB */}
        <button
          type="button"
          onClick={() => navigate("/rooms/create")}
          className="fixed bottom-[calc(var(--bottom-bar-height)+16px)] right-4 z-40"
        >
          <img src={plusIcon} alt="방 생성" className="w-[70px] h-[70px]" />
        </button>

        {/* 참여 확인 모달 */}
        {selectedRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[300px] rounded-2xl bg-white px-7 py-8 shadow-xl">
              <p className="text-center text-[15px] font-semibold text-black mb-6">
                이 방에 참여하시겠습니까?
              </p>
              <ul className="flex flex-col gap-[10px] text-sm text-black mb-7">
                <li className="flex gap-2">
                  <span className="text-sub-black shrink-0">· 현재 / 최소</span>
                  <span className="ml-2">
                    | {selectedRoom.currentMembers} /{" "}
                    {selectedRoom.atLeastPeople}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-sub-black shrink-0">· 독서 기간</span>
                  <span className="ml-5">| {selectedRoom.period} 일</span>
                </li>
                {selectedRoom.detail && (
                  <li className="flex gap-2">
                    <span className="text-sub-black shrink-0">· 상세 설명</span>
                    <span className="ml-4">| {selectedRoom.detail}</span>
                  </li>
                )}
              </ul>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  className="h-11 w-[105px] rounded-2xl bg-field text-[15px] font-medium text-black"
                  onClick={() => setSelectedRoom(null)}
                >
                  취소
                </button>
                <button
                  type="button"
                  disabled={joining}
                  className="h-11 w-[105px] rounded-2xl bg-black text-[15px] font-medium text-white disabled:opacity-50"
                  onClick={handleJoinConfirm}
                >
                  {joining ? "참여 중…" : "참여"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomSearchPage;
