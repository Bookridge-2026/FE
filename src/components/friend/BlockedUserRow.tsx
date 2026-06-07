import type { BlockedUser } from "@/types/block.ts";

interface BlockedUserRowProps {
  user: BlockedUser;
  onUnblock: (user: BlockedUser) => void;
}

export const BlockedUserRow = ({ user, onUnblock }: BlockedUserRowProps) => {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-base font-semibold text-primary">{user.nickname}</span>

      <button
        type="button"
        className="h-8 rounded-lg bg-primary px-3 text-sm text-main"
        onClick={() => onUnblock(user)}
      >
        해제
      </button>
    </div>
  );
};