import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../src/styles/NoticePage.module.css";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

type RoomColor =
  | "coral"
  | "blue"
  | "teal"
  | "amber"
  | "purple"
  | "pink"
  | "green"
  | "gray";

// "reply" = 대댓글
type NotifType = "comment" | "reply" | "emoji" | "ocr" | "friend_request";

interface BookRef {
  id: string;    // rooms/{id}/{page} 라우팅에 사용
  title: string;
  page: number;
}

interface Notification {
  id: string;
  type: NotifType;
  unread: boolean;
  user: {
    name: string;
    roomColor: RoomColor;
  };
  book?: BookRef;
  // comment : 코멘트 본문만
  // reply   : 대댓글 본문만
  // ocr     : preview 없음 (고정 문구 사용)
  // emoji   : preview 없음
  // friend_request : preview 없음
  preview?: string;
  timeLabel: string;
}

// ────────────────────────────────────────────────
// Lookup maps
// ────────────────────────────────────────────────

const AVATAR_COLOR_CLASS: Record<RoomColor, string> = {
  coral:  styles.avatarCoral,
  blue:   styles.avatarBlue,
  teal:   styles.avatarTeal,
  amber:  styles.avatarAmber,
  purple: styles.avatarPurple,
  pink:   styles.avatarPink,
  green:  styles.avatarGreen,
  gray:   styles.avatarGray,
};

const BADGE_CLASS: Record<NotifType, string> = {
  comment:        styles.badgeComment,
  reply:          styles.badgeReply,
  emoji:          styles.badgeEmoji,
  ocr:            styles.badgeOcr,
  friend_request: styles.badgeFriend,
};

const BADGE_ICON: Record<NotifType, string> = {
  comment:        "💬",
  reply:          "↩️",
  emoji:          "🔥",
  ocr:            "📷",
  friend_request: "👤",
};

const ACTION_LABEL: Record<NotifType, string> = {
  comment:        "님이 코멘트를 남겼어요",
  reply:          "님이 대댓글을 남겼어요",
  emoji:          "님이 반응했어요",
  ocr:            "님이 OCR을 남겼어요",
  friend_request: "님이 친구 신청을 보냈어요",
};

// ────────────────────────────────────────────────
// Mock data
// ────────────────────────────────────────────────

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "comment",
    unread: true,
    user: { name: "이수민", roomColor: "purple" },
    book: { id: "book-001", title: "채식주의자", page: 45 },
    // 코멘트 본문만 (책 구절 제외)
    preview: "이 구절은 독자가 텍스트를 해석하는 방식에 대해 정말 깊은 통찰을 주는 것 같아요.",
    timeLabel: "방금 전",
  },
  {
    id: "2",
    type: "reply",
    unread: true,
    user: { name: "박준혁", roomColor: "teal" },
    book: { id: "book-001", title: "채식주의자", page: 45 },
    // 대댓글 본문만
    preview: "저도 그렇게 느꼈어요. 비트겐슈타인을 여기서 만날 줄은 몰랐네요.",
    timeLabel: "15분 전",
  },
  {
    id: "3",
    type: "emoji",
    unread: true,
    user: { name: "김민준", roomColor: "green" },
    book: { id: "book-001", title: "채식주의자", page: 45 },
    // emoji는 preview 없음
    timeLabel: "20분 전",
  },
  {
    id: "4",
    type: "friend_request",
    unread: true,
    user: { name: "오하은", roomColor: "amber" },
    // friend_request는 book/preview 없음
    timeLabel: "32분 전",
  },
  {
    id: "5",
    type: "ocr",
    unread: false,
    user: { name: "최다연", roomColor: "pink" },
    book: { id: "book-002", title: "82년생 김지영", page: 77 },
    // ocr은 preview 없음 — 고정 문구로 처리
    timeLabel: "3시간 전",
  },
  {
    id: "6",
    type: "comment",
    unread: false,
    user: { name: "강지훈", roomColor: "blue" },
    book: { id: "book-003", title: "데미안", page: 112 },
    preview: "헤세가 이 부분에서 말하고 싶었던 건 결국 자기 자신을 찾는 여정인 것 같아요.",
    timeLabel: "어제",
  },
  {
    id: "7",
    type: "friend_request",
    unread: false,
    user: { name: "정우진", roomColor: "coral" },
    timeLabel: "2일 전",
  },
];

// ────────────────────────────────────────────────
// Avatar
// ────────────────────────────────────────────────

interface AvatarProps {
  roomColor: RoomColor;
  notifType: NotifType;
}

const Avatar: React.FC<AvatarProps> = ({ roomColor, notifType }) => (
  <div className={styles.avatarWrap}>
    <div className={`${styles.avatar} ${AVATAR_COLOR_CLASS[roomColor]}`} />
    <span
      className={`${styles.badge} ${BADGE_CLASS[notifType]}`}
      aria-hidden="true"
    >
      {BADGE_ICON[notifType]}
    </span>
  </div>
);

// ────────────────────────────────────────────────
// NotifItem
// ────────────────────────────────────────────────

interface NotifItemProps {
  notif: Notification;
  onRead: (id: string) => void;
}

const NotifItem: React.FC<NotifItemProps> = ({ notif, onRead }) => {
  const navigate = useNavigate();
  const isFriend = notif.type === "friend_request";

  const handleClick = useCallback(() => {
    if (notif.unread) onRead(notif.id);

    if (isFriend) {
      navigate("/FriendsPage");
    } else if (notif.book) {
      navigate(`/rooms/${notif.book.id}/${notif.book.page}`);
    }
  }, [notif, isFriend, onRead, navigate]);

  const itemClass = [
    styles.notifItem,
    notif.unread ? styles.notifItemUnread : "",
    isFriend ? styles.notifItemFriend : "",
  ]
    .filter(Boolean)
    .join(" ");

  // preview 결정:
  // - ocr/emoji/friend_request → preview 없음 (action label만)
  // - comment/reply → preview(본문)만 표시, 이탤릭 없음
  const showPreview =
    notif.preview &&
    (notif.type === "comment" || notif.type === "reply");

  return (
    <li
      className={itemClass}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      <Avatar roomColor={notif.user.roomColor} notifType={notif.type} />

      <div className={styles.notifBody}>
        <div className={styles.notifTop}>
          <span className={styles.notifUser}>{notif.user.name}</span>
          <span className={styles.notifAction}>{ACTION_LABEL[notif.type]}</span>
          <span className={styles.notifTime}>{notif.timeLabel}</span>
        </div>

        {notif.book && (
          <div className={styles.notifMeta}>
            <span className={styles.notifBook}>{notif.book.title}</span>
            <span className={styles.notifPage}>{notif.book.page}p</span>
          </div>
        )}

        {showPreview && (
          <p className={styles.notifPreview}>{notif.preview}</p>
        )}
      </div>

      {notif.unread && (
        <span
          className={`${styles.unreadDot} ${isFriend ? styles.unreadDotGreen : ""}`}
          aria-label="읽지 않음"
        />
      )}
    </li>
  );
};

// ────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────

const NoticePage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(
    INITIAL_NOTIFICATIONS
  );

  const handleRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  }, []);

  const newNotifs = notifications.filter((n) => n.unread);
  const oldNotifs = notifications.filter((n) => !n.unread);

  return (
    <div className={styles.noticePage}>
      <header className={styles.noticeHeader}>
        <h1 className={styles.noticeTitle}>알림</h1>
        {newNotifs.length > 0 && (
          <span className={styles.noticeCount}>{newNotifs.length}</span>
        )}
      </header>

      <div className={styles.noticeFeed}>
        {newNotifs.length > 0 && (
          <section>
            <p className={styles.sectionLabel}>새 알림</p>
            <ul className={styles.notifList}>
              {newNotifs.map((n) => (
                <NotifItem key={n.id} notif={n} onRead={handleRead} />
              ))}
            </ul>
          </section>
        )}

        {oldNotifs.length > 0 && (
          <section>
            <p className={styles.sectionLabel}>이전 알림</p>
            <ul className={styles.notifList}>
              {oldNotifs.map((n) => (
                <NotifItem key={n.id} notif={n} onRead={handleRead} />
              ))}
            </ul>
          </section>
        )}

        {notifications.length === 0 && (
          <div className={styles.noticeEmpty}>
            <span className={styles.noticeEmptyIcon}>🔔</span>
            <p>알림 내역이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticePage;