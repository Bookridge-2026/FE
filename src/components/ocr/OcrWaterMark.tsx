import mainLogo from "@/assets/main-logo.svg";

interface OcrWatermarkProps {
  userCode: string;
}

export default function OcrWatermark({ userCode }: OcrWatermarkProps) {
  if (!userCode) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="mx-3 my-10 grid h-[130vh] w-[130vw] rotate-[-18deg] grid-cols-2 gap-y-10 opacity-[0.09]">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="flex select-none flex-col items-center justify-center"
          >
            <img src={mainLogo} alt="" className="mb-3 w-[150px]" />
            <div className="text-[22px] font-bold tracking-[0.22em] text-primary">
              {userCode}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}