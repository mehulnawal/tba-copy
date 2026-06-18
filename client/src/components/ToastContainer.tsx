import { useToast } from "../context/ToastContext";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-24 right-4 z-[10000] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={`px-4 py-3 border shadow-lg font-secondary text-sm cursor-pointer transition-opacity ${
            toast.type === "success"
              ? "bg-[var(--color-bg)] border-green-600 text-green-700"
              : toast.type === "error"
                ? "bg-[var(--color-bg)] border-red-600 text-red-700"
                : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)]"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
