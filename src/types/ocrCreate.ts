// types/ocrCreate.ts

export type OcrStep = "camera" | "preview" | "loading";

export interface CapturedImage {
  file: File;
  previewUrl: string;
}

export interface OcrExtractResponse {
  text: string;
}

export interface OcrPageCreateRequest {
  page: number;
  text: string;
}

export interface CameraViewProps {
  onCapture: (image: CapturedImage) => void;
  onCancel: () => void;
}

export interface PreviewViewProps {
  imageSrc: string;
  onRetake: () => void;
  onExtract: () => void;
}