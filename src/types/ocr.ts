export interface OcrComment {
  ocrCommentId: number;
  content: string;
  color: string;
  createdAt: string;
}

export interface OcrHighlight {
  highlightId: number;
  ocrPageId: number;
  selectedText: string;
  startIndex: number;
  endIndex: number;
  ocrComments: OcrComment[];
}

export interface OcrPage {
  ocrPageId: number;
  roomId: number;
  page: number;
  text: string;
  createdAt: string;
  highlights?: OcrHighlight[];
}

export interface CreateOcrHighlightRequest {
  selectedText: string;
  startIndex: number;
  endIndex: number;
  content: string;
}

export interface CreateOcrCommentRequest {
  content: string;
}