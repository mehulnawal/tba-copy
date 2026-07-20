import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type OrderItem = {
    title: string;
    image: string;
    quantity: number;
    karat: string;
};

type Order = {
    _id: string;
    orderStatus: "pending" | "confirmed" | "failed";
    amount: number;
    createdAt: string;
    items: OrderItem[];
};

export default function OrderHistory() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("All");

    useEffect(() => {
        setIsLoading(true);
        apiRequest<Order[]>("/orders")
            .then(setOrders)
            .catch((e) => setError(e.message))
            .finally(() => setIsLoading(false));
    }, []);

    const formatStatus = (status: Order["orderStatus"]) => {
        switch (status) {
            case "confirmed":
                return { label: "Processing", color: "text-[var(--color-teal)] bg-[var(--color-bg-secondary)]" };
            case "pending":
                return { label: "Pending", color: "text-amber-700 bg-amber-50" };
            case "failed":
                return { label: "Failed", color: "text-red-700 bg-red-50" };
            default:
                return { label: status, color: "text-[var(--color-text-muted)] bg-[var(--color-cream-light)]" };
        }
    };

    return (
        <>
            <Navbar
                onSearchChange={() => { }}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
            />

            <main className="min-h-screen bg-[var(--color-bg)] py-16 px-4 md:px-8">
                <div className="container max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[var(--color-cream)] pb-6 mb-12">
                        <div>
                            <span className="section-label">Purchase History</span>
                            <h1 className="text-3xl md:text-4xl font-primary uppercase tracking-wide text-[var(--color-teal)]">
                                My Orders
                            </h1>
                        </div>
                    </div>

                    {/* Tab Navigation Structure matching Account Page */}
                    <div className="flex flex-wrap gap-8 mb-10 border-b border-[var(--color-border-subtle)] pb-2">
                        <button
                            onClick={() => navigate("/account")}
                            className="font-secondary pb-2 text-sm uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-all duration-300 relative"
                        >
                            Personal Details
                        </button>
                        <button
                            onClick={() => navigate("/account")}
                            className="font-secondary pb-2 text-sm uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-all duration-300 relative"
                        >
                            Address Book
                        </button>
                        <button
                            className="font-secondary pb-2 text-sm uppercase tracking-widest text-[var(--color-teal)] font-medium transition-all duration-300 relative"
                        >
                            My Orders
                            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-teal)]" />
                        </button>
                    </div>

                    {/* Content Section */}
                    {isLoading ? (
                        <div className="space-y-6">
                            <div className="skeleton h-48 w-full" />
                            <div className="skeleton h-48 w-full" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 border border-dashed border-[var(--color-error)] text-[var(--color-error)] font-secondary text-sm">
                            {error}
                        </div>
                    ) : orders.length === 0 ? (
                        /* Empty State */
                        <div className="text-center py-16 px-4 border border-dashed border-[var(--color-cream)] bg-[var(--color-bg-secondary)] my-8">
                            <h2 className="font-primary text-xl uppercase tracking-wider text-[var(--color-teal)] mb-3">
                                No orders yet
                            </h2>
                            <p className="font-secondary text-sm text-[var(--color-text-muted)] max-w-md mx-auto mb-2">
                                You haven't placed any jewellery orders.
                            </p>
                            <p className="font-secondary text-xs text-[var(--color-text-muted)] italic max-w-md mx-auto mb-8">
                                Explore our collections to discover timeless pieces.
                            </p>
                            <Link
                                to="/"
                                className="inline-block bg-[var(--color-teal)] !text-white px-8 py-3.5 text-xs uppercase tracking-widest font-secondary hover:bg-[var(--color-teal-dark)] transition duration-300 shadow-sm"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        /* Orders List */
                        <div className="space-y-8">
                            {orders.map((o) => {
                                const statusInfo = formatStatus(o.orderStatus);
                                return (
                                    <div
                                        key={o._id}
                                        className="border border-[var(--color-cream)] bg-[var(--color-bg)] p-6 md:p-8 hover:border-[var(--color-teal)] transition-all duration-300"
                                    >
                                        {/* Card Top Banner */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--color-border-subtle)] pb-4 mb-6 gap-2">
                                            <div>
                                                <span className="font-primary text-base uppercase tracking-wider text-[var(--color-teal)] block">
                                                    Order #{o._id.slice(-8).toUpperCase()}
                                                </span>
                                                <span className="font-secondary text-xs text-[var(--color-text-muted)]">
                                                    Placed: {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] uppercase tracking-widest px-3 py-1 font-secondary font-medium ${statusInfo.color}`}>
                                                    Status: {statusInfo.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Items List */}
                                        <div className="divide-y divide-[var(--color-border-subtle)]">
                                            {o.items.map((i, n) => (
                                                <div key={n} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={i.image}
                                                            alt={i.title}
                                                            className="h-20 w-20 object-cover border border-[var(--color-cream)] bg-[var(--color-cream-light)] flex-shrink-0"
                                                        />
                                                        <div>
                                                            <h3 className="font-primary text-base text-[var(--color-teal)] uppercase tracking-wide">
                                                                {i.title}
                                                            </h3>
                                                            <p className="font-secondary text-xs text-[var(--color-text-muted)] mt-1">
                                                                Metal: <span className="uppercase text-[var(--color-text)] font-medium">{i.karat}</span>
                                                            </p>
                                                            <p className="font-secondary text-xs text-[var(--color-text-muted)]">
                                                                Qty: <span className="text-[var(--color-text)] font-medium">{i.quantity}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Card Footer Summary & Action */}
                                        <div className="mt-6 pt-4 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <span className="font-secondary text-xs uppercase tracking-wider text-[var(--color-text-muted)] block">Total</span>
                                                <span className="font-primary text-lg text-[var(--color-teal)] font-semibold">
                                                    ₹{Math.round(o.amount).toLocaleString("en-IN")}
                                                </span>
                                            </div>
                                            <Link
                                                to={`/orderConfirmation?orderId=${o._id}`}
                                                className="inline-center justify-center text-center bg-transparent border border-[var(--color-teal)] text-[var(--color-teal)] hover:bg-[var(--color-teal)] hover:text-white px-6 py-2.5 text-xs uppercase tracking-widest font-secondary transition-all duration-300"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Support Contact Info Footer */}
                    {/* <div className="mt-12 text-center border-t border-[var(--color-cream)] pt-6">
                        <p className="font-secondary text-xs text-[var(--color-text-muted)] tracking-wide">
                            For order tracking & inquiries, contact us at{" "}
                            <span className="text-[var(--color-teal)] font-medium">
                                {import.meta.env.VITE_ORDER_SUPPORT_PHONE || "our support team"}
                            </span>
                            .
                        </p>
                    </div> */}
                </div>
            </main>

            <Footer onCategoryChange={setActiveCategory} />
        </>
    );
}