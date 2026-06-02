import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import CameraView from "@/components/ocr/CameraView";
import PreviewView from "@/components/ocr/PreviewView";
import LoadingView from "@/components/ocr/LoadingView";

import { ocrExtract } from "@/api/ocr";
import type { CapturedImage, OcrStep } from "@/types/ocrCreate";

export default function OcrCreatePage() {
  const [step, setStep] = useState<OcrStep>("camera");
  const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);

  const navigate = useNavigate();
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);

  const handleCapture = (image: CapturedImage) => {
    if (capturedImage?.previewUrl) {
      URL.revokeObjectURL(capturedImage.previewUrl);
    }

    setCapturedImage(image);
    setStep("preview");
  };

  const handleRetake = () => {
    if (capturedImage?.previewUrl) {
      URL.revokeObjectURL(capturedImage.previewUrl);
    }

    setCapturedImage(null);
    setStep("camera");
  };

  const handleExtract = async () => {
    if (!capturedImage) return;

    try {
      setStep("loading");

      const { text } = await ocrExtract(capturedImage.file);

      navigate(`/rooms/${roomId}/ocr/result`, {
        state: {
          text,
          page,
          imageUrl: capturedImage.previewUrl,
        },
      });
    } catch (error) {
      console.error(error);
      alert("OCR 추출에 실패했습니다.");
      setStep("preview");
    }
  };

  if (step === "camera") {
    return <CameraView onCapture={handleCapture} onCancel={() => navigate(-1)} />;
  }

  if (step === "preview" && capturedImage) {
    return (
      <PreviewView
        imageSrc={capturedImage.previewUrl}
        onRetake={handleRetake}
        onExtract={handleExtract}
      />
    );
  }

  return <LoadingView />;
}