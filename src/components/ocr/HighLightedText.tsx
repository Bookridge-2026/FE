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
    points.add(highlight.startIndex);
    points.add(highlight.endIndex);
  });

  const sortedPoints = [...points].sort((a, b) => a - b);

  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-primary">
      {sortedPoints.map((start, index) => {
        const end = sortedPoints[index + 1];
        if (end === undefined) return null;

        const content = text.slice(start, end);

        const includedHighlights = highlights.filter(
          (highlight) =>
            highlight.startIndex < end && highlight.endIndex > start
        );

        if (includedHighlights.length === 0) {
          return <span key={`${start}-${end}`}>{content}</span>;
        }

        const highlightIds = includedHighlights.map((h) => h.highlightId);
        const isActive = highlightIds.some((id) =>
          activeHighlightIds.includes(id)
        );
        const isOverlapping = includedHighlights.length >= 2;

        const markClass = isOverlapping
          ? isActive
            ? "bg-orange-400/60"
            : "bg-[#FFD7C1]"
          : isActive
            ? "bg-[#FFE085]"
            : "bg-[#FFF2CB]";

        return (
          <mark
            key={`${start}-${end}`}
            className={`cursor-pointer rounded-sm px-[1px] ${markClass}`}
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

