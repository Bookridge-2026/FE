import { useEffect, useState } from "react";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { FriendRequestRow } from "@/components/friend/FriendRequestRow";
import { FriendRow } from "@/components/friend/FriendRow";
import {
  acceptFriendRequest,
  blockUser,
  deleteFriend,
  getFriends,
  getReceivedFriendRequests,
  rejectFriendRequest,
} from "@/api/friend";
import type { FriendItem, FriendRequestItem } from "@/types/friend.ts";
import { useNavigate } from "react-router-dom";
import backButtonIcon from "@/assets/common/back-button.svg";

type ModalAction =
  | { type: "ACCEPT"; request: FriendRequestItem }
  | { type: "REJECT"; request: FriendRequestItem }
  | { type: "DELETE"; friend: FriendItem }
  | { type: "BLOCK"; friend: FriendItem }
  | null;

const MyFriendsPage = () => {
  const [requests, setRequests] = useState<FriendRequestItem[]>([]);
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAction, setModalAction] = useState<ModalAction>(null);
  const navigate = useNavigate();

  const fetchFriendsData = async () => {
    try {
      setLoading(true);

      const [requestList, friendList] = await Promise.all([
        getReceivedFriendRequests(),
        getFriends(),
      ]);

      setRequests(requestList);
      setFriends(friendList);
    } catch (error) {
      console.error(error);
      alert("친구 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendsData();
  }, []);

  const modalMessage = (() => {
    if (!modalAction) return "";

    switch (modalAction.type) {
      case "ACCEPT":
        return `${modalAction.request.sender.nickname}님의\n친구 요청을 수락하시겠습니까?`;
      case "REJECT":
        return `${modalAction.request.sender.nickname}님의\n친구 요청을 거절하시겠습니까?`;
      case "DELETE":
        return `${modalAction.friend.nickname}님을\n친구 목록에서 삭제하시겠습니까?`;
      case "BLOCK":
        return `${modalAction.friend.nickname}님을\n차단하시겠습니까?`;
      default:
        return "";
    }
  })();

  const modalConfirmText = (() => {
    if (!modalAction) return "확인";

    switch (modalAction.type) {
      case "ACCEPT":
        return "수락";
      case "REJECT":
        return "거절";
      case "DELETE":
        return "삭제";
      case "BLOCK":
        return "차단";
      default:
        return "확인";
    }
  })();

  const handleConfirm = async () => {
    if (!modalAction) return;

    try {
      if (modalAction.type === "ACCEPT") {
        await acceptFriendRequest(modalAction.request.friendRequestId);

        setRequests((prev) =>
          prev.filter(
            (request) =>
              request.friendRequestId !== modalAction.request.friendRequestId
          )
        );

        await fetchFriendsData();
      }

      if (modalAction.type === "REJECT") {
        await rejectFriendRequest(modalAction.request.friendRequestId);

        setRequests((prev) =>
          prev.filter(
            (request) =>
              request.friendRequestId !== modalAction.request.friendRequestId
          )
        );
      }

      if (modalAction.type === "DELETE") {
        await deleteFriend(modalAction.friend.userId);

        setFriends((prev) =>
          prev.filter((friend) => friend.userId !== modalAction.friend.userId)
        );
      }

      if (modalAction.type === "BLOCK") {
        await blockUser(modalAction.friend.userId);

        setFriends((prev) =>
          prev.filter((friend) => friend.userId !== modalAction.friend.userId)
        );
      }

      setModalAction(null);
    } catch (error) {
      console.error(error);
      alert("요청 처리에 실패했습니다.");
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-sub-black">불러오는 중...</div>;
  }

  return (
    <>
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
        친구 관리
      </div>
    </header>
    
    <div className="pt-[96px] min-h-full p-4 pb-[100px]">
      <section>
        <h2 className="mb-4 mt-3 text-lg font-semibold text-black">
          · 친구 요청
        </h2>

        <div className="space-y-1 pl-4">
          {requests.length > 0 ? (
            requests.map((request) => (
              <FriendRequestRow
                key={request.friendRequestId}
                request={request}
                onAccept={(selectedRequest) =>
                  setModalAction({ type: "ACCEPT", request: selectedRequest })
                }
                onReject={(selectedRequest) =>
                  setModalAction({ type: "REJECT", request: selectedRequest })
                }
              />
            ))
          ) : (
            <p className="py-2 text-sm text-sub-black">
              받은 친구 요청이 없습니다.
            </p>
          )}
        </div>
      </section>

      <div className="my-5 h-px bg-sub-black" />

      <section>
        <h2 className="mb-4 mt-5 text-lg font-semibold text-black">
          · 친구 목록
        </h2>

        <div className="space-y-1 pl-4">
          {friends.length > 0 ? (
            friends.map((friend) => (
              <FriendRow
                key={friend.friendId}
                friend={friend}
                onDelete={(selectedFriend) =>
                  setModalAction({ type: "DELETE", friend: selectedFriend })
                }
                onBlock={(selectedFriend) =>
                  setModalAction({ type: "BLOCK", friend: selectedFriend })
                }
              />
            ))
          ) : (
            <p className="py-2 text-sm text-sub-black">
              친구 목록이 없습니다.
            </p>
          )}
        </div>
      </section>

      <ConfirmModal
        open={modalAction !== null}
        message={modalMessage}
        onCancel={() => setModalAction(null)}
        onConfirm={handleConfirm}
        cancelText="취소"
        confirmText={modalConfirmText}
      />
    </div>
        </>
  );
};

export default MyFriendsPage;
