import React, { useState, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    Lock,
    ChevronRight,
    ShoppingBag,
    Check,
    MapPin,
    CreditCard,
    Tag,
    Smartphone,
    Building,
    Wallet,
    HelpCircle,
    Calendar,
    AlertCircle,
    Sparkles,
    ArrowRight,
    Info
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { checkoutApi } from '../api/checkout.api';
import { useToast } from '../context/ToastContext';
import { ApiRequestError } from '../api/client';

/* ==========================================================================
   MOCK PRODUCT DATA (Rupees Only)
   ========================================================================== */
interface CheckoutItem {
    id: string;
    name: string;
    category: string;
    image: string;
    quantity: number;
    price: number;
    available: boolean;
}

/* ==========================================================================
   ANIMATION CONFIGURATIONS
   ========================================================================== */
const pageFadeVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.215, 0.610, 0.355, 1.000], staggerChildren: 0.08 }
    }
};

const blockRevealVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.215, 0.610, 0.355, 1.000] }
    }
};

/* ==========================================================================
   REUSABLE ACCESSIBLE INPUT COMPONENT
   ========================================================================== */
interface LuxuryInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    optional?: boolean;
}

const LuxuryInput: React.FC<LuxuryInputProps> = ({ label, optional, id, className = '', ...props }) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const [focused, setFocused] = useState(false);
    const [filled, setFilled] = useState(false);

    return (
        <div className="relative w-full mb-6 group">
            <input
                id={inputId}
                className={`w-full bg-transparent text-[var(--color-text)] font-secondary text-sm pt-6 pb-2 px-0 border-b border-[var(--color-border)] focus:border-[var(--color-teal)] focus:outline-none transition-all duration-300 tracking-wide autofill:bg-transparent ${className}`}
                placeholder=" "
                onFocus={() => setFocused(true)}
                onBlur={(e) => {
                    setFocused(false);
                    setFilled(e.target.value !== '');
                }}
                onChange={(e) => {
                    setFilled(e.target.value !== '');
                    if (props.onChange) props.onChange(e);
                }}
                {...props}
            />
            <label
                htmlFor={inputId}
                className={`absolute left-0 pointer-events-none font-secondary tracking-widest text-[10px] uppercase transition-all duration-300 text-[var(--color-text-muted)]
          ${focused || filled ? '-translate-y-5 text-[var(--color-teal)] font-medium opacity-100' : 'translate-y-2 opacity-70'}`}
            >
                {label} {optional && <span className="lowercase italic opacity-60">(optional)</span>}
            </label>
            <div className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-[var(--color-teal)] transition-all duration-300 ease-out group-focus-within:left-0 group-focus-within:w-full" />
        </div>
    );
};

/* ==========================================================================
   MAIN CHECKOUT PAGE
   ========================================================================== */
export default function CheckoutPage() {
    const { showToast } = useToast();
    const [items, setItems] = useState<CheckoutItem[]>([]);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [summary, setSummary] = useState({
        subtotal: 0,
        discount: 0,
        shippingFee: 0,
        total: 0,
        itemCount: 0,
    });

    // Form State
    const [pincode, setPincode] = useState('');
    const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'unsupported'>('idle');

    const [couponCode, setCouponCode] = useState('');
    const [couponStatus, setCouponStatus] = useState<'idle' | 'valid' | 'invalid' | 'expired' | 'unmet'>('idle');
    const [appliedDiscount, setAppliedDiscount] = useState(0);

    const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('card');

    useEffect(() => {
        const loadCheckout = async () => {
            try {
                const orderSummary = await checkoutApi.getOrderSummary();
                setItems(
                    orderSummary.items.map((item) => ({
                        id: item._id,
                        name: item.name,
                        category: item.category,
                        image: item.image,
                        quantity: item.quantity,
                        price: item.price,
                        available: item.inStock,
                    })),
                );
                setSummary(orderSummary.summary);
                setAppliedDiscount(orderSummary.summary.discount);
                if (orderSummary.coupon?.code) {
                    setCouponCode(orderSummary.coupon.code);
                    setCouponStatus('valid');
                }
            } catch (error) {
                const message = error instanceof ApiRequestError ? error.message : 'Unable to load checkout';
                showToast(message, 'error');
            } finally {
                setIsPageLoading(false);
            }
        };

        loadCheckout();
    }, [showToast]);

    // Price Calculations
    const totalQuantityCount = summary.itemCount || items.reduce((acc, current) => acc + current.quantity, 0);
    const subtotalSum = summary.subtotal;
    const calculatedShippingCost = summary.shippingFee ?? (subtotalSum > 25000 || subtotalSum === 0 ? 0 : 150);
    const calculatedTaxPlaceholder = 0;
    const finalAggregatedTotal = summary.total;

    // Pincode validation simulator
    const executePincodeValidation = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pincode.trim()) return;

        setPincodeStatus('checking');
        setTimeout(() => {
            const sanitized = pincode.trim();
            if (sanitized === '400001' || sanitized === '110001' || sanitized === '560001') {
                setPincodeStatus('valid');
            } else if (sanitized === '000000') {
                setPincodeStatus('unsupported');
            } else if (sanitized.length !== 6 || isNaN(Number(sanitized))) {
                setPincodeStatus('invalid');
            } else {
                setPincodeStatus('valid');
            }
        }, 800);
    };

    // Coupon validation simulator
    const executeCouponValidation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!couponCode.trim()) return;

        try {
            const result = await checkoutApi.applyCoupon(couponCode.trim());
            setCouponStatus('valid');
            setAppliedDiscount(result.summary.discount);
            setSummary(result.summary);
            showToast('Coupon applied successfully', 'success');
        } catch (error) {
            setCouponStatus('invalid');
            setAppliedDiscount(0);
            const message = error instanceof ApiRequestError ? error.message : 'Invalid coupon code';
            showToast(message, 'error');
        }
    };

    const resetCheckoutData = () => {
        window.location.reload();
    };

    const removeCoupon = async () => {
        try {
            const result = await checkoutApi.removeCoupon();
            setSummary(result.summary);
            setAppliedDiscount(0);
            setCouponCode('');
            setCouponStatus('idle');
            showToast('Coupon removed', 'success');
        } catch (error) {
            showToast(error instanceof ApiRequestError ? error.message : 'Unable to remove coupon', 'error');
        }
    };

    const handlePlaceOrder = () => {
        showToast('Checkout preparation complete. Payment gateway is not enabled in this phase.', 'info');
    };

    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");


    return (

        <>

            <Navbar
                onSearchChange={setSearchQuery}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
            />



            <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] styled-scrollbar antialiased pb-24 lg:pb-12">
                <div className="container section-padding">

                    {/* ==========================================================================
           CHECKOUT HEADER
           ========================================================================== */}
                    <header className="max-w-7xl mx-auto mb-12 md:mb-16 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[var(--color-border-subtle)] pb-8">
                        <div className="text-center md:text-left">
                            <span className="section-label">Secure Checkout</span>
                            <h1 className="font-primary text-3xl sm:text-4xl tracking-wide font-light text-[var(--color-teal)] mb-1">
                                Review and Pay
                            </h1>
                            <p className="font-secondary text-xs text-[var(--color-text-muted)] tracking-wider">
                                Please review your fine jewelry order details
                            </p>
                        </div>

                        {/* Progress Breadcrumbs */}
                        <nav className="flex items-center gap-3 font-secondary text-[11px] tracking-[0.2em] uppercase text-[var(--color-text-muted)]" aria-label="Checkout Progress">
                            <span className="opacity-50">Shopping Bag</span>
                            <ChevronRight className="w-3 h-3 opacity-40 stroke-[1.5]" />
                            <span className="text-[var(--color-teal)] font-medium underline underline-offset-4">Checkout</span>
                            <ChevronRight className="w-3 h-3 opacity-40 stroke-[1.5]" />
                            <span className="opacity-40">Confirmation</span>
                        </nav>

                        {/* Security Badge */}
                        <div className="hidden lg:flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] rounded-[var(--radius-sm)]">
                            <Lock className="w-3.5 h-3.5 text-[var(--color-teal)] stroke-[1.5]" />
                            <span className="font-secondary text-[10px] uppercase tracking-widest text-[var(--color-text)] font-medium">
                                Secure 256-Bit SSL Encryption
                            </span>
                        </div>
                    </header>

                    {/* ==========================================================================
           MAIN CONTENT LAYOUT
           ========================================================================== */}
                    <AnimatePresence mode="wait">
                        {isPageLoading ? (
                            /* Loading State */
                            <motion.div
                                key="loading-placeholder"
                                variants={pageFadeVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
                            >
                                <div className="lg:col-span-7 space-y-8">
                                    <div className="skeleton h-48 w-full" />
                                    <div className="skeleton h-64 w-full" />
                                    <div className="skeleton h-48 w-full" />
                                </div>
                                <div className="lg:col-span-5 space-y-6">
                                    <div className="skeleton h-96 w-full" />
                                </div>
                            </motion.div>
                        ) : items.length === 0 ? (
                            /* Empty State */
                            <motion.div
                                key="empty-cart-view"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="max-w-md mx-auto text-center py-16 px-6 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-sm flex flex-col items-center rounded-[var(--radius-sm)]"
                            >
                                <div className="w-12 h-12 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] mb-6 opacity-80">
                                    <ShoppingBag className="w-4 h-4 stroke-[1.25]" />
                                </div>
                                <h2 className="font-primary text-xl tracking-wide text-[var(--color-text)] font-light mb-3">
                                    Your Bag is Empty
                                </h2>
                                <p className="font-secondary text-xs text-[var(--color-text-muted)] tracking-wide font-light leading-relaxed mb-8 max-w-xs">
                                    There are currently no items in your checkout session.
                                </p>
                                <button
                                    onClick={resetCheckoutData}
                                    className="w-full bg-[var(--color-teal)] text-[var(--color-white)] font-secondary tracking-[0.25em] text-[10px] uppercase py-4 px-6 hover:bg-[var(--color-teal-light)] transition-all duration-300 focus:outline-none rounded-[var(--radius-sm)] cursor-pointer"
                                >
                                    Reload Sample Products
                                </button>
                            </motion.div>
                        ) : (
                            /* Checkout Form Grid */
                            <motion.div
                                key="active-checkout-layout"
                                variants={pageFadeVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
                            >

                                {/* LEFT COLUMN: FORMS */}
                                <div className="lg:col-span-7 space-y-12">

                                    {/* Customer Information */}
                                    <motion.section variants={blockRevealVariants} className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-6 md:p-8 rounded-[var(--radius-sm)] shadow-sm">
                                        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-[var(--color-border-subtle)]">
                                            <span className="font-primary text-lg text-[var(--color-teal)] font-light">01</span>
                                            <h2 className="font-primary text-lg text-[var(--color-text)] tracking-wide font-light">
                                                Customer Information
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                                            <div className="sm:col-span-2">
                                                <LuxuryInput label="Full Name" type="text" required autoComplete="name" />
                                            </div>
                                            <LuxuryInput label="Email Address" type="email" required autoComplete="email" />
                                            <LuxuryInput label="Phone Number" type="tel" required autoComplete="tel" />
                                        </div>
                                    </motion.section>

                                    {/* Delivery Address */}
                                    <motion.section variants={blockRevealVariants} className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-6 md:p-8 rounded-[var(--radius-sm)] shadow-sm">
                                        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-[var(--color-border-subtle)]">
                                            <span className="font-primary text-lg text-[var(--color-teal)] font-light">02</span>
                                            <h2 className="font-primary text-lg text-[var(--color-text)] tracking-wide font-light">
                                                Delivery Address
                                            </h2>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="relative w-full mb-6 group">
                                                <textarea
                                                    rows={2}
                                                    className="w-full bg-transparent text-[var(--color-text)] font-secondary text-sm pt-6 pb-2 px-0 border-b border-[var(--color-border)] focus:border-[var(--color-teal)] focus:outline-none transition-all duration-300 tracking-wide resize-none styled-scrollbar"
                                                    placeholder=" "
                                                    required
                                                />
                                                <label className="absolute left-0 top-0 pointer-events-none font-secondary tracking-widest text-[10px] uppercase text-[var(--color-text-muted)] opacity-70 group-focus-within:-translate-y-1 group-focus-within:text-[var(--color-teal)] group-focus-within:opacity-100 transition-all duration-300">
                                                    Street Address, Apartment, Suite
                                                </label>
                                                <div className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-[var(--color-teal)] transition-all duration-300 ease-out group-focus-within:left-0 group-focus-within:w-full" />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                                                <LuxuryInput label="Landmark" optional type="text" />
                                                <LuxuryInput label="City" type="text" required />
                                                <LuxuryInput label="State" type="text" required />
                                                <LuxuryInput label="Pincode" type="text" required maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value)} />
                                            </div>
                                        </div>

                                        {/* Pincode Checker */}
                                        <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)]/60 p-4 rounded-[var(--radius-sm)]">
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
                                                <div className="flex-1">
                                                    <p className="font-secondary text-[10px] tracking-wider text-[var(--color-text-muted)] uppercase mb-2 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3 text-[var(--color-teal)]" /> Check Delivery Availability
                                                    </p>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter 6-digit delivery pincode (e.g., 400001)"
                                                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text)] font-secondary text-xs px-3 py-2.5 rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--color-teal)] placeholder:opacity-50 tracking-wider"
                                                        value={pincode}
                                                        onChange={(e) => setPincode(e.target.value)}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={executePincodeValidation}
                                                    className="bg-[var(--color-teal-dark)] text-[var(--color-white)] font-secondary text-[10px] tracking-widest uppercase px-5 py-3 rounded-[var(--radius-sm)] hover:bg-[var(--color-teal)] transition-colors cursor-pointer whitespace-nowrap self-end"
                                                >
                                                    Check
                                                </button>
                                            </div>

                                            {/* Status States */}
                                            <AnimatePresence mode="wait">
                                                {pincodeStatus === 'checking' && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 mt-3 text-[11px] text-[var(--color-text-muted)]">
                                                        <div className="pulse-dot" /> Checking shipping schedule...
                                                    </motion.div>
                                                )}
                                                {pincodeStatus === 'valid' && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-start gap-2 mt-3 text-[11px] text-emerald-800 bg-emerald-50/50 p-2 border border-emerald-100 rounded-[var(--radius-sm)]">
                                                        <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 stroke-[2]" />
                                                        <div>
                                                            <span className="font-medium">Delivery Available.</span> Estimated secure hand-delivery in <span className="underline font-medium">3 - 5 business days</span>.
                                                        </div>
                                                    </motion.div>
                                                )}
                                                {pincodeStatus === 'invalid' && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 mt-3 text-[11px] text-red-800 bg-red-50/50 p-2 border border-red-100 rounded-[var(--radius-sm)]">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Invalid pincode. Please check the number and try again.
                                                    </motion.div>
                                                )}
                                                {pincodeStatus === 'unsupported' && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-start gap-2 mt-3 text-[11px] text-amber-800 bg-amber-50/50 p-2 border border-amber-100 rounded-[var(--radius-sm)]">
                                                        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                                        <div>
                                                            <span className="font-medium">Service Area Note.</span> We do not currently ship high-value items to this location. Please contact our support team.
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.section>

                                    {/* Payment Methods */}
                                    <motion.section variants={blockRevealVariants} className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-6 md:p-8 rounded-[var(--radius-sm)] shadow-sm">
                                        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-[var(--color-border-subtle)]">
                                            <span className="font-primary text-lg text-[var(--color-teal)] font-light">03</span>
                                            <h2 className="font-primary text-lg text-[var(--color-text)] tracking-wide font-light">
                                                Payment Method
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Card Option */}
                                            <label className={`relative flex items-start gap-3 p-4 border rounded-[var(--radius-sm)] cursor-pointer transition-all duration-300 ${paymentMethod === 'card' ? 'border-[var(--color-teal)] bg-[var(--color-bg)] shadow-sm' : 'border-[var(--color-border)] bg-transparent opacity-75 hover:opacity-100'}`}>
                                                <input type="radio" name="paymentGroup" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="mt-1 accent-[var(--color-teal)]" />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <span className="font-secondary text-xs font-medium tracking-wide text-[var(--color-text)]">Credit / Debit Card</span>
                                                        <CreditCard className="w-4 h-4 text-[var(--color-teal)] stroke-[1.5]" />
                                                    </div>
                                                    <p className="font-secondary text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                                                        Visa, Mastercard, American Express, and Diners Club.
                                                    </p>
                                                </div>
                                            </label>

                                            {/* UPI Option */}
                                            <label className={`relative flex items-start gap-3 p-4 border rounded-[var(--radius-sm)] cursor-pointer transition-all duration-300 ${paymentMethod === 'upi' ? 'border-[var(--color-teal)] bg-[var(--color-bg)] shadow-sm' : 'border-[var(--color-border)] bg-transparent opacity-75 hover:opacity-100'}`}>
                                                <input type="radio" name="paymentGroup" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="mt-1 accent-[var(--color-teal)]" />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <span className="font-secondary text-xs font-medium tracking-wide text-[var(--color-text)]">UPI</span>
                                                        <Smartphone className="w-4 h-4 text-[var(--color-teal)] stroke-[1.5]" />
                                                    </div>
                                                    <p className="font-secondary text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                                                        Pay instantly using your preferred UPI app.
                                                    </p>
                                                </div>
                                            </label>

                                            {/* Net Banking */}
                                            <label className={`relative flex items-start gap-3 p-4 border rounded-[var(--radius-sm)] cursor-pointer transition-all duration-300 ${paymentMethod === 'netbanking' ? 'border-[var(--color-teal)] bg-[var(--color-bg)] shadow-sm' : 'border-[var(--color-border)] bg-transparent opacity-75 hover:opacity-100'}`}>
                                                <input type="radio" name="paymentGroup" checked={paymentMethod === 'netbanking'} onChange={() => setPaymentMethod('netbanking')} className="mt-1 accent-[var(--color-teal)]" />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <span className="font-secondary text-xs font-medium tracking-wide text-[var(--color-text)]">Net Banking</span>
                                                        <Building className="w-4 h-4 text-[var(--color-teal)] stroke-[1.5]" />
                                                    </div>
                                                    <p className="font-secondary text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                                                        Direct secure transfer from all major banks.
                                                    </p>
                                                </div>
                                            </label>

                                            {/* Wallet */}
                                            <label className={`relative flex items-start gap-3 p-4 border rounded-[var(--radius-sm)] cursor-pointer transition-all duration-300 ${paymentMethod === 'wallet' ? 'border-[var(--color-teal)] bg-[var(--color-bg)] shadow-sm' : 'border-[var(--color-border)] bg-transparent opacity-75 hover:opacity-100'}`}>
                                                <input type="radio" name="paymentGroup" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} className="mt-1 accent-[var(--color-teal)]" />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <span className="font-secondary text-xs font-medium tracking-wide text-[var(--color-text)]">Digital Wallets</span>
                                                        <Wallet className="w-4 h-4 text-[var(--color-teal)] stroke-[1.5]" />
                                                    </div>
                                                    <p className="font-secondary text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                                                        Pay using supported online digital wallets.
                                                    </p>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="mt-4 flex items-start gap-2 text-[10px] text-[var(--color-text-muted)] leading-normal opacity-80">
                                            <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-teal)] shrink-0 stroke-[1.5]" />
                                            <span>Your payment data is fully encrypted and processed through secure networks. No card details are saved on our servers.</span>
                                        </div>
                                    </motion.section>
                                </div>

                                {/* RIGHT COLUMN: STICKY ORDER SUMMARY */}
                                <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">

                                    {/* Order Summary Block */}
                                    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-6 rounded-[var(--radius-sm)] shadow-md space-y-6">
                                        <div>
                                            <h3 className="font-primary text-base tracking-wide text-[var(--color-teal)] font-light pb-2 border-b border-[var(--color-border-subtle)]">
                                                Order Summary
                                            </h3>
                                        </div>

                                        {/* Compact Product Cards */}
                                        <div className="divide-y divide-[var(--color-border-subtle)] max-h-[220px] overflow-y-auto pr-1 styled-scrollbar">
                                            {items.map((item) => (
                                                <div key={item.id} className={`flex gap-4 py-3 items-center first:pt-0 last:pb-0 ${!item.available ? 'opacity-50' : ''}`}>
                                                    <div className="relative w-14 aspect-[3/4] bg-[var(--color-bg)] border border-[var(--color-border-subtle)] shrink-0 overflow-hidden rounded-[var(--radius-sm)]">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover object-center" />
                                                        <span className="absolute bottom-1 right-1 bg-[var(--color-teal-dark)] text-[var(--color-white)] text-[9px] font-display px-1 rounded-xs">
                                                            x{item.quantity}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="font-secondary text-[8px] tracking-[0.2em] text-[var(--color-text-muted)] uppercase block mb-0.5">
                                                            {item.category}
                                                        </span>
                                                        <h4 className="font-primary text-xs text-[var(--color-text)] tracking-wide line-clamp-1">
                                                            {item.name}
                                                        </h4>
                                                        <span className="font-display text-[11px] text-[var(--color-text-muted)] mt-0.5 block">
                                                            ₹{item.price.toLocaleString('en-IN')}
                                                        </span>
                                                    </div>

                                                    {/* Simulate item availability change */}
                                                    <div className="text-right shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setItems(prev => prev.map(p => p.id === item.id ? { ...p, available: !p.available } : p));
                                                            }}
                                                            className={`font-secondary text-[8px] tracking-widest uppercase block underline underline-offset-2 ${item.available ? 'text-[var(--color-text-muted)] hover:text-amber-800' : 'text-emerald-800 font-medium'}`}
                                                            title="Simulate product availability states"
                                                        >
                                                            {item.available ? 'Make Unavailable' : 'Make Available'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Coupon Application Block */}
                                        <div className="pt-4 border-t border-[var(--color-border-subtle)]">
                                            <form onSubmit={executeCouponValidation} className="flex gap-2 items-end">
                                                <div className="flex-1">
                                                    <LuxuryInput
                                                        label="Promo Code"
                                                        type="text"
                                                        value={couponCode}
                                                        onChange={(e) => setCouponCode(e.target.value)}
                                                        className="pt-4 pb-1 text-xs"
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="bg-transparent text-[var(--color-teal)] border border-[var(--teal)] font-secondary text-[9px] tracking-widest uppercase py-1.5 px-3 mb-2 hover:bg-[var(--color-teal)] hover:text-[var(--color-white)] transition-all rounded-[var(--radius-sm)] cursor-pointer"
                                                >
                                                    Apply
                                                </button>
                                            </form>
                                            {couponStatus === 'valid' && <button type="button" onClick={removeCoupon} className="mt-1 text-[10px] underline text-[var(--color-teal)]">Remove coupon</button>}

                                            {/* Coupon Feedback Alerts */}
                                            <AnimatePresence mode="wait">
                                                {couponStatus === 'valid' && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 text-[10px] text-emerald-800 font-secondary flex items-center gap-1.5 bg-emerald-50 p-1.5 border border-emerald-100 rounded-xs">
                                                        <Sparkles className="w-3 h-3 text-emerald-700" /> Code applied. Your order total has been updated.
                                                    </motion.div>
                                                )}
                                                {couponStatus === 'invalid' && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 text-[10px] text-red-800 font-secondary flex items-center gap-1.5 bg-red-50 p-1.5 border border-red-100 rounded-xs">
                                                        <AlertCircle className="w-3 h-3 text-red-700" /> Invalid code. Please verify and try again.
                                                    </motion.div>
                                                )}
                                                {couponStatus === 'expired' && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 text-[10px] text-amber-800 font-secondary flex items-center gap-1.5 bg-amber-50 p-1.5 border border-amber-100 rounded-xs">
                                                        <HelpCircle className="w-3 h-3 text-amber-700" /> This promotional offer code has expired.
                                                    </motion.div>
                                                )}
                                                {couponStatus === 'unmet' && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 text-[10px] text-amber-800 font-secondary flex items-center gap-1.5 bg-amber-50 p-1.5 border border-amber-100 rounded-xs">
                                                        <AlertCircle className="w-3 h-3 text-amber-700" /> Minimum order requirement not met. You need a total of ₹5,00,000 to use this code.
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Price Calculations Sheet */}
                                        <div className="pt-4 border-t border-[var(--color-border-subtle)] space-y-3 font-secondary text-xs tracking-wide">
                                            <div className="flex justify-between text-[var(--color-text-muted)]">
                                                <span>Subtotal</span>
                                                <span className="font-display text-[var(--color-text)] font-medium">₹{subtotalSum.toLocaleString('en-IN')}</span>
                                            </div>

                                            {appliedDiscount > 0 && (
                                                <div className="flex justify-between text-emerald-800 font-medium">
                                                    <span>Discount Applied</span>
                                                    <span className="font-display">-₹{appliedDiscount.toLocaleString('en-IN')}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between text-[var(--color-text-muted)]">
                                                <span>Secure Hand-Delivery Shipping</span>
                                                <span className="font-display text-[var(--color-text)]">
                                                    {calculatedShippingCost === 0 ? <span className="text-emerald-800 font-medium uppercase text-[10px] tracking-widest">Free Delivery</span> : `₹${calculatedShippingCost.toLocaleString('en-IN')}`}
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-[var(--color-text-muted)]">
                                                <span>Estimated Taxes & GST (3%)</span>
                                                <span className="font-display text-[var(--color-text)]">₹{calculatedTaxPlaceholder.toLocaleString('en-IN')}</span>
                                            </div>

                                            <div className="pt-4 border-t border-[var(--color-border)] flex justify-between items-baseline">
                                                <span className="text-sm font-medium text-[var(--color-text)]">Total</span>
                                                <span className="font-display text-xl font-semibold text-[var(--color-teal)]">
                                                    ₹{finalAggregatedTotal.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Trust Note */}
                                        <div className="bg-[var(--color-bg)] p-3 border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] text-[10px] font-secondary tracking-wide text-[var(--color-text-muted)] leading-relaxed space-y-1">
                                            <p className="text-[var(--color-teal)] font-medium uppercase tracking-widest text-[8px] flex items-center gap-1">
                                                <Calendar className="w-2.5 h-2.5" /> Gold Price Lock Guarantee
                                            </p>
                                            <p>Gold and diamond prices are locked immediately after your order is successfully placed.</p>
                                        </div>

                                        {/* Place Order Button */}
                                        <button
                                            type="button"
                                            disabled={subtotalSum === 0}
                                            onClick={handlePlaceOrder}
                                            className="w-full bg-[var(--color-teal)] text-[var(--color-white)] font-secondary tracking-[0.2em] text-xs uppercase py-4 px-6 rounded-[var(--radius-sm)] hover:bg-[var(--color-teal-dark)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 ease-out focus:outline-none flex items-center justify-center gap-2 shadow-md cursor-pointer"
                                        >
                                            <span>Place Secure Order</span>
                                            <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
                                        </button>

                                        <div className="flex justify-center gap-4 text-[9px] font-secondary tracking-widest uppercase text-[var(--color-text-muted)] opacity-70 text-center">
                                            <button type="button" onClick={() => setItems([])} className="hover:text-red-800 transition-colors cursor-pointer">Simulate Empty Cart State</button>
                                        </div>
                                    </div>

                                    {/* Secure Badges */}
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div className="p-4 border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] bg-[var(--color-bg-secondary)]/50">
                                            <ShieldCheck className="w-4 h-4 mx-auto text-[var(--color-teal)] mb-1.5 stroke-[1.5]" />
                                            <h5 className="font-primary text-[11px] text-[var(--color-text)] tracking-wider mb-0.5">100% Certified Jewelry</h5>
                                            <p className="font-secondary text-[9px] text-[var(--color-text-muted)] tracking-wide leading-tight">Every piece features official hallmarked certification.</p>
                                        </div>
                                        <div className="p-4 border border-[var(--color-border-subtle)] rounded-[var(--radius-sm)] bg-[var(--color-bg-secondary)]/50">
                                            <Lock className="w-4 h-4 mx-auto text-[var(--color-teal)] mb-1.5 stroke-[1.5]" />
                                            <h5 className="font-primary text-[11px] text-[var(--color-text)] tracking-wider mb-0.5">Fully Insured Transit</h5>
                                            <p className="font-secondary text-[9px] text-[var(--color-text-muted)] tracking-wide leading-tight">Your delivery is guarded securely until signed for.</p>
                                        </div>
                                    </div>

                                </div>

                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>

                {/* ==========================================================================
         STICKY BOTTOM MOBILE CALL-TO-ACTION
         ========================================================================== */}
                {items.length > 0 && !isPageLoading && (
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-bg)]/95 backdrop-blur-md border-t border-[var(--color-border)] z-[200] p-4 flex items-center justify-between gap-4 shadow-lg">
                        <div className="flex flex-col">
                            <span className="font-secondary text-[9px] uppercase tracking-widest text-[var(--color-text-muted)]">
                                Total ({totalQuantityCount} items)
                            </span>
                            <span className="font-display text-base font-semibold text-[var(--color-teal)]">
                                ₹{finalAggregatedTotal.toLocaleString('en-IN')}
                            </span>
                        </div>
                        <button
                            type="button"
                            disabled={subtotalSum === 0}
                            onClick={handlePlaceOrder}
                            className="flex-1 max-w-[200px] bg-[var(--color-teal)] text-[var(--color-white)] font-secondary tracking-widest text-[10px] uppercase py-3.5 px-4 text-center font-medium shadow-sm focus:outline-none rounded-[var(--radius-sm)] cursor-pointer active:scale-[0.99] disabled:opacity-30 transition-all"
                        >
                            Place Order
                        </button>
                    </div>
                )}
            </main>

            <Footer onCategoryChange={setActiveCategory} />
        </>
    );
}
