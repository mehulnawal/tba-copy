import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { apiRequest } from "../api/client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { formatINR } from "../utils/currency";

type Order = {
  _id: string;
  amount: number;
  createdAt: string;
  items: {
    title: string;
    image: string;
    karat: string;
    color: string;
    size: string;
    quantity: number;
    priceSnapshot: { finalPrice: number };
  }[];
};

export default function OrderConfirmation() {
  const [params] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const id = params.get("orderId");
  useEffect(() => {
    if (!id) {
      setError("Order reference is missing.");
      return;
    }
    apiRequest<Order>(`/orders/${id}`)
      .then(setOrder)
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to load your order.",
        ),
      );
  }, [id]);
  return (
    <>
      <Navbar
        onSearchChange={() => {}}
        activeCategory="All"
        onCategoryChange={() => {}}
      />
      <main className="min-h-screen bg-[var(--color-bg)] px-4 py-12 sm:px-6">
        <section className="mx-auto max-w-3xl">
          <div className="border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 text-center shadow-sm sm:p-10">
            <CheckCircle2
              className="mx-auto h-12 w-12 text-[var(--color-teal)]"
              aria-hidden="true"
            />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Thank you
            </p>
            <h1 className="mt-2 font-primary text-3xl text-[var(--color-teal)] sm:text-4xl">
              Your order is confirmed
            </h1>
            {order && (
              <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                Order reference{" "}
                <span className="font-mono font-semibold text-[var(--color-text)]">
                  #{String(order._id).slice(-8).toUpperCase()}
                </span>{" "}
                ·{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
            {error && (
              <p className="mt-5 text-sm text-[var(--color-error)]">{error}</p>
            )}
          </div>
          {order && (
            <section className="mt-6 border border-[var(--color-border)] bg-white p-5 sm:p-7">
              <div className="mb-5 flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                <h2 className="font-primary text-xl text-[var(--color-teal)]">
                  Order details
                </h2>
                <b className="text-lg text-[var(--color-teal)]">
                  {formatINR(order.amount)}
                </b>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {order.items.map((item, index) => (
                  <article
                    key={`${item.title}-${index}`}
                    className="flex gap-4 py-4 first:pt-0"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-20 w-20 border border-[var(--color-border)] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[var(--color-text)]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {item.karat?.toUpperCase()} ·{" "}
                        {item.color || "Standard finish"} ·{" "}
                        {item.size ? `Size ${item.size}` : "Size not selected"}
                      </p>
                      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                        Quantity {item.quantity}
                      </p>
                    </div>
                    <b className="text-sm text-[var(--color-text)]">
                      {formatINR(item.priceSnapshot.finalPrice * item.quantity)}
                    </b>
                  </article>
                ))}
              </div>
              <p className="mt-6 border-t border-[var(--color-border)] pt-5 text-sm text-[var(--color-text-muted)]">
                Need help with this order? Contact{" "}
                {import.meta.env.VITE_ORDER_SUPPORT_PHONE || "our support team"}
                .
              </p>
            </section>
          )}
          <div className="mt-6 text-center">
            <Link
              to="/products"
              className="inline-flex border border-[var(--color-teal)] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-teal)] transition hover:bg-[var(--color-teal)] hover:text-white"
            >
              Continue shopping
            </Link>
          </div>
        </section>
      </main>
      <Footer onCategoryChange={() => {}} />
    </>
  );
}
