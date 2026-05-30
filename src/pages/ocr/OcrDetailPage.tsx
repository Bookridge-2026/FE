// OCR 페이지 - OCR 텍스트 + 하이라이트 + 메모 보여주기

import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import AddMemoModal from "@/components/ocr/AddMemoModal";
import HighlightedText from "@/components/ocr/HighLightedText";
import MemoLayer from "@/components/ocr/MemoLayer";

import {
  createOcrHighlight,
  createOcrMemo,
  getOcrPage,
} from "@/api/ocr";

import type { OcrPage as OcrPageType } from "@/types/ocr";

interface LocationState {
  ocrPage?: OcrPageType;
}

interface SelectedRange {
  selectedText: string;
  startOffset: number;
  endOffset: number;
}

const getSelectionRange = (
  container: HTMLElement,
  fullText: string
): SelectedRange | null => {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return null;

  const selectedText = selection.toString();

  if (!selectedText.trim()) return null;

  const range = selection.getRangeAt(0);

  if (!container.contains(range.commonAncestorContainer)) return null;

  const preRange = document.createRange();
  preRange.selectNodeContents(container);
  preRange.setEnd(range.startContainer, range.startOffset);

  const startOffset = preRange.toString().length;
  const endOffset = startOffset + selectedText.length;

  if (
    startOffset < 0 ||
    endOffset > fullText.length ||
    startOffset >= endOffset
  ) {
    return null;
  }

  return {
    selectedText,
    startOffset,
    endOffset,
  };
};

