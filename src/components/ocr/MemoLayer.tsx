// 메모지 위치 배치

import type { OcrMemo } from "@/types/ocr";

interface MemoLayerProps {
  memos: OcrMemo[];
  anchorRect: DOMRect | null;
}

const APP_WIDTH = 390;
const SIDE_PADDING = 16;
const HEADER_SAFE_TOP = 104;
const BOTTOM_SAFE_BOTTOM = 96;

const MEMO_WIDTH = 120;
const MEMO_HEIGHT = 112;
const GAP = 10;

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export default function MemoLayer({ memos, anchorRect }: MemoLayerProps) {
  if (!anchorRect || memos.length === 0) return null;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const appLeft = Math.max((viewportWidth - APP_WIDTH) / 2, 0);
  const appRight = appLeft + APP_WIDTH;

  const minLeft = appLeft + SIDE_PADDING;
  const maxLeft = appRight - SIDE_PADDING - MEMO_WIDTH;

  const canShowBottom =
    anchorRect.bottom + GAP + MEMO_HEIGHT <
    viewportHeight - BOTTOM_SAFE_BOTTOM;

  const baseTop = canShowBottom
    ? anchorRect.bottom + GAP
    : anchorRect.top - MEMO_HEIGHT - GAP;

  const safeBaseTop = clamp(
    baseTop,
    HEADER_SAFE_TOP,
    viewportHeight - BOTTOM_SAFE_BOTTOM - MEMO_HEIGHT
  );

  const baseLeft = clamp(anchorRect.left, minLeft, maxLeft);

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none">
      {memos.map((memo, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);

        const wantedLeft = baseLeft + col * (MEMO_WIDTH + GAP);
        const wantedTop = safeBaseTop + row * (MEMO_HEIGHT + GAP);

        const left = clamp(wantedLeft, minLeft, maxLeft);
        const top = clamp(
          wantedTop,
          HEADER_SAFE_TOP,
          viewportHeight - BOTTOM_SAFE_BOTTOM - MEMO_HEIGHT
        );

        return (
          <div
            key={memo.memoId}
            className="pointer-events-auto absolute h-[112px] w-[120px] overflow-hidden rounded-lg p-2 text-[10px] leading-snug text-black shadow-md"
            style={{
              left,
              top,
              backgroundColor: memo.color,
              transform: `rotate(${index % 2 === 0 ? -3 : 3}deg)`,
            }}
          >
            <p className="line-clamp-7 break-words">{memo.content}</p>
          </div>
        );
      })}
    </div>
  );
}