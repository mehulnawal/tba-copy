import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type ToastType = "success" | "error" | "info";
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}
interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const removeToast = useCallback(
    (id: string) =>
      setToasts((prev) => prev.filter((toast) => toast.id !== id)),
    [],
  );
  const showToast = useCallback((message: string, type: ToastType = "info") => {
    setToasts((prev) => {
      if (
        prev.some((toast) => toast.message === message && toast.type === type)
      )
        return prev;
      const duration =
        type === "success" ? 4000 : type === "error" ? 8000 : 5000;
      return [
        ...prev,
        { id: `${Date.now()}-${Math.random()}`, message, type, duration },
      ].slice(-4);
    });
  }, []);
  const value = useMemo(
    () => ({ toasts, showToast, removeToast }),
    [toasts, showToast, removeToast],
  );
  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
