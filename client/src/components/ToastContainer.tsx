import { useEffect, useRef } from "react";
import { useToast, type Toast } from "../context/ToastContext";

const iconFor = (type: Toast["type"]) => type === "success" ? "OK" : type === "error" ? "!" : "i";
function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToast();
  const remaining = useRef(toast.duration);
  const startedAt = useRef<number | null>(null);
  const timer = useRef<number | null>(null);
  const clear = () => { if (timer.current !== null) window.clearTimeout(timer.current); timer.current = null; };
  const start = () => { clear(); startedAt.current = Date.now(); timer.current = window.setTimeout(() => removeToast(toast.id), remaining.current); };
  const pause = () => { if (startedAt.current !== null) remaining.current -= Date.now() - startedAt.current; clear(); startedAt.current = null; };
  useEffect(() => { start(); return clear; });
  return <div role={toast.type === "error" ? "alert" : "status"} className={`customer-toast customer-toast--${toast.type}`} onMouseEnter={pause} onMouseLeave={start} onFocusCapture={pause} onBlurCapture={start} onKeyDown={(event) => { if (event.key === "Escape") removeToast(toast.id); }}>
    <span className="customer-toast__icon" aria-hidden="true">{iconFor(toast.type)}</span><p>{toast.message}</p><button type="button" onClick={() => removeToast(toast.id)} aria-label="Dismiss notification">×</button>
  </div>;
}
export default function ToastContainer() { const { toasts } = useToast(); if (!toasts.length) return null; return <div className="customer-toast-stack" aria-live="polite" aria-atomic="true">{toasts.map((toast) => <ToastItem key={toast.id} toast={toast} />)}</div>; }
