interface ConfirmModalProps {
  open: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
}

export const ConfirmModal = ({
  open,
  message,
  onCancel,
  onConfirm,
  cancelText = "취소",
  confirmText = "확인",
}: ConfirmModalProps) => {
  if (!open) return null;

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="w-[280px] rounded-2xl bg-white px-4 py-6 shadow-xl">
        <div className="flex flex-col items-center gap-5 mt-2">
            <p className="text-center text-base font-semibold text-primary whitespace-pre-line">
            {message}
            </p>

            <div className="flex gap-3">
            <button
                type="button"
                className="h-10 w-[100px] rounded-xl bg-field text-base font-normal text-primary"
                onClick={onCancel}>
                {cancelText}
            </button>

            <button
                type="button"
                className="h-10 w-[100px] rounded-xl bg-primary text-base font-normal text-white"
                onClick={onConfirm}>
                {confirmText}
            </button>
            </div>
        </div>
        </div>
  </div>
);
};
