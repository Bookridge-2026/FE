import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchBooks, type BookSummary } from "@/api/rooms";

// 도서 카드
function BookCard({
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
      className="w-full flex items-center gap-4 py-4 border-b border-[#EEEAE6] text-left"
    >
      <img
        src={
          book.thumbnail || "https://via.placeholder.com/70x95?text=No+Cover"
        }
        alt={book.title}
        className="w-[70px] h-[95px] object-cover rounded-md shrink-0 bg-field"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src =
            "https://via.placeholder.com/70x95?text=No+Cover";
        }}
      />
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <p className="text-base font-semibold text-black line-clamp-2">
          {book.title}
        </p>
        <p className="text-sm text-sub-black">
          {book.author} · {book.publisher}
        </p>
        {book.translator && (
          <p className="text-sm text-sub-black">번역: {book.translator}</p>
        )}
      </div>
    </button>
  );
}

// 도서 검색 페이지
const BookSearchPage = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [keyword, setKeyword] = useState("");
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [meta, setMeta] = useState({ isEnd: false, currentPage: 1 });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fetchBooks = useCallback(
    async (kw: string, page: number, append = false) => {
      if (!kw.trim()) return;
      setLoading(true);
      try {
        const res = await searchBooks(kw, page, 10);
        setBooks((prev) => (append ? [...prev, ...res.books] : res.books));
        setMeta({ isEnd: res.meta.isEnd, currentPage: res.meta.currentPage });
        setSearched(true);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleSearch = () => {
    setBooks([]);
    fetchBooks(keyword, 1);
  };

  const handleSelect = (book: BookSummary) => {
    // 선택한 책 정보를 state로 넘겨 방 생성 페이지로 이동
    navigate("/rooms/create", { state: { selectedBook: book } });
  };

  return (
    <div className="min-h-dvh bg-white">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 pt-safe-top pt-4 pb-4 border-b border-[#EEEAE6]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center text-black"
        >
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path
              d="M9 1L1 9L9 17"
              stroke="#291A00"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="flex-1 flex items-center gap-2 bg-field rounded-2xl px-4 h-11">
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="제목 / ISBN 코드"
            className="flex-1 bg-transparent outline-none text-base text-black placeholder:text-sub-black"
          />
          <button type="button" onClick={handleSearch}>
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
      </div>

      {/* 결과 */}
      <div className="px-4">
        {loading && books.length === 0 ? (
          <div className="flex flex-col">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex gap-4 py-4 border-b border-[#EEEAE6]"
              >
                <div className="w-[70px] h-[95px] rounded-md bg-field animate-pulse shrink-0" />
                <div className="flex-1 flex flex-col gap-2 pt-1">
                  <div className="h-4 bg-field rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-field rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : searched && books.length === 0 ? (
          <p className="text-center text-sub-black text-sm mt-16">
            검색 결과가 없어요.
          </p>
        ) : (
          <>
            {books.map((book) => (
              <BookCard
                key={book.isbn}
                book={book}
                onSelect={() => handleSelect(book)}
              />
            ))}
            {/* 더보기 */}
            {!meta.isEnd && books.length > 0 && (
              <button
                type="button"
                disabled={loading}
                onClick={() => fetchBooks(keyword, meta.currentPage + 1, true)}
                className="w-full py-4 text-sm text-sub-black text-center disabled:opacity-50"
              >
                {loading ? "로딩 중…" : "더보기"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BookSearchPage;
