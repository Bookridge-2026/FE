import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../styles/RoomDetailPage.module.css";


interface User {
  id: number;
  name: string;
  color: string;
}

interface PageReaction {
  id: number;
  user: User;
  emoji: string;
}

interface Reply {
  id: number;
  author: User;
  text: string;
}

interface Comment {
  id: number;
  page: number;
  quote: string;
  author: User;
  text?: string;
  replies: Reply[];
}

interface PageData {
  page: number;
  reactions: PageReaction[];
  comments: Comment[];
}

interface RoomDetail {
  id: number;
  bookTitle: string;
  publisher: string;
  totalPages: number;
  readers: { user: User; page: number }[];
  pages: PageData[];
}

type Tab = "일반" | "OCR";
type ModalStep = "main" | "comment" | "emoji";


const EMOJI_OPTIONS = ["😮", "😨", "😢", "😠", "❤️"];

// ─── 목 데이터 ─────────────────────────────────────────────────────────────────

const MOCK_ROOM: RoomDetail = {
  id: 1,
  bookTitle: "죽은 시인의 사회",
  publisher: "서교출판사",
  totalPages: 310,
  readers: [
    { user: { id: 1, name: "나", color: "#F9A8B8" }, page: 55 },
    { user: { id: 2, name: "유저2", color: "#7EC8D8" }, page: 100 },
    { user: { id: 3, name: "유저3", color: "#C4A7E0" }, page: 100 },
    { user: { id: 4, name: "유저4", color: "#A8D95E" }, page: 200 },
  ],
  pages: [
    {
      page: 55,
      reactions: [
        { id: 1, user: { id: 1, name: "나", color: "#F9A8B8" }, emoji: "😮" },
        { id: 2, user: { id: 2, name: "유저2", color: "#7EC8D8" }, emoji: "😨" },
      ],
      comments: [
        {
          id: 10,
          page: 55,
          quote: "두려움은 적이 아니라 교사다",
          author: { id: 1, name: "나", color: "#F9A8B8" },
          text: "이 말이 계속 머릿속에 맴돌아",
          replies: [],
        },
      ],
    },
    {
      page: 159,
      reactions: [
        { id: 3, user: { id: 4, name: "유저4", color: "#A8D95E" }, emoji: "😮" },
        { id: 4, user: { id: 2, name: "유저2", color: "#7EC8D8" }, emoji: "😮" },
        { id: 5, user: { id: 1, name: "나", color: "#F9A8B8" }, emoji: "😨" },
        { id: 6, user: { id: 3, name: "유저3", color: "#C4A7E0" }, emoji: "❤️" },
      ],
      comments: [
        {
          id: 1,
          page: 159,
          quote: "오 캡틴 마이 캡틴",
          author: { id: 4, name: "유저4", color: "#A8D95E" },
          text: "이게 비극적 결말을 예고하는 복선이 될줄이야...",
          replies: [
            { id: 1, author: { id: 2, name: "유저2", color: "#7EC8D8" }, text: "아니 뭐임;; 스포 ㄴㄴ" },
          ],
        },
      ],
    },
    {
      page: 200,
      reactions: [
        { id: 7, user: { id: 2, name: "유저2", color: "#7EC8D8" }, emoji: "❤️" },
      ],
      comments: [
        {
          id: 2,
          page: 200,
          quote: "현재를 붙잡아라, 오늘을 살아라,\n너의 삶을 특별하게 만들어라.",
          author: { id: 1, name: "나", color: "#F9A8B8" },
          replies: [],
        },
      ],
    },
  ],
};



const ReadingProgress = ({
  readers,
  totalPages,
}: {
  readers: RoomDetail["readers"];
  totalPages: number;
}) => {
  const [openUserId, setOpenUserId] = useState<number | null>(null);

  const groups = useMemo(() => {
    const map = new Map<number, RoomDetail["readers"]>();
    readers.forEach((r) => {
      if (!map.has(r.page)) map.set(r.page, []);
      map.get(r.page)!.push(r);
    });
    return map;
  }, [readers]);

  return (
    <div
      className={styles.progressWrapper}
      
      onClick={() => setOpenUserId(null)}
    >
      {/* 진행 바 */}
      <div className={styles.progressBar}>
        {readers.map((r) => (
          <div
            key={r.user.id}
            className={styles.progressTick}
            style={{ left: `${(r.page / totalPages) * 100}%`, backgroundColor: r.user.color }}
          />
        ))}
      </div>

      {/* 아바타 영역 */}
      <div className={styles.avatarArea} style={{ height: 48 }}>
        {Array.from(groups.entries()).map(([page, group]) =>
          group.map((r, idx) => {
            const isOpen = openUserId === r.user.id;
            const leftPct = `calc(${(page / totalPages) * 100}% - 16px + ${idx * 10}px)`;
            return (
              <div
                key={r.user.id}
                style={{ position: "absolute", top: 0, left: leftPct }}
              >
                <button
                  className={styles.avatarDot}
                  style={{ backgroundColor: r.user.color, position: "relative" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenUserId(isOpen ? null : r.user.id);
                  }}
                />
                {/* 팝업: 이름 + 현재 쪽수 */}
                {isOpen && (
                  <div className={styles.avatarPopup}>
                    <span className={styles.avatarPopupName}>{r.user.name}</span>
                    <span className={styles.avatarPopupPage}>{r.page}p</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const TabBar = ({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) => (
  <div className={styles.tabBar}>
    {(["일반", "OCR"] as Tab[]).map((tab) => (
      <button
        key={tab}
        onClick={() => onChange(tab)}
        className={`${styles.tab} ${active === tab ? styles.tabActive : ""}`}
      >
        {tab} 코멘트
      </button>
    ))}
  </div>
);

const PagePicker = ({
  selectedPage,
  pages,
  open,
  onToggle,
  onSelect,
}: {
  selectedPage: number;
  pages: number[];
  open: boolean;
  onToggle: () => void;
  onSelect: (p: number) => void;
}) => (
  <div className={styles.pagePickerWrapper} onClick={(e) => e.stopPropagation()}>
    <button onClick={onToggle} className={styles.pagePickerTrigger}>
      {selectedPage}p
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        className={`${styles.pagePickerChevron} ${open ? styles.pagePickerChevronOpen : ""}`}
      >
        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
    {open && (
      <div className={styles.pagePickerDropdown}>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => { onSelect(p); onToggle(); }}
            className={`${styles.pagePickerItem} ${selectedPage === p ? styles.pagePickerItemActive : ""}`}
          >
            {p}p
          </button>
        ))}
      </div>
    )}
  </div>
);

const PageEmojiRow = ({
  reactions,
  openPopupId,
  setOpenPopupId,
}: {
  reactions: PageReaction[];
  openPopupId: number | null;
  setOpenPopupId: (id: number | null) => void;
}) => {
  const [showAll, setShowAll] = useState(false);
  const needsOverflow = reactions.length > 3;
  const visible = needsOverflow && !showAll ? reactions.slice(-2) : reactions;

  if (reactions.length === 0) return null;

  return (
    <div className={styles.emojiRow} onClick={(e) => e.stopPropagation()}>
      {visible.map((r) => {
        const isOpen = openPopupId === r.id;
        return (
          <div key={r.id} style={{ position: "relative" }}>
            <button
              onClick={() => setOpenPopupId(isOpen ? null : r.id)}
              className={styles.emojiChip}
            >
              {r.emoji}
            </button>
            {isOpen && (
              <div className={styles.emojiPopup}>
                <div className={styles.emojiPopupRow}>
                  <span className={styles.emojiPopupDot} style={{ backgroundColor: r.user.color }} />
                  <span className={styles.emojiPopupName}>{r.user.name}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {needsOverflow && (
        <button onClick={() => setShowAll((v) => !v)} className={styles.emojiOverflowBtn}>
          <svg width="14" height="4" viewBox="0 0 14 4" fill="none">
            <circle cx="1.5" cy="2" r="1.5" fill="white" />
            <circle cx="7" cy="2" r="1.5" fill="white" />
            <circle cx="12.5" cy="2" r="1.5" fill="white" />
          </svg>
        </button>
      )}
    </div>
  );
};

const ReplyItem = ({ reply }: { reply: Reply }) => (
  <div className={styles.replyItem}>
    <span className={styles.replyPrefix}>ㄴ</span>
    <span className={styles.replyDot} style={{ backgroundColor: reply.author.color }} />
    <p className={styles.replyText}>{reply.text}</p>
  </div>
);

const CommentCard = ({ comment }: { comment: Comment }) => {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const hasReplies = comment.replies.length > 0;

  return (
    <div className={styles.card}>
      <div className={styles.quoteBlock}>
        <span className={styles.quoteOpen}>"</span>
        <p className={styles.quoteText}>{comment.quote}</p>
        <span className={styles.quoteClose}>"</span>
      </div>

      {comment.text && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className={styles.commentRow}>
            <span className={styles.commentDot} style={{ backgroundColor: comment.author.color }} />
            <span className={styles.commentText}>{comment.text}</span>
            {hasReplies && (
              <button
                onClick={() => setRepliesOpen((v) => !v)}
                className={`${styles.chevronBtn} ${repliesOpen ? styles.chevronBtnOpen : ""}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9L12 15L18 9" stroke="#9E9890" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
          {repliesOpen && (
            <div className={styles.repliesList}>
              {comment.replies.map((r) => <ReplyItem key={r.id} reply={r} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


const ModalOverlay = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => (
  <div className={styles.overlay} onClick={onClose}>
    <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

const MainModal = ({
  onClose,
  onSelectComment,
  onSelectEmoji,
  totalPages,
}: {
  onClose: () => void;
  onSelectComment: (page: number) => void;
  onSelectEmoji: (page: number) => void;
  totalPages: number;
}) => {
  const [pageInput, setPageInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const pageNum = parseInt(pageInput, 10);
  const isValid = !isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages;

  return (
    <ModalOverlay onClose={onClose}>
      <div className={styles.mainInputRow}>
        <div className={styles.mainInputBox}>
          <input
            ref={inputRef}
            type="number"
            min={1}
            max={totalPages}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            placeholder="쪽수"
            className={styles.mainInput}
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: "#9E9890" }}>
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className={styles.mainLabel}>에 어떤 반응을 남길까요?</span>
      </div>

      <div className={styles.modalBtnRow}>
        <button disabled={!isValid} className={`${styles.actionBtn} ${!isValid ? styles.actionBtnDisabled : ""}`}>
          OCR
        </button>
        <button
          disabled={!isValid}
          onClick={() => isValid && onSelectComment(pageNum)}
          className={`${styles.actionBtn} ${!isValid ? styles.actionBtnDisabled : ""}`}
        >
          코멘트
        </button>
        <button
          disabled={!isValid}
          onClick={() => isValid && onSelectEmoji(pageNum)}
          className={`${styles.actionBtn} ${!isValid ? styles.actionBtnDisabled : ""}`}
        >
          이모지
        </button>
      </div>
    </ModalOverlay>
  );
};

const CommentModal = ({
  page,
  onClose,
  onConfirm,
}: {
  page: number;
  onClose: () => void;
  onConfirm: (quote: string, comment: string) => void;
}) => {
  const [quote, setQuote] = useState("");
  const [comment, setComment] = useState("");
  const canConfirm = comment.trim().length > 0;

  return (
    <ModalOverlay onClose={onClose}>
      <p className={styles.modalPageLabel}>{page}p</p>
      <textarea
        value={quote}
        onChange={(e) => setQuote(e.target.value)}
        placeholder="책 구절을 입력해주세요 (선택)"
        rows={2}
        className={`${styles.textarea} ${styles.textareaQuote}`}
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="자유롭게 코멘트를 작성해주세요"
        rows={3}
        className={`${styles.textarea} ${styles.textareaComment}`}
      />
      <div className={styles.modalBtnRow}>
        <button onClick={onClose} className={styles.cancelBtn}>취소</button>
        <button
          onClick={() => canConfirm && onConfirm(quote, comment)}
          disabled={!canConfirm}
          className={`${styles.confirmBtn} ${!canConfirm ? styles.confirmBtnDisabled : ""}`}
        >
          확인
        </button>
      </div>
    </ModalOverlay>
  );
};

const EmojiSelectModal = ({
  page,
  onClose,
  onConfirm,
}: {
  page: number;
  onClose: () => void;
  onConfirm: (emoji: string) => void;
}) => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <ModalOverlay onClose={onClose}>
      <p className={styles.modalPageLabel}>{page}p</p>
      <div className={styles.emojiSelectRow}>
        {EMOJI_OPTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => setSelected(emoji)}
            className={`${styles.emojiSelectBtn} ${selected === emoji ? styles.emojiSelectBtnActive : ""}`}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className={styles.modalBtnRow}>
        <button onClick={onClose} className={styles.cancelBtn}>취소</button>
        <button
          onClick={() => selected && onConfirm(selected)}
          disabled={!selected}
          className={`${styles.confirmBtn} ${!selected ? styles.confirmBtnDisabled : ""}`}
        >
          확인
        </button>
      </div>
    </ModalOverlay>
  );
};


const RoomDetailPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();

  // TODO: useQuery로 API 연결
  const room = MOCK_ROOM;

  const sortedPages = useMemo(
    () => [...room.pages].sort((a, b) => a.page - b.page),
    [room.pages]
  );

  const [activeTab, setActiveTab] = useState<Tab>("일반");
  const [selectedPage, setSelectedPage] = useState<number>(sortedPages[0]?.page ?? 0);
  const [pagePickerOpen, setPagePickerOpen] = useState(false);
  const [openPopupId, setOpenPopupId] = useState<number | null>(null);
  const [manageActive, setManageActive] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep | null>(null);
  const [modalPage, setModalPage] = useState<number | null>(null);

  const currentPageData = sortedPages.find((p) => p.page === selectedPage);

  const handleCloseAll = () => setModalStep(null);
  const handleSelectComment = (page: number) => { setModalPage(page); setModalStep("comment"); };
  const handleSelectEmoji = (page: number) => { setModalPage(page); setModalStep("emoji"); };

  const handleCommentConfirm = (quote: string, comment: string) => {
    // TODO: POST /rooms/:roomId/comments { page: modalPage, quote, comment }
    console.log("코멘트 저장:", { page: modalPage, quote, comment });
    setModalStep(null);
  };

  const handleEmojiConfirm = (emoji: string) => {
    // TODO: POST /rooms/:roomId/reactions { page: modalPage, emoji }
    console.log("이모지 저장:", { page: modalPage, emoji });
    setModalStep(null);
  };

  return (
    <div
      className={styles.root}
      onClick={() => { setOpenPopupId(null); setPagePickerOpen(false); }}
    >
      {/* 헤더 */}
      
      <div className={styles.header} onClick={(e) => e.stopPropagation()}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className={styles.headerTitle}>{room.bookTitle} | {room.publisher}</h1>
        <button
          className={`${styles.manageBtn} ${manageActive ? styles.manageBtnActive : ""}`}
          onPointerDown={() => setManageActive(true)}
          onPointerUp={() => { setManageActive(false); navigate(`/rooms/${roomId}/manage`); }}
          onPointerLeave={() => setManageActive(false)}
        >
          관리
        </button>
      </div>

      {/* 독서 진행도 */}
      <ReadingProgress readers={room.readers} totalPages={room.totalPages} />

      {/* 탭 */}
      <TabBar active={activeTab} onChange={setActiveTab} />

      {/* 필터 행 */}
      <div className={styles.filterRow} onClick={(e) => e.stopPropagation()}>
        <PagePicker
          selectedPage={selectedPage}
          pages={sortedPages.map((p) => p.page)}
          open={pagePickerOpen}
          onToggle={() => setPagePickerOpen((v) => !v)}
          onSelect={setSelectedPage}
        />
        {currentPageData && (
          <PageEmojiRow
            reactions={currentPageData.reactions}
            openPopupId={openPopupId}
            setOpenPopupId={setOpenPopupId}
          />
        )}
      </div>

      {/* 코멘트 목록 */}
      <div className={styles.commentList}>
        {!currentPageData?.comments.length ? (
          <p className={styles.emptyText}>이 페이지에 코멘트가 없어요</p>
        ) : (
          currentPageData.comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        )}
      </div>

      {/* FAB */}
      <div className={styles.fabWrapper} onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setModalStep("main")} className={styles.fabBtn}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div style={{ marginTop: "auto" }} />

      {/* 모달 */}
      {modalStep === "main" && (
        <MainModal
          onClose={handleCloseAll}
          onSelectComment={handleSelectComment}
          onSelectEmoji={handleSelectEmoji}
          totalPages={room.totalPages}
        />
      )}
      {modalStep === "comment" && modalPage !== null && (
        <CommentModal page={modalPage} onClose={handleCloseAll} onConfirm={handleCommentConfirm} />
      )}
      {modalStep === "emoji" && modalPage !== null && (
        <EmojiSelectModal page={modalPage} onClose={handleCloseAll} onConfirm={handleEmojiConfirm} />
      )}
    </div>
  );
};

export default RoomDetailPage;