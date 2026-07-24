import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkoutApi } from "../api/checkout.api";
import { apiRequest } from "../api/client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type Summary = {
    subtotal: number;
    discount: number;
    shippingFee: number;
    total: number;
};

type CartItem = {
    _id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
    karat?: string;
};

type AppliedCoupon = {
    code: string;
    discountDisplay?: string;
};

type AvailableCoupon = {
    code: string;
    discountType: string;
    discountValue: number;
    minimumCartValue: number;
    expiryDate: string;
    usageLimit: number;
    usedCount: number;
};

export default function Checkout() {
    const [items, setItems] = useState<CartItem[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);

    const [error, setError] = useState("");
    const [couponSuccess, setCouponSuccess] = useState("");
    const [couponError, setCouponError] = useState("");
    const [manualCouponCode, setManualCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

    const [applyingCode, setApplyingCode] = useState<string | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);
    const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>("All");

    const nav = useNavigate();

    // 1. Load Razorpay SDK
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // 2. Fetch Order Summary & Initial Applied Coupon
    const fetchOrderSummary = async () => {
        try {
            const d: any = await checkoutApi.getOrderSummary();
            setItems(d.items as CartItem[]);
            setSummary(d.summary);
            if (d.coupon) {
                setAppliedCoupon({
                    code: d.coupon.code || d.coupon,
                    discountDisplay: d.coupon.discountDisplay || d.coupon.discountLabel,
                });
            } else {
                setAppliedCoupon(null);
            }
        } catch (e: any) {
            setError(e.message);
        }
    };

    useEffect(() => {
        fetchOrderSummary();
    }, []);

    // 3. Fetch Available Coupons
    useEffect(() => {
        setIsLoadingCoupons(true);
        checkoutApi
            .getCoupons()
            .then((coupons) => {
                setAvailableCoupons(coupons || []);
            })
            .catch(() => {
                setAvailableCoupons([]);
            })
            .finally(() => setIsLoadingCoupons(false));
    }, []);

    // Apply Coupon Handler
    const handleApplyCoupon = async (codeToApply: string) => {
        setCouponError("");
        setCouponSuccess("");

        const trimmedCode = codeToApply.trim();
        if (!trimmedCode) {
            setCouponError("Please enter a coupon code");
            return;
        }

        try {
            setApplyingCode(trimmedCode);
            await checkoutApi.applyCoupon(trimmedCode);
            await fetchOrderSummary();
            setCouponSuccess("Coupon applied successfully.");
            setManualCouponCode("");
        } catch (err: any) {
            setCouponError(err?.message || err?.response?.data?.message || "Failed to apply coupon.");
        } finally {
            setApplyingCode(null);
        }
    };

    // Remove Coupon Handler
    const handleRemoveCoupon = async () => {
        setCouponError("");
        setCouponSuccess("");

        try {
            setIsRemoving(true);
            await checkoutApi.removeCoupon();
            await fetchOrderSummary();
            setCouponSuccess("Coupon removed successfully.");
        } catch (err: any) {
            setCouponError(err?.message || err?.response?.data?.message || "Failed to remove coupon.");
        } finally {
            setIsRemoving(false);
        }
    };

    const place = async () => {
        try {
            const d = await apiRequest<{
                order: { _id: string };
                razorpayOrder: { id: string };
                keyId: string;
            }>("/orders", { method: "POST" });

            const R = (window as any).Razorpay;
            if (!R) throw new Error("Razorpay checkout is not loaded");

            new R({
                key: d.keyId,
                order_id: d.razorpayOrder.id,
                amount: Math.round(summary!.total * 100),
                currency: "INR",
                handler: async (r: any) => {
                    await apiRequest("/orders/verify", {
                        method: "POST",
                        body: JSON.stringify(r),
                    });
                    nav(`/orderConfirmation?orderId=${d.order._id}`);
                },
            }).open();
        } catch (e: any) {
            setError(e.message);
        }
    };

    const formatCurrency = (amount: number) => {
        return `₹${Math.round(amount).toLocaleString("en-IN")}`;
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <>
            <Navbar
                onSearchChange={() => { }}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
            />

            <main className="min-h-screen bg-[var(--color-bg,#fff)] py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    {/* Page Header */}
                    <div className="border-b border-gray-200 pb-6 mb-8">
                        <span className="text-xs uppercase tracking-widest text-gray-500 font-medium block mb-1">
                            Finalize Purchase
                        </span>
                        <h1 className="text-3xl font-serif uppercase tracking-wide text-gray-900">
                            Checkout
                        </h1>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-md border border-red-200 bg-red-50 text-red-700 text-xs font-medium uppercase tracking-wider">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Cart Items List */}
                        <div className="lg:col-span-7 space-y-4">
                            <h2 className="text-sm uppercase tracking-widest font-semibold text-gray-900 mb-4">
                                Order Items ({items.length})
                            </h2>
                            <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                                {items.map((i) => (
                                    <div className="py-4 first:pt-0 last:pb-0 flex items-center gap-4" key={i._id}>
                                        <img
                                            className="h-20 w-20 object-cover rounded border border-gray-100 flex-shrink-0 bg-gray-50"
                                            src={i.image}
                                            alt={i.name}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-gray-900 tracking-wide truncate">
                                                {i.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                                                {i.karat && `${i.karat.toUpperCase()} · `}Qty: {i.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right font-medium text-sm text-gray-900">
                                            {formatCurrency(i.price * i.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Offers & Summary Sidebar */}
                        <div className="lg:col-span-5 space-y-6">
                            {/* Offers & Coupons Panel */}
                            <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm space-y-5">
                                <h3 className="text-xs uppercase tracking-widest font-semibold text-gray-900 border-b border-gray-100 pb-3">
                                    Offers & Coupons
                                </h3>

                                {/* Manual Input Form (Always Visible When No Active Applied Coupon) */}
                                {!appliedCoupon && (
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-medium uppercase tracking-wider text-gray-500 block">
                                            Enter Promo Code
                                        </label>
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleApplyCoupon(manualCouponCode);
                                            }}
                                            className="flex gap-2"
                                        >
                                            <input
                                                type="text"
                                                placeholder="SAVE10"
                                                value={manualCouponCode}
                                                onChange={(e) => setManualCouponCode(e.target.value.toUpperCase())}
                                                disabled={!!applyingCode}
                                                className="flex-1 bg-white border border-gray-300 text-gray-900 text-xs px-3 py-2.5 rounded focus:outline-none focus:border-gray-900 uppercase tracking-wider disabled:opacity-50"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!!applyingCode || !manualCouponCode.trim()}
                                                className="bg-black hover:bg-gray-800 text-white text-xs uppercase tracking-widest px-4 py-2.5 rounded font-medium transition-colors disabled:opacity-50 flex-shrink-0"
                                            >
                                                {applyingCode === manualCouponCode.trim() ? "Applying..." : "Apply"}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* Applied Coupon Section */}
                                {appliedCoupon ? (
                                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-bold tracking-wider text-emerald-900 flex items-center gap-1.5">
                                                <span>✓</span> {appliedCoupon.code} Applied
                                            </div>
                                            {appliedCoupon.discountDisplay && (
                                                <div className="text-xs text-emerald-700 font-medium mt-0.5">
                                                    {appliedCoupon.discountDisplay}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveCoupon}
                                            disabled={isRemoving}
                                            className="text-xs uppercase tracking-wider font-semibold text-red-600 hover:text-red-800 underline underline-offset-2 transition-colors disabled:opacity-50"
                                        >
                                            {isRemoving ? "Removing..." : "Remove"}
                                        </button>
                                    </div>
                                ) : (
                                    /* Available Offers Section */
                                    <div className="space-y-3 pt-2">
                                        <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500 block">
                                            Available Offers
                                        </span>

                                        {isLoadingCoupons ? (
                                            <div className="space-y-2">
                                                <div className="h-16 bg-gray-100 rounded animate-pulse" />
                                                <div className="h-16 bg-gray-100 rounded animate-pulse" />
                                            </div>
                                        ) : availableCoupons.length === 0 ? (
                                            <p className="text-xs text-gray-500 italic py-2">
                                                No offers available.
                                            </p>
                                        ) : (
                                            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                                {availableCoupons.map((coupon) => {
                                                    const currentSubtotal = summary?.subtotal || 0;
                                                    const minReq = coupon.minimumCartValue || 0;
                                                    const isEligible = currentSubtotal >= minReq;
                                                    const shortage = minReq - currentSubtotal;
                                                    const isThisApplying = applyingCode === coupon.code;

                                                    return (
                                                        <div
                                                            key={coupon.code}
                                                            className={`p-3.5 border rounded-md transition-all flex items-start justify-between gap-3 ${isEligible
                                                                    ? "border-gray-200 bg-gray-50/50 hover:border-gray-400"
                                                                    : "border-gray-200 bg-gray-50/20 opacity-75"
                                                                }`}
                                                        >
                                                            <div className="space-y-1 min-w-0 flex-1">
                                                                <div className="text-xs font-bold text-gray-900 tracking-wider">
                                                                    {coupon.code}
                                                                </div>
                                                                <div className="text-xs font-semibold text-emerald-700">
                                                                    {coupon.discountType === "percentage"
                                                                        ? `${coupon.discountValue}% OFF`
                                                                        : `${formatCurrency(coupon.discountValue)} OFF`}
                                                                </div>
                                                                {minReq > 0 && (
                                                                    <div className="text-[11px] text-gray-500">
                                                                        Minimum Order {formatCurrency(minReq)}
                                                                    </div>
                                                                )}
                                                                <div className="text-[10px] text-gray-400">
                                                                    Expires {formatDate(coupon.expiryDate)}
                                                                </div>

                                                                {!isEligible && (
                                                                    <div className="text-[11px] font-medium text-amber-700 pt-1">
                                                                        Add {formatCurrency(shortage)} more to use this coupon.
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <button
                                                                type="button"
                                                                disabled={!isEligible || !!applyingCode || isRemoving}
                                                                onClick={() => isEligible && handleApplyCoupon(coupon.code)}
                                                                className="bg-black hover:bg-gray-800 text-white text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                                                            >
                                                                {isThisApplying ? "Applying..." : "Apply"}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Status Messages */}
                                {couponSuccess && (
                                    <p className="text-xs font-medium text-emerald-700 tracking-wide">
                                        {couponSuccess}
                                    </p>
                                )}
                                {couponError && (
                                    <p className="text-xs font-medium text-red-700 tracking-wide">
                                        {couponError}
                                    </p>
                                )}
                            </div>

                            {/* Order Summary Section */}
                            {summary && (
                                <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm space-y-4">
                                    <h3 className="text-xs uppercase tracking-widest font-semibold text-gray-900 border-b border-gray-100 pb-3">
                                        Order Summary
                                    </h3>

                                    <div className="space-y-2.5 text-xs text-gray-600 tracking-wide">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span className="font-medium text-gray-900">
                                                {formatCurrency(summary.subtotal)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-emerald-700">
                                            <span>Discount</span>
                                            <span className="font-medium">
                                                -{formatCurrency(summary.discount)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Shipping</span>
                                            <span className="font-medium text-gray-900">
                                                {summary.shippingFee === 0
                                                    ? "Free"
                                                    : formatCurrency(summary.shippingFee)}
                                            </span>
                                        </div>

                                        <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-baseline text-gray-900">
                                            <span className="text-sm font-semibold uppercase tracking-wider">
                                                Grand Total
                                            </span>
                                            <span className="text-lg font-serif font-bold">
                                                {formatCurrency(summary.total)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={place}
                                        className="w-full mt-4 bg-black hover:bg-gray-800 text-white text-xs uppercase tracking-widest font-semibold py-3.5 px-4 rounded shadow transition-all duration-200"
                                    >
                                        Pay Securely
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer onCategoryChange={setActiveCategory} />
        </>
    );
}