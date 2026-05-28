import { useState } from "react";
import plusIcon from "@/assets/common/plus-icon.svg";
import AddReactionModal from "@/components/rooms/detail/AddReactionModal";

const RoomDetailPage = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const currentPage = 2;
  const totalPages = 500;

  return (
    <>
      <button
        className="fixed left-1/2 bottom-[110px] z-50 translate-x-[129px] rounded-full bg-black flex items-center justify-center shadow-lg"
        aria-label="추가"
        onClick={() => setModalOpen(true)}
      >
        <img src={plusIcon} alt="추가" className="w-[50px] h-[50px]" />
      </button>

        <AddReactionModal
        open={modalOpen}
        currentPage={currentPage}
        totalPages={totalPages}
        onClose={() => setModalOpen(false)}
        onSelectOCR={(page) => {
            setModalOpen(false);
        }}
        onSelectComment={(page) => {
            setModalOpen(false);
        }}
        onSelectEmoji={(page) => {
            setModalOpen(false);
        }}
        />
    </>
  );
};

export default RoomDetailPage;
