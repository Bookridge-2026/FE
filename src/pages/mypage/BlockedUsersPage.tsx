import { useEffect, useState } from "react";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { BlockedUserRow } from "@/components/friend/BlockedUserRow";
import { getBlockedUsers, unblockUser } from "@/api/block";
import type { BlockedUser } from "@/types/block.ts";
import backButtonIcon from "@/assets/common/back-button.svg";
import { useNavigate } from "react-router-dom";

const BlockedUsersPage = () => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<BlockedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBlockedUsers = async () => {
    try {
      setLoading(true);
      const users = await getBlockedUsers();
      setBlockedUsers(users);
    } catch (error) {
      console.error(error);
      alert("차단 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const handleUnblock = async () => {
    if (!selectedUser) return;

    try {
      await unblockUser(selectedUser.userId);

      setBlockedUsers((prev) =>
        prev.filter((user) => user.userId !== selectedUser.userId)
      );

      setSelectedUser(null);
    } catch (error) {
      console.error(error);
      alert("차단 해제에 실패했습니다.");
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

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[17px] font-semibold text-primary">
        차단 목록
      </div>
    </header>

    <div className="pt-[96px] min-h-full p-4 pb-[100px]">
      <section>

        <div className="space-y-1 pl-2">
          {blockedUsers.length > 0 ? (
            blockedUsers.map((user) => (
              <BlockedUserRow
                key={user.userId}
                user={user}
                onUnblock={setSelectedUser}
              />
            ))
          ) : (
            <p className="py-2 text-sm text-sub-black">
              차단한 유저가 없습니다.
            </p>
          )}
        </div>
      </section>

      <ConfirmModal
        open={selectedUser !== null}
        message={
          selectedUser
            ? `${selectedUser.nickname}님의\n차단을 해제하시겠습니까?`
            : ""
        }
        onCancel={() => setSelectedUser(null)}
        onConfirm={handleUnblock}
        cancelText="취소"
        confirmText="해제"
      />
    </div>
    </>
  );
};

export default BlockedUsersPage;
