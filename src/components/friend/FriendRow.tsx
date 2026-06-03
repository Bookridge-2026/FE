import type { FriendItem } from "@/types/friend.ts";

interface FriendRowProps {
  friend: FriendItem;
  onDelete: (friend: FriendItem) => void;
  onBlock: (friend: FriendItem) => void;
}

export const FriendRow = ({ friend, onDelete, onBlock }: FriendRowProps) => {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-black">{friend.nickname}</span>

      <div className="flex gap-2">
        <button
          type="button"
          className="h-8 rounded-lg bg-black px-3 text-sm text-main"
          onClick={() => onDelete(friend)}
        >
          삭제
        </button>

        <button
          type="button"
          className="h-8 rounded-lg bg-black px-3 text-sm text-main"
          onClick={() => onBlock(friend)}
        >
          차단
        </button>
      </div>
    </div>
  );
};