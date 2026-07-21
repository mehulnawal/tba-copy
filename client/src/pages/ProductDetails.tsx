import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToast } from "../context/ToastContext";
import { useAddToCart } from "../hooks/useCart";
import { RING_SIZES } from "../constants/product";
import type { Product } from "../types";

type Review = {
    _id: string;
    rating: number;
    text: string;
    user?: { name: string };
};

function getSwatchHexColor(colorName: string): string {
    const normalized = colorName.toLowerCase();
    if (normalized.includes("rose") || normalized.includes("pink")) return "#E0A899";
    if (normalized.includes("yellow") || normalized.includes("gold")) return "#E5C158";
    if (normalized.includes("white") || normalized.includes("silver") || normalized.includes("platinum")) return "#FFFFF";
    return "#FFF";
}

function formatFinishLabel(colorName: string): string {
    const normalized = colorName.toLowerCase();
    if (normalized.includes("yellow")) return "Yellow";
    if (normalized.includes("rose")) return "Rose";
    if (normalized.includes("white")) return "White";
    return colorName;
}

export default function ProductDetails() {
    const { slug = "" } = useParams();
    const { showToast } = useToast();
    const addToCartMutation = useAddToCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [karat, setKarat] = useState<"9kt" | "14kt" | "18kt">("14kt");
    const [color, setColor] = useState("");
    const [size, setSize] = useState("");
    const [reviews, setReviews] = useState<Review[]>([]);

    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState("");

    const [activeMediaIndex, setActiveMediaIndex] = useState(0);
    const [isPriceBreakupOpen, setIsPriceBreakupOpen] = useState(true);
    const [zoomMousePos, setZoomMousePos] = useState({ x: 0, y: 0 });
    const [isHoveringMainImage, setIsHoveringMainImage] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        apiRequest<Product>(`/products/${slug}`)
            .then((p) => {
                setProduct(p);
                const defaultColors = p.colors && p.colors.length > 0 ? p.colors : ["Yellow", "Rose", "White"];
                setColor(defaultColors[0]);
                setSize(RING_SIZES[0]);

                apiRequest<Review[]>(`/reviews/${p.SKU}`).then(setReviews).catch(() => { });
            })
            .catch(() => setProduct(null));
    }, [slug]);

    if (!product) {
        return (
            <>
                <Navbar onSearchChange={() => { }} activeCategory="All" onCategoryChange={() => { }} />
                <main className="flex items-center justify-center min-h-[60vh] bg-[#FAF9F6]">
                    <div className="text-center space-y-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-800 mx-auto" />
                        <p className="text-xs uppercase tracking-widest text-amber-900 font-medium font-serif">Loading Product Details...</p>
                    </div>
                </main>
                <Footer onCategoryChange={() => { }} />
            </>
        );
    }

    const activePriceObj = product.prices.find((price) => price.karat === karat) || product.prices[0];
    const categoryName = (category: Product["mainCategory"]) => typeof category === "string" ? "Jewellery" : category.name;
    const categoryId = (category: Product["mainCategory"]) => typeof category === "string" ? category : category._id;

    const mediaList = product.images.map((image) => ({ type: "image" as const, url: image.url }));

    const availableColors = (product.colors && product.colors.length > 0)
        ? (product.colors.some(c => c.toLowerCase().includes("white")) ? product.colors : [...product.colors, "White"])
        : ["Yellow", "Rose", "White"];

    // FIX 2: Fancy Diamond & Round Diamond display logic
    const roundCarat = product.diamond?.roundCarat ?? 0;
    const fancyCarat = product.diamond?.fancyCarat ?? 0;
    const certCharges = activePriceObj.certificateCharges ?? product.certificateCharges;

    const computedGoldValue = activePriceObj.goldValue ||
        Math.max(0, activePriceObj.totalCost - activePriceObj.makingCharge - certCharges);

    const handleMouseMoveZoom = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomMousePos({ x, y });
    };

    const handleAddToCart = async () => {
        try {
            await addToCartMutation.mutateAsync({
                productId: product.SKU,
                karat,
                color,
                size,
                quantity: 1,
            });
            showToast("Item added to cart!", "success");
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Failed to add to cart.", "error");
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const addedReview = await apiRequest<Review>(`/reviews/${product.SKU}`, {
                method: "POST",
                body: JSON.stringify({ rating, text: reviewText }),
            });
            setReviews((prev) => [addedReview, ...prev]);
            showToast("Review submitted!", "success");
            setReviewText("");
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Could not submit review.", "error");
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] text-stone-900 antialiased font-sans pb-28 md:pb-12">
            <Navbar onSearchChange={() => { }} activeCategory="All" onCategoryChange={() => { }} />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-16">

                {/* Breadcrumbs */}
                <nav className="mb-6 text-[11px] tracking-widest text-amber-900/60 uppercase font-medium space-x-2 border-b border-stone-200/60 pb-3">
                    <Link to="/" className="hover:text-amber-900">Home</Link>
                    <span>/</span>
                    <Link to={`/products?mainCategory=${encodeURIComponent(categoryId(product.mainCategory))}`}>{categoryName(product.mainCategory)}</Link>
                    <span>/</span>
                    <span className="text-stone-900 font-semibold">{product.title}</span>
                </nav>

                {/* Balanced Grid - Image on Left, Details on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">

                    {/* LEFT COLUMN: Gallery & Shifted Description */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="flex flex-col-reverse md:flex-row gap-4">

                            {/* Thumbnails */}
                            <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible space-x-3 md:space-x-0 md:space-y-3 shrink-0">
                                {mediaList.map((media, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveMediaIndex(idx)}
                                        className={`w-20 h-20 aspect-square border rounded transition bg-white overflow-hidden ${idx === activeMediaIndex ? "border-amber-800 ring-1 ring-amber-800" : "border-stone-200 opacity-70"
                                            }`}
                                    >
                                        <img src={media.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>

                            {/* Main Stage Image */}
                            <div className="relative flex-grow aspect-square rounded-lg bg-white border border-stone-200/80 shadow-xs overflow-hidden">
                                <div
                                    className="w-full h-full relative cursor-zoom-in"
                                    onMouseMove={handleMouseMoveZoom}
                                    onMouseEnter={() => setIsHoveringMainImage(true)}
                                    onMouseLeave={() => setIsHoveringMainImage(false)}
                                >
                                    <img
                                        src={mediaList[activeMediaIndex]?.url}
                                        alt={product.title}
                                        className={`w-full h-full object-cover transition-opacity duration-200 ${isHoveringMainImage ? "opacity-0" : "opacity-100"}`}
                                    />
                                    {isHoveringMainImage && (
                                        <div
                                            className="absolute inset-0 bg-no-repeat pointer-events-none"
                                            style={{
                                                backgroundImage: `url(${mediaList[activeMediaIndex]?.url})`,
                                                backgroundPosition: `${zoomMousePos.x}% ${zoomMousePos.y}%`,
                                                backgroundSize: "220%",
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* FIX 3: Description relocated under the image */}
                        <div className="bg-white p-5 border border-stone-200/80 rounded-lg shadow-xs space-y-2">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-700">Description</h3>
                            <p className="text-xs leading-relaxed text-stone-600">{product.description}</p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Product Configurator */}
                    <div className="lg:col-span-6 space-y-5">

                        <div>
                            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-amber-900">
                                {categoryName(product.mainCategory)}
                            </span>
                            <h1 className="text-2xl md:text-3xl font-serif text-stone-900 tracking-tight mt-1">
                                {product.title}
                            </h1>
                        </div>

                        {/* Price Row */}
                        <div className="py-3 border-y border-stone-200/80 flex items-baseline justify-between">
                            <div>
                                <span className="text-3xl font-serif text-stone-900">
                                    ₹{Math.round(activePriceObj.finalPrice).toLocaleString("en-IN")}
                                </span>
                                <span className="text-[11px] text-stone-500 block">Inclusive of all taxes & 3% GST</span>
                            </div>
                            {/* <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                                In Stock & Ready to Ship
                            </span> */}
                        </div>

                        {/* Purity Selection */}
                        <div className="space-y-2">
                            <label className="block text-xs uppercase tracking-widest font-semibold text-stone-600">
                                Select Purity Standard: <span className="text-stone-900">{karat.toUpperCase()} Gold</span>
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {(["9kt", "14kt", "18kt"] as const).map((k) => (
                                    <button
                                        key={k}
                                        onClick={() => setKarat(k)}
                                        className={`py-2.5 text-xs font-semibold uppercase rounded transition border ${karat === k
                                            ? "border-amber-800 bg-amber-900 text-white"
                                            : "border-stone-300 bg-white text-stone-700 hover:border-amber-700"
                                            }`}
                                    >
                                        {k}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Breakdown Component */}
                        <div className="bg-white border border-stone-200/90 rounded-lg p-4 space-y-3 shadow-xs">
                            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-stone-700">
                                    Transparent Price Breakdown
                                </h4>
                                <button
                                    onClick={() => setIsPriceBreakupOpen(!isPriceBreakupOpen)}
                                    className="text-[11px] font-medium uppercase text-amber-900 underline"
                                >
                                    {isPriceBreakupOpen ? "Hide Details" : "View Breakdown"}
                                </button>
                            </div>

                            {isPriceBreakupOpen && (
                                <div className="space-y-2 text-xs text-stone-600">
                                    <div className="flex justify-between">
                                        <span>Gold Value</span>
                                        <span className="font-medium text-stone-900">₹{Math.round(computedGoldValue).toLocaleString("en-IN")}</span>
                                    </div>

                                    {/* Round Diamond */}
                                    <div className="flex justify-between">
                                        <span>Round Diamond ({roundCarat.toFixed(2)} ct)</span>
                                        <span className="font-medium text-stone-900">Included</span>
                                    </div>

                                    {/* FIX 4: Fancy Diamond row guaranteed rendering */}
                                    <div className="flex justify-between">
                                        <span>Fancy Diamond ({fancyCarat.toFixed(2)} ct)</span>
                                        <span className="font-medium text-stone-900">Included</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>Certificate Charges</span>
                                        <span className="font-medium text-stone-900">₹{Math.round(certCharges).toLocaleString("en-IN")}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>Making Charges</span>
                                        <span className="font-medium text-stone-900">₹{Math.round(activePriceObj.makingCharge).toLocaleString("en-IN")}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>GST (3%)</span>
                                        <span className="font-medium text-stone-900">₹{Math.round(activePriceObj.gst).toLocaleString("en-IN")}</span>
                                    </div>

                                    <div className="flex justify-between pt-2 border-t border-stone-200 font-semibold text-stone-900 text-sm">
                                        <span>Final Price</span>
                                        <span className="font-serif">₹{Math.round(activePriceObj.finalPrice).toLocaleString("en-IN")}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Specs */}
                        <div className="bg-stone-50 border border-stone-200/80 rounded-lg p-4 space-y-3">
                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-700">
                                Weight & Authenticity Specifications
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="bg-white p-3 rounded border border-stone-100">
                                    <span className="block text-[10px] text-stone-400 uppercase">Gross Weight</span>
                                    <span className="text-sm font-serif font-semibold text-stone-900">{activePriceObj.grossWeight} g</span>
                                </div>
                                <div className="bg-white p-3 rounded border border-stone-100">
                                    <span className="block text-[10px] text-stone-400 uppercase">Net Weight</span>
                                    <span className="text-sm font-serif font-semibold text-stone-900">{activePriceObj.netWeight} g</span>
                                </div>
                            </div>
                        </div>

                        {/* Metal Finish Swatches with Proper White Color */}
                        <div className="space-y-2">
                            <label className="block text-xs uppercase tracking-widest font-semibold text-stone-600">
                                Metal Finish: <span className="text-stone-900">{formatFinishLabel(color)}</span>
                            </label>
                            <div className="flex gap-3">
                                {availableColors.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        className={`flex items-center space-x-2 px-3.5 py-2 rounded-full border transition ${color === c ? "border-amber-800 bg-amber-50/50 ring-1 ring-amber-800" : "border-stone-200 bg-white"
                                            }`}
                                    >
                                        <span
                                            className="w-4 h-4 rounded-full border border-stone-300 shadow-inner"
                                            style={{ backgroundColor: getSwatchHexColor(c) }}
                                        />
                                        <span className="text-xs font-medium text-stone-800">
                                            {formatFinishLabel(c)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs uppercase tracking-widest font-semibold text-stone-600">Ring Size: <span className="text-stone-900">{size}</span></label>
                            <div className="flex flex-wrap gap-2">
                                {RING_SIZES.map((ringSize) => <button key={ringSize} type="button" onClick={() => setSize(ringSize)} className={`min-w-10 px-3 py-2 text-xs font-semibold rounded border transition ${size === ringSize ? "border-amber-800 bg-amber-900 text-white" : "border-stone-300 bg-white text-stone-700 hover:border-amber-700"}`}>{ringSize}</button>)} 
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex gap-4 pt-2">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 py-3.5 px-6 border border-stone-900 bg-white text-stone-900 font-semibold text-xs uppercase tracking-widest hover:bg-stone-900 hover:text-white transition"
                            >
                                Add to Cart
                            </button>
                            {/* <button
                                onClick={handleAddToCart}
                                className="flex-1 py-3.5 px-6 bg-amber-900 text-white font-semibold text-xs uppercase tracking-widest hover:bg-amber-800 transition"
                            >
                                Buy Now
                            </button> */}
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <section className="mt-16 pt-12 border-t border-stone-200">
                    <h2 className="text-xl font-serif text-stone-900 mb-6">Customer Reviews</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Interactive Review Star Selector */}
                        <div className="lg:col-span-4 bg-white p-6 border border-stone-200/80 rounded-lg shadow-xs space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-800">
                                Write an Assessment
                            </h3>
                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                <div>
                                    <label className="block text-[11px] uppercase tracking-wider font-medium text-stone-600 mb-1.5">
                                        Select Rating
                                    </label>
                                    <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                type="button"
                                                key={star}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(star)}
                                                className="text-2xl focus:outline-none transition-transform hover:scale-125"
                                            >
                                                <span className={(hoverRating || rating) >= star ? "text-amber-500" : "text-stone-300"}>
                                                    ★
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] uppercase tracking-wider font-medium text-stone-600 mb-1">
                                        Your Experience
                                    </label>
                                    <textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        required
                                        rows={4}
                                        placeholder="Describe design quality, finish, and overall elegance..."
                                        className="w-full rounded border-stone-300 text-xs p-3 focus:ring-amber-800"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-2.5 bg-stone-900 text-stone-100 text-xs uppercase tracking-widest font-semibold hover:bg-black transition"
                                >
                                    Submit Review
                                </button>
                            </form>
                        </div>

                        {/* Reviews Display */}
                        <div className="lg:col-span-8 space-y-4">
                            {reviews.length === 0 ? (
                                <div className="text-center py-16 border border-dashed border-stone-200 rounded-lg text-stone-400 text-xs uppercase tracking-widest bg-white">
                                    No verified client reviews recorded yet. Be the first to review.
                                </div>
                            ) : (
                                reviews.map((r) => (
                                    <article key={r._id} className="p-5 bg-white rounded-lg border border-stone-200 shadow-xs space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-stone-900">{r.user?.name || "Verified Client"}</span>
                                            <span className="text-amber-500 font-bold">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                                        </div>
                                        <p className="text-xs text-stone-600">{r.text}</p>
                                    </article>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <Footer onCategoryChange={() => { }} />
        </div>
    );
}