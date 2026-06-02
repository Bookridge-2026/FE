// OCR 페이지 - OCR 텍스트 + 하이라이트 + 메모 보여주기

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import AddMemoModal from "@/components/ocr/AddMemoModal";
import HighlightedText from "@/components/ocr/HighLightedText";
import MemoLayer from "@/components/ocr/MemoLayer";

import {
  createOcrComment,
  createOcrHighlight,
  getOcrComments,
  getOcrPage,
} from "@/api/ocr";

import type {
  OcrHighlight,
  OcrPage as OcrPageType,
} from "@/types/ocr";

interface LocationState {
  ocrPage?: OcrPageType;
}

interface SelectedRange {
  selectedText: string;
  startIndex: number;
  endIndex: number;
  rect: DOMRect;
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

  const startIndex = preRange.toString().length;
  const endIndex = startIndex + selectedText.length;

  if (
    startIndex < 0 ||
    endIndex > fullText.length ||
    startIndex >= endIndex
  ) {
    return null;
  }

  return {
    selectedText,
    startIndex,
    endIndex,
    rect: range.getBoundingClientRect(),
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

  const [highlights, setHighlights] = useState<OcrHighlight[]>(
    state?.ocrPage?.highlights ?? []
  );

  const [loading, setLoading] = useState(!state?.ocrPage);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedRange, setSelectedRange] = useState<SelectedRange | null>(null);

  const [activeHighlightIds, setActiveHighlightIds] = useState<number[]>([]);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [addMemoModalOpen, setAddMemoModalOpen] = useState(false);

  const upsertHighlight = useCallback((newHighlight: OcrHighlight) => {
    setHighlights((prev) => {
      const exists = prev.some(
        (highlight) => highlight.highlightId === newHighlight.highlightId
      );

      if (exists) {
        return prev.map((highlight) =>
          highlight.highlightId === newHighlight.highlightId
            ? newHighlight
            : highlight
        );
      }

      return [...prev, newHighlight];
    });
  }, []);

  useEffect(() => {
    if (!roomId || !ocrPageId) return;

    const fetchOcrPage = async () => {
      try {
        setLoading(true);

        const data = await getOcrPage(Number(roomId), Number(ocrPageId));
        console.log("OCR 페이지 조회 응답:", data);

        setOcrPage(data);
        setHighlights(data.highlights ?? []);
      } catch (error) {
        console.error(error);
        alert("OCR 페이지 조회에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchOcrPage();
  }, [roomId, ocrPageId]);

  // SSE 연결: 이 조회 페이지에서 연결하고, 페이지 이탈 시 close
  useEffect(() => {
    if (!ocrPageId) return;

    const eventSource = new EventSource(
      `/api/ocr/ocrPage/${ocrPageId}/sse`,
      { withCredentials: true }
    );

    eventSource.addEventListener("new-highlight", (e) => {
      const data = JSON.parse(e.data);

      const newHighlight: OcrHighlight = {
        highlightId: data.highlightId,
        ocrPageId: Number(ocrPageId),
        selectedText: data.selectedText,
        startIndex: data.startIndex,
        endIndex: data.endIndex,
        ocrComments: [
          {
            ocrCommentId: data.ocrCommentId,
            content: data.content,
            color: data.color,
            createdAt: data.createdAt,
          },
        ],
      };

      upsertHighlight(newHighlight);
    });

    eventSource.onerror = (error) => {
      console.error("OCR SSE 연결 오류:", error);
    };

    return () => {
      eventSource.close();
    };
  }, [ocrPageId, upsertHighlight]);

  useEffect(() => {
    const closeMemo = (e: Event) => {
      if (
        e.target instanceof Element &&
        e.target.closest("[data-memo-layer]")
      ) {
        return;
      }

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

  const activeHighlights = highlights.filter((highlight) =>
    activeHighlightIds.includes(highlight.highlightId)
  );

  const canAddMemoToActiveHighlight = activeHighlightIds.length === 1;

  const handleSelectionEnd = () => {
    if (!selectMode || !textRef.current || !ocrPage) return;

    setTimeout(() => {
      const range = getSelectionRange(textRef.current!, ocrPage.text);

      if (!range) return;

      setSelectedRange(range);
    }, 0);
  };

  const handleClickHighlightGroup = async (
    highlightIds: number[],
    rect: DOMRect
  ) => {
    if (!roomId) return;

    setActiveHighlightIds(highlightIds);
    setAnchorRect(rect);

    try {
      const results = await Promise.all(
        highlightIds.map((highlightId) =>
          getOcrComments(Number(roomId), highlightId)
        )
      );

      results.forEach((highlight) => {
        upsertHighlight(highlight);
      });
    } catch (error) {
      console.error(error);
      alert("메모 조회에 실패했습니다.");
    }
  };

  const handleCreateHighlight = async (memo: string) => {
    if (!ocrPage || !selectedRange || !roomId) return;

    try {
      const newHighlight = await createOcrHighlight(
        Number(roomId),
        ocrPage.ocrPageId,
        {
          selectedText: selectedRange.selectedText,
          startIndex: selectedRange.startIndex,
          endIndex: selectedRange.endIndex,
          content: memo,
        }
      );

      upsertHighlight(newHighlight);

      setActiveHighlightIds([newHighlight.highlightId]);
      setAnchorRect(selectedRange.rect);

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
    if (!roomId || activeHighlightIds.length !== 1) return;

    const highlightId = activeHighlightIds[0];

    try {
      const updatedHighlight = await createOcrComment(
        Number(roomId),
        highlightId,
        {
          content: memo,
        }
      );

      upsertHighlight(updatedHighlight);

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
    return (
      <div className="p-4 text-sm text-sub-black">OCR 페이지가 없습니다.</div>
    );
  }

  return (
    <div
      className="relative min-h-full p-4 pb-[120px]"
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
          text={ocrPage.text}
          highlights={highlights}
          activeHighlightIds={activeHighlightIds}
          onClickHighlightGroup={handleClickHighlightGroup}
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