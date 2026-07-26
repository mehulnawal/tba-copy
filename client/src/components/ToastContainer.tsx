import { useToast } from "../context/ToastContext";

const iconFor = (type: "success" | "error" | "info") => type === "success" ? "✓" : type === "error" ? "!" : "i";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();
  if (toasts.length === 0) return null;
  return <div className="customer-toast-stack" aria-live="polite" aria-atomic="true">
    {toasts.map(toast => <div key={toast.id} role={toast.type === "error" ? "alert" : "status"} className={"customer-toast customer-toast--" + toast.type}>
      <span className="customer-toast__icon" aria-hidden="true">{iconFor(toast.type)}</span>
      <p>{toast.message}</p>
      <button onClick={() => removeToast(toast.id)} aria-label="Dismiss notification">×</button>
    </div>)}
  </div>;
}