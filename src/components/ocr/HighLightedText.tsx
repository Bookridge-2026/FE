import type { OcrHighlight } from "@/types/ocr";

interface HighlightedTextProps {
  text: string;
  highlights: OcrHighlight[];
  activeHighlightIds: number[];
  onClickHighlightGroup: (highlightIds: number[], rect: DOMRect) => void;
}

export default function HighlightedText({
  text,
  highlights,
  activeHighlightIds,
  onClickHighlightGroup,
}: HighlightedTextProps) {
  const points = new Set<number>();

  points.add(0);
  points.add(text.length);

  highlights.forEach((highlight) => {
    points.add(highlight.startOffset);
    points.add(highlight.endOffset);
  });

  const sortedPoints = [...points].sort((a, b) => a - b);

  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-black">
      {sortedPoints.map((start, index) => {
        const end = sortedPoints[index + 1];
        if (end === undefined) return null;

        const content = text.slice(start, end);

        const includedHighlights = highlights.filter(
          (highlight) =>
            highlight.startOffset < end && highlight.endOffset > start
        );

        if (includedHighlights.length === 0) {
          return <span key={`${start}-${end}`}>{content}</span>;
        }

        const highlightIds = includedHighlights.map(
          (highlight) => highlight.highlightId
        );

        const isActive = highlightIds.some((id) =>
          activeHighlightIds.includes(id)
        );

        return (
          <mark
            key={`${start}-${end}`}
            className={`cursor-pointer rounded-sm px-[1px] ${
              isActive ? "bg-yellow-400/70" : "bg-yellow-200/50"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onClickHighlightGroup(
                highlightIds,
                e.currentTarget.getBoundingClientRect()
              );
            }}
          >
            {content}
          </mark>
        );
      })}
    </p>
  );
}