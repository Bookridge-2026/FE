import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../styles/Roomdetailpage.module.css";
import AddReactionModal from "../../components/rooms/detail/AddReactionModal";

import plusIcon from "@/assets/common/plus-icon.svg";
import musicIcon from "@/assets/rooms/music.svg";
import { fetchRandomSongRecommendation } from "../../api/song";
import type { SongRecommendationWithCreatedAt } from "@/types/song";

import { jwtDecode } from "jwt-decode";

import {
  fetchPages,
  fetchComments,
  fetchReactions,
  fetchReplies,
  fetchProgress,
  fetchRoomDetail,
   fetchOcrEntriesByPage,
  fetchOcrPages,
  fetchMyMemberId,
  createComment  as apiCreateComment,
  toggleReaction as apiToggleReaction,
  createReply    as apiCreateReply,
  updateComment  as apiUpdateComment,
  deleteComment  as apiDeleteComment,
  deleteReply    as apiDeleteReply,
  deleteReaction as apiDeleteReaction,
  EMOJI_TYPES,
  type User, type Reply, type Comment, type PageReaction,
  type RoomDetail,
} from "../../api/roomDetail";

type Reader    = { user: User; page: number };
type Tab       = "일반" | "OCR";
type ModalStep = "main" | "comment" | "emoji";

// ─── ⋮ 케밥 메뉴 ─────────────────────────────────────────────────────────────
const KebabMenu = ({
  isMine,
  onEdit,
  onDelete,
}: {
  isMine: boolean;
  onEdit?: () => void;
  onDelete: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className={styles.kebabBtn}
        aria-label="더보기"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5"  r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className={styles.kebabDropdown} onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <button
              className={styles.kebabItem}
              disabled={!isMine}
              onClick={() => { if (isMine) { setOpen(false); onEdit(); } }}
              style={!isMine ? { opacity: 0.35, cursor: "not-allowed" } : {}}
            >
              수정
            </button>
          )}
          <button
            className={`${styles.kebabItem} ${isMine ? styles.kebabItemDelete : ""}`}
            disabled={!isMine}
            onClick={() => { if (isMine) { setOpen(false); onDelete(); } }}
            style={!isMine ? { opacity: 0.35, cursor: "not-allowed" } : {}}
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
};

// ─── 삭제 확인 다이얼로그 ─────────────────────────────────────────────────────
const ConfirmDialog = ({
  message, onConfirm, onCancel,
}: {
  message: string; onConfirm: () => void; onCancel: () => void;
}) => (
  <div className={styles.confirmBackdrop} onClick={onCancel}>
    <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
      <p className={styles.confirmMessage}>{message}</p>
      <div className={styles.confirmBtnRow}>
        <button className={styles.cancelBtn}  onClick={onCancel}>취소</button>
        <button
          className={`${styles.confirmBtn} ${styles.confirmBtnDanger}`}
          onClick={onConfirm}
        >
          삭제
        </button>
      </div>
    </div>
  </div>
);

// ─── 독서 진행바 ──────────────────────────────────────────────────────────────
const ReadingProgress = ({ readers, totalPages }: { readers: Reader[]; totalPages: number }) => {
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
            const isOpen  = openUserId === r.user.id;
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

// ─── 탭바 ─────────────────────────────────────────────────────────────────────
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

// ─── 페이지 피커 ──────────────────────────────────────────────────────────────
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
        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />
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

// ─── 이모지 행 ────────────────────────────────────────────────────────────────
const PageEmojiRow = ({
  reactions, openPopupId, setOpenPopupId, onDeleteReaction, currentUserId,
}: {
  reactions: PageReaction[];
  openPopupId: number | null;
  setOpenPopupId: (id: number | null) => void;
  onDeleteReaction: (emojiId: number) => Promise<void>;
  currentUserId: number;
}) => {
  const [showAll,   setShowAll]   = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const needsOverflow = reactions.length > 3;
  const visible = needsOverflow && !showAll ? reactions.slice(-2) : reactions;

  if (reactions.length === 0) return null;

  return (
    <>
      <div className={styles.emojiRow} onClick={(e) => e.stopPropagation()}>
        {visible.map((r) => {
          const isOpen = openPopupId === r.id;
          const isMine = r.user.id === currentUserId;

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
                    <button
                      className={styles.emojiDeleteBtn}
                      disabled={!isMine}
                      onClick={(e) => {
                        if (!isMine) return;
                        e.stopPropagation();
                        setConfirmId(r.id);
                        setOpenPopupId(null);
                      }}
                      style={!isMine ? { opacity: 0.35, cursor: "not-allowed" } : {}}
                      aria-label="이모지 삭제"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {needsOverflow && (
          <button onClick={() => setShowAll((v) => !v)} className={styles.emojiOverflowBtn}>
            <svg width="14" height="4" viewBox="0 0 14 4" fill="none">
              <circle cx="1.5"  cy="2" r="1.5" fill="white" />
              <circle cx="7"    cy="2" r="1.5" fill="white" />
              <circle cx="12.5" cy="2" r="1.5" fill="white" />
            </svg>
          </button>
        )}
      </div>

      {confirmId !== null && (
        <ConfirmDialog
          message="이모지를 삭제할까요?"
          onConfirm={async () => { await onDeleteReaction(confirmId); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </>
  );
};

// ─── 대댓글 아이템 ────────────────────────────────────────────────────────────
const ReplyItem = ({
  reply, onDelete, currentUserId,
}: {
  reply: Reply;
  onDelete: (replyId: number) => Promise<void>;
  currentUserId: number;
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isMine = reply.author.id === currentUserId;

  return (
    <>
      <div className={styles.replyItem}>
        <span className={styles.replyPrefix}>ㄴ</span>
        <span className={styles.replyDot} style={{ backgroundColor: reply.author.color }} />
        <p className={styles.replyText}>{reply.text}</p>
        <KebabMenu isMine={isMine} onDelete={() => setConfirmDelete(true)} />
      </div>

      {confirmDelete && (
        <ConfirmDialog
          message="답글을 삭제할까요?"
          onConfirm={async () => { setConfirmDelete(false); await onDelete(reply.id); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
};

// ─── 코멘트 카드 ──────────────────────────────────────────────────────────────
const CommentCard = ({
  comment, roomId, currentUserId, onReply, onUpdate, onDelete,
}: {
  comment: Comment;
  roomId: string;
  currentUserId: number;
  onReply:  (commentId: number, text: string) => Promise<void>;
  onUpdate: (commentId: number, commentText: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
}) => {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [replies,     setReplies]     = useState<Reply[]>([]);
  const [loaded,      setLoaded]      = useState(false);

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySub,  setReplySub]  = useState(false);

  const [editing,  setEditing]  = useState(false);
  const [editText, setEditText] = useState(comment.text ?? "");
  const [editSub,  setEditSub]  = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const isDeleted = comment.text === "삭제된 코멘트입니다";
  const isMine    = comment.author.id === currentUserId;

  const hasReplies = comment.replyCount > 0 || replies.length > 0;
  

  const loadReplies = async () => {
    const list = await fetchReplies(roomId, comment.id);
    setReplies(list);
    setLoaded(true);
  };

  const toggle = async () => {
    const next = !repliesOpen;
    setRepliesOpen(next);
    if (next && !loaded) await loadReplies().catch(console.error);
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    setReplySub(true);
    try {
      await onReply(comment.id, replyText.trim());
      await loadReplies();
      setRepliesOpen(true);
      setReplyText("");
      setReplyOpen(false);
    } catch (e) { console.error(e); }
    finally { setReplySub(false); }
  };

  const handleEditSubmit = async () => {
    if (!editText.trim()) return;
    setEditSub(true);
    try {
      await onUpdate(comment.id, editText.trim());
      setEditing(false);
    } catch (e) { console.error(e); }
    finally { setEditSub(false); }
  };

  const handleReplyDelete = async (replyId: number) => {
    await apiDeleteReply(roomId, comment.id, replyId);
    setReplies((prev) => prev.filter((r) => r.id !== replyId));
  };

  return (
    <>
      <div className={styles.card}>
        {comment.quote && (
          <div className={styles.quoteBlock}>
            <span className={styles.quoteOpen}>"</span>
            <p className={styles.quoteText}>{comment.quote}</p>
            <span className={styles.quoteClose}>"</span>
          </div>
        )}

        {comment.text && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {editing ? (
              <>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                  className={`${styles.textarea} ${styles.textareaComment}`}
                  autoFocus
                />
                <div className={styles.modalBtnRow}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => { setEditing(false); setEditText(comment.text ?? ""); }}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    disabled={!editText.trim() || editSub}
                    className={`${styles.confirmBtn} ${!editText.trim() ? styles.confirmBtnDisabled : ""}`}
                  >
                    {editSub ? "…" : "저장"}
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.commentRow}>
                <span className={styles.commentDot} style={{ backgroundColor: comment.author.color }} />
                <span className={styles.commentText}>{comment.text}</span>

                {!isDeleted && (
                  <KebabMenu
                    isMine={isMine}
                    onEdit={() => { setEditText(comment.text ?? ""); setEditing(true); }}
                    onDelete={() => setConfirmDelete(true)}
                  />
                )}

                <button
                  onClick={() => setReplyOpen((v) => !v)}
                  className={styles.replyToggleBtn}
                  aria-label="답글 쓰기"
                >
                  답글
                </button>

                {hasReplies && (
                  <button
                    onClick={toggle}
                    className={`${styles.chevronBtn} ${repliesOpen ? styles.chevronBtnOpen : ""}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9L12 15L18 9" stroke="#9E9890" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {repliesOpen && (
              <div className={styles.repliesList}>
                {replies.map((r) => (
                  <ReplyItem
                    key={r.id}
                    reply={r}
                    onDelete={handleReplyDelete}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}

            {replyOpen && (
              <div className={styles.replyInputRow}>
                <span className={styles.replyPrefix}>ㄴ</span>
                <input
                  className={styles.replyInput}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReplySubmit(); }
                  }}
                  placeholder="답글을 입력하세요"
                  disabled={replySub}
                  autoFocus
                />
                <button
                  onClick={handleReplySubmit}
                  disabled={!replyText.trim() || replySub}
                  className={`${styles.replySubmitBtn} ${!replyText.trim() ? styles.replySubmitBtnDisabled : ""}`}
                >
                  {replySub ? "…" : "등록"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {confirmDelete && (
        <ConfirmDialog
          message="코멘트를 삭제할까요?"
          onConfirm={async () => { setConfirmDelete(false); await onDelete(comment.id); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
};

// ─── 모달 공통 오버레이 ───────────────────────────────────────────────────────
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
  const [quote,   setQuote]   = useState("");
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
// 메인 페이지
// ─────────────────────────────────────────────────────────────────────────────
const RoomDetailPage = () => {

  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();

  const token = localStorage.getItem("accessToken");
  const currentJwtId = token ? jwtDecode<{ id: number }>(token).id : 0;

  const [currentMemberId, setCurrentMemberId] = useState<number>(0);

  const [songRecommendation, setSongRecommendation] =
    useState<SongRecommendationWithCreatedAt | null>(null);

  const [activeTab,    setActiveTab]    = useState<Tab>("일반");
  const [roomDetail,   setRoomDetail]   = useState<RoomDetail | null>(null);
  const [pages,        setPages]        = useState<number[]>([]);
  const [ocrPages,     setOcrPages]     = useState<number[]>([]);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [comments,     setComments]     = useState<Comment[]>([]);
  const [reactions,    setReactions]    = useState<PageReaction[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [readers,      setReaders]      = useState<Reader[]>([]);
  const [totalPages,   setTotalPages]   = useState(0);
  const [pagePickerOpen, setPagePickerOpen] = useState(false);
  const [openPopupId,    setOpenPopupId]    = useState<number | null>(null);
  const [manageActive,   setManageActive]   = useState(false);
  const [modalStep,      setModalStep]      = useState<ModalStep | null>(null);
  const [modalPage,      setModalPage]      = useState<number | null>(null);

  

  // 멤버 ID 조회
  useEffect(() => {
    if (!roomId || !currentJwtId) return;
    fetchMyMemberId(roomId, currentJwtId)
      .then(setCurrentMemberId)
      .catch(console.error);
  }, [roomId, currentJwtId]);

  // 방 기본 정보, 일반 페이지 목록, 진행도
  useEffect(() => {
    if (!roomId) return;
    fetchRoomDetail(roomId)
      .then((d) => { setRoomDetail(d); setTotalPages(d.book.totalPage); })
      .catch(console.error);
    fetchPages(roomId)
      .then((list) => { setPages(list); setSelectedPage((p) => p ?? list[0] ?? null); })
      .catch(console.error);
    fetchProgress(roomId)
      .then(({ readers }) => setReaders(readers))
      .catch(console.error);
  }, [roomId]);

  // 노래 추천
  useEffect(() => {
    if (!roomId) return;
    fetchRandomSongRecommendation(roomId)
      .then((res) => setSongRecommendation(res.data))
      .catch(console.error);
  }, [roomId]);

  // 일반 탭 — 코멘트 & 리액션
  useEffect(() => {
    if (!roomId || selectedPage == null || activeTab !== "일반") return;
    setLoading(true);
    Promise.all([fetchComments(roomId, selectedPage), fetchReactions(roomId, selectedPage)])
      .then(([c, r]) => { setComments(c); setReactions(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [roomId, selectedPage, activeTab]);

  // OCR 탭 — OCR 페이지 번호 목록 (탭 진입 시 한 번)
  useEffect(() => {
    if (!roomId || activeTab !== "OCR") return;
    fetchOcrPages(roomId)
      .then((list) => {
        setOcrPages(list);
        if (list.length > 0) setSelectedPage(list[0]);
      })
      .catch(console.error);
  }, [roomId, activeTab]);

  // OCR 탭 — 선택된 페이지의 OCR 내용
  // 상태 추가
// 상태
const [ocrEntries, setOcrEntries] = useState<{ ocrPageId: number; page: number }[]>([]);
const [ocrListLoading, setOcrListLoading] = useState(false);

// useEffect — OCR 탭 + 페이지 선택 시
useEffect(() => {
  if (!roomId || selectedPage == null || activeTab !== "OCR") return;
  setOcrListLoading(true);
  setOcrEntries([]);
  fetchOcrEntriesByPage(roomId, selectedPage)
    .then(setOcrEntries)
    .catch(console.error)
    .finally(() => setOcrListLoading(false));
}, [roomId, selectedPage, activeTab]);


  const reloadPage = async (page: number) => {
    if (!roomId) return;
    const [list, c, r] = await Promise.all([
      fetchPages(roomId),
      fetchComments(roomId, page),
      fetchReactions(roomId, page),
    ]);
    setPages(list);
    if (page === selectedPage) { setComments(c); setReactions(r); }
    else setSelectedPage(page);
  };

  const handleCloseAll      = () => setModalStep(null);
  const handleSelectComment = (page: number) => { setModalPage(page); setModalStep("comment"); };
  const handleSelectEmoji   = (page: number) => { setModalPage(page); setModalStep("emoji"); };

  const handleCommentConfirm = async (quote: string, comment: string) => {
    if (!roomId || modalPage == null) return;
    try { await apiCreateComment(roomId, modalPage, quote, comment); await reloadPage(modalPage); }
    catch (e) { console.error(e); }
    setModalStep(null);
  };

  const handleEmojiConfirm = async (emojiTypeId: number) => {
    if (!roomId || modalPage == null) return;
    try {
      await apiToggleReaction(roomId, modalPage, emojiTypeId);
      const updated = await fetchReactions(roomId, modalPage);
      setReactions(updated);
    } catch (e) { console.error(e); }
    setModalStep(null);
  };

  const handleReply = async (commentId: number, text: string) => {
    if (!roomId) return;
    await apiCreateReply(roomId, commentId, text);
  };

  const handleCommentUpdate = async (commentId: number, commentText: string) => {
    if (!roomId) return;
    await apiUpdateComment(roomId, commentId, commentText);
    setComments((prev) =>
      prev.map((c) => c.id === commentId ? { ...c, text: commentText } : c)
    );
  };

  const handleCommentDelete = async (commentId: number) => {
    if (!roomId) return;
    await apiDeleteComment(roomId, commentId);
    if (selectedPage != null) {
      const updated = await fetchComments(roomId, selectedPage);
      setComments(updated);
    }
  };

  const handleDeleteReaction = async (emojiId: number) => {
    if (!roomId) return;
    await apiDeleteReaction(roomId, emojiId);
    setReactions((prev) => prev.filter((r) => r.id !== emojiId));
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
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
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

      <ReadingProgress readers={readers} totalPages={totalPages} />

      <div className={styles.songRecommendationSection}>
        <button
          type="button"
          className={styles.songRecommendationCard}
          disabled={!songRecommendation}
          onClick={() => {
            if (!songRecommendation?.url) return;
            window.open(songRecommendation.url, "_blank", "noopener,noreferrer");
          }}
        >
          <span className={styles.songRecommendationIcon}>
            <img src={musicIcon} alt="" className="h-5 w-5" />
          </span>
          <span className={styles.songRecommendationText}>
            {songRecommendation
              ? `${songRecommendation.title} - ${songRecommendation.artist}`
              : "추천 노래를 불러오는 중..."}
          </span>
        </button>
      </div>

      <TabBar active={activeTab} onChange={setActiveTab} />

      {/* 일반 탭 필터 행 */}
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
            onDeleteReaction={handleDeleteReaction}
            currentUserId={currentMemberId}
          />
        </div>
      )}

      {/* OCR 탭 렌더링 */}
{activeTab === "OCR" ? (
  <div className={styles.commentList}>
    {/* 페이지 피커 — ocrPages 기준 */}
    <div onClick={(e) => e.stopPropagation()}>
      <PagePicker
        selectedPage={selectedPage ?? 0}
        pages={ocrPages}
        open={pagePickerOpen}
        onToggle={() => setPagePickerOpen((v) => !v)}
        onSelect={(p) => { setSelectedPage(p); setOcrEntries([]); }}
      />
    </div>

    {/* 해당 쪽수 OCR 바로가기 목록 */}
    {ocrListLoading ? (
      <p className={styles.emptyText}>불러오는 중…</p>
    ) : ocrEntries.length === 0 ? (
      <p className={styles.emptyText}>이 페이지에 OCR 데이터가 없어요</p>
    ) : (
      ocrEntries.map((entry, idx) => (
        <button
          key={entry.ocrPageId}
          className={styles.ocrItem}
          onClick={() => navigate(`/rooms/${roomId}/ocr/${entry.ocrPageId}`)}
        >
          <span>{entry.page}쪽 OCR 바로가기 - {idx + 1}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ))
    )}
  </div>
) : (
  
  <div className={styles.commentList}>
    {loading ? (
      <p className={styles.emptyText}>불러오는 중…</p>
    ) : !comments.length ? (
      <p className={styles.emptyText}>이 페이지에 코멘트가 없어요</p>
    ) : (
      comments.map((c) => (
        <CommentCard
          key={c.id}
          comment={c}
          roomId={roomId!}
          currentUserId={currentMemberId}
          onReply={handleReply}
          onUpdate={handleCommentUpdate}
          onDelete={handleCommentDelete}
        />
      ))
    )}
  </div>
)}
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

      {modalStep === "main" && (
        <AddReactionModal
          open
          currentPage={selectedPage ?? 1}
          totalPages={totalPages}
          onClose={handleCloseAll}
          onSelectOCR={(page) => navigate(`/rooms/${roomId}/ocr/${page}`)}
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