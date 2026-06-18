import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ============================================
// TYPE DEFINITIONS FOR THE JEWELRY ORDER
// ============================================
interface ProductItem {
    id: number;
    name: string;
    option: string;
    price: number;
    image: string;
}

interface ShippingAddress {
    name: string;
    street: string;
    cityStateZip: string;
    country: string;
}

interface OrderDetails {
    id: string;
    date: string;
    paymentMethod: string;
    shippingAddress: ShippingAddress;
    deliveryEstimate: string;
    items: ProductItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
}

export default function OrderConfirmation(): React.JSX.Element {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [animationActive, setAnimationActive] = useState<boolean>(true);
    const [showNotification, setShowNotification] = useState<boolean>(true);

    // Mock Data for the customer purchase
    const orderDetails: OrderDetails = {
        id: "TBA-8492041",
        date: "June 1, 2026",
        paymentMethod: "Visa ending in 8842",
        shippingAddress: {
            name: "Eleanor Vance",
            street: "1428 Elmhurst Drive, Suite 400",
            cityStateZip: "Beverly Hills, CA 90210",
            country: "United States",
        },
        deliveryEstimate: "June 4 — June 6, 2026",
        items: [
            {
                id: 1,
                name: "Aurelia Brilliant Cut Diamond Engagement Ring",
                option: "18k Yellow Gold / 1.75 Carat / VVS1 Clarity",
                price: 4850.0,
                image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
            },
            {
                id: 2,
                name: "Seraphina Infinite Loop Tennis Bracelet",
                option: "18k White Gold / 3.5 Carat Total Weight",
                price: 3200.0,
                image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
            },
        ],
        subtotal: 8050.0,
        shipping: 0.0, // Free Premium Insured Shipping
        tax: 644.0,
        total: 8694.0,
    };

    // Elegant Gold Shimmer Canvas Particle Effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let particles: LuxurySparkle[] = [];

        // Check if the user dislikes screen movement
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) {
            setAnimationActive(false);
            return;
        }

        const resizeCanvas = (): void => {
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // Particle logic mimicking soft gold dust and diamond light sparks[cite: 1]
        class LuxurySparkle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            color: string;
            alpha: number;
            decay: number;

            constructor() {
                this.x = Math.random() * (canvas?.width ?? window.innerWidth);
                this.y = Math.random() * ((canvas?.height ?? window.innerHeight) * 0.4) + ((canvas?.height ?? window.innerHeight) * 0.1);
                this.size = Math.random() * 2.5 + 0.5;
                this.speedX = Math.random() * 0.6 - 0.3;
                this.speedY = Math.random() * -0.8 - 0.2; // Slowly drifts upwards
                // Uses the gold color token or pure shining white
                this.color = Math.random() > 0.4 ? "rgba(219, 213, 181, " : "rgba(255, 255, 255, ";
                this.alpha = Math.random() * 0.6 + 0.4;
                this.decay = Math.random() * 0.01 + 0.005;
            }

            update(): void {
                this.x += this.speedX;
                this.y += this.speedY;
                this.alpha -= this.decay;
            }

            draw(context: CanvasRenderingContext2D): void {
                context.save();
                context.beginPath();
                context.globalAlpha = this.alpha;
                context.fillStyle = this.color + this.alpha + ")";
                if (this.size > 1.8) {
                    context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                } else {
                    context.rect(this.x, this.y, this.size, this.size);
                }
                context.fill();
                context.restore();
            }
        }

        // Spawn initial elegant particles
        for (let i = 0; i < 65; i++) {
            particles.push(new LuxurySparkle());
        }

        const animate = (): void => {
            if (!canvas || !ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = particles.length - 1; i >= 0; i--) {
                const particle = particles[i];
                particle.update();
                particle.draw(ctx);

                if (particle.alpha <= 0 || particle.y < 0) {
                    particles.splice(i, 1);
                }
            }

            if (particles.length > 0) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setAnimationActive(false);
            }
        };

        animate();

        // Close the top pop-up notification and canvas after 7 seconds automatically
        const timeoutId = setTimeout(() => {
            cancelAnimationFrame(animationFrameId);
            setAnimationActive(false);
            setShowNotification(false);
        }, 7000);

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            clearTimeout(timeoutId);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <>
            <div className="min-h-screen font-secondary bg-[var(--color-bg)] text-[var(--color-text)] relative overflow-x-clip antialiased selection:bg-[var(--color-cream)] selection:text-[var(--color-teal-dark)] pb-2">

                {/* Sparkle Background Layer[cite: 1] */}
                {animationActive && (
                    <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none z-[200]"
                        style={{ mixBlendMode: "screen" }}
                    />
                )}

                <Navbar
                    onSearchChange={setSearchQuery}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                />

                {/* FIXED VISUAL FIX: Elegant Pop-up Alert Box at the Top */}
                {showNotification && (
                    <div className="w-full bg-[var(--color-bg-secondary)] border-b border-[var(--color-cream)] py-3 px-4 text-center text-xs tracking-wide text-[var(--color-teal)] animate-[slideDown_0.4s_ease-out] relative z-[250] flex items-center justify-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-success)]"></span>
                        <span>Your payment was successful and your order is securely locked in.</span>
                        <button
                            onClick={() => setShowNotification(false)}
                            className="ml-4 text-[var(--color-text-muted)] hover:text-[var(--color-teal)] font-bold text-sm cursor-pointer"
                            aria-label="Close message"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Page Content Layout */}
                <main className="container max-w-[1100px] mt-12 px-4 sm:px-6 animate-[fadeIn_0.6s_ease-out]">

                    {/* ============================================
           1. SUCCESS HERO SECTION
           ============================================ */}
                    <section className="text-center max-w-[680px] mx-auto mb-16 flex flex-col items-center">
                        <div className="relative mb-6 flex items-center justify-center">
                            {/* Soft pulsing layout accent ring */}
                            <div className="absolute w-16 h-16 rounded-full border border-[var(--color-cream)] animate-[ping_2.5s_cubic-bezier(0.2,0,0,1)_infinite] opacity-40"></div>
                            <div className="w-12 h-12 rounded-full border border-[var(--color-teal)] bg-[var(--color-bg)] flex items-center justify-center z-10 shadow-sm">
                                <svg
                                    className="w-5 h-5 text-[var(--color-teal)]"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                        </div>

                        <span className="section-label">Order Confirmed</span>
                        <h1 className="font-primary text-3xl sm:text-4xl text-[var(--color-teal)] tracking-wide mb-4 font-normal">
                            Thank you for your purchase
                        </h1>
                        <p className="text-base text-[var(--color-text-muted)] font-normal max-w-[540px] leading-relaxed">
                            Your items are now being prepared by our team. We have sent a copy of your receipt and order details to{" "}
                            <span className="text-[var(--color-teal)] font-medium">e.vance@studio.com</span>.
                        </p>
                    </section>

                    {/* Two-Column Structured Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                        {/* LEFT PANEL: Products and Address Information */}
                        <div className="lg:col-span-7 space-y-8">

                            {/* ============================================
               2. PRODUCT PREVIEW SECTION
               ============================================ */}
                            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-6 sm:p-8 shadow-[var(--shadow-sm)]">
                                <h2 className="font-primary text-xl text-[var(--color-teal)] tracking-wide mb-6 pb-4 border-b border-[var(--color-border-tertiary)]">
                                    Items Ordered
                                </h2>

                                <div className="space-y-6">
                                    {orderDetails.items.map((item) => (
                                        <div key={item.id} className="flex gap-4 sm:gap-6 items-start py-2">
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[var(--color-bg)] rounded-[var(--radius-sm)] overflow-hidden border border-[var(--color-border-subtle)] flex-shrink-0 relative group">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover transition-transform duration-[var(--transition-slow)] group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-primary text-base sm:text-lg text-[var(--color-teal)] font-normal leading-snug tracking-wide line-clamp-2">
                                                    {item.name}
                                                </h3>
                                                <p className="text-xs text-[var(--color-text-muted)] mt-1 font-normal tracking-wide">
                                                    {item.option}
                                                </p>
                                                <p className="text-sm text-[var(--color-teal)] font-medium mt-2">
                                                    ${item.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>



                            {/* ============================================
               4. TRUST / REASSURANCE SECTION
               ============================================ */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                <div className="border border-[var(--color-border-subtle)] bg-[var(--color-cream-light)]/40 p-5 rounded-[var(--radius-sm)]">
                                    <h4 className="font-primary text-sm text-[var(--color-teal)] font-semibold tracking-wide mb-1">
                                        100% Authentic
                                    </h4>
                                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                                        All pieces are original designs and come with official quality grading certificates.
                                    </p>
                                </div>
                                <div className="border border-[var(--color-border-subtle)] bg-[var(--color-cream-light)]/40 p-5 rounded-[var(--radius-sm)]">
                                    <h4 className="font-primary text-sm text-[var(--color-teal)] font-semibold tracking-wide mb-1">
                                        Insured Delivery
                                    </h4>
                                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                                        Your shipment is completely insured until it is safely signed for at your door.
                                    </p>
                                </div>
                                <div className="border border-[var(--color-border-subtle)] bg-[var(--color-cream-light)]/40 p-5 rounded-[var(--radius-sm)]">
                                    <h4 className="font-primary text-sm text-[var(--color-teal)] font-semibold tracking-wide mb-1">
                                        Full Guarantee
                                    </h4>
                                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                                        We offer free checks, custom size adjustments, and polishing for your jewelry pieces.
                                    </p>
                                </div>
                            </div>

                        </div>

                        {/* RIGHT PANEL: Financial Breakdowns & Summary Layout */}
                        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">

                            {/* ============================================
               5. ORDER SUMMARY BLOCK
               ============================================ */}
                            <div className="bg-[var(--color-bg)] border border-[var(--color-teal)] rounded-[var(--radius-md)] p-6 sm:p-8 shadow-[var(--shadow-md)] relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-[3px] bg-[var(--color-cream)]"></div>

                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <span className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] block">Order Number</span>
                                        <span className="font-mono text-sm font-medium text-[var(--color-teal)] tracking-wider uppercase">
                                            {orderDetails.id}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] block">Date</span>
                                        <span className="text-sm font-medium text-[var(--color-text)]">
                                            {orderDetails.date}
                                        </span>
                                    </div>
                                </div>

                                <h2 className="font-primary text-lg text-[var(--color-teal)] tracking-wide mb-4 pb-2 border-b border-[var(--color-border-tertiary)]">
                                    Payment Summary
                                </h2>

                                <div className="space-y-3.5 text-sm">
                                    <div className="flex justify-between text-[var(--color-text)]">
                                        <span className="text-[var(--color-text-muted)]">Subtotal</span>
                                        <span>${orderDetails.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[var(--color-text-muted)]">Shipping & Handling</span>
                                        <span className="text-xs uppercase tracking-widest text-[var(--color-success)] font-medium">
                                            Free
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[var(--color-text)]">
                                        <span className="text-[var(--color-text-muted)]">Estimated Taxes</span>
                                        <span>${orderDetails.tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                                    </div>

                                    <div className="pt-4 mt-2 border-t border-[var(--color-border-subtle)] flex justify-between items-baseline">
                                        <span className="font-primary text-lg text-[var(--color-teal)]">Total Paid</span>
                                        <span className="text-xl font-bold text-[var(--color-teal-dark)] tracking-wide">
                                            ${orderDetails.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-[var(--color-border-tertiary)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                                    <span>Paid via</span>
                                    <span className="font-medium text-[var(--color-text)]">{orderDetails.paymentMethod}</span>
                                </div>
                            </div>

                            {/* ============================================
               6. SUPPORT / HELP SECTION
               ============================================ */}
                            <div id="help" className="border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] rounded-[var(--radius-md)] p-6 text-center">
                                <h3 className="font-primary text-base text-[var(--color-teal)] mb-1">
                                    Have a Question About Your Order?
                                </h3>
                                <p className="text-xs text-[var(--color-text-muted)] max-w-[340px] mx-auto mb-4 leading-relaxed">
                                    Our support team is here to help you change order sizes, edit details, or handle special delivery steps.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2 justify-center items-center text-xs">
                                    <a
                                        href="mailto:concierge@tbajewellery.com"
                                        className="px-4 py-2 border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--color-teal)] bg-[var(--color-bg)] hover:bg-[var(--color-cream-light)] w-full sm:w-auto transition-colors font-medium text-center"
                                    >
                                        concierge@tbajewellery.com
                                    </a>
                                    <span className="text-[var(--color-text-muted)] hidden sm:inline">or</span>
                                    <span className="text-[var(--color-teal)] font-medium tracking-wide">
                                        1-800-TBA-GOLD
                                    </span>
                                </div>
                            </div>

                            {/* ============================================
               7. CTA ACTIONS SECTION
               ============================================ */}
                            <div className="space-y-3 pt-2">
                                <button
                                    onClick={(): string => window.location.href = "/collections"}
                                    className="w-full bg-[var(--color-teal)] text-white font-secondary text-sm tracking-[0.15em] uppercase py-4 rounded-[var(--radius-sm)] shadow-[var(--shadow-sm)] hover:bg-[var(--color-teal-dark)] transition-colors duration-[var(--transition-base)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-cream)]"
                                >
                                    Continue Shopping
                                </button>
                                <button
                                    onClick={(): void => window.print()}
                                    className="w-full bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)] font-secondary text-xs tracking-widest uppercase py-3 rounded-[var(--radius-sm)] hover:bg-[var(--color-cream-light)] transition-colors duration-[var(--transition-fast)] cursor-pointer hidden sm:block"
                                >
                                    Print Receipt
                                </button>
                            </div>

                        </div>

                    </div>
                </main>

                {/* Embedded Clear Global Keyframe Rules */}
                <style dangerouslySetInnerHTML={{
                    __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        } `}} />

            </div>
            <Footer onCategoryChange={setActiveCategory} />
        </>
    );
}