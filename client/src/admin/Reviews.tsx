import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi, type AdminReview } from "../api/admin.api";
import { ApiRequestError } from "../api/client";

const errorMessage = (error: unknown) =>
  error instanceof ApiRequestError
    ? error.message
    : "Unable to update review. Please try again.";
const statusClasses: Record<AdminReview["status"], string> = {
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  approved:
    "bg-[var(--color-teal)]/10 text-[var(--color-teal)] border-[var(--color-teal)]/20",
  rejected:
    "bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20",
};

export default function Reviews() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [filter, setFilter] = useState<"all" | AdminReview["status"]>(
    "pending",
  );
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReviews(await adminApi.reviews());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const visible = useMemo(
    () =>
      filter === "all"
        ? reviews
        : reviews.filter((review) => review.status === filter),
    [filter, reviews],
  );
  const moderate = async (id: string, status: "approved" | "rejected") => {
    setError("");
    try {
      await adminApi.moderateReview(id, status);
      setMessage(`Review ${status}.`);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };
  const remove = async (id: string) => {
    if (!window.confirm("Permanently delete this review?")) return;
    setError("");
    try {
      await adminApi.deleteReview(id);
      setMessage("Review deleted.");
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };
  return (
    <section className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-3xl font-primary tracking-tight text-[var(--color-teal)]">
            Review Moderation
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 font-secondary">
            Approve customer feedback before it appears on product pages.
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="admin-input sm:w-44"
        >
          <option value="pending">Pending review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All reviews</option>
        </select>
      </div>
      {message && (
        <div className="p-3 text-xs rounded-[var(--radius-md)] bg-[var(--color-teal)]/10 text-[var(--color-teal)] border border-[var(--color-teal)]/20">
          {message}
        </div>
      )}
      {error && (
        <div className="p-3 text-xs rounded-[var(--radius-md)] bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/30">
          {error}
        </div>
      )}
      {loading ? (
        <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">
          Loading reviews...
        </div>
      ) : visible.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)] text-sm text-[var(--color-text-muted)]">
          No {filter === "all" ? "" : filter} reviews found.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((review) => (
            <article
              key={review._id}
              className="p-5 border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] shadow-[var(--shadow-sm)] space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm text-[var(--color-teal)]">
                    {review.product?.data?.Title ||
                      review.product?.SKU ||
                      "Deleted product"}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {review.user?.name || "Deleted customer"}{" "}
                    {review.user?.email && `(${review.user.email})`}
                  </p>
                </div>
                <span
                  className={`self-start px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${statusClasses[review.status]}`}
                >
                  {review.status}
                </span>
              </div>
              <p
                className="text-amber-600 text-sm"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </p>
              <p className="text-sm leading-6 text-[var(--color-charcoal)]">
                {review.text}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--color-border)]">
                <span className="text-xs text-[var(--color-text-muted)]">
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <div className="flex gap-3 text-xs font-semibold">
                  <button
                    onClick={() => void moderate(review._id, "approved")}
                    className="text-emerald-700 cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => void moderate(review._id, "rejected")}
                    className="text-amber-700 cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => void remove(review._id)}
                    className="text-red-700 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
