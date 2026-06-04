import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import backButtonIcon from "@/assets/common/back-button.svg";
import { getUserProfile } from "@/api/friend";
import { sendFriendRequest } from "@/api/friend";
import type { UserProfile } from "@/types/friend.ts";
import { UserBookStack } from "@/components/friend/UserBookStack";
import { useToastContext } from "@/components/common/ToastProvider";

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { show } = useToastContext();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const data = await getUserProfile(Number(userId));

      if (data.isBlocked || data.friendStatus === "BLOCKED") {
        show("접근할 수 없는 사용자입니다.");
        navigate(-1);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error(error);
      show("프로필을 불러오지 못했습니다.");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const friendButtonText = useMemo(() => {
    if (!profile) return "";

    switch (profile.friendStatus) {
      case "ME":
        return "나";
      case "FRIENDS":
        return "친구";
      case "REQUEST_SENT":
        return "요청 보냄";
      case "REQUEST_RECEIVED":
        return "요청 받음";
      case "NONE":
      default:
        return "친구 추가";
    }
  }, [profile]);

  const canSendRequest = profile?.friendStatus === "NONE";

  const handleFriendButtonClick = async () => {
    if (!profile || !canSendRequest) return;

    try {
      await sendFriendRequest(profile.userId);

      show("친구 요청을 보냈습니다.");

      setProfile({
        ...profile,
        friendStatus: "REQUEST_SENT",
      });
    } catch (error) {
      console.error(error);
      show("친구 요청에 실패했습니다.");
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-sub-black">불러오는 중...</div>;
  }

  if (!profile) return null;

  return (
    <div className="flex min-h-[calc(100dvh-var(--bottom-bar-height))] flex-col bg-white">
      <header className="relative flex h-[80px] items-center bg-main px-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="이전으로 가기"
          className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center justify-center"
        >
          <img src={backButtonIcon} alt="" className="h-[24px] w-[24px]" />
        </button>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[17px] font-semibold text-black">
          프로필
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="mt-12 flex flex-col items-center px-6">
          <img
            src={profile.profileImageUrl ?? ""}
            onError={(e) => {
              e.currentTarget.src = "";
            }}
            alt={`${profile.nickname} 프로필`}
            className="h-24 w-24 rounded-full border-1 border-field object-cover"
          />

          <p className="mt-3 text-lg font-semibold text-black">
            {profile.nickname}
          </p>

          <p className="text-sm text-sub-black">
            @{profile.userCode}
          </p>

          <button
            type="button"
            disabled={!canSendRequest}
            onClick={handleFriendButtonClick}
            className="mt-3 rounded-xl bg-black px-2 py-2 text-xs font-normal text-white disabled:bg-field disabled:text-sub-black"
          >
            {friendButtonText}
          </button>

          <p className="mt-3 mb-4 text-center text-sm leading-relaxed text-[#3B2E1E]">
            {profile.recentBookTitle
              ? `「${profile.recentBookTitle}」을 읽고 있어요.`
              : "아직 진행 중인 책이 없습니다."}
          </p>
        </section>

        <UserBookStack books={profile.books} />
      </main>
    </div>
  );
};

export default UserProfilePage;
