export interface UserSummary {
  userId: number;
  nickname: string;
}

export interface OcrMemo {
  memoId: number;
  highlightId: number;
  content: string;
  color: string;
  createdAt: string;
}

export interface OcrHighlight {
  highlightId: number;
  selectedText: string;
  startOffset: number;
  endOffset: number;
  memos: OcrMemo[];
}

export interface OcrPage {
  ocrPageId: number;
  roomId: number;
  page: number;
  ocrText: string;
  createdBy: UserSummary;
  highlights: OcrHighlight[];
}

export interface CreateHighlightRequest {
  selectedText: string;
  startOffset: number;
  endOffset: number;
  memoContent: string;
}

export interface CreateMemoRequest {
  memoContent: string;
}