import React from "react";

interface BottomButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const BottomButton = ({ children, onClick, disabled }: BottomButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-[340px] h-[60px] rounded-2xl text-base font-normal flex items-center justify-center transition-colors
        ${disabled ? "bg-sub-black text-main" : "bg-black text-main"}`}
    >
      {children}
    </button>
  );
};
