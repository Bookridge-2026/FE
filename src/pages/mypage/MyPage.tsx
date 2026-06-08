import { useState, useEffect } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { getMyProfile, getMyPageInfo } from '@/api/mypage';
import { updateNickname, updateProfileImage } from '@/api/user';
import type { UserProfile } from '@/types/user';
import ProfileEditModal from '@/components/mypage/ProfileEditModal';
import { setStoredUserCode } from '@/utils/watermark';

const menuItems = [
  { label: '친구 관리', path: '/mypage/friends' },
  { label: '내 방 둘러보기', path: '/mypage/rooms' },
  { label: '내 책 모아보기', path: '/mypage/books' },
  { label: '차단', path: '/mypage/blocked' },
];

const useProfileEdit = (
  profile: UserProfile | null,
  onSuccess: (updated: Partial<UserProfile>) => void
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    setNickname(profile?.nickname ?? '');
    setImageFile(null);
    setImagePreview(profile?.profileImageUrl ?? '');
    setError(null);
    setIsOpen(true);
  };

  const close = () => {
    if (isSubmitting) return;
    setIsOpen(false);
  };

  const handleImageChange = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const updates: Partial<UserProfile> = {};
      const nicknameChanged = nickname.trim() !== profile?.nickname;
      const imageChanged = imageFile !== null;

      if (nicknameChanged) {
        const res = await updateNickname(nickname.trim());
        updates.nickname = res.data.data.nickname;
      }

      if (imageChanged) {
        const res = await updateProfileImage(imageFile!);
        updates.profileImageUrl = res.data.data.profileImageUrl;
      }

      if (nicknameChanged || imageChanged) {
        onSuccess(updates);
      }

      setIsOpen(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    open,
    close,
    nickname,
    setNickname,
    imagePreview,
    handleImageChange,
    handleSubmit,
    isSubmitting,
    error,
  };
};

const MyPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userCode, setUserCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, myPageRes] = await Promise.all([
          getMyProfile(),
          getMyPageInfo(),
        ]);
        setProfile(profileRes.data.data);
        setUserCode(myPageRes.data.user.userCode);
        setStoredUserCode(myPageRes.data.user.userCode);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const profileEdit = useProfileEdit(profile, (updated) => {
    setProfile((prev) => prev ? { ...prev, ...updated } : prev);
  });

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>에러: {error}</p>;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userCode");
    navigate("/", { replace: true });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFFFF]">

      {/* 프로필 영역 */}
      <div className="flex flex-col items-center pt-10 pb-6">

        {/* 프로필 이미지 */}
        <div className="relative">
          <img
            src={profile?.profileImageUrl}
            alt="프로필"
            className="w-32 h-32 rounded-full border-2 border-[#3B2E1E] bg-gray-200 object-cover"
          />

          {/* 수정 버튼 */}
          <button
            className="absolute bottom-1 right-1 w-8 h-8 bg-[#3B2E1E] rounded-full flex items-center justify-center"
            onClick={profileEdit.open}
          >
            <FiEdit2 size={14} color="white" />
          </button>
        </div>

        {/* 이름 */}
        <p className="mt-4 text-lg font-semibold text-[#3B2E1E]">{profile?.nickname}</p>
        {userCode && (
          <p className="mt-1 text-xs text-gray-400">#{userCode}</p>
        )}
      </div>

      {/* 메뉴 목록 */}
      <div className="flex flex-col ">
        {menuItems.map((item, index) => (
          <div key={index}>
            <button
              className="w-full text-left px-6 py-5 text-[#3B2E1E] text-base shadow-sm"
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          </div>
        ))}
      </div>

      {/* 로그아웃 / 회원탈퇴 */}
      <div className="flex justify-center gap-6 mt-8">
        <button
          className="text-sm text-gray-400 underline hover:text-gray-600"
          onClick={handleLogout}
        >
          로그아웃
        </button>
        <button className="text-sm text-gray-400 underline hover:text-gray-600">
          회원탈퇴
        </button>
      </div>

      {/* 프로필 수정 모달 */}
      <ProfileEditModal
        open={profileEdit.isOpen}
        imagePreview={profileEdit.imagePreview}
        nickname={profileEdit.nickname}
        isSubmitting={profileEdit.isSubmitting}
        error={profileEdit.error}
        onClose={profileEdit.close}
        onImageChange={profileEdit.handleImageChange}
        onNicknameChange={profileEdit.setNickname}
        onSubmit={profileEdit.handleSubmit}
      />

    </div>
  );
};

export default MyPage;