export default function OcrDetailPage() {
  const { roomId, ocrPageId } = useParams();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const textRef = useRef<HTMLDivElement>(null);

  const [ocrPage, setOcrPage] = useState<OcrPageType | null>(
    state?.ocrPage ?? null
  );

  const [loading, setLoading] = useState(!state?.ocrPage);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedRange, setSelectedRange] = useState<SelectedRange | null>(null);

  const [activeHighlightIds, setActiveHighlightIds] = useState<number[]>([]);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [addMemoModalOpen, setAddMemoModalOpen] = useState(false);

  useEffect(() => {
    if (ocrPage || !roomId || !ocrPageId) return;

    const fetchOcrPage = async () => {
      try {
        setLoading(true);

        const data = await getOcrPage(Number(roomId), Number(ocrPageId));
        setOcrPage(data);
      } catch (error) {
        console.error(error);
        alert("OCR 페이지 조회에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchOcrPage();
  }, [ocrPage, roomId, ocrPageId]);

    useEffect(() => {
    const closeMemo = (e: Event) => {
        // MemoLayer 내부 스크롤이면 무시
        if (e.target instanceof Element && e.target.closest("[data-memo-layer]")) return;
        if (!createModalOpen && !addMemoModalOpen) {
        setActiveHighlightIds([]);
        setAnchorRect(null);
        }
    };
    window.addEventListener("scroll", closeMemo, true);
    return () => {
        window.removeEventListener("scroll", closeMemo, true);
    };
    }, [createModalOpen, addMemoModalOpen]);

  const highlights = ocrPage?.highlights ?? [];

  const activeHighlights = highlights.filter((highlight) =>
    activeHighlightIds.includes(highlight.highlightId)
    );

  // const activeMemos: OcrMemo[] = activeHighlights.flatMap(
  //   (highlight) => highlight.memos ?? []
  // );

  const canAddMemoToActiveHighlight = activeHighlightIds.length === 1;

  const handleSelectionEnd = () => {
    if (!selectMode || !textRef.current || !ocrPage) return;

    setTimeout(() => {
      const range = getSelectionRange(textRef.current!, ocrPage.ocrText);

      if (!range) return;

      setSelectedRange(range);
    }, 0);
  };

  const handleCreateHighlight = async (memo: string) => {
    if (!ocrPage || !selectedRange) return;

    try {
      const newHighlight = await createOcrHighlight(ocrPage.ocrPageId, {
        selectedText: selectedRange.selectedText,
        startOffset: selectedRange.startOffset,
        endOffset: selectedRange.endOffset,
        memoContent: memo,
      });

      setOcrPage({
        ...ocrPage,
        highlights: [...(ocrPage.highlights ?? []), newHighlight],
        });

      setActiveHighlightIds([newHighlight.highlightId]);
      setCreateModalOpen(false);
      setSelectMode(false);
      setSelectedRange(null);
      window.getSelection()?.removeAllRanges();
    } catch (error) {
      console.error(error);
      alert("하이라이트 저장에 실패했습니다.");
    }
  };

  const handleAddMemo = async (memo: string) => {
    if (!ocrPage || activeHighlightIds.length !== 1) return;

    const highlightId = activeHighlightIds[0];

    try {
      const newMemo = await createOcrMemo(highlightId, {
        memoContent: memo,
      });

      setOcrPage({
        ...ocrPage,
        highlights: (ocrPage.highlights ?? []).map((highlight) =>
            highlight.highlightId === highlightId
            ? {
                ...highlight,
                memos: [...(highlight.memos ?? []), newMemo],
                }
            : highlight
        ),
        });

      setAddMemoModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("메모 추가에 실패했습니다.");
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-sub-black">불러오는 중...</div>;
  }

  if (!ocrPage) {
    return <div className="p-4 text-sm text-sub-black">OCR 페이지가 없습니다.</div>;
  }

  return (
    <div
      className="relative p-4 min-h-full pb-[120px]"
      onClick={() => {
        if (!selectMode && !createModalOpen && !addMemoModalOpen) {
          setActiveHighlightIds([]);
          setAnchorRect(null);
        }
      }}
    >
      <div className="mb-2 flex justify-end">
        {selectMode ? (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="rounded-lg border-[2px] border-field bg-main px-3 py-2 text-sm text-black"
              onClick={() => {
                setSelectMode(false);
                setSelectedRange(null);
                window.getSelection()?.removeAllRanges();
              }}
            >
              취소
            </button>

            <button
              type="button"
              className="rounded-lg bg-black px-3 py-2 text-sm text-white disabled:bg-sub-black"
              disabled={!selectedRange}
              onClick={() => setCreateModalOpen(true)}
            >
              선택 완료
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="rounded-lg border-[2px] border-field bg-main px-3 py-2 text-sm text-black disabled:opacity-40"
            disabled={activeHighlightIds.length > 1}
            onClick={(e) => {
              e.stopPropagation();

              if (canAddMemoToActiveHighlight) {
                setAddMemoModalOpen(true);
                return;
              }

              setSelectMode(true);
              setSelectedRange(null);
              setActiveHighlightIds([]);
              setAnchorRect(null);
              window.getSelection()?.removeAllRanges();
            }}
          >
            {canAddMemoToActiveHighlight ? "이어서 반응 추가" : "새 반응 추가"}
          </button>
        )}
      </div>

      <div
        ref={textRef}
        className={selectMode ? "select-text touch-auto" : "select-none"}
        onMouseUp={handleSelectionEnd}
        onTouchEnd={handleSelectionEnd}
        onClick={(e) => {
            if (selectMode) return;
            e.stopPropagation();
            setActiveHighlightIds([]);
            setAnchorRect(null);
        }}
        >
        <HighlightedText
            text={ocrPage.ocrText}
            highlights={highlights}
            activeHighlightIds={activeHighlightIds}
            onClickHighlightGroup={(highlightIds, rect) => {
            setActiveHighlightIds(highlightIds);
            setAnchorRect(rect);
            }}
        />
        </div>

      <MemoLayer activeHighlights={activeHighlights} anchorRect={anchorRect} />

      <AddMemoModal
        open={createModalOpen}
        title="새 구절에 메모 남기기"
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateHighlight}
      />

      <AddMemoModal
        open={addMemoModalOpen}
        title="기존 구절에 메모 추가하기"
        onClose={() => setAddMemoModalOpen(false)}
        onSave={handleAddMemo}
      />
    </div>
  );
}