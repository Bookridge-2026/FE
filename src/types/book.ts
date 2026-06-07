export interface Book {
  roomId: number;
  state: 'ongoing' | 'closed';
  startDate: string;
  book: {
    title: string;
    publisher: string;
  };
}

export interface MyBooksResponse {
  closedCount: number;
  books: Book[];
}