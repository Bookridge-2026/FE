import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, searchBooks, type BookSummary } from "@/api/rooms";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { BottomButton } from "@/components/common/BottomButton";
import backButtonIcon from "@/assets/common/back-button.svg";
import { createSongRecommendations } from "@/api/song";

// 셀렉트박스
function SelectField({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-14 bg-field rounded-2xl px-4 pr-10 text-[15px] text-primary appearance-none outline-none"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
        <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
          <path
            d="M1 1L7 7L13 1"
            stroke="#291A00"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}

// 옵션
const peopleOptions = Array.from({ length: 9 }, (_, i) => ({
  label: `${i + 2}명`,
  value: String(i + 2),
}));

const periodOptions = [1, 3, 5, 7, 10, 14, 21, 30, 45, 60, 90].map((d) => ({
  label: `${d}일`,
  value: String(d),
}));

const pokeOptions = [
  { label: "찌르기는 방장만 가능 / 강퇴 버튼 활성화", value: "0" },
  ...Array.from({ length: 6 }, (_, i) => ({
    label: `${(i + 1) * 5}회`,
    value: String((i + 1) * 5),
  })),
];

// 인라인 책 검색 결과 아이템
function BookItem({
  book,
  onSelect,
}: {
  book: BookSummary;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full flex items-center gap-3 py-3 border-b border-[#EEEAE6] last:border-0 text-left active:bg-field/50 transition-colors"
    >
      <img
        src={book.thumbnail || ""}
        alt={book.title}
        className="w-[50px] h-[68px] object-cover rounded-md shrink-0 bg-field"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
        }}
      />
      <div className="flex flex-col gap-[3px] flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-primary line-clamp-1">
          {book.title}
        </p>
        <p className="text-[13px] text-sub-black">
          {book.author} · {book.publisher}
        </p>
        {book.translator && (
          <p className="text-[12px] text-sub-black">번역: {book.translator}</p>
        )}
      </div>
    </button>
  );
}

// 방 생성 페이지
const RoomCreatePage = () => {
  const navigate = useNavigate();

  // 책 검색 상태
  const bookInputRef = useRef<HTMLInputElement>(null);
  const [bookKeyword, setBookKeyword] = useState("");
  const [bookResults, setBookResults] = useState<BookSummary[]>([]);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookSearched, setBookSearched] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookSummary | null>(null);

  // 폼 상태
  const [totalPage, setTotalPage] = useState("");
  const [atLeastPeople, setAtLeastPeople] = useState("");
  const [period, setPeriod] = useState("");
  const [poke, setPoke] = useState("");
  const [detail, setDetail] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isReady = !!selectedBook && !!atLeastPeople && !!period && !!poke;

  // 전체 페이지 수 — 숫자만 입력되도록
  const handleTotalPageChange = (v: string) => {
    const onlyNum = v.replace(/[^0-9]/g, "");
    setTotalPage(onlyNum);
  };

  // 책 검색 실행
  const handleBookSearch = async () => {
    if (!bookKeyword.trim()) return;
    setBookLoading(true);
    setBookSearched(true);
    try {
      const res = await searchBooks(bookKeyword, 1, 10);
      setBookResults(res.books);
    } catch (e) {
      console.error(e);
      setBookResults([]);
    } finally {
      setBookLoading(false);
    }
  };

  // 책 선택
  const handleSelectBook = (book: BookSummary) => {
    setSelectedBook(book);
    setBookResults([]);
    setBookKeyword(book.title);
    setBookSearched(false);
    setTotalPage(""); // 책 바꾸면 페이지수 초기화
  };
 
  // 방 생성 -> 노래 추천
  const handleConfirm = async () => {
  if (!selectedBook) return;

  setConfirmOpen(false);
  setSubmitting(true);

  try {
    const room = await createRoom({
      isbn: selectedBook.isbn,
      period: Number(period),
      atLeastPeople: Number(atLeastPeople),
      poke: poke ? Number(poke) : 3,
      detail: detail || undefined,
      totalPage: totalPage ? Number(totalPage) : undefined,
    });

    createSongRecommendations(room.roomId).catch((error) => {
      console.error("노래 추천 생성 실패:", error);
    });

    navigate("/rooms/search");
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : "방 생성에 실패했습니다.");
  } finally {
    setSubmitting(false);
  }
  };

  const showDropdown = bookSearched && bookResults.length > 0 && !selectedBook;

  return (
    <div>
      <header className="fixed top-0 left-1/2 z-50 flex h-[80px] w-full max-w-[390px] -translate-x-1/2 items-center bg-main px-4 box-border">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="이전으로 가기"
          className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
        >
          <img
            src={backButtonIcon}
            alt=""
            className="block h-[24px] w-[24px]"
          />
        </button>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[17px] font-semibold text-primary">
          방 생성
        </div>
      </header>

      <div className="px-4 py-4 flex flex-col pt-[96px]">
        {/* 책 선택 */}
        <div className="flex flex-col gap-2 mb-5">
          <p className="text-[13px] font-medium text-primary">· 책 선택</p>
          <div className="relative">
            <div className="flex items-center gap-2 bg-field rounded-2xl px-4 h-14">
              <input
                ref={bookInputRef}
                type="text"
                value={bookKeyword}
                onChange={(e) => {
                  setBookKeyword(e.target.value);
                  if (selectedBook) {
                    setSelectedBook(null);
                    setBookSearched(false);
                    setBookResults([]);
                    setTotalPage("");
                  }
                }}
                onKeyDown={(e) => e.key === "Enter" && handleBookSearch()}
                placeholder="제목 / ISBN 코드"
                className="flex-1 bg-transparent outline-none text-[15px] text-primary placeholder:text-sub-black"
              />
              <button
                type="button"
                onClick={handleBookSearch}
                className="p-1 -mr-1"
              >
                {bookLoading ? (
                  <div className="w-5 h-5 border-2 border-sub-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle
                      cx="9"
                      cy="9"
                      r="6"
                      stroke="#291A00"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M14 14L18 18"
                      stroke="#291A00"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* 드롭다운 */}
            {showDropdown && (
              <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white rounded-2xl shadow-lg border border-[#EEEAE6] px-3 py-1 z-20 max-h-[280px] overflow-y-auto">
                {bookResults.map((book) => (
                  <BookItem
                    key={book.isbn}
                    book={book}
                    onSelect={() => handleSelectBook(book)}
                  />
                ))}
              </div>
            )}

            {/* 검색 결과 없음 */}
            {bookSearched && !bookLoading && bookResults.length === 0 && (
              <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white rounded-2xl shadow-lg border border-[#EEEAE6] px-4 py-4 z-20">
                <p className="text-sm text-sub-black text-center">
                  검색 결과가 없어요.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 전체 페이지 수 */}
        <div className="flex flex-col gap-2 mb-5">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-medium text-primary">
              · 전체 페이지 수
            </p>
          </div>
          <div className="flex items-center bg-field rounded-2xl px-4 h-14 gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={totalPage}
              onChange={(e) => handleTotalPageChange(e.target.value)}
              placeholder="예) 328"
              maxLength={5}
              className="flex-1 bg-transparent outline-none text-[15px] text-primary placeholder:text-sub-black"
            />
            {totalPage && (
              <span className="text-[14px] text-sub-black shrink-0">쪽</span>
            )}
          </div>
        </div>

        {/* 최소 인원 */}
        <div className="flex flex-col gap-2 mb-5">
          <p className="text-[13px] font-medium text-primary">
            · 최소 인원 (최대 인원은 10명으로 제한)
          </p>
          <SelectField
            value={atLeastPeople}
            options={peopleOptions}
            placeholder="최소 인원 수를 설정해주세요"
            onChange={setAtLeastPeople}
          />
        </div>

        {/* 기간 */}
        <div className="flex flex-col gap-2 mb-5">
          <p className="text-[13px] font-medium text-primary">
            · 기간 (1일 - 90일 선택)
          </p>
          <SelectField
            value={period}
            options={periodOptions}
            placeholder="기간을 선택해주세요"
            onChange={setPeriod}
          />
        </div>

        {/* 찌르기 횟수 */}
        <div className="flex flex-col gap-2 mb-5">
          <p className="text-[13px] font-medium text-primary">· 찌르기 횟수</p>
          <SelectField
            value={poke}
            options={pokeOptions}
            placeholder="찌르기는 방장만 가능 / 강퇴 버튼 활성화"
            onChange={setPoke}
          />
        </div>

        {/* 상세 설명 */}
        <div className="flex flex-col gap-2 mb-8">
          <p className="text-[13px] font-medium text-primary">· 상세 설명</p>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="우리 방을 한 문장으로 설명해주세요"
            maxLength={100}
            rows={3}
            className="w-full bg-field rounded-2xl px-4 py-4 text-[15px] text-primary placeholder:text-sub-black outline-none resize-none"
          />
        </div>

        {/* 방 생성 버튼 */}
        <div className="flex justify-center mt-auto">
          <BottomButton
            onClick={() => isReady && setConfirmOpen(true)}
            disabled={!isReady || submitting}
          >
            {submitting ? "생성 중…" : "방 생성"}
          </BottomButton>
        </div>

        {/* 확인 모달 */}
        <ConfirmModal
          open={confirmOpen}
          message="이 방을 생성하시겠습니까?"
          cancelText="취소"
          confirmText="확인"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  );
};

export default RoomCreatePage;
