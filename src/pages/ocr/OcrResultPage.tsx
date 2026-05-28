// OCR 텍스트 수정 후 저장 페이지

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { BottomButton } from "@/components/common/BottomButton";
import { createOcrPage } from "@/api/ocr";

interface LocationState {
  text: string;
  page: number;
}

const MAX_TEXTAREA_HEIGHT = 480;

export default function OcrDetailPage() {
  const location = useLocation();
  const state = location.state as LocationState | null;

  const navigate = useNavigate();
  const { roomId } = useParams();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [text, setText] = useState(state?.text ?? "");
  const [page] = useState(state?.page ?? 1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!state?.text) {
      navigate(-1);
    }
  }, [state, navigate]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";

    if (textarea.scrollHeight > MAX_TEXTAREA_HEIGHT) {
      textarea.style.height = `${MAX_TEXTAREA_HEIGHT}px`;
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.height = `${textarea.scrollHeight}px`;
      textarea.style.overflowY = "hidden";
    }
  }, [text]);

  const handleSave = async () => {
    if (saving || !roomId || !text.trim()) return;

    try {
      setSaving(true);

      const ocrPage = await createOcrPage(Number(roomId), {
        page,
        ocrText: text,
      });

      navigate(`/rooms/${roomId}/ocr/${ocrPage.ocrPageId}`, {
        state: { ocrPage },
      });
    } catch (error) {
      console.error(error);
      alert("OCR 페이지 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (!state?.text) return null;
  

  return (
    <div className="flex h-[calc(100dvh-var(--header-height)-var(--bottom-bar-height)-32px)] flex-col">
      <textarea
        ref={textareaRef}
        className="min-h-0 flex-1 resize-none rounded-lg border-[1.5px] border-field bg-transparent p-4 text-sm leading-5 text-black outline-none overflow-y-auto"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="추출된 텍스트가 없습니다."
      />

      <div className="mt-6 flex justify-center">
        <BottomButton onClick={handleSave} disabled={!text.trim()}>
          저장
        </BottomButton>
      </div>
    </div>
  );
}

