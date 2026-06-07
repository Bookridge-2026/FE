import { useNavigate } from "react-router-dom";
import type { FriendRequestItem } from "@/types/friend.ts";

interface FriendRequestRowProps {
  request: FriendRequestItem;
  onAccept: (request: FriendRequestItem) => void;
  onReject: (request: FriendRequestItem) => void;
}

export const FriendRequestRow = ({
  request,
  onAccept,
  onReject,
}: FriendRequestRowProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between py-2">
      <span
        className="text-base font-semibold text-primary cursor-pointer hover:underline"
        onClick={() => navigate(`/users/${request.sender.userId}`)}
      >
        {request.sender.nickname}
      </span>

      <div className="flex gap-2">
        <button
          type="button"
          className="h-8 rounded-lg bg-primary px-3 text-sm text-main"
          onClick={() => onAccept(request)}
        >
          수락
        </button>

        <button
          type="button"
          className="h-8 rounded-lg bg-primary px-3 text-sm text-main"
          onClick={() => onReject(request)}
        >
          거절
        </button>
      </div>
    </div>
  );
};