import mainLogo from "@/assets/main-logo-1.svg";

export const Header = () => {
  return (
    <header className="h-[var(--header-height)] shrink-0 px-4 pt-8 flex items-start bg-main">
      <img src={mainLogo} alt="Bookridge Logo" className="h-[31px] mt-6" />
    </header>
  );
};