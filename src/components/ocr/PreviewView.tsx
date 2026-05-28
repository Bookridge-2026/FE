import type { PreviewViewProps } from "@/types/ocrCreate";

export default function PreviewView({
  imageSrc,
  onRetake,
  onExtract,
}: PreviewViewProps) {
  return (
    <div className="fixed inset-0 flex flex-col bg-[#000000]">
      <div className="flex items-center justify-between bg-[#000000] px-4 py-3">
        <button
          type="button"
          onClick={onRetake}
          className="rounded-[10px] px-4 py-2 text-sm font-normal text-black bg-main"
        >
          다시 찍기
        </button>

        <button
          type="button"
          onClick={onExtract}
          className="rounded-[10px] bg-black px-4 py-2 text-sm font-normal text-main"
        >
          텍스트 추출하기
        </button>
      </div>

      <img
        src={imageSrc}
        alt="촬영된 사진"
        className="w-full flex-1 bg-[#000000] object-contain"
      />
    </div>
  );
}
