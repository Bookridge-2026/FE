import { NavLink } from "react-router-dom";
import homeOn from "@/assets/common/home-on.svg";
import homeOff from "@/assets/common/home-off.svg";
import searchOn from "@/assets/common/search-on.svg";
import searchOff from "@/assets/common/search-off.svg";
import myOn from "@/assets/common/my-on.svg";
import myOff from "@/assets/common/my-off.svg";

export const BottomBar = () => {
  const itemClass = () =>
    `flex-1 h-full flex items-center justify-center text-[13px]`;

  return (
    <nav className="h-[var(--bottom-bar-height)] shrink-0 border-t border-[#EEEAE6] bg-main flex rounded-t-2xl">
      <NavLink to="/rooms/search" className={itemClass}>
        {({ isActive }) => (
          <img src={isActive ? searchOn : searchOff} alt="Search" className="h-[37px]" />
        )}
      </NavLink>
      <NavLink to="/home" className={itemClass}>
        {({ isActive }) => (
          <img src={isActive ? homeOn : homeOff} alt="Home" className="h-[36px] mb-[2px]" />
        )}
      </NavLink>
      <NavLink to="/mypage" className={itemClass}>
        {({ isActive }) => (
          <img src={isActive ? myOn : myOff} alt="My Page" className="h-[36px]" />
        )}
      </NavLink>
    </nav>
  );
};