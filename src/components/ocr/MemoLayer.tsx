// 메모지 위치 배치 - 메모지 많아지면 지금 헤더까지 올라가는데 이거 개수 제한 둘지 아니면
// 메모지 스크롤 컨테이너 만들어서 그 안에서 스크롤하게 할지 고민

import type { OcrHighlight, OcrMemo } from "@/types/ocr";

interface MemoLayerProps {
  activeHighlights: OcrHighlight[];
  anchorRect: DOMRect | null;
}

const APP_WIDTH = 390;
const SIDE_PADDING = 16;
const HEADER_SAFE_TOP = 104;
const BOTTOM_SAFE_BOTTOM = 96;

const MEMO_WIDTH = 110;
const MEMO_HEIGHT = 102;
const GAP = 8;
const COLUMN_COUNT = 3;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function MemoLayer({ activeHighlights, anchorRect }: MemoLayerProps) {
  if (!anchorRect || activeHighlights.length === 0) return null;

  const groups = activeHighlights.filter((h) => h.memos.length > 0);
  if (groups.length === 0) return null;

  const allMemos: { memo: OcrMemo; highlight: OcrHighlight }[] = groups.flatMap(
    (h) => h.memos.map((m) => ({ memo: m, highlight: h }))
  );

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const appLeft = Math.max((viewportWidth - APP_WIDTH) / 2, 0);
  const appRight = appLeft + APP_WIDTH;

  const layoutCount = allMemos.length <= 2 ? allMemos.length : allMemos.length + 1;
  const rowCount = Math.ceil(layoutCount / COLUMN_COUNT);

  const groupWidth = COLUMN_COUNT * MEMO_WIDTH + (COLUMN_COUNT - 1) * GAP;

  // 실제 콘텐츠 높이 (스크롤 컨테이너 내부)
  const contentHeight = rowCount * MEMO_HEIGHT + (rowCount - 1) * GAP;

  // 컨테이너가 차지할 수 있는 최대 높이: 헤더 ~ 바텀바 사이
  const maxContainerHeight = viewportHeight - HEADER_SAFE_TOP - BOTTOM_SAFE_BOTTOM - GAP * 2;

  // 실제 컨테이너 높이 (콘텐츠가 작으면 딱 맞게, 크면 maxHeight로 제한)
  const containerHeight = Math.min(contentHeight, maxContainerHeight);

  const minLeft = appLeft + SIDE_PADDING;
  const maxLeft = appRight - SIDE_PADDING - groupWidth;
  const wantedLeft = anchorRect.left + anchorRect.width / 2 - groupWidth / 2;
  const groupLeft = clamp(wantedLeft, minLeft, maxLeft);

  const bottomSpace = viewportHeight - BOTTOM_SAFE_BOTTOM - anchorRect.bottom - GAP;
  const topSpace = anchorRect.top - HEADER_SAFE_TOP - GAP;
  const shouldShowBottom = bottomSpace >= containerHeight || bottomSpace >= topSpace;

  // 컨테이너 top 좌표
  const wantedTop = shouldShowBottom
    ? anchorRect.bottom + GAP
    : anchorRect.top - containerHeight - GAP;

  const minTop = HEADER_SAFE_TOP;
  const maxTop = viewportHeight - BOTTOM_SAFE_BOTTOM - containerHeight;
  const containerTop = clamp(wantedTop, minTop, maxTop);

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none">
      {/* 스크롤 가능한 컨테이너 */}
      <div
        className="pointer-events-auto absolute overflow-y-auto"
        style={{
          left: groupLeft,
          top: containerTop,
          width: groupWidth,
          height: containerHeight,
          // 스크롤바 숨기기
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* 실제 메모 배치 영역 */}
        <div
          className="relative"
          style={{ height: contentHeight }}
        >
          {allMemos.map(({ memo, highlight }, index) => {
            const layoutIndex = index < 2 ? index : index + 1;
            const col = layoutIndex % COLUMN_COUNT;
            const row = Math.floor(layoutIndex / COLUMN_COUNT);

            return (
              <div
                key={memo.memoId}
                className="absolute overflow-hidden rounded-lg shadow-md"
                style={{
                  left: col * (MEMO_WIDTH + GAP),
                  top: row * (MEMO_HEIGHT + GAP),
                  width: MEMO_WIDTH,
                  height: MEMO_HEIGHT,
                  backgroundColor: memo.color,
                  transform: `rotate(${index % 2 === 0 ? -3 : 3}deg)`,
                }}
              >
                <div className="p-2" style={{ height: MEMO_HEIGHT }}>
                  <p className="line-clamp-7 break-words text-[9px] leading-snug text-black">
                    {memo.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

