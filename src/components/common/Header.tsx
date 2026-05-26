import mainLogo from "@/assets/main-logo-1.svg";
import noticeIcon from "@/assets/common/notice.svg";
import friendIcon from "@/assets/common/friend.svg";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="h-[var(--header-height)] shrink-0 px-4 pt-8 flex items-start justify-between bg-main">
      <img src={mainLogo} alt="Bookridge Logo" className="h-[31px] mt-6" />
      <div className="flex gap-4 mt-7">
        <button onClick={() => navigate('/friends')}>
          <img src={friendIcon} alt="친구" className="h-6 w-6" />
        </button>
        <button onClick={() => navigate('/notice')}>
          <img src={noticeIcon} alt="알림" className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};