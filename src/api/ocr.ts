// api/ocr.ts

import { api } from "@/api/client";

import type {
  CreateOcrCommentRequest,
  CreateOcrHighlightRequest,
  OcrHighlight,
  OcrPage,
} from "@/types/ocr";

import type {
  OcrExtractResponse,
  OcrPageCreateRequest,
} from "@/types/ocrCreate";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const ocrExtract = async (image: File): Promise<OcrExtractResponse> => {
  const formData = new FormData();
  formData.append("image", image);

  const { data } = await api.post<ApiResponse<OcrExtractResponse>>(
    "api/ocr/extract",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data.data;
};

export const createOcrPage = async (
  roomId: number,
  body: OcrPageCreateRequest
): Promise<OcrPage> => {
  const { data } = await api.post<ApiResponse<OcrPage>>(
    `api/ocr/rooms/${roomId}/ocrSave`,
    body
  );

  return data.data;
};

export const getOcrPage = async (
  roomId: number,
  ocrPageId: number
): Promise<OcrPage> => {
  const { data } = await api.get<ApiResponse<OcrPage>>(
    `api/ocr/rooms/${roomId}/ocrPage/${ocrPageId}`
  );

  return data.data;
};

export const getOcrComments = async (
  roomId: number,
  highlightId: number
): Promise<OcrHighlight> => {
  const { data } = await api.get<ApiResponse<OcrHighlight>>(
    `api/ocr/rooms/${roomId}/highlight/${highlightId}/OcrComments`
  );

  return data.data;
};

export const createOcrHighlight = async (
  roomId: number,
  ocrPageId: number,
  body: CreateOcrHighlightRequest
): Promise<OcrHighlight> => {
  const { data } = await api.post<ApiResponse<OcrHighlight>>(
    `api/ocr/rooms/${roomId}/ocrPage/${ocrPageId}/createOcrComment`,
    body
  );

  return data.data;
};

export const createOcrComment = async (
  roomId: number,
  highlightId: number,
  body: CreateOcrCommentRequest
): Promise<OcrHighlight> => {
  const { data } = await api.post<ApiResponse<OcrHighlight>>(
    `api/ocr/rooms/${roomId}/highlight/${highlightId}/createOcrComment`,
    body
  );

  return data.data;
};