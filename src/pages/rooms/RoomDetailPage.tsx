import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../styles/Roomdetailpage.module.css";
import AddReactionModal from "../../components/rooms/detail/AddReactionModal";

import plusIcon from "@/assets/common/plus-icon.svg";
import musicIcon from "@/assets/rooms/music.svg";

import {
  fetchPages, fetchComments, fetchReactions, fetchReplies, fetchProgress,
  fetchRoomDetail, fetchOcrPage,
  createComment as apiCreateComment, addReaction as apiAddReaction,
  EMOJI_TYPES,
  type User, type Reply, type Comment, type PageReaction,
  type RoomDetail, type OcrPage,
} from "../../api/roomDetail";

type Reader = { user: User; page: number };
type Tab = "일반" | "OCR";
type ModalStep = "main" | "comment" | "emoji";

interface SongRecommendation {
    songRecommendationId: number;
    title: string;
    artist: string;
    url: string;
    createdAt: string;
}

const MOCK_SONG_RECOMMENDATION: SongRecommendation = {
  songRecommendationId: 10,
  title: "노스탤지어",
  artist: "윤마치",
  url: "https://www.youtube.com/watch?v=...",
  createdAt: "2026-05-30T12:34:56.000Z",
};

const ReadingProgress = ({
  readers,
  totalPages,
}: {
  readers: Reader[];
  totalPages: number;
}) => {
  const [openUserId, setOpenUserId] = useState<number | null>(null);

  const groups = useMemo(() => {
    const map = new Map<number, Reader[]>();
    readers.forEach((r) => {
      if (!map.has(r.page)) map.set(r.page, []);
      map.get(r.page)!.push(r);
    });
    return map;
  }, [readers]);

  return (
    <div className={styles.progressWrapper} onClick={() => setOpenUserId(null)}>
      <div className={styles.progressBar}>
        {readers.map((r) => (
          <div
            key={r.user.id}
            className={styles.progressTick}
            style={{ left: `${(r.page / totalPages) * 100}%`, backgroundColor: r.user.color }}
          />
        ))}
      </div>
      <div className={styles.avatarArea} style={{ height: 48 }}>
        {Array.from(groups.entries()).map(([page, group]) =>
          group.map((r, idx) => {
            const isOpen = openUserId === r.user.id;
            const leftPct = `calc(${(page / totalPages) * 100}% - 16px + ${idx * 10}px)`;
            return (
              <div key={r.user.id} style={{ position: "absolute", top: 0, left: leftPct }}>
                <button
                  className={styles.avatarDot}
                  style={{ backgroundColor: r.user.color, position: "relative" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenUserId(isOpen ? null : r.user.id);
                  }}
                />
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
  selectedPage, pages, open, onToggle, onSelect,
}: {
  selectedPage: number; pages: number[]; open: boolean;
  onToggle: () => void; onSelect: (p: number) => void;
}) => (
  <div className={styles.pagePickerWrapper} onClick={(e) => e.stopPropagation()}>
    <button onClick={onToggle} className={styles.pagePickerTrigger}>
      {selectedPage}p
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none"
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
  reactions, openPopupId, setOpenPopupId,
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
            <button onClick={() => setOpenPopupId(isOpen ? null : r.id)} className={styles.emojiChip}>
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

const CommentCard = ({ comment, roomId }: { comment: Comment; roomId: string }) => {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loaded, setLoaded] = useState(false);
  const hasReplies = comment.replyCount > 0;

  const toggle = async () => {
    const next = !repliesOpen;
    setRepliesOpen(next);
    if (next && !loaded) {
      try {
        setReplies(await fetchReplies(roomId, comment.id));
        setLoaded(true);
      } catch (e) { console.error(e); }
    }
  };

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
                onClick={toggle}
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
              {replies.map((r) => <ReplyItem key={r.id} reply={r} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ModalOverlay = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => (
  <div className={styles.overlay} onClick={onClose}>
    <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>{children}</div>
  </div>
);

const CommentModal = ({
  page, onClose, onConfirm,
}: {
  page: number; onClose: () => void; onConfirm: (quote: string, comment: string) => void;
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
  page, onClose, onConfirm,
}: {
  page: number; onClose: () => void; onConfirm: (emojiTypeId: number) => void;
}) => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <ModalOverlay onClose={onClose}>
      <p className={styles.modalPageLabel}>{page}p</p>
      <div className={styles.emojiSelectRow}>
        {EMOJI_TYPES.map(({ id, char }) => (
          <button
            key={id}
            onClick={() => setSelected(id)}
            className={`${styles.emojiSelectBtn} ${selected === id ? styles.emojiSelectBtnActive : ""}`}
          >
            {char}
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

// ─────────────────────────────────────────────────────────────────────────────

const RoomDetailPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();

  const [activeTab, setActiveTab] = useState<Tab>("일반");
  const [roomDetail, setRoomDetail] = useState<RoomDetail | null>(null);
  const [pages, setPages] = useState<number[]>([]);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<PageReaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [ocrData, setOcrData] = useState<OcrPage | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);

  const [pagePickerOpen, setPagePickerOpen] = useState(false);
  const [openPopupId, setOpenPopupId] = useState<number | null>(null);
  const [manageActive, setManageActive] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep | null>(null);
  const [modalPage, setModalPage] = useState<number | null>(null);

  // 방 기본정보 + 페이지 목록 + 독서 진행도
  useEffect(() => {
    if (!roomId) return;

    fetchRoomDetail(roomId)
      .then((detail) => {
        setRoomDetail(detail);
        setTotalPages(detail.book.totalPage);
      })
      .catch(console.error);

    fetchPages(roomId)
      .then((list) => {
        setPages(list);
        setSelectedPage((prev) => prev ?? list[0] ?? null);
      })
      .catch(console.error);

    fetchProgress(roomId)
      .then(({ readers }) => setReaders(readers))
      .catch(console.error);
  }, [roomId]);

  // 일반 탭: 선택 페이지의 코멘트 + 리액션
  useEffect(() => {
    if (!roomId || selectedPage == null || activeTab !== "일반") return;
    setLoading(true);
    Promise.all([fetchComments(roomId, selectedPage), fetchReactions(roomId, selectedPage)])
      .then(([c, r]) => { setComments(c); setReactions(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [roomId, selectedPage, activeTab]);

  // OCR 탭: 선택 페이지의 OCR 데이터
  useEffect(() => {
    if (!roomId || selectedPage == null || activeTab !== "OCR") return;
    setOcrLoading(true);
    fetchOcrPage(roomId, selectedPage)
      .then(setOcrData)
      .catch(console.error)
      .finally(() => setOcrLoading(false));
  }, [roomId, selectedPage, activeTab]);

  const reload = async (page: number) => {
    if (!roomId) return;
    const list = await fetchPages(roomId);
    setPages(list);
    if (page === selectedPage) {
      const [c, r] = await Promise.all([fetchComments(roomId, page), fetchReactions(roomId, page)]);
      setComments(c); setReactions(r);
    } else {
      setSelectedPage(page);
    }
  };

  const handleCloseAll = () => setModalStep(null);
  const handleSelectComment = (page: number) => { setModalPage(page); setModalStep("comment"); };
  const handleSelectEmoji = (page: number) => { setModalPage(page); setModalStep("emoji"); };

  const handleCommentConfirm = async (quote: string, comment: string) => {
    if (!roomId || modalPage == null) return;
    try {
      await apiCreateComment(roomId, modalPage, quote, comment);
      await reload(modalPage);
    } catch (e) { console.error(e); }
    setModalStep(null);
  };

  const handleEmojiConfirm = async (emojiTypeId: number) => {
    if (!roomId || modalPage == null) return;
    try {
      await apiAddReaction(roomId, modalPage, emojiTypeId);
      await reload(modalPage);
    } catch (e) { console.error(e); }
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
        <h1 className={styles.headerTitle}>
          {roomDetail
            ? `${roomDetail.book.title} | ${roomDetail.book.publisher}`
            : "불러오는 중…"}
        </h1>
        <button
          className={`${styles.manageBtn} ${manageActive ? styles.manageBtnActive : ""}`}
          onPointerDown={() => setManageActive(true)}
          onPointerUp={() => { setManageActive(false); navigate(`/rooms/${roomId}/manage`); }}
          onPointerLeave={() => setManageActive(false)}
        >
          관리
        </button>
      </div>

      {/* 독서 진행바 */}
      <ReadingProgress readers={readers} totalPages={totalPages} />

      {/* 랜덤 노래 추천 */}
      <div className={styles.songRecommendationSection}>
        <button
          type="button"
          className={styles.songRecommendationCard}
          onClick={() => window.open(MOCK_SONG_RECOMMENDATION.url, "_blank", "noopener,noreferrer")}
        >
          <span className={styles.songRecommendationIcon}>
            <img src={musicIcon} alt="" className="h-5 w-5" />
          </span>

          <span className={styles.songRecommendationText}>
            {MOCK_SONG_RECOMMENDATION.title} - {MOCK_SONG_RECOMMENDATION.artist}
          </span>
        </button>
      </div>

      {/* 탭 */}
      <TabBar active={activeTab} onChange={setActiveTab} />

      {/* 일반 탭: 페이지 피커 + 이모지 */}
      {activeTab === "일반" && (
        <div className={styles.filterRow} onClick={(e) => e.stopPropagation()}>
          <PagePicker
            selectedPage={selectedPage ?? 0}
            pages={pages}
            open={pagePickerOpen}
            onToggle={() => setPagePickerOpen((v) => !v)}
            onSelect={setSelectedPage}
          />
          <PageEmojiRow
            reactions={reactions}
            openPopupId={openPopupId}
            setOpenPopupId={setOpenPopupId}
          />
        </div>
      )}

      {/* 콘텐츠 영역 */}
      {activeTab === "OCR" ? (
        <div className={styles.commentList}>
          {/* OCR 탭 페이지 피커 */}
          <div className={styles.filterRow} onClick={(e) => e.stopPropagation()}>
            <PagePicker
              selectedPage={selectedPage ?? 0}
              pages={pages}
              open={pagePickerOpen}
              onToggle={() => setPagePickerOpen((v) => !v)}
              onSelect={(p) => { setSelectedPage(p); setOcrData(null); }}
            />
          </div>

          {ocrLoading ? (
            <p className={styles.emptyText}>불러오는 중…</p>
          ) : !ocrData ? (
            <p className={styles.emptyText}>이 페이지에 OCR 데이터가 없어요</p>
          ) : (
            <div className={styles.card}>
              {ocrData.imageUrl && (
                <img
                  src={ocrData.imageUrl}
                  alt={`${ocrData.page}p 원본`}
                  style={{ width: "100%", borderRadius: 8, marginBottom: 12 }}
                />
              )}
              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{ocrData.text}</p>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.commentList}>
          {loading ? (
            <p className={styles.emptyText}>불러오는 중…</p>
          ) : !comments.length ? (
            <p className={styles.emptyText}>이 페이지에 코멘트가 없어요</p>
          ) : (
            comments.map((c) => <CommentCard key={c.id} comment={c} roomId={roomId!} />)
          )}
        </div>
      )}

      {/* FAB */}
      {activeTab === "일반" && (
        <button
          onClick={() => setModalStep("main")}
          className="fixed left-1/2 bottom-[calc(var(--bottom-bar-height)+20px)] z-40 -translate-x-1/2 translate-x-[129px] rounded-full bg-primary flex items-center justify-center shadow-lg w-12 h-12"
          aria-label="추가"
        >
          <img src={plusIcon} alt="추가" className="w-[50px] h-[50px]" />
        </button>
      )}

      <div style={{ marginTop: "auto" }} />

      {/* 모달 */}
      {modalStep === "main" && (
  <AddReactionModal
    open
    currentPage={selectedPage ?? 1}
    totalPages={totalPages}
    onClose={handleCloseAll}
    onSelectOCR={(page) => console.log("OCR:", page)}
    onSelectComment={handleSelectComment}
    onSelectEmoji={handleSelectEmoji}
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