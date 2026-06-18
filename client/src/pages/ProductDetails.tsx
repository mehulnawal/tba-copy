import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    Play,
    Maximize2,
    ChevronLeft,
    ChevronRight,
    Share2,
    Search,
    ShieldCheck,
    Truck,
    RotateCcw,
    BadgeCheck,
    Award
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ============================================================
// PRODUCT DATA — update fields to match each product
// ============================================================
const PRODUCT_DATA = {
    name: "The Aurelia Eternal Cascade Diamond Necklace",
    slug: "aurelia-eternal-cascade-diamond-necklace",
    shortDescription:
        "An exquisite composition of cascading brilliant-cut pear diamonds, individually hand-set in flowing ripples of liquid 18-karat gold.",
    storyDescription:
        "Inspired by the fluid beauty of falling water, the Aurelia Cascade Necklace rests gracefully against the collarbone. Handcrafted over 84 hours by our master artisans, it uses a signature micro-claw setting to maximize the natural brilliance and fire of every diamond.",
    category: "Jewellery",
    subCategory: "Necklaces",
    sku: "AU-NCK-0092-2026",
    collection: "L'Oasis Lumineuse",
    price: 34582, // base display price in INR
    priceExcludesTax: true,

    // Color variants
    colors: [
        { label: "Yellow", dot: "#f5c842" },
        { label: "White", dot: "#d0d0d0" },
        { label: "Rose", dot: "#e8a0a0" },
    ],
    defaultColor: "Yellow",

    // Metal purity options
    metalOptions: ["9Kt Gold", "14Kt Gold", "18Kt Gold"],
    defaultMetal: "14Kt Gold",

    // Ring sizes dropdown
    ringSizes: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    defaultRingSize: 10,

    // Special offers
    offers: [
        {
            saveAmount: "₹4,446",
            couponCode: "Dazzling20",
            loyaltySaving: "₹ 445",
        },
        {
            saveAmount: "₹2,500",
            couponCode: "JB100",
            loyaltySaving: "₹ 445",
        },
    ],

    // Weight & purity details
    weightGross: "1.27 gm",
    weightNet: "1.12 gm",
    purity: "14Kt Gold (Yellow)",

    // Diamond & Gemstones table
    diamondSummary: { totalWeight: "0.77Ct", totalCount: 11 },
    diamonds: [
        { shape: "Oval", count: 1, totalWeight: "0.46", color: "EF", clarity: "VVS / VS", sizeRange: "0.40 to 0.49" },
        { shape: "Pear", count: 2, totalWeight: "0.08", color: "EF", clarity: "VVS / VS", sizeRange: "0.01 to 0.07" },
        { shape: "Marquise", count: 8, totalWeight: "0.23", color: "EF", clarity: "VVS / VS", sizeRange: "0.01 to 0.07" },
    ],

    // Price breakup
    priceBreakup: [
        { label: "Gold", amount: "₹ 9,852/-" },
        { label: "Diamond", amount: "₹ 22,230/-" },
        { label: "Making Charge", amount: "₹ 2,500/-" },
        { label: "GST", amount: "₹ 1,037/-" },
        { label: "Total", amount: "₹ 35,619/-" },
    ],

    // Categories & tags
    categories: ["Rings", "Everyday Rings"],
    tags: [
        "100% off on making", "Bestsellers", "Birthday", "Desk to Dinner",
        "Evening wear", "Everyday Classic", "Everyday wear", "Festive",
        "Leaf", "Party wear", "Solitaire", "Women", "Work wear"
    ],

    // Our Promise
    promises: [
        { icon: "certified", text: "Certified & Hallmarked Jewellery" },
        { icon: "shipping", text: "Free Shipping & Insurance" },
        { icon: "returns", text: "Hassle Free 15 Day Returns" },
        { icon: "buyback", text: "80% Buyback & 100% Exchange" },
    ],

    // Ready to Ship products
    readyToShip: [
        {
            image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
            price: "₹33,246",
            sku: "PRI152914YG20/1",
            metal: "1.316 gm",
            diamondWeight: "0.670Ct",
            purity: "14Kt Gold Yellow",
            ringSize: "20",
        },
        {
            image: "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=600&q=80",
            price: "₹39,859",
            sku: "PRI152918YG06/1",
            metal: "1.39 gm",
            diamondWeight: "0.760Ct",
            purity: "18Kt Gold Yellow",
            ringSize: "06",
        },
    ],

    // Recently viewed
    recentlyViewed: [
        {
            image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
            price: "₹14,293",
            name: "Green Stone Vanki Diamond Ring",
        },
        {
            image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
            price: "₹43,021",
            name: "Aurora Borrelia's Round Diamond Ring",
        },
    ],

    // Media
    media: [
        {
            type: "image",
            url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85",
            alt: "The Aurelia Eternal Cascade Necklace on elegant display",
        },
        {
            type: "image",
            url: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1200&q=85",
            alt: "Close-up detail of the hand-crafted diamond settings",
        },
        {
            type: "image",
            url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85",
            alt: "Editorial perspective of the collection styling",
        },
        {
            type: "video",
            youtubeId: "dQw4w9WgXcQ",
            thumbnail: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=85",
        },
    ],
};

const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

// ============================================================
// PROMISE ICONS — inline SVG set
// ============================================================
function PromiseIcon({ type }: { type: string }) {
    const cls = "w-5 h-5 shrink-0 text-[#1a3a5c]";
    if (type === "certified") return <BadgeCheck className={cls} />;
    if (type === "shipping") return <Truck className={cls} />;
    if (type === "returns") return <RotateCcw className={cls} />;
    return <ShieldCheck className={cls} />;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ProductDetailPage() {
    useEffect(() => {
        if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
        window.scrollTo({ top: 0, left: 0 });
    }, []);

    // Media state
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);
    const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);
    const [isFullscreenZoomOpen, setIsFullscreenZoomOpen] = useState(false);
    const mainImageRef = useRef<HTMLDivElement>(null);
    const [zoomStyle, setZoomStyle] = useState({ display: "none", backgroundPosition: "0% 0%", backgroundImage: "" });

    const activeMedia = PRODUCT_DATA.media[activeMediaIndex] || PRODUCT_DATA.media[0];

    // Product config state
    const [selectedColor, setSelectedColor] = useState(PRODUCT_DATA.defaultColor);
    const [selectedMetal, setSelectedMetal] = useState(PRODUCT_DATA.defaultMetal);
    const [selectedSize, setSelectedSize] = useState(PRODUCT_DATA.defaultRingSize);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [pincode, setPincode] = useState("");

    // Nav state (passed to Navbar/Footer)
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        document.body.style.overflow = videoModalUrl || isFullscreenZoomOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [videoModalUrl, isFullscreenZoomOpen]);

    // Zoom handlers
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!mainImageRef.current) return;
        const { left, top, width, height } = mainImageRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomStyle({ display: "block", backgroundPosition: `${x}% ${y}%`, backgroundImage: `url(${(activeMedia as any).url})` });
    };
    const handleMouseLeave = () => setZoomStyle((p) => ({ ...p, display: "none" }));
    const handlePrevMedia = () => setActiveMediaIndex((p) => (p === 0 ? PRODUCT_DATA.media.length - 1 : p - 1));
    const handleNextMedia = () => setActiveMediaIndex((p) => (p === PRODUCT_DATA.media.length - 1 ? 0 : p + 1));

    return (
        <div className="bg-white text-[#1a1a1a] min-h-screen antialiased font-secondary">
            <Navbar onSearchChange={setSearchQuery} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

            {/* ── HERO: IMAGE + PRODUCT INFO ── */}
            <main className="container mx-auto px-4 md:px-6 pb-16 max-w-[1320px] mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">

                    {/* ── LEFT: IMAGE / VIDEO PANEL (unchanged from original) ── */}
                    <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4 items-start w-full relative">
                        {/* Thumbnail strip */}
                        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-[76px] overflow-x-auto sm:overflow-x-visible shrink-0 order-2 sm:order-1 py-1 sm:py-0 no-scrollbar">
                            {PRODUCT_DATA.media.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveMediaIndex(index)}
                                    className={`relative aspect-[4/5] w-14 sm:w-full rounded border overflow-hidden transition-all shrink-0 ${activeMediaIndex === index
                                        ? "border-[#1a3a5c] opacity-100 shadow-sm scale-95"
                                        : "border-gray-200 opacity-60 hover:opacity-100"
                                        }`}
                                >
                                    <img
                                        src={(item as any).type === "video" ? (item as any).thumbnail : (item as any).url}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover select-none"
                                    />
                                    {(item as any).type === "video" && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <Play className="w-4 h-4 text-white fill-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Main image / video */}
                        <div className="relative flex-1 w-full aspect-[4/5] max-h-[660px] bg-gray-50 rounded overflow-hidden border border-gray-200 order-1 sm:order-2 group">
                            {/* Ready to Ship badge */}
                            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-[#1a3a5c] text-white text-[10px] font-semibold px-3 py-1.5 rounded-full">
                                <Truck className="w-3 h-3" />
                                Ready To Ship
                            </div>

                            {(activeMedia as any).type !== "video" ? (
                                <div
                                    ref={mainImageRef}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                    onClick={() => setIsFullscreenZoomOpen(true)}
                                    className="relative w-full h-full cursor-zoom-in"
                                >
                                    <motion.img
                                        key={(activeMedia as any).url}
                                        initial={{ opacity: 0.85 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.25 }}
                                        src={(activeMedia as any).url}
                                        alt={(activeMedia as any).alt}
                                        className="w-full h-full object-cover"
                                    />
                                    <div
                                        className="absolute inset-0 pointer-events-none bg-no-repeat transition-opacity duration-150 hidden md:block"
                                        style={{ ...zoomStyle, backgroundSize: "220%", opacity: zoomStyle.display === "block" ? 1 : 0 }}
                                    />
                                </div>
                            ) : (
                                <div
                                    className="relative w-full h-full cursor-pointer"
                                    onClick={() => setVideoModalUrl((activeMedia as any).youtubeId || null)}
                                >
                                    <img src={(activeMedia as any).thumbnail} alt="Video cover" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-md text-[#1a3a5c] transition-transform group-hover:scale-105">
                                            <Play className="w-5 h-5 ml-0.5 fill-current" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button onClick={handlePrevMedia} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-[#1a3a5c] shadow-sm md:opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Previous">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={handleNextMedia} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-[#1a3a5c] shadow-sm md:opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Next">
                                <ChevronRight className="w-4 h-4" />
                            </button>

                            {(activeMedia as any).type !== "video" && (
                                <button onClick={() => setIsFullscreenZoomOpen(true)} className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 text-[#1a3a5c] shadow-sm" aria-label="Zoom">
                                    <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT: PRODUCT INFO ── */}
                    <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-6 w-full">

                        {/* Share + Wishlist */}
                        <div className="flex justify-end gap-3">
                            <button className="p-1.5 text-gray-500 hover:text-[#1a3a5c] transition-colors" aria-label="Share">
                                <Share2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setIsWishlisted(!isWishlisted)}
                                className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                                aria-label="Wishlist"
                            >
                                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                            </button>
                        </div>

                        {/* SKU */}
                        <p className="text-xs text-gray-500">SKU : {PRODUCT_DATA.sku}</p>

                        {/* Product Title */}
                        <h1 className="font-primary text-xl md:text-2xl font-semibold text-[#1a1a1a] leading-snug">
                            {PRODUCT_DATA.name}
                        </h1>

                        {/* Price */}
                        <div>
                            <p className="text-2xl font-bold text-[#1a1a1a]">{formatPrice(PRODUCT_DATA.price)}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Price exclusive of taxes. See the full{" "}
                                <a href="#price-breakup" className="text-[#1a6fae] hover:underline">price breakup</a>
                            </p>
                        </div>

                        {/* Special Offer Cards */}
                        <div className="grid grid-cols-2 gap-3">
                            {PRODUCT_DATA.offers.map((offer, i) => (
                                <div key={i} className="border border-dashed border-gray-300 rounded relative pt-5 pb-3 px-3 space-y-3">
                                    {/* Badge */}
                                    <span className="absolute -top-px left-3 bg-[#1a3a5c] text-white text-[9px] font-bold uppercase px-2 py-0.5 tracking-wide">
                                        Special Offer
                                    </span>
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-xs text-gray-600">Save</p>
                                            <p className="text-base font-bold text-[#1a1a1a] leading-tight">{offer.saveAmount} at Checkout.</p>
                                        </div>
                                        <button className="shrink-0 border border-gray-300 rounded text-[10px] font-semibold px-2 py-1.5 text-center leading-tight text-gray-700 whitespace-nowrap">
                                            Apply Coupon<br />{offer.couponCode}
                                        </button>
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 flex items-center justify-between gap-2">
                                        <p className="text-[10px] text-gray-500 leading-snug">
                                            Join Our Loyalty Program And Save Extra {offer.loyaltySaving}
                                        </p>
                                        <button className="shrink-0 bg-[#1a3a5c] text-white text-[10px] font-semibold px-3 py-1.5 rounded-full">
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Color Selector */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-[#1a1a1a]">Color</p>
                            <div className="flex gap-2 flex-wrap">
                                {PRODUCT_DATA.colors.map((c) => (
                                    <button
                                        key={c.label}
                                        onClick={() => setSelectedColor(c.label)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-sm transition-all ${selectedColor === c.label
                                            ? "border-[#1a3a5c] bg-white font-semibold text-[#1a1a1a]"
                                            : "border-gray-300 text-gray-600 hover:border-gray-400"
                                            }`}
                                    >
                                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.dot }} />
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Metal Purity */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-[#1a1a1a]">Metal Purity</p>
                            <div className="flex gap-2 flex-wrap">
                                {PRODUCT_DATA.metalOptions.map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setSelectedMetal(m)}
                                        className={`px-3 py-1.5 rounded border text-sm transition-all ${selectedMetal === m
                                            ? "border-[#1a3a5c] bg-white font-semibold text-[#1a1a1a]"
                                            : "border-gray-300 text-gray-600 hover:border-gray-400"
                                            }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Ring Size */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-[#1a1a1a]">Ring size</p>
                            <select
                                value={selectedSize}
                                onChange={(e) => setSelectedSize(Number(e.target.value))}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-[#1a1a1a] bg-white focus:outline-none focus:border-[#1a3a5c] cursor-pointer"
                            >
                                {PRODUCT_DATA.ringSizes.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            <a href="#size-guide" className="text-xs text-[#1a6fae] hover:underline block">Ring Size Guide</a>
                        </div>

                        {/* Add to Cart */}
                        <button className="w-full bg-[#1a3a5c] hover:bg-[#122a45] text-white font-semibold text-sm tracking-wide py-3.5 rounded-full flex items-center justify-center gap-2 transition-colors">
                            Add to Cart
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7h12.8M7 13L5.4 5M17 21a1 1 0 100-2 1 1 0 000 2zm-10 0a1 1 0 100-2 1 1 0 000 2z" />
                            </svg>
                        </button>

                        {/* Delivery / Cancellation Links */}
                        {/* <div className="flex gap-3 text-xs text-[#1a6fae]">
                            <a href="#delivery" className="hover:underline">Check Estimated Delivery Date</a>
                            <span className="text-gray-300">|</span>
                            <a href="#cancellation" className="hover:underline">Delivery & Cancellation</a>
                        </div> */}

                        {/* Check Pincode */}
                        {/* <div className="space-y-1">
                            <p className="text-sm font-medium text-[#1a1a1a]">Check Pincode</p>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    placeholder="Enter Pincode"
                                    className="flex-1 border border-gray-300 border-r-0 rounded-l px-3 py-2 text-sm focus:outline-none focus:border-[#1a3a5c]"
                                    maxLength={6}
                                />
                                <button className="bg-[#1a3a5c] hover:bg-[#122a45] text-white px-4 py-2 rounded-r transition-colors">
                                    <Search className="w-4 h-4" />
                                </button>
                            </div>
                        </div> */}
                    </div>
                </div>
            </main>

            {/* ── READY TO SHIP ── */}
            {/* <section className="container mx-auto px-4 md:px-6 py-10 max-w-[1320px]">
                <h2 className="text-lg font-semibold text-[#1a1a1a] mb-5">Ready to Ship</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {PRODUCT_DATA.readyToShip.map((item, i) => (
                        <div key={i} className="cursor-pointer group">
                            <div className="aspect-square bg-gray-50 rounded overflow-hidden border border-gray-200 mb-3">
                                <img
                                    src={item.image}
                                    alt={item.sku}
                                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                />
                            </div>
                            <p className="text-base font-bold text-[#1a1a1a]">{item.price}</p>
                            <div className="text-xs text-gray-600 space-y-0.5 mt-1">
                                <p><span className="font-semibold">SKU:</span>  {item.sku}</p>
                                <p><span className="font-semibold">Metal:</span>  {item.metal}</p>
                                <p><span className="font-semibold">Diamond Weight:</span>  {item.diamondWeight}</p>
                                <p><span className="font-semibold">Purity</span>  {item.purity}</p>
                                <p><span className="font-semibold">Ring Size:</span>  {item.ringSize}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section> */}

            {/* ── PRODUCT DETAILS + OUR PROMISE ── */}
            <section className="container mx-auto px-4 md:px-6 py-10 max-w-[1320px]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* LEFT: Product Details */}
                    <div className="lg:col-span-8 space-y-8">
                        <div>
                            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-3">Product Details</h2>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                The <strong>{PRODUCT_DATA.name}</strong> {PRODUCT_DATA.storyDescription}
                            </p>
                        </div>

                        {/* Weight & Purity */}
                        <div className="grid grid-cols-2 gap-6 pt-2 border-t border-gray-200">
                            <div>
                                <p className="text-sm font-semibold text-[#1a1a1a] mb-1">Weight</p>
                                <p className="text-sm text-gray-600">Gross (Product) - {PRODUCT_DATA.weightGross}</p>
                                <p className="text-sm text-gray-600">Net (Gold) - {PRODUCT_DATA.weightNet}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#1a1a1a] mb-1">Purity</p>
                                <p className="text-sm text-gray-600">{PRODUCT_DATA.purity}</p>
                            </div>
                        </div>

                        {/* Price Breakup Table */}
                        <div id="price-breakup">
                            <h3 className="text-base font-semibold text-[#1a1a1a] mb-3">Price Breakup</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="text-left px-4 py-2.5 font-semibold text-[#1a1a1a] border-b border-gray-200 text-xs">Particulars</th>
                                            <th className="text-left px-4 py-2.5 font-semibold text-[#1a1a1a] border-b border-gray-200 text-xs">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {PRODUCT_DATA.priceBreakup.map((row, i) => (
                                            <tr key={i} className={`border-b border-gray-100 last:border-0 ${row.label === "Total" ? "font-semibold bg-gray-50" : ""}`}>
                                                <td className="px-4 py-2 text-gray-700 text-xs">{row.label}</td>
                                                <td className="px-4 py-2 text-gray-700 text-xs">{row.amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Final price calculated at checkout based on actual weight.</p>
                        </div>
                    </div>

                    {/* RIGHT: Our Promise */}
                    <div className="lg:col-span-4 space-y-5">
                        <h2 className="text-lg font-semibold text-[#1a1a1a]">Our Promise</h2>

                        <div className="space-y-4">
                            {PRODUCT_DATA.promises.map((p, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <PromiseIcon type={p.icon} />
                                    <p className="text-sm text-gray-700">{p.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CATEGORIES & TAGS ── */}
            <section className="container mx-auto px-4 md:px-6 py-6 max-w-[1320px] border-t border-gray-100">
                <div className="flex flex-wrap gap-y-3 gap-x-8 text-sm">
                    <div className="flex items-start gap-2">
                        <span className="font-semibold text-[#1a1a1a] shrink-0">Categories</span>
                        <div className="flex flex-wrap gap-x-2 gap-y-1">
                            {PRODUCT_DATA.categories.map((c) => (
                                <a key={c} href="#" className="text-[#1a6fae] hover:underline">{c}</a>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="font-semibold text-[#1a1a1a] shrink-0">Tags</span>
                        <div className="flex flex-wrap gap-x-2 gap-y-1">
                            {PRODUCT_DATA.tags.map((t) => (
                                <a key={t} href="#" className="text-[#1a6fae] hover:underline">{t}</a>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── RECENTLY VIEWED ── */}
            <section className="container mx-auto px-4 md:px-6 py-10 max-w-[1320px]">
                <h2 className="text-lg font-semibold text-[#1a1a1a] mb-5">Similar Products</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {PRODUCT_DATA.recentlyViewed.map((item, i) => (
                        <div key={i} className="cursor-pointer group">
                            <div className="aspect-square bg-gray-50 rounded overflow-hidden border border-gray-200 relative mb-3">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                />
                                <button className="absolute bottom-2 right-2 p-1.5 bg-white border border-gray-200 rounded text-[#1a3a5c] shadow-sm hover:bg-gray-50">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7h12.8M7 13L5.4 5M17 21a1 1 0 100-2 1 1 0 000 2zm-10 0a1 1 0 100-2 1 1 0 000 2z" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-base font-bold text-[#1a1a1a]">{item.price}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{item.name}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── VIDEO MODAL ── */}
            <AnimatePresence>
                {videoModalUrl && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setVideoModalUrl(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.98 }} animate={{ scale: 1 }} exit={{ scale: 0.98 }}
                            className="relative w-full max-w-[860px] aspect-video bg-black rounded overflow-hidden shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <iframe
                                src={`https://www.youtube.com/embed/${videoModalUrl}?autoplay=1&rel=0`}
                                title="Video Player"
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── FULLSCREEN ZOOM MODAL ── */}
            <AnimatePresence>
                {isFullscreenZoomOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setIsFullscreenZoomOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.98 }} animate={{ scale: 1 }} exit={{ scale: 0.98 }}
                            className="max-w-full max-h-full overflow-hidden flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={(activeMedia as any).url}
                                alt={(activeMedia as any).alt}
                                className="max-w-screen max-h-screen object-contain select-none rounded"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── MOBILE STICKY BOTTOM BAR (unchanged from original) ── */}
            <div
                className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-40 shadow-md flex items-center space-x-3"
                style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
            >
                <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-3.5 border rounded flex items-center justify-center shrink-0 transition-colors ${isWishlisted ? "bg-red-50 border-red-200 text-red-500" : "border-gray-300 text-gray-400"
                        }`}
                    aria-label="Wishlist"
                >
                    <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
                <button className="flex-1 bg-transparent border border-[#1a3a5c] text-[#1a3a5c] text-xs font-semibold uppercase tracking-widest py-3.5 rounded">
                    Add To Cart
                </button>
                <button className="flex-1 bg-[#1a3a5c] text-white text-xs font-semibold uppercase tracking-widest py-3.5 rounded text-center shadow-sm">
                    Buy It Now
                </button>
            </div>

            <Footer onCategoryChange={setActiveCategory} />
        </div>
    );
}