import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Noticepage.module.css";
import { fetchNotifications, markAsRead, markAllAsRead } from "../api/notificationApi";
import type { NotifType, NotificationItem as ApiNotification } from "../api/notificationApi";

function colorFromHex(hex: string | null): string {
  if (hex) return hex;
  return "#b4b2a9";
}

function formatTimeLabel(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;
  return new Date(isoString).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
}

interface Notification {
  id: string;
  type: NotifType;
  unread: boolean;
  user: { name: string; color: string };
  book?: { roomId: string; title: string; page: number };
  preview?: string;
  timeLabel: string;
}

function mapApiToNotification(item: ApiNotification): Notification {
  return {
    id: item.notificationId,
    type: item.type,
    unread: !item.isRead,
    user: {
      name: item.user.nickname,
      color: colorFromHex(item.user.roomColor),
    },
    book: item.book
      ? { roomId: item.book.roomId, title: item.book.title, page: item.book.page }
      : undefined,
    preview: item.preview ?? undefined,
    timeLabel: formatTimeLabel(item.createdAt),
  };
}

const BADGE_CLASS: Record<NotifType, string> = {
  comment:           styles.badgeComment,
  reply:            styles.badgeReply,
  emoji:            styles.badgeEmoji,
  ocr:              styles.badgeOcr,
  friend_request:   styles.badgeFriend,
  friend_accepted:  styles.badgeFriend,
};

const BADGE_ICON: Record<NotifType, string> = {
  comment:           "💬",
  reply:            "↩️",
  emoji:            "🔥",
  ocr:              "📷",
  friend_request:   "👤",
  friend_accepted:  "✅",
};

const ACTION_LABEL: Record<NotifType, string> = {
  comment:           "님이 코멘트를 남겼어요",
  reply:            "님이 대댓글을 남겼어요",
  emoji:            "님이 반응했어요",
  ocr:              "님이 OCR을 남겼어요",
  friend_request:   "님이 친구 신청을 보냈어요",
  friend_accepted:  "님이 친구 신청을 수락했어요",
};

interface AvatarProps {
  color: string;
  notifType: NotifType;
}

const Avatar: React.FC<AvatarProps> = ({ color, notifType }) => (
  <div className={styles.avatarWrap}>
    <div className={styles.avatar} style={{ background: color }} />
    <span className={`${styles.badge} ${BADGE_CLASS[notifType]}`} aria-hidden="true">
      {BADGE_ICON[notifType]}
    </span>
  </div>
);

interface NotifItemProps {
  notif: Notification;
  onRead: (id: string) => void;
}

const NotifItem: React.FC<NotifItemProps> = ({ notif, onRead }) => {
  const navigate = useNavigate();
  const isFriend = notif.type === "friend_request" || notif.type === "friend_accepted";

  const handleClick = useCallback(async () => {
    if (notif.unread) {
      onRead(notif.id);        
      markAsRead(notif.id).catch(() => {}); 
    }

    if (isFriend) {
      navigate("/mypage/friends");
    } else if (notif.book) {
      navigate(`/rooms/${notif.book.roomId}`);
    }
  }, [notif, isFriend, onRead, navigate]);

  const itemClass = [
    styles.notifItem,
    notif.unread ? styles.notifItemUnread : "",
    isFriend ? styles.notifItemFriend : "",
  ].filter(Boolean).join(" ");

  const showPreview = notif.preview && (notif.type === "comment" || notif.type === "reply");

  return (
    <li
      className={itemClass}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      <Avatar color={notif.user.color} notifType={notif.type} />

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

        {showPreview && <p className={styles.notifPreview}>{notif.preview}</p>}
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

const NoticePage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchNotifications()
      .then(({ data }) => {
        if (cancelled) return;
        const all = [
          ...data.newNotifications.map(mapApiToNotification),
          ...data.oldNotifications.map(mapApiToNotification),
        ];
        setNotifications(all);
      })
      .catch(() => {
        if (!cancelled) {
          setError("알림을 불러오지 못했어요.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const handleRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  }, []);

  const handleReadAll = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    markAllAsRead().catch(() => {});
  }, []);

  const newNotifs = notifications.filter((n) => n.unread);
  const oldNotifs = notifications.filter((n) => !n.unread);

  return (
    <div className={styles.noticePage}>
      <header className={styles.noticeHeader}>
        <div className={styles.noticeHeaderLeft}>
          <h1 className={styles.noticeTitle}>알림</h1>
          {newNotifs.length > 0 && (
            <span className={styles.noticeCount}>{newNotifs.length}</span>
          )}
        </div>

        {newNotifs.length > 0 && (
          <button
            className={styles.readAllBtn}
            onClick={handleReadAll}
            type="button"
          >
            전체 읽음
          </button>
        )}
      </header>

      <div className={styles.noticeFeed}>
        {loading && (
          <div className={styles.noticeEmpty}>
            <p>알림을 불러오는 중...</p>
          </div>
        )}

        {!loading && error && (
          <div className={styles.noticeEmpty}>
            <span className={styles.noticeEmptyIcon}>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default NoticePage;