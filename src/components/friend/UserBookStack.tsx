import type { UserProfileBook } from "@/types/friend";

interface UserBookStackProps {
  books: UserProfileBook[];
}

const chunkBooks = (books: UserProfileBook[], size: number) => {
  const chunks: UserProfileBook[][] = [];

  for (let i = 0; i < books.length; i += size) {
    chunks.push(books.slice(i, i + size));
  }

  return chunks;
};

export const UserBookStack = ({ books }: UserBookStackProps) => {
  const displayBooks = books;

  if (displayBooks.length === 0) {
    return (
      <div className="mt-auto px-6 pb-10">
        <div className="rounded-2xl bg-main px-5 py-6 text-center shadow-sm">
          <p className="text-sm font-medium text-black">
            아직 함께한 책이 없습니다.
          </p>
        </div>
      </div>
    );
  }

  const stacks = chunkBooks(displayBooks, 6);

  return (
    <div className="mt-auto px-3">
      <p className="mb-3 text-center text-xs text-sub-black">
        총 {displayBooks.length}권의 책을 함께했어요.
      </p>

      <div
        className={
          stacks.length > 1
            ? "-mx-3 overflow-x-auto px-3 py-1"
            : "px-1 py-1"
        }
      >
        <div
          className={`flex min-w-full gap-4 px-1 ${
            stacks.length === 1 ? "justify-center" : "justify-start"
          }`}
        >
          {stacks.map((stack, stackIndex) => (
            <div
              key={stackIndex}
              className="flex w-[calc(100vw-32px)] max-w-[354px] shrink-0 flex-col-reverse pb-2"
            >
              {stack.map((book, index) => (
                <div
                  key={`${book.roomId}-${book.title}-${index}`}
                  style={{
                    zIndex: index,
                    marginTop: index === 0 ? 0 : -4,
                  }}
                  className="relative rounded-xl bg-main px-3 py-4 text-sm text-black shadow-sm ring-1 ring-field"
                >
                  <div className="flex min-w-0 items-center overflow-hidden">
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {book.title}
                    </span>

                    <span className="mx-1 shrink-0 text-sub-black">|</span>

                    <span className="max-w-[70px] shrink-0 truncate text-sub-black">
                      {book.author}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {stacks.length > 1 && <div className="w-1 shrink-0" />}
        </div>
      </div>
    </div>
  );
};