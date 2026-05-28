import booksIcon from "@/assets/rooms/books-logo.svg";

export default function LoadingView() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-white">
      <img src={booksIcon} alt="로딩" className="h-[50px] w-[50px]" />
      <p className="text-sm text-gray-400">문장을 읽어 오는 중...</p>
    </div>
  );
}
