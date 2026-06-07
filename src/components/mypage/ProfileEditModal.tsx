import { useRef } from "react";
import { FiCamera } from "react-icons/fi";

interface ProfileEditModalProps {
  open: boolean;
  imagePreview: string;
  nickname: string;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onImageChange: (file: File) => void;
  onNicknameChange: (value: string) => void;
  onSubmit: () => void;
}

const ProfileEditModal = ({
  open,
  imagePreview,
  nickname,
  isSubmitting,
  error,
  onClose,
  onImageChange,
  onNicknameChange,
  onSubmit,
}: ProfileEditModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageChange(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[320px] rounded-2xl bg-white px-6 py-7 shadow-xl flex flex-col items-center gap-5">

        <h2 className="text-base font-semibold text-[#3B2E1E]">프로필 수정</h2>

        {/* 프로필 이미지 */}
        <div
          className="relative cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <img
            src={imagePreview}
            alt="프로필 미리보기"
            className="w-24 h-24 rounded-full border-2 border-[#3B2E1E] bg-gray-200 object-cover"
          />
          <div className="absolute bottom-1 right-1 w-7 h-7 bg-[#3B2E1E] rounded-full flex items-center justify-center">
            <FiCamera size={13} color="white" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* 닉네임 입력 */}
        <div className="w-full flex flex-col gap-1">
          <label className="text-xs text-[#3B2E1E] font-medium">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            className="w-full rounded-xl border border-[#D6CEC5] bg-[#F5F1EC] px-4 py-2 text-sm text-[#3B2E1E] outline-none focus:border-[#3B2E1E]"
            placeholder="닉네임을 입력하세요"
            maxLength={20}
          />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <p className="text-xs text-red-500 self-start -mt-2">{error}</p>
        )}

        {/* 버튼 */}
        <div className="flex gap-3 w-full mt-1">
          <button
            type="button"
            className="flex-1 h-10 rounded-xl bg-[#F5F1EC] text-sm font-medium text-[#3B2E1E]"
            onClick={onClose}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            type="button"
            className="flex-1 h-10 rounded-xl bg-[#3B2E1E] text-sm font-medium text-white disabled:opacity-50"
            onClick={onSubmit}
            disabled={isSubmitting || !nickname.trim()}
          >
            {isSubmitting ? "저장 중..." : "변경하기"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProfileEditModal;
