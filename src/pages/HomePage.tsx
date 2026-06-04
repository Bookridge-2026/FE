import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, MoreHorizontal } from "lucide-react";
import { getJoinedRooms } from "@/api/rooms";
import type { JoinedRoom } from "@/types/room";

const quotes = [
  { text: "하루라도 책을 읽지 않으면\n입안에 가시가 돋는다", author: "안중근" },
  { text: "책은 도끼다.\n우리 안의 얼어붙은 바다를 깨는.", author: "프란츠 카프카" },
  { text: "독서는 완성된 사람을 만들고\n대화는 재치 있는 사람을 만든다.", author: "프랜시스 베이컨" },
  { text: "독서는 마음의 양식이다.", author: "키케로" },
  { text: "책 속에 길이 있다.", author: "작자 미상" },
  { text: "책 한 권 한 권이\n당신의 방에 새로운 문을 만든다.", author: "작자 미상" },
  { text: "어떤 책이든 읽어라.\n좋은 책은 지식을 주고\n나쁜 책도 경험을 준다.", author: "작자 미상" },
  { text: "독서 없는 삶은\n창문 없는 방과 같다.", author: "작자 미상" },
  { text: "책은 시간을 초월한\n가장 조용한 친구다.", author: "찰스 W. 엘리엇" },
  { text: "좋은 책을 읽는 것은\n과거의 훌륭한 사람들과 대화하는 것이다.", author: "데카르트" },

];


const HomePage = () => {
  const navigate = useNavigate();

  const [quote] = useState(
    () => quotes[Math.floor(Math.random() * quotes.length)]
  );
  const [rooms, setRooms] = useState<JoinedRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getJoinedRooms();
        setRooms(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? rooms.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === rooms.length - 1 ? 0 : prev + 1));
  };

  const room = rooms[currentIndex];

  return (
    <div className="flex flex-col flex-1 bg-[#FFFFFF] px-6 py-8 relative ">

      {/* 명언 */}
      <div className="h-28 flex flex-col items-center justify-center overflow-hidden">
        <p className="mt-2 text-center text-[#3B2E1E] text-base font-medium leading-relaxed whitespace-pre-line">
          {quote.text}
        </p>
        <p className="text-center text-[#3B2E1E] text-xs mt-2 mb-8">
          - {quote.author} -
        </p>
      </div>

      {loading ? (
        <div className="w-full bg-gray-100 rounded-2xl h-64 animate-pulse" />
      ) : rooms.length === 0 ? (
        <p className="text-center text-gray-600 mt-16">텅</p>
      ) : (
        <>

          {/* 카드 캐러셀 */}
          <div className="relative flex items-center justify-center">

            {/* 왼쪽 화살표 */}
            <button onClick={handlePrev} className="absolute -left-4 z-10 text-gray-400">
              <ChevronLeft size={24} />
            </button>

            {/* 카드 */}
            <div className="w-[87%] bg-[#FFFBEF] rounded-2xl p-4 shadow-sm cursor-pointer" 
            onClick={() => navigate(`/rooms/${room.roomId}`)}>

              <div className="flex gap-4">
                {/* 책 표지 */}
                <img
                  src={room.book.thumbnail}
                  alt={room.book.title}
                  className="w-24 h-37 object-cover rounded-lg bg-gray-200"
                />

                {/* 책 정보 */}
                <div className="flex flex-col flex-1 gap-1">
                  <p className="font-semibold text-[#3B2E1E]">{room.book.title}</p>
                  <p className="text-xs text-gray-400">
                    {room.book.author} · {room.book.publisher}
                  </p>

                  {/* 뱃지 */}
                  {room.state === "ongoing" ? (
                    <span className="mt-2 self-start px-3 py-1 border border-[#3B2E1E] rounded-full text-xs text-[#3B2E1E]">
                      D - {room.daysLeft}
                    </span>
                  ) : (
                    <span className="mt-2 self-start px-3 py-1 border border-[#3B2E1E] rounded-full text-xs text-[#3B2E1E]">
                      {room.period}일간 진행 예정
                    </span>
                  )}

                  {/* 진행률 */}
                  <p className="mt-7 text-xs text-gray-400">{room.progressRate}%</p>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full">
                    <div
                      className="h-1.5 bg-[#3B2E1E] rounded-full"
                      style={{ width: `${room.progressRate}%` }}
                    />
                  </div>

                  {/* 멤버 수 */}
                  <p className="text-xs text-gray-400 text-right">
                    {room.memberProfiles.length}/{room.minMembers}
                  </p>
                </div>
              </div>

              {/* 하단 프로필 + 화살표 */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1">
                  {room.memberProfiles.slice(0, 3).map((member, i) => (
                    <img
                      key={i}
                      src={member.profileImage}
                      alt="프로필"
                      className="w-7 h-7 rounded-full object-cover bg-gray-200"
                    />
                  ))}
                  <button className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                    <MoreHorizontal size={14} className="text-gray-500" />
                  </button>
                </div>
                <button className="text-gray-400">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* 오른쪽 화살표 */}
            <button onClick={handleNext} className="absolute -right-4 z-10 text-gray-400">
              <ChevronRight size={24} />
            </button>
          </div>

          {/* 점 인디케이터 */}
          <div className="flex justify-center gap-2 mt-4">
            {rooms.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i === currentIndex ? "bg-[#3B2E1E]" : "bg-gray-300"
                  }`}
              />
            ))}
          </div>

          {/* + 버튼 */}
          <button className="fixed bottom-24 right-6 w-12 h-12 bg-[#3B2E1E] rounded-full flex items-center justify-center shadow-lg">
            <Plus size={24} color="white" />
          </button>
        </>
      )}
    </div>
  );
};

export default HomePage;