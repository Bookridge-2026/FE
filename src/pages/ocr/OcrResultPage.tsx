// OCR 텍스트 수정 후 저장 페이지

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { BottomButton } from "@/components/common/BottomButton";
import OcrWatermark from "@/components/ocr/OcrWaterMark";
import { createOcrPage } from "@/api/ocr";
import { getStoredUserCode, setStoredUserCode } from "@/utils/watermark";
import { getMyPageInfo } from "@/api/mypage";
import backButtonIcon from "@/assets/common/back-button.svg";

interface LocationState {
  text: string;
  page: number;
}

const MAX_TEXTAREA_HEIGHT = 480;

export default function OcrResultPage() {
  const location = useLocation();
  const state = location.state as LocationState | null;

  const navigate = useNavigate();
  const { roomId } = useParams();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [text, setText] = useState(state?.text ?? "");
  const [page] = useState(state?.page ?? 1);
  const [saving, setSaving] = useState(false);
  const [userCode, setUserCode] = useState("");

  useEffect(() => {
    const storedCode = getStoredUserCode();

    if (storedCode) {
      setUserCode(storedCode);
      return;
    }

    const fetchUserCode = async () => {
      try {
        const response = await getMyPageInfo();
        const code = response.data.user.userCode;

        if (!code) return;

        setStoredUserCode(code);
        setUserCode(code);
      } catch (error) {
        console.error("워터마크 userCode 조회 실패:", error);
      }
    };

    fetchUserCode();
  }, []);

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
        text,
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
    <div className="flex h-[calc(100dvh-var(--bottom-bar-height))] flex-col bg-white">
      <header className="fixed top-0 left-1/2 z-50 flex h-[80px] w-full max-w-[390px] -translate-x-1/2 items-center bg-main px-4 box-border">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="이전으로 가기"
          className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
        >
          <img src={backButtonIcon} alt="" className="block h-[24px] w-[24px]" />
        </button>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[17px] font-semibold text-primary">
          OCR
        </div>
      </header>

      <main className="relative flex flex-1 flex-col overflow-hidden p-4 pt-[96px] pb-[16px]">
        <OcrWatermark userCode={userCode} />

        <textarea
          ref={textareaRef}
          className="relative z-10 min-h-0 flex-1 resize-none rounded-lg border-[1.5px] border-field p-4 text-sm leading-5 text-primary outline-none overflow-y-auto"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="추출된 텍스트가 없습니다."
        />

        <div className="relative z-10 mt-3 flex justify-center">
          <BottomButton onClick={handleSave} disabled={!text.trim()}>
            저장
          </BottomButton>
        </div>
      </main>
    </div>
  );
}

