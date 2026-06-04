import { useNavigate } from 'react-router-dom';
import backButtonIcon from "@/assets/common/back-button.svg";

const books = [
  { title: '배민다움', publisher: '북스톤', date: '2024.03.01' },
  { title: '젊은 베르테르의 슬픔', publisher: '문학 동네', date: '2024.05.12' },
  { title: '코스모스', publisher: '사이언스북스', date: '2024.06.20' },
];

const MyBooksPage = () => {
  const completionCount = 2;
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-[calc(100dvh-var(--bottom-bar-height))] bg-[#FFFFFF]">
        <header className="fixed top-0 left-1/2 z-50 flex h-[80px] w-full max-w-[390px] -translate-x-1/2 items-center bg-main px-4 box-border">
            <button
                type="button"
                onClick={() => navigate("/mypage")}
                aria-label="이전으로 가기"
                className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
            >
                <img
                src={backButtonIcon}
                alt=""
                className="block h-[24px] w-[24px]"
                />
            </button>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[17px] font-semibold text-black">
                내 책 모아보기
            </div>
        </header>

      {/* 완주 횟수 */}
      <div className="flex flex-col items-center mt-[144px] gap-8">
        <p className="text-center text-[#3B2E1E] text-base leading-relaxed">
          지금까지 교환독서를<br />
          총 [ {completionCount} ]번 완주했어요!
        </p>

        {/* 점 세개
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[#3B2E1E]" />
          <div className="w-2 h-2 rounded-full bg-[#3B2E1E]" />
          <div className="w-2 h-2 rounded-full bg-[#3B2E1E]" />
        </div> */}
      </div>

      {/* 책 카드 목록 */}
      <div className="flex flex-col-reverse px-6 mb-8 mt-auto">
        {books.map((book, index) => (
          <div
            key={index}
            style={{ zIndex: index }}
    className="bg-[#FFFBEF] rounded-xl px-5 py-4 shadow-sm text-[#3B2E1E] text-sm relative"
          >
            <span>{book.title} | {book.publisher}</span>
            <span className="ml-2 text-gray-400 text-xs">{book.date}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default MyBooksPage;
