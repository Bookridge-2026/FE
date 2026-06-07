import { useEffect, useState } from "react";

interface AddMemoModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSave: (memo: string) => void;
}

const MAX_MEMO_LENGTH = 84;

export default function AddMemoModal({
  open,
  title,
  onClose,
  onSave,
}: AddMemoModalProps) {
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (!open) {
      setMemo("");
    }
  }, [open]);

  if (!open) return null;

  const handleClose = () => {
    setMemo("");
    onClose();
  };

  const handleSave = () => {
    const trimmedMemo = memo.trim();

    if (!trimmedMemo) return;

    onSave(trimmedMemo);
    setMemo("");
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="w-[300px] rounded-2xl bg-white px-4 py-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-3 text-sm font-semibold text-primary">{title}</p>

        <textarea
          className="h-[90px] w-full resize-none rounded-xl bg-field p-3 text-sm outline-none"
          placeholder="메모를 입력해주세요"
          maxLength={MAX_MEMO_LENGTH}
          value={memo}
          onChange={(e) => setMemo(e.target.value.slice(0, MAX_MEMO_LENGTH))}
        />

        <div className="text-right text-[11px] text-sub-black">
          {memo.length}/{MAX_MEMO_LENGTH}
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            className="h-10 flex-1 rounded-xl bg-field text-sm text-primary"
            onClick={handleClose}
          >
            취소
          </button>

          <button
            type="button"
            className="h-10 flex-1 rounded-xl bg-primary text-sm text-white disabled:bg-sub-black"
            disabled={!memo.trim()}
            onClick={handleSave}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}