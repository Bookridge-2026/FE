import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface AddReactionModalProps {
  open: boolean;
  currentPage: number;
  totalPages: number;
  onClose: () => void;
  onSelectOCR: (page: number) => void;
  onSelectComment: (page: number) => void;
  onSelectEmoji: (page: number) => void;
}

export default function AddReactionModal({
  open,
  currentPage,
  totalPages,
  onClose,
  onSelectOCR,
  onSelectComment,
  onSelectEmoji,
}: AddReactionModalProps) {
  const navigate = useNavigate();
  const { roomId } = useParams();

  const [selectedPage, setSelectedPage] = useState(currentPage);
  const [pageInput, setPageInput] = useState(String(currentPage));

  useEffect(() => {
    if (open) {
      setSelectedPage(currentPage);
      setPageInput(String(currentPage));
    }
  }, [open, currentPage]);

  if (!open) return null;

  const handleChangePage = () => {
    const page = Number(pageInput);

    if (!Number.isInteger(page) || page < 1 || page > totalPages) {
      setPageInput(String(selectedPage));
      return;
    }

    setSelectedPage(page);
    setPageInput(String(page));
  };

  const handleOCR = () => {
    handleChangePage();

    const page = Number(pageInput);

    if (!Number.isInteger(page) || page < 1 || page > totalPages) return;

    if (roomId) {
      navigate(`/rooms/${roomId}/ocr/create?page=${page}`);
      return;
    }

    onSelectOCR(page);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-[300px] rounded-2xl bg-white px-4 py-7 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-[50px] items-center rounded-[16px] bg-field px-2">
            <input
              value={pageInput}
              onChange={(e) =>
                setPageInput(e.target.value.replace(/[^0-9]/g, ""))
              }
              onBlur={handleChangePage}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleChangePage();
                  e.currentTarget.blur();
                }
              }}
              className="w-[36px] bg-transparent text-center text-base font-semibold text-primary outline-none"
            />
            <span className="text-sm font-semibold text-sub-black">
              / {totalPages}p
            </span>
          </div>

          <p className="text-base font-semibold text-primary">
            에 어떤 반응을 남길까요?
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleOCR}
            className="h-[40px] flex-1 rounded-[10px] bg-primary text-base font-normal text-white"
          >
            OCR
          </button>

          <button
            type="button"
            onClick={() => {
              handleChangePage();
              const page = Number(pageInput);
              if (!Number.isInteger(page) || page < 1 || page > totalPages) return;
              onSelectComment(page);
            }}
            className="h-[40px] flex-1 rounded-[10px] bg-primary text-base font-normal text-white"
          >
            코멘트
          </button>

          <button
            type="button"
            onClick={() => {
              handleChangePage();
              const page = Number(pageInput);
              if (!Number.isInteger(page) || page < 1 || page > totalPages) return;
              onSelectEmoji(page);
            }}
            className="h-[40px] flex-1 rounded-[10px] bg-primary text-base font-normal text-white"
          >
            이모지
          </button>
        </div>
      </div>
    </div>
  );
}