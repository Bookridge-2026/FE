export type OcrStep = "camera" | "preview" | "loading";

export interface CapturedImage {
  file: File;
  previewUrl: string;
}

export interface OcrExtractResponse {
  ocrText: string;
} // ocr 호출 결과 반환 텍스트

export interface CameraViewProps {
  onCapture: (image: CapturedImage) => void;
  onCancel: () => void;
}

export interface PreviewViewProps {
  imageSrc: string;
  onRetake: () => void;
  onExtract: () => void;
}

export interface OcrPageCreateRequest {
  page: number;
  ocrText: string;
} // OCR 페이지 생성 - 텍스트 수정 후 API 요청 데이터

export interface OcrPageResponse {
  ocrPageId: number;
  roomId: number;
  page: number;
  ocrText: string;
  createdBy: {
    userId: number;
    nickname: string;
  };
  createdAt: string;
} // OCR 페이지 생성 - 응답