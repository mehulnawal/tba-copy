import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { formatINR } from "../utils/currency";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useAddToCart } from "../hooks/useCart";
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from "../hooks/useWishlist";
import { AuthModal } from "../pages/AuthModal";
import primeCollection from '../assets/primeCollection/img2.png';

interface Product {
    id: string;
    code: string;
    name: string;
    category: string;
    tags: string[];
    prices: { karat: string; finalPrice: number }[];
    images: string[];
}

interface Hotspot {
    id: string;
    x: number; // Plus button X percentage axis
    y: number; // Plus button Y percentage axis
    anchorX: number; // White guide line target X
    anchorY: number; // White guide line target Y
    label: string;
    products: Product[];
}

interface Look {
    id: string;
    image: string;
    hotspots: Hotspot[];
}

const PRIME_LOOKS: Look[] = [
    {
        id: "look-1",
        image: primeCollection,
        hotspots: [
            {
                id: "spot-necklace",
                x: 49.5,
                y: 54.0,
                anchorX: 49.5,
                anchorY: 72.0,
                label: "Diamond Tier Necklace",
                products: [
                    {
                        id: "TBA-GLD-NL0001",
                        code: "#TBA-GLD-NL0001",
                        name: "Royal Bridal Gold Necklace",
                        category: "Diamond Necklace",
                        tags: ["PRIME COLLECTION"],
                        prices: [{ karat: "14kt", finalPrice: 1271473 }, { karat: "18kt", finalPrice: 1680088 }],
                        images: ["https://res.cloudinary.com/dkrchgmhx/image/upload/v1785928643/tba-products/ezsrtxzmx94kkywtqlmg.jpg"]
                    }
                ]
            }
        ]
    }
];

export default function PrimeSelection() {
    const [currentLookIndex, setCurrentLookIndex] = useState(0);
    const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
    const [showDrawer, setShowDrawer] = useState(false);

    const [startCoords, setStartCoords] = useState<{ x: number; y: number } | null>(null);
    const [endCoords, setEndCoords] = useState<{ x: number; y: number } | null>(null);
    const [isDesktop, setIsDesktop] = useState(false);
    const [imageIndices, setImageIndices] = useState<Record<string, number>>({});
    const [selectedKarats, setSelectedKarats] = useState<Record<string, string>>({});
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const addToCartMutation = useAddToCart();
    const { data: wishlist = [] } = useWishlist(isAuthenticated);
    const addToWishlistMutation = useAddToWishlist();
    const removeFromWishlistMutation = useRemoveFromWishlist();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ type: "cart" | "wishlist"; product: Product; karat: string } | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const drawerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // MOBILE LAUNCH LOCK: Full body structure freeze on small viewports
    useEffect(() => {
        if (selectedHotspot && !isDesktop) {
            document.body.style.overflow = "hidden";
            document.body.style.touchAction = "none";
        } else {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        }
        return () => {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        };
    }, [selectedHotspot, isDesktop]);

    // Vector Calculation Module for Desktop Curved Teal Line Pathing
    useEffect(() => {
        if (!selectedHotspot || !canvasRef.current || !isDesktop) return;

        const updateVectorLinePath = () => {
            if (!canvasRef.current) return;
            const canvasRect = canvasRef.current.getBoundingClientRect();

            // 1. Source Coordinates (Hotspot Center relative to Canvas Container)
            const absoluteStartX = (selectedHotspot.x / 100) * canvasRect.width;
            const absoluteStartY = (selectedHotspot.y / 100) * canvasRect.height;
            setStartCoords({ x: absoluteStartX, y: absoluteStartY });

            // 2. Target Drawer Coordinates (Middle-Left edge of the Centered Drawer)
            if (drawerRef.current) {
                const drawerRect = drawerRef.current.getBoundingClientRect();
                const targetX = drawerRect.left - canvasRect.left;
                const targetY = (drawerRect.top + drawerRect.height / 2) - canvasRect.top;
                setEndCoords({ x: targetX, y: targetY });
            } else {
                // Fallback estimate if ref hasn't rendered completely yet
                setEndCoords({ x: canvasRect.width - 350, y: canvasRect.height / 2 });
            }
        };

        updateVectorLinePath();
        const resizeSync = setInterval(updateVectorLinePath, 100);
        window.addEventListener("resize", updateVectorLinePath);

        return () => {
            clearInterval(resizeSync);
            window.removeEventListener("resize", updateVectorLinePath);
        };
    }, [selectedHotspot, isDesktop, showDrawer]);

    const handleHotspotClick = (e: React.MouseEvent, hotspot: Hotspot) => {
        e.preventDefault();
        e.stopPropagation();

        setSelectedHotspot(hotspot);

        if (isDesktop) {
            // Desktop Flow: Triggers wave line animation first, then launches popup drawer
            setShowDrawer(false);
            setTimeout(() => {
                setShowDrawer(true);
            }, 450);
        } else {
            // Mobile Flow: Direct swift trigger without delay or line calculation paths
            setShowDrawer(true);
        }
    };

    const handleCloseModal = () => {
        setShowDrawer(false);
        setSelectedHotspot(null);
        setStartCoords(null);
        setEndCoords(null);
    };

    const handleAddToCart = async (product: Product, karat: string) => {
        if (!isAuthenticated) { setPendingAction({ type: "cart", product, karat }); setIsAuthOpen(true); return; }
        try { await addToCartMutation.mutateAsync({ productId: product.id, karat, quantity: 1 }); showToast("Item added to cart!", "success"); }
        catch (error: unknown) { showToast(error instanceof Error ? error.message : "Failed to add to cart.", "error"); }
    };
    const handleWishlistToggle = async (product: Product, karat: string) => {
        if (!isAuthenticated) { setPendingAction({ type: "wishlist", product, karat }); setIsAuthOpen(true); return; }
        const saved = wishlist.some((item) => item.productId === product.id);
        try { if (saved) { await removeFromWishlistMutation.mutateAsync(product.id); showToast("Removed from wishlist.", "success"); } else { await addToWishlistMutation.mutateAsync({ productId: product.id, karat }); showToast("Product saved to wishlist.", "success"); } }
        catch (error: unknown) { showToast(error instanceof Error ? error.message : "Could not update wishlist.", "error"); }
    };

    const handleAuthenticated = () => { const action = pendingAction; setPendingAction(null); setIsAuthOpen(false); if (action?.type === "cart") void handleAddToCart(action.product, action.karat); if (action?.type === "wishlist") void handleWishlistToggle(action.product, action.karat); };

    const CompactProductCard = ({ product }: { product: Product }) => {
        const imageIndex = imageIndices[product.id] || 0;
        const selectedKarat = selectedKarats[product.id] || product.prices[0]?.karat;
        const selectedPrice = product.prices.find((price) => price.karat === selectedKarat)?.finalPrice || 0;
        const isWishlisted = wishlist.some((item) => item.productId === product.id);
        return <article className="group relative flex gap-4 rounded-lg border border-[var(--color-border-subtle)] bg-white p-3.5 shadow-sm"><div className="relative h-52 w-40 shrink-0 overflow-hidden rounded-md bg-[var(--color-bg-secondary)] sm:h-64 sm:w-52"><img src={product.images[imageIndex]} alt={product.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />{product.images.length > 1 && <><button type="button" onClick={() => setImageIndices((current) => ({ ...current, [product.id]: (imageIndex - 1 + product.images.length) % product.images.length }))} className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1 text-[var(--color-teal)] shadow" aria-label="Previous product image"><ChevronLeft className="h-3 w-3" /></button><button type="button" onClick={() => setImageIndices((current) => ({ ...current, [product.id]: (imageIndex + 1) % product.images.length }))} className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1 text-[var(--color-teal)] shadow" aria-label="Next product image"><ChevronRight className="h-3 w-3" /></button></>}</div><div className="min-w-0 flex flex-1 flex-col py-1"><div className="flex items-start gap-2"><div className="min-w-0 flex-1"><p className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-text-muted)]">{product.code}</p><h4 className="mt-1 font-primary text-base leading-snug text-[var(--color-text)]">{product.name}</h4><p className="mt-1 text-[10px] tracking-wide text-[var(--color-text-muted)]">{product.category}</p></div><button type="button" onClick={() => void handleWishlistToggle(product, selectedKarat || product.prices[0]?.karat || "14kt")} aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"} className="rounded-full border border-[var(--color-border-subtle)] bg-white p-1.5 text-[var(--color-text-muted)] hover:text-rose-600"><Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-rose-600 stroke-rose-600" : ""}`} /></button></div><div className="mt-4 border-t border-[var(--color-border-subtle)] pt-3"><div className="flex items-end justify-between gap-2"><div><p className="text-[8px] uppercase tracking-widest text-[var(--color-text-muted)]">Estimated Price</p><p className="text-xs font-semibold text-[var(--color-text)]">{formatINR(selectedPrice)}</p></div><div className="flex gap-1">{product.prices.map((price) => <button key={price.karat} type="button" onClick={() => setSelectedKarats((current) => ({ ...current, [product.id]: price.karat }))} className={`rounded border px-1.5 py-0.5 text-[8px] font-semibold ${selectedKarat === price.karat ? "border-[var(--color-teal)] bg-[var(--color-cream-light)] text-[var(--color-teal)]" : "border-[var(--color-border-subtle)] text-[var(--color-text-muted)]"}`}>{price.karat.toUpperCase()}</button>)}</div></div><button type="button" onClick={() => void handleAddToCart(product, selectedKarat || product.prices[0]?.karat || "14kt")} disabled={addToCartMutation.isPending} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded bg-[var(--color-teal)] px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-white transition-[background-color,transform] duration-200 hover:bg-[var(--color-teal-light)] hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"><ShoppingBag className="h-3 w-3" />{addToCartMutation.isPending ? "Adding..." : "Add to Cart"}</button></div></div></article>;
    };
    return (
        <><section ref={containerRef} className="my-0 reveal-section py-8 md:py-12 bg-[var(--color-bg)] w-full relative" id="prime-selection-section">
            <div className="container mx-auto px-4 flex flex-col items-center w-full">

                {/* Section Titles */}
                <div className="flex flex-col items-center mb-5 text-center">
                    <span className="section-label">CRAFTED FOR TIMELESS MOMENTS</span>
                    <h2 className="font-primary text-3xl md:text-4xl text-[var(--color-text)] tracking-wide font-light">
                        Prime collection
                    </h2>
                    <div className="w-12 h-[1px] bg-[var(--color-cream)] mt-4" />
                </div>

                {/* Core Canvas Element Viewport Box */}
                <div
                    ref={canvasRef}
                    className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] rounded-xl overflow-hidden bg-zinc-100 shadow-md border border-[var(--color-border-subtle)]"
                >
                    <img
                        src={PRIME_LOOKS[currentLookIndex].image}
                        alt="Prime Collection Look"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-center select-none pointer-events-none"
                    />

                    {/* SVG Vector Systems Layer */}
                    <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
                        <svg className="w-full h-full">
                            {/* Constant Static White Reference Guidelines */}
                            {PRIME_LOOKS[currentLookIndex].hotspots.map((hotspot) => (
                                <line
                                    key={`static-${hotspot.id}`}
                                    x1={`${hotspot.x}%`}
                                    y1={`${hotspot.y + 1}%`}
                                    x2={`${hotspot.anchorX}%`}
                                    y2={`${hotspot.anchorY}%`}
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeDasharray="4 4"
                                    className="opacity-70"
                                />
                            ))}

                            {/* Sequential Teal Premium Wave Curve - RESTRICTED STRICTLY TO DESKTOP TIERS */}
                            {isDesktop && selectedHotspot && startCoords && endCoords && (
                                <AnimatePresence>
                                    <motion.path
                                        d={`M ${startCoords.x} ${startCoords.y} C ${(startCoords.x + endCoords.x) / 2} ${startCoords.y}, ${(startCoords.x + endCoords.x) / 2} ${endCoords.y}, ${endCoords.x} ${endCoords.y}`}
                                        fill="none"
                                        stroke="var(--color-teal, #1c3b48)"
                                        strokeWidth="4"
                                        strokeDasharray="6 6"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                    />
                                </AnimatePresence>
                            )}
                        </svg>
                    </div>

                    {/* Dynamic Action Target Trigger Nodes */}
                    {PRIME_LOOKS[currentLookIndex].hotspots.map((hotspot) => (
                        <div
                            key={hotspot.id}
                            className="absolute z-20"
                            style={{
                                left: `${hotspot.x}%`,
                                top: `${hotspot.y}%`,
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            <div className="relative flex items-center justify-center w-12 h-12">
                                <div className="absolute inset-0 rounded-full border border-white/40 bg-white/5 animate-[ping_2s_infinite] pointer-events-none" />
                                <button
                                    type="button"
                                    onClick={(e) => handleHotspotClick(e, hotspot)}
                                    className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/30 font-secondary font-light text-xl flex items-center justify-center cursor-pointer shadow-xl hover:bg-[var(--color-teal,#1c3b48)] hover:text-white hover:border-transparent transition-all duration-300 transform hover:scale-110 z-30 select-none"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Navigation Arrows */}
                    {PRIME_LOOKS.length > 1 && (
                        <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); handleCloseModal(); setCurrentLookIndex((prev) => (prev - 1 + PRIME_LOOKS.length) % PRIME_LOOKS.length); }}
                                className="w-9 h-9 rounded-full bg-white/90 text-zinc-800 hover:bg-white flex items-center justify-center cursor-pointer transition-all shadow-sm border-none"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); handleCloseModal(); setCurrentLookIndex((prev) => (prev + 1) % PRIME_LOOKS.length); }}
                                className="w-9 h-9 rounded-full bg-white/90 text-zinc-800 hover:bg-white flex items-center justify-center cursor-pointer transition-all shadow-sm border-none"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* DESKTOP HOUSING STRUCTURE: Vertically Centered, Height till content only, Locked inside Section Section boundary */}
                    {isDesktop && selectedHotspot && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-[440px] xl:w-[500px] z-40 pointer-events-none flex items-center">
                            <AnimatePresence>
                                {showDrawer && (
                                    <motion.div
                                        ref={drawerRef}
                                        initial={{ x: "40px", opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: "40px", opacity: 0 }}
                                        transition={{ type: "spring", damping: 30, stiffness: 240 }}
                                        className="bg-white w-full max-h-[92%] rounded-xl p-6 shadow-2xl border border-zinc-100/80 pointer-events-auto flex flex-col z-50"
                                    >
                                        <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3 shrink-0">
                                            <h3 className="font-secondary text-xs font-semibold tracking-wider uppercase text-zinc-800">
                                                Shop {selectedHotspot.label}
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={handleCloseModal}
                                                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 cursor-pointer border-none bg-transparent transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar">
                                            {selectedHotspot.products.map((product) => (
                                                <CompactProductCard key={product.id} product={product} />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* MOBILE PORTAL DRAWER HOUSING: Screen Bottom Full Lock Component */}
                {!isDesktop && selectedHotspot && (
                    <AnimatePresence>
                        <div className="fixed inset-0 z-[999999] flex items-end justify-center">

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={handleCloseModal}
                                className="fixed inset-0 bg-black/40"
                            />

                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 28, stiffness: 220 }}
                                className="relative bg-white w-full max-h-[82dvh] rounded-t-2xl px-5 pb-5 pt-4 shadow-[0_-8px_32px_rgba(0,0,0,0.15)] z-50 overflow-y-auto"
                            >
                                <div className="w-12 h-1 bg-zinc-200 rounded-full mx-auto mb-4 shrink-0" />

                                <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3 shrink-0">
                                    <h3 className="font-secondary text-xs font-semibold tracking-wider uppercase text-zinc-800">
                                        Shop {selectedHotspot.label}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 cursor-pointer border-none bg-transparent transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar flex-1">
                                    {selectedHotspot.products.map((product) => (
                                        <CompactProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </AnimatePresence>
                )}
            </div>
        </section><AuthModal isOpen={isAuthOpen} onClose={() => { setIsAuthOpen(false); setPendingAction(null); }} onAuthenticated={handleAuthenticated} />
        </>
    );
}
