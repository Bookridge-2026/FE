import React, { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastContextValue = {
  show: (message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const timerRef = useRef<number | null>(null);

  const show = useCallback((msg: string, duration = 1500) => {
    setMessage(msg);
    setVisible(true);

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      setVisible(false);
      timerRef.current = null;
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {visible && (
        <div className="pointer-events-none fixed left-1/2 bottom-[120px] z-[100] -translate-x-1/2">
          <div className="inline-flex max-w-[360px] justify-center break-words rounded-lg bg-black font-normal px-3 py-2 text-center text-sm text-white shadow-md">
            {message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("토스트 컨텍스트가 존재하지 않습니다.");
  return ctx;
}

export default ToastProvider;
