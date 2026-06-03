interface ConfirmModalProps {
  open: boolean;
  message: string;
  onCancel: () => void;
  onConfirm?: () => void;
  cancelText?: string;
  confirmText?: string;
  showConfirm?: boolean;
}

export const ConfirmModal = ({
  open,
  message,
  onCancel,
  onConfirm,
  cancelText = "취소",
  confirmText = "확인",
  showConfirm = true,
}: ConfirmModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[280px] rounded-2xl bg-white px-6 py-8 shadow-xl">
        <div className="mt-2 flex flex-col items-center gap-7">
          <p className="whitespace-pre-line text-center text-base font-semibold text-black">
            {message}
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              className="h-10 w-[100px] rounded-xl bg-field text-base font-normal text-black"
              onClick={onCancel}
            >
              {cancelText}
            </button>

            {showConfirm && (
              <button
                type="button"
                className="h-10 w-[100px] rounded-xl bg-black text-base font-normal text-white"
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};