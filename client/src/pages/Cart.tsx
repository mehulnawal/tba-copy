import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Heart, Plus, Minus, ArrowRight, ShieldCheck, Truck, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useCart, useUpdateCartItem, useRemoveFromCart } from '../hooks/useCart';
import { checkoutApi } from '../api/checkout.api';
import { useToast } from '../context/ToastContext';
import { ApiRequestError } from '../api/client';

/* ==========================================================================
   INTERFACE CONFIGURATIONS
   ========================================================================== */
interface CartItem {
    id: string;
    slug: string;
    name: string;
    category: string;
    image: string;
    quantity: number;
    price: number;
}

/* ==========================================================================
   ANIMATION CONFIGURATIONS
   ========================================================================== */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.215, 0.610, 0.355, 1.000] as const }
    },
    exit: {
        opacity: 0,
        x: -20,
        transition: { duration: 0.3, ease: [0.4, 0, 1, 1] as const }
    }
};

/* ==========================================================================
   MAIN COMPONENT IMPLEMENTATION
   ========================================================================== */
export default function CartPage() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { data: cartData, isLoading: isCartLoading, isError } = useCart();
    const updateCartMutation = useUpdateCartItem();
    const removeCartMutation = useRemoveFromCart();

    const [isPageLoading, setIsPageLoading] = useState(true);

    const cart: CartItem[] = useMemo(
        () =>
            (cartData?.items || []).map((item) => ({
                id: item._id,
                slug: item.slug,
                name: item.name,
                category: item.category,
                image: item.image,
                quantity: item.quantity,
                price: item.price,
            })),
        [cartData],
    );

    // Coupon Module Frontend State
    const [couponCode, setCouponCode] = useState('');
    const [couponStatus, setCouponStatus] = useState<'idle' | 'valid' | 'invalid' | 'expired' | 'unmet'>('idle');
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [shippingFee, setShippingFee] = useState(0);

    // Delivery Module Frontend State
    const [pincode, setPincode] = useState('');
    const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'unsupported'>('idle');

    useEffect(() => {
        if (!isCartLoading) {
            const timer = setTimeout(() => setIsPageLoading(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isCartLoading]);

    useEffect(() => {
        if (isError) {
            showToast('Unable to load cart', 'error');
        }
    }, [isError, showToast]);

    // Structural Math & Value Aggregation
    const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const resolvedShippingFee = shippingFee || (subtotal > 25000 || subtotal === 0 ? 0 : 150);
    const estimatedTotal = subtotal - appliedDiscount + resolvedShippingFee;

    // Updated updateQuantity: Quantity 1 hone par remove chalega
    const updateQuantity = async (id: string, delta: number) => {
        const item = cart.find((entry) => entry.id === id);
        if (!item) return;

        // Agar quantity 1 hai aur minus daba rahe hain toh item delete kar do[cite: 6]
        if (item.quantity === 1 && delta === -1) {
            await handleRemoveItem(id);
            return;
        }

        const targetQty = item.quantity + delta;
        if (targetQty < 1) return;

        try {
            await updateCartMutation.mutateAsync({ itemId: id, quantity: targetQty });
        } catch (error) {
            const message = error instanceof ApiRequestError ? error.message : 'Failed to update quantity';
            showToast(message, 'error');
        }
    };

    const handleRemoveItem = async (id: string) => {
        try {
            await removeCartMutation.mutateAsync(id);
            showToast('Item removed from cart', 'success');
        } catch (error) {
            const message = error instanceof ApiRequestError ? error.message : 'Failed to remove item';
            showToast(message, 'error');
        }
    };

    const handleApplyCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!couponCode.trim()) return;

        try {
            const result = await checkoutApi.applyCoupon(couponCode.trim());
            setCouponStatus('valid');
            setAppliedDiscount(result.summary.discount);
            setShippingFee(result.summary.shippingFee);
            showToast('Coupon applied successfully', 'success');
        } catch (error) {
            setCouponStatus('invalid');
            setAppliedDiscount(0);
            const message = error instanceof ApiRequestError ? error.message : 'Invalid coupon code';
            showToast(message, 'error');
        }
    };

    const handleCheckPincode = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pincode.trim()) return;

        setPincodeStatus('checking');
        setTimeout(() => {
            if (pincode === '10001' || pincode === '90210') {
                setPincodeStatus('valid');
            } else if (pincode === '00000') {
                setPincodeStatus('unsupported');
            } else {
                setPincodeStatus('invalid');
            }
        }, 700);
    };

    const handleResetSimulation = () => {
        navigate('/products');
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

            <main className="min-h-screen bg-[var(--color-bg)] transition-colors duration-300 text-[var(--color-text)] styled-scrollbar antialiased pb-24 lg:pb-12">
                <div className="container section-padding">

                    {/* Editorial Page Header Module */}
                    <header className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
                        <span className="section-label">Your Selection</span>
                        <h1 className="font-primary text-3xl sm:text-4xl md:text-5xl tracking-wide font-light text-[var(--color-teal)] mb-2">
                            Shopping Cart
                        </h1>
                        <p className="font-secondary text-xs sm:text-sm text-[var(--color-text-muted)] tracking-widest uppercase font-light">
                            {totalItemsCount} {totalItemsCount === 1 ? 'Curated Masterpiece' : 'Curated Masterpieces'}
                        </p>
                        <div className="h-[1px] w-12 bg-[var(--color-cream)] mx-auto mt-4" />

                        {cart.length === 0 && !isPageLoading && (
                            <button
                                onClick={handleResetSimulation}
                                className="mt-4 font-secondary text-[10px] tracking-widest uppercase text-[var(--color-teal)]/40 hover:text-[var(--color-teal)] transition-colors duration-200 underline underline-offset-4"
                            >
                                Reset Simulation Matrix
                            </button>
                        )}
                    </header>

                    <AnimatePresence mode="wait">
                        {isPageLoading ? (
                            <motion.div
                                key="loading-skeleton"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
                            >
                                <div className="lg:col-span-8 space-y-6">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="flex gap-4 sm:gap-6 border-b border-[var(--color-border-subtle)] pb-6">
                                            <div className="skeleton w-24 sm:w-32 aspect-[3/4] shrink-0" />
                                            <div className="flex-1 space-y-3 py-2">
                                                <div className="skeleton h-5 w-2/3" />
                                                <div className="skeleton h-4 w-1/3" />
                                                <div className="skeleton h-8 w-24 mt-4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="lg:col-span-4 space-y-4">
                                    <div className="skeleton h-64 w-full" />
                                </div>
                            </motion.div>
                        ) : cart.length > 0 ? (
                            <motion.div
                                key="active-cart"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
                            >
                                {/* Product Grid Cluster (Left Column) */}
                                <div className="lg:col-span-8 space-y-1">
                                    <div className="hidden sm:grid grid-cols-12 pb-3 text-[10px] font-secondary tracking-[0.2em] uppercase text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)] px-2">
                                        <div className="col-span-6">Creation Details</div>
                                        <div className="col-span-3 text-center">Quantity</div>
                                        <div className="col-span-3 text-right">Subtotal</div>
                                    </div>

                                    <div className="divide-y divide-[var(--color-border-subtle)]">
                                        <AnimatePresence mode="popLayout">
                                            {cart.map((item) => (
                                                <motion.div
                                                    key={item.id}
                                                    variants={itemVariants}
                                                    layout
                                                    className={`grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-2 py-6 items-center px-2 transition-opacity duration-300 ${false ? 'opacity-65' : 'opacity-100'
                                                        }`}
                                                >
                                                    {/* Image & Main Editorial Descriptors */}
                                                    <div className="col-span-1 sm:col-span-6 flex gap-4 sm:gap-6 items-center">
                                                        <div
                                                            onClick={() => navigate(`/product/${item.slug}`)}
                                                            className="relative w-20 sm:w-28 aspect-[3/4] bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] shrink-0 overflow-hidden group cursor-pointer"
                                                        >
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                            {false && (
                                                                <div className="absolute inset-0 bg-[var(--color-bg)]/80 backdrop-blur-xs flex items-center justify-center p-1 text-center">
                                                                    <span className="font-secondary text-[8px] tracking-[0.2em] uppercase text-red-800 font-medium">
                                                                        Waitlisted
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-1 min-w-0">
                                                            <span className="font-secondary text-[9px] tracking-[0.25em] text-[var(--color-text-muted)] uppercase block">
                                                                {item.category}
                                                            </span>
                                                            <h3
                                                                onClick={() => navigate(`/product/${item.slug}`)}
                                                                className="font-primary text-base text-[var(--color-text)] tracking-wide line-clamp-2 leading-snug cursor-pointer hover:text-[var(--color-teal)] transition-colors duration-200"
                                                            >
                                                                {item.name}
                                                            </h3>
                                                            <div className="font-display text-xs text-[var(--color-text-muted)] pt-0.5">
                                                                Piece Value: ₹{item.price.toLocaleString()}
                                                            </div>

                                                            {/* Mobile Inline Controls Container */}
                                                            <div className="flex sm:hidden items-center gap-4 pt-3">
                                                                <div className="flex items-center border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]">
                                                                    <button
                                                                        type="button"
                                                                        disabled={false} // Updated: Item quantity check removed
                                                                        onClick={() => updateQuantity(item.id, -1)}
                                                                        className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30 transition-colors cursor-pointer"
                                                                        aria-label="Reduce units"
                                                                    >
                                                                        <Minus className="w-3 h-3 stroke-[1.5]" />
                                                                    </button>
                                                                    <span className="w-6 text-center font-display text-xs">{item.quantity}</span>
                                                                    <button
                                                                        type="button"
                                                                        disabled={false}
                                                                        onClick={() => updateQuantity(item.id, 1)}
                                                                        className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30 transition-colors cursor-pointer"
                                                                        aria-label="Add units"
                                                                    >
                                                                        <Plus className="w-3 h-3 stroke-[1.5]" />
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleRemoveItem(item.id)}
                                                                    className="text-[var(--color-text-muted)] hover:text-red-800 transition-colors"
                                                                    aria-label="Remove item"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Desktop Quantitative Modifiers */}
                                                    <div className="hidden sm:col-span-3 sm:flex flex-col items-center justify-center gap-2">
                                                        <div className="flex items-center border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] shadow-xs">
                                                            <button
                                                                type="button"
                                                                disabled={false} // Updated: Item quantity check removed
                                                                onClick={() => updateQuantity(item.id, -1)}
                                                                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30 transition-colors cursor-pointer focus:outline-none"
                                                                aria-label="Decrement item quantity"
                                                            >
                                                                <Minus className="w-3 h-3 stroke-[1.5]" />
                                                            </button>
                                                            <span className="w-8 text-center font-display text-xs select-none">{item.quantity}</span>
                                                            <button
                                                                type="button"
                                                                disabled={false}
                                                                onClick={() => updateQuantity(item.id, 1)}
                                                                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30 transition-colors cursor-pointer focus:outline-none"
                                                                aria-label="Increment item quantity"
                                                            >
                                                                <Plus className="w-3 h-3 stroke-[1.5]" />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => navigate('/wishlist')}
                                                                className="font-secondary text-[9px] tracking-widest text-[var(--color-text-muted)] uppercase hover:text-[var(--color-teal)] transition-colors focus:outline-none"
                                                            >
                                                                Save to Wishlist
                                                            </button>
                                                            <span className="text-[var(--color-border-subtle)] text-xs">|</span>
                                                            <button
                                                                onClick={() => handleRemoveItem(item.id)}
                                                                className="font-secondary text-[9px] tracking-widest text-[var(--color-text-muted)] uppercase hover:text-red-800 transition-colors focus:outline-none"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Line Matrix Total Value Presentation */}
                                                    <div className="hidden sm:col-span-3 sm:block text-right font-display text-sm tracking-wide text-[var(--color-text)] font-medium">
                                                        {true ? `₹${(item.price * item.quantity).toLocaleString()}` : '—'}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Order Summary Ledger Section */}
                                <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6">
                                    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-6 shadow-sm">
                                        <h2 className="font-primary text-xl tracking-wide text-[var(--color-text)] mb-6 font-light pb-2 border-b border-[var(--color-border-subtle)]">
                                            Dossier Summary
                                        </h2>

                                        <div className="space-y-4 font-secondary text-xs tracking-wide">
                                            <div className="flex justify-between text-[var(--color-text-muted)]">
                                                <span>Subtotal Selection</span>
                                                <span className="font-display font-medium text-[var(--color-text)]">₹{subtotal.toLocaleString()}</span>
                                            </div>

                                            {appliedDiscount > 0 && (
                                                <div className="flex justify-between text-emerald-800 font-medium">
                                                    <span className="flex items-center gap-1.5">
                                                        <Sparkles className="w-3 h-3" /> Promotion Applied
                                                    </span>
                                                    <span className="font-display">-${appliedDiscount.toLocaleString()}</span>
                                                </div>
                                            )}

                                            <div className="pt-4 border-t border-[var(--color-border-subtle)] flex justify-between items-baseline">
                                                <span className="text-sm font-medium text-[var(--color-text)]">Estimated Vault Total</span>
                                                <span className="font-display text-xl font-semibold text-[var(--color-teal)]">
                                                    ₹{estimatedTotal.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate('/checkout')}
                                            className="w-full mt-6 bg-[var(--color-teal)] text-[var(--color-cream)] font-secondary tracking-[0.2em] text-xs uppercase py-4 px-6 border border-transparent hover:bg-[var(--color-teal-dark)] transition-all duration-300 ease-out focus:outline-none focus:ring-1 focus:ring-[var(--color-teal)] flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                                        >
                                            <span>Proceed to Secured Checkout</span>
                                            <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
                                        </button>

                                        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-secondary tracking-widest uppercase text-[var(--color-text-muted)] opacity-60">
                                            <ShieldCheck className="w-3.5 h-3.5" /> End-to-End Encrypted Secure Checkout
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty-cart"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.55 }}
                                className="max-w-md mx-auto text-center py-16 px-6 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex flex-col items-center justify-center shadow-xs"
                            >
                                <div className="w-14 h-14 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] mb-6 opacity-75">
                                    <ShoppingBag className="w-5 h-5 stroke-[1.25]" />
                                </div>
                                <h2 className="font-primary text-xl sm:text-2xl text-[var(--color-text)] tracking-wide font-light mb-3">
                                    Your Selection Portfolio is Clear
                                </h2>
                                <p className="font-secondary text-xs sm:text-sm text-[var(--color-text-muted)] tracking-wide font-light max-w-xs mx-auto leading-relaxed mb-8">
                                    The collection portfolio is currently unassigned. Explore our fine rings, curated necklaces, and bespoke seasonal releases.
                                </p>
                                <button
                                    onClick={() => navigate('/products')}
                                    className="group flex items-center justify-center gap-2.5 bg-[var(--color-teal)] text-[var(--color-cream)] font-secondary tracking-[0.25em] text-[11px] uppercase py-4 px-8 border border-transparent hover:bg-[var(--color-teal-dark)] transition-all duration-400 ease-out focus:outline-none cursor-pointer"
                                >
                                    <span>Browse Collections</span>
                                    <ArrowRight className="w-3.5 h-3.5 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-1" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Mobile Sticky Checkout Bar */}
                {cart.length > 0 && !isPageLoading && (
                    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-bg)]/95 backdrop-blur-md border-t border-[var(--color-border)] z-[200] p-4 flex items-center justify-between gap-4 shadow-[0_-4px_16px_rgba(28,59,72,0.08)]">
                        <div className="flex flex-col">
                            <span className="font-secondary text-[9px] uppercase tracking-widest text-[var(--color-text-muted)]">
                                Est. Total ({totalItemsCount})
                            </span>
                            <span className="font-display text-base font-semibold text-[var(--color-teal)]">
                                ₹{estimatedTotal.toLocaleString()}
                            </span>
                        </div>
                        <button
                            onClick={() => navigate('/checkout')}
                            className="flex-1 max-w-[200px] bg-[var(--color-teal)] text-[var(--color-cream)] font-secondary tracking-widest text-[10px] uppercase py-3.5 px-4 text-center font-medium shadow-xs focus:outline-none active:scale-[0.98] transition-transform"
                        >
                            Secure Checkout
                        </button>
                    </div>
                )}
            </main>

            <Footer onCategoryChange={setActiveCategory} />
        </>
    );
}