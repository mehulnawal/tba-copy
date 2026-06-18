import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import primeCollection from '../assets/primeCollection/img1.webp';

interface Product {
    id: string;
    code: string;
    name: string;
    price: string;
    image: string;
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
                y: 64.0,
                anchorX: 49.5,
                anchorY: 82.0,
                label: "Diamond Tier Necklace",
                products: [
                    {
                        id: "p-neck-1",
                        code: "#NK-409",
                        name: "Masterpiece Tiered Pear-Cut Diamond Necklace",
                        price: "₹4,50,000.00",
                        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80"
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

    return (
        <section ref={containerRef} className="my-3 reveal-section py-12 bg-[var(--color-bg)] w-full relative" id="prime-selection-section">
            <div className="container mx-auto px-4 flex flex-col items-center w-full">

                {/* Section Titles */}
                <div className="flex flex-col items-center mb-6 text-center">
                    <h2 className="font-primary text-3xl md:text-4xl text-[var(--color-text)] tracking-wide font-light">
                        Prime Collection
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
                                    y1={`${hotspot.y}%`}
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
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-[350px] z-40 pointer-events-none flex items-center">
                            <AnimatePresence>
                                {showDrawer && (
                                    <motion.div
                                        ref={drawerRef}
                                        initial={{ x: "40px", opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: "40px", opacity: 0 }}
                                        transition={{ type: "spring", damping: 30, stiffness: 240 }}
                                        className="bg-white w-full h-auto max-h-[90%] rounded-xl p-5 shadow-2xl border border-zinc-100/80 pointer-events-auto flex flex-col z-50"
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

                                        <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar flex-1">
                                            {selectedHotspot.products.map((product) => (
                                                <div key={product.id} className="flex gap-4 rounded-xl border border-zinc-100 p-2 bg-white shrink-0">
                                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-50 shrink-0">
                                                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                                    </div>
                                                    <div className="flex flex-col flex-1 justify-between py-1">
                                                        <div>
                                                            <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-mono">{product.code}</span>
                                                            <h4 className="text-xs font-medium text-zinc-800 line-clamp-2 mt-0.5 font-secondary">{product.name}</h4>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-zinc-50">
                                                            <span className="text-xs font-bold text-zinc-900 font-secondary">{product.price}</span>
                                                            <button type="button" className="flex items-center gap-1.5 rounded bg-zinc-900 hover:bg-[var(--color-teal,#1c3b48)] px-4 py-2 text-[10px] font-medium tracking-wider text-white uppercase transition-colors cursor-pointer border-none">
                                                                <ShoppingBag size={12} />
                                                                <span>Add</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
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
                                className="relative bg-white w-full h-[45%] max-h-[50vh] rounded-t-2xl p-5 shadow-[0_-8px_32px_rgba(0,0,0,0.15)] z-50 overflow-hidden flex flex-col"
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
                                        <div key={product.id} className="flex gap-4 rounded-xl border border-zinc-100 p-2 bg-white shrink-0">
                                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-50 shrink-0">
                                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="flex flex-col flex-1 justify-between py-1">
                                                <div>
                                                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-mono">{product.code}</span>
                                                    <h4 className="text-xs font-medium text-zinc-800 line-clamp-2 mt-0.5 font-secondary">{product.name}</h4>
                                                </div>
                                                <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-zinc-50">
                                                    <span className="text-xs font-bold text-zinc-900 font-secondary">{product.price}</span>
                                                    <button type="button" className="flex items-center gap-1.5 rounded bg-zinc-900 hover:bg-[var(--color-teal,#1c3b48)] px-4 py-2 text-[10px] font-medium tracking-wider text-white uppercase transition-colors cursor-pointer border-none">
                                                        <ShoppingBag size={12} />
                                                        <span>Add</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </AnimatePresence>
                )}
            </div>
        </section>
    );
}