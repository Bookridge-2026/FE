import type { OcrComment, OcrHighlight } from "@/types/ocr";

interface MemoLayerProps {
  activeHighlights: OcrHighlight[];
  anchorRect: DOMRect | null;
}

const APP_WIDTH = 390;
const SIDE_PADDING = 16;
const HEADER_SAFE_TOP = 80;
const BOTTOM_SAFE_BOTTOM = 90;

const MEMO_WIDTH = 110;
const MEMO_HEIGHT = 102;
const GAP = 10;
const MAX_COLUMN_COUNT = 3;
const ROTATION_PADDING = 6;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function MemoLayer({
  activeHighlights,
  anchorRect,
}: MemoLayerProps) {
  if (!anchorRect || activeHighlights.length === 0) return null;

  const groups = activeHighlights.filter(
    (highlight) => (highlight.ocrComments ?? []).length > 0
  );

  if (groups.length === 0) return null;

  const allComments: {
    comment: OcrComment;
    highlight: OcrHighlight;
  }[] = groups.flatMap((highlight) =>
    (highlight.ocrComments ?? []).map((comment) => ({
      comment,
      highlight,
    }))
  );

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const appWidth = Math.min(APP_WIDTH, viewportWidth);
  const appLeft = Math.max((viewportWidth - appWidth) / 2, 0);
  const appRight = appLeft + appWidth;

  // 실제 메모 개수에 따라 열 개수 조정
  const columnCount = Math.min(allComments.length, MAX_COLUMN_COUNT);
  const rowCount = Math.ceil(allComments.length / columnCount);

  const gridWidth =
    columnCount * MEMO_WIDTH + (columnCount - 1) * GAP;

  const gridHeight =
    rowCount * MEMO_HEIGHT + (rowCount - 1) * GAP;

  // 회전된 모서리가 잘리지 않도록 여백 추가
  const groupWidth = gridWidth + ROTATION_PADDING * 2;
  const contentHeight = gridHeight + ROTATION_PADDING * 2;

  const maxContainerHeight =
    viewportHeight - HEADER_SAFE_TOP - BOTTOM_SAFE_BOTTOM - GAP * 2;

  const containerHeight = Math.min(contentHeight, maxContainerHeight);

  const minLeft = appLeft + SIDE_PADDING;
  const maxLeft = appRight - SIDE_PADDING - groupWidth;

  const wantedLeft =
    anchorRect.left + anchorRect.width / 2 - groupWidth / 2;

  const groupLeft =
    maxLeft < minLeft
      ? Math.max((viewportWidth - groupWidth) / 2, 0)
      : clamp(wantedLeft, minLeft, maxLeft);

  const bottomSpace =
    viewportHeight - BOTTOM_SAFE_BOTTOM - anchorRect.bottom - GAP;

  const topSpace =
    anchorRect.top - HEADER_SAFE_TOP - GAP;

  const shouldShowBottom =
    bottomSpace >= containerHeight || bottomSpace >= topSpace;

  const wantedTop = shouldShowBottom
    ? anchorRect.bottom + GAP
    : anchorRect.top - containerHeight - GAP;

  const minTop = HEADER_SAFE_TOP;
  const maxTop =
    viewportHeight - BOTTOM_SAFE_BOTTOM - containerHeight;

  const containerTop = clamp(wantedTop, minTop, maxTop);

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none">
      <div
        data-memo-layer
        className="pointer-events-auto absolute overflow-y-auto"
        style={{
          left: groupLeft,
          top: containerTop,
          width: groupWidth,
          height: containerHeight,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="relative" style={{ height: contentHeight }}>
          {allComments.map(({ comment }, index) => {
            const col = index % columnCount;
            const row = Math.floor(index / columnCount);

            return (
              <div
                key={comment.ocrCommentId}
                className="absolute overflow-hidden rounded-lg shadow-md"
                style={{
                  left:
                    ROTATION_PADDING +
                    col * (MEMO_WIDTH + GAP),
                  top:
                    ROTATION_PADDING +
                    row * (MEMO_HEIGHT + GAP),
                  width: MEMO_WIDTH,
                  height: MEMO_HEIGHT,
                  backgroundColor: comment.color,
                  transform: `rotate(${
                    index % 2 === 0 ? -3 : 3
                  }deg)`,
                }}
              >
                <div className="p-2" style={{ height: MEMO_HEIGHT }}>
                  <p className="line-clamp-7 break-words text-[9px] leading-snug text-primary">
                    {comment.content}
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

