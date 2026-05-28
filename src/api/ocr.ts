// 일단 mock 데이터 - api 연동 시 수정

import type { OcrExtractResponse, OcrPageCreateRequest, OcrPageResponse } from "@/types/ocrCreate";
import type {
  CreateHighlightRequest,
  CreateMemoRequest,
  OcrHighlight,
  OcrMemo,
  OcrPage,
} from "@/types/ocr";

const MOCK_OCR_TEXT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

export const ocrExtract = async (image: File): Promise<OcrExtractResponse> => {
  console.log("OCR 요청 이미지:", image);

  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    ocrText: MOCK_OCR_TEXT,
  };
}; // 이미지 파일 받아서 OCR 텍스트 추출

export const createOcrPage = async (
  roomId: number,
  body: OcrPageCreateRequest
): Promise<OcrPageResponse> => {
  console.log("OCR 페이지 생성 요청:", {
    roomId,
    body,
  });

  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    ocrPageId: 1,
    roomId,
    page: body.page,
    ocrText: body.ocrText,
    createdBy: {
      userId: 1,
      nickname: "가윤",
    },
    createdAt: "2026-05-27T12:00:00",
  };
}; // OCR 페이지 생성

const mockPage: OcrPage = {
  ocrPageId: 1,
  roomId: 3,
  page: 159,
  ocrText:
    "저장된 OCR 텍스트입니다. 이 문장은 하이라이트 테스트용 문장입니다. 선택한 구절에 메모를 남길 수 있습니다.",
  createdBy: {
    userId: 1,
    nickname: "가윤",
  },
  highlights: [
    {
      highlightId: 10,
      selectedText: "하이라이트 테스트용 문장",
      startOffset: 20,
      endOffset: 34,
      memos: [
        {
          memoId: 20,
          highlightId: 10,
          content: "이 문장 좋다",
          color: "#F6D36B",
          createdAt: "2026-05-27T12:10:00",
        },
      ],
    },
  ],
};

export const getOcrPage = async (
  roomId: number,
  ocrPageId: number
): Promise<OcrPage> => {
  console.log("OCR 페이지 조회:", { roomId, ocrPageId });

  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    ...mockPage,
    roomId,
    ocrPageId,
  };
}; // 저장된 OCR 페이지 조회

export const createOcrHighlight = async (
  ocrPageId: number,
  body: CreateHighlightRequest
): Promise<OcrHighlight> => {
  console.log("하이라이트 + 메모 생성:", { ocrPageId, body });

  await new Promise((resolve) => setTimeout(resolve, 500));

  const highlightId = Date.now();
  const memoId = highlightId + 1;

  return {
    highlightId,
    selectedText: body.selectedText,
    startOffset: body.startOffset,
    endOffset: body.endOffset,
    memos: [
      {
        memoId,
        highlightId,
        content: body.memoContent,
        color: "#F6D36B",
        createdAt: new Date().toISOString(),
      },
    ],
  };
}; // 새로운 하이라이트 + 메모 생성 동시에

export const createOcrMemo = async (
  highlightId: number,
  body: CreateMemoRequest
): Promise<OcrMemo> => {
  console.log("기존 하이라이트에 메모 추가:", { highlightId, body });

  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    memoId: Date.now(),
    highlightId,
    content: body.memoContent,
    color: "#A7D8FF",
    createdAt: new Date().toISOString(),
  };
}; // 이미 존재하는 하이라이트에 메모를 추가