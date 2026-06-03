import { useMemo, useState } from "react";
import { ConfirmModal } from "@/components/friend/ConfirmModal";
import { searchUserByCode, sendFriendRequest } from "@/api/friend.ts";
import type { SearchedUser } from "@/types/friend.ts";
import { useToastContext } from "@/components/common/ToastProvider";

const FriendsPage = () => {
  const [userCode, setUserCode] = useState("");
  const [searchedUser, setSearchedUser] = useState<SearchedUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blockedModalOpen, setBlockedModalOpen] = useState(false);
  const [notFoundModalOpen, setNotFoundModalOpen] = useState(false);
  const { show } = useToastContext();

  const modalState = useMemo(() => {
    if (!searchedUser) {
      return {
        message: "",
        confirmText: "확인",
        showConfirm: false,
      };
    }

    const baseMessage = `${searchedUser.nickname}\n@${searchedUser.userCode}`;

    switch (searchedUser.friendStatus) {
      case "ME":
        return {
          message: `${baseMessage}\n\n본인은 친구 추가할 수 없습니다.`,
          confirmText: "확인",
          showConfirm: false,
        };

      case "FRIENDS":
        return {
          message: `${baseMessage}\n\n이미 친구인 사용자입니다.`,
          confirmText: "확인",
          showConfirm: false,
        };

      case "REQUEST_SENT":
        return {
          message: `${baseMessage}\n\n이미 친구 요청을 보낸 사용자입니다.`,
          confirmText: "확인",
          showConfirm: false,
        };

      case "REQUEST_RECEIVED":
        return {
          message: `${baseMessage}\n\n상대방에게 받은 친구 요청이 있습니다.`,
          confirmText: "확인",
          showConfirm: false,
        };

      case "BLOCKED":
        return {
          message: "차단한 사용자는 검색할 수 없습니다.",
          confirmText: "확인",
          showConfirm: false,
        };

      case "NONE":
      default:
        return {
          message: `${baseMessage}\n\n친구 요청을 보내시겠습니까?`,
          confirmText: "친구 신청",
          showConfirm: true,
        };
    }
  }, [searchedUser]);

  const handleSearch = async () => {
    const trimmedCode = userCode.trim();

    if (!trimmedCode) {
      show("유저코드를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      const user = await searchUserByCode(trimmedCode);

      if (user.isBlocked || user.friendStatus === "BLOCKED") {
        setBlockedModalOpen(true);
        return;
      }

      setSearchedUser(user);
      setModalOpen(true);
    } catch (error) {
      console.error(error);
      setNotFoundModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!searchedUser) return;

    if (searchedUser.friendStatus !== "NONE") {
      setModalOpen(false);
      return;
    }

    try {
      await sendFriendRequest(searchedUser.userId);

      show("친구 요청을 보냈습니다.");

      setSearchedUser({
        ...searchedUser,
        friendStatus: "REQUEST_SENT",
      });

      setModalOpen(false);
    } catch (error) {
      console.error(error);
      show("친구 요청에 실패했습니다.");
    }
  };

  return (
    <div className="px-4 py-2">
      <h1 className="mb-2 text-base font-normal text-black">친구 추가</h1>

      <div className="flex gap-2">
        <input
          value={userCode}
          onChange={(e) => setUserCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="유저코드를 입력하세요"
          className="h-11 flex-1 rounded-xl border border-field bg-white px-4 text-sm text-black outline-none placeholder:text-sub-black"
        />

        <button
          type="button"
          disabled={loading}
          onClick={handleSearch}
          className="h-11 rounded-xl bg-black px-4 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "검색 중" : "추가"}
        </button>
      </div>

      <ConfirmModal
        open={modalOpen}
        message={modalState.message}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        cancelText={modalState.showConfirm ? "취소" : "닫기"}
        confirmText={modalState.confirmText}
        showConfirm={modalState.showConfirm}
      />

      <ConfirmModal
        open={blockedModalOpen}
        message="차단한 사용자는 검색할 수 없습니다."
        onCancel={() => setBlockedModalOpen(false)}
        cancelText="닫기"
        showConfirm={false}
      />

      <ConfirmModal
        open={notFoundModalOpen}
        message="사용자를 찾을 수 없습니다."
        onCancel={() => setNotFoundModalOpen(false)}
        cancelText="닫기"
        showConfirm={false}
      />
    </div>
  );
};

export default FriendsPage;
