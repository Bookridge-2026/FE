import { useEffect, useRef } from "react";
import type { CameraViewProps } from "@/types/ocrCreate";

export default function CameraView({ onCapture, onCancel }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error(error);
        alert("카메라 권한을 허용해주세요.");
      }
    };

    startCamera();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext("2d")?.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File([blob], "ocr-image.jpg", {
          type: "image/jpeg",
        });

        const previewUrl = URL.createObjectURL(file);

        onCapture({
          file,
          previewUrl,
        });
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#000000]">
      <video
        ref={videoRef}
        className="w-full flex-1 object-cover"
        autoPlay
        playsInline
        muted
      />

      <button
        type="button"
        onClick={onCancel}
        className="absolute left-4 top-4 rounded-full bg-[#000000]/40 px-3 py-1 text-sm text-white"
      >
        취소
      </button>

      <div className="flex items-center justify-center bg-[#000000] py-6">
        <button
          type="button"
          onClick={handleCapture}
          className="h-[72px] w-[72px] rounded-full border-4 border-white bg-white/30"
          aria-label="사진 촬영"
        />
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

