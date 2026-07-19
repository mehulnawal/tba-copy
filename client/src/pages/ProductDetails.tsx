import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToast } from "../context/ToastContext";
import { useAddToCart } from "../hooks/useCart"; // Imported the global cart hook

// --- TypeScript Interfaces ---
type Price = {
    karat: "9kt" | "14kt" | "18kt";
    makingCharge: number;
    totalCost: number;
    gst: number;
    finalPrice: number;
    grossWeight: number;
    netWeight: number;
};

type Review = {
    _id: string;
    rating: number;
    text: string;
    user?: { name: string };
};

type Coupon = {
    code: string;
    scope: string;
};

type Product = {
    SKU: string;
    Title: string;
    Description: string;
    Category: string;
    slug: string;
    "image_link-1"?: string;
    "image_link-2"?: string;
    "image_link-3"?: string;
    video_link?: string;
    colors?: string[];
    size_options?: string[];
    prices: Price[];
    [key: string]: any;
};

// --- Helper Functions ---
function extractYouTubeId(url: string): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
}

function getSwatchHexColor(colorName: string): string {
    const normalized = colorName.toLowerCase();
    if (normalized.includes("rose") || normalized.includes("pink")) return "#E0A899";
    if (normalized.includes("yellow") || normalized.includes("gold")) return "#E5C158";
    if (normalized.includes("white") || normalized.includes("silver") || normalized.includes("platinum")) return "#E5E7EB";
    return "#9CA3AF"; // Default neutral fallback color
}

export default function ProductDetails() {
    const { slug = "" } = useParams();
    const { showToast } = useToast();
    const addToCartMutation = useAddToCart(); // Initialized the mutation hook

    const [product, setProduct] = useState<Product | null>(null);
    const [karat, setKarat] = useState<"9kt" | "14kt" | "18kt">("14kt");
    const [color, setColor] = useState("");
    const [size, setSize] = useState("");
    const [reviews, setReviews] = useState<Review[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);

    // Interactive Review States
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState("");

    // Media Interaction Layout States
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isPriceBreakupOpen, setIsPriceBreakupOpen] = useState(true);
    const [zoomMousePos, setZoomMousePos] = useState({ x: 0, y: 0 });
    const [isHoveringMainImage, setIsHoveringMainImage] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        apiRequest<Product>(`/products/${slug}`)
            .then((p) => {
                setProduct(p);
                // Initialize dropdown default selections securely from response fields
                if (p.colors?.length) setColor(p.colors[0]);
                if (p.size_options?.length) setSize(p.size_options[0]);

                // Parallelized collection requests
                apiRequest<Review[]>(`/reviews/${p.SKU}`).then(setReviews).catch(() => { });
                apiRequest<Coupon[]>(`/coupons/eligible/${slug}`).then(setCoupons).catch(() => { });

                // Fetch matching items based on active product taxonomy context
                apiRequest<Product[]>(`/products?category=${encodeURIComponent(p.Category)}`)
                    .then((list) => {
                        const filtered = list.filter((item) => item.slug !== slug).slice(0, 4);
                        setSimilarProducts(filtered);
                    })
                    .catch(() => { });
            })
            .catch(() => setProduct(null));
    }, [slug]);

    if (!product) {
        return (
            <>
                <Navbar onSearchChange={() => { }} activeCategory="All" onCategoryChange={() => { }} />
                <main className="flex items-center justify-center min-h-[50vh]">
                    <div className="text-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-800 mx-auto" />
                        <p className="text-sm text-gray-500 font-medium">Gathering collection specifications...</p>
                    </div>
                </main>
                <Footer onCategoryChange={() => { }} />
            </>
        );
    }

    // Derive dynamic configuration based on selected active metadata layers
    const activePriceObj = product.prices.find((p) => p.karat === karat) || product.prices[0];

    // Generate complete valid unified media list arrays
    const mediaList = [product["image_link-1"], product["image_link-2"], product["image_link-3"]]
        .filter((img): img is string => typeof img === "string" && img.trim() !== "")
        .map((url) => ({ type: "image" as const, url }));

    if (product.video_link && product.video_link.trim() !== "") {
        mediaList.push({ type: "video" as const, url: product.video_link });
    }

    const handleMouseMoveZoom = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomMousePos({ x, y });
    };

    const handleShareProduct = () => {
        navigator.clipboard.writeText(window.location.href);
        showToast("Product link copied to clipboard!", "success");
    };

    // --- API Action Hooks ---
    const handleAddToCart = async () => {
        try {
            // Replaced raw apiRequest with reactive hook mutation structure
            await addToCartMutation.mutateAsync({
                productId: product.SKU,
                karat,
                color,
                size,
                quantity: 1,
                price: activePriceObj.finalPrice,
                name: product.Title,
                image: product["image_link-1"] || "",
                category: product.Category
            });
            showToast("Item successfully added to your cart!", "success");
        } catch (err: any) {
            showToast(err.message || "Could not complete cart action.", "error");
        }
    };

    const handleAddToWishlist = async () => {
        try {
            await apiRequest("/wishlist", {
                method: "POST",
                body: JSON.stringify({ productId: product.SKU, karat }),
            });
            showToast("Item successfully added to your wishlist!", "success");
        } catch (err: any) {
            showToast(err.message || "Could not complete wishlist action.", "error");
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
            showToast("Review submitted successfully for moderation.", "success");
            setReviewText("");
        } catch (err: any) {
            showToast(err.message || "An error occurred submitting your review.", "error");
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 antialiased font-sans pb-24 md:pb-0">
            <Navbar onSearchChange={() => { }} activeCategory="All" onCategoryChange={() => { }} />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

                {/* Dynamic Breadcrumbs Map */}
                <nav className="mb-6 text-xs text-gray-500 tracking-wide font-medium uppercase space-x-2">
                    <Link to="/" className="hover:text-amber-700">Home</Link>
                    <span>/</span>
                    <Link to={`/products?category=${encodeURIComponent(product.Category)}`} className="hover:text-amber-700">
                        {product.Category}
                    </Link>
                    <span>/</span>
                    <span className="text-gray-900 font-semibold truncate">{product.Title}</span>
                </nav>

                {/* Core Detail Presentation Structural Grid splits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 xl:gap-16">

                    {/* LEFT COLUMN: Media Gallery Canvas and Controls */}
                    <div className="space-y-4">
                        <div className="flex flex-col-reverse lg:flex-row gap-4">

                            {/* Vertical Strip Thumbnail Track */}
                            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible space-x-3 lg:space-x-0 lg:space-y-3 shrink-0 scrollbar-none">
                                {mediaList.map((media, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveMediaIndex(idx)}
                                        className={`relative w-20 h-20 aspect-square border rounded-md overflow-hidden bg-gray-50 transition shrink-0 ${idx === activeMediaIndex ? "border-amber-700 ring-1 ring-amber-700" : "border-gray-200 hover:border-gray-400"
                                            }`}
                                    >
                                        {media.type === "video" ? (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wider">
                                                <span>Video</span>
                                            </div>
                                        ) : (
                                            <img src={media.url} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Focus Stage Workspace */}
                            <div className="relative flex-grow aspect-square border border-gray-100 rounded-lg bg-gray-50 overflow-hidden group">
                                {mediaList[activeMediaIndex]?.type === "video" ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
                                        <svg className="h-14 w-14 text-amber-700 mb-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                        <button
                                            onClick={() => setIsVideoModalOpen(true)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-700 hover:bg-amber-800 transition"
                                        >
                                            Launch Product Video Player
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        className="w-full h-full relative overflow-hidden cursor-zoom-in"
                                        onMouseMove={handleMouseMoveZoom}
                                        onMouseEnter={() => setIsHoveringMainImage(true)}
                                        onMouseLeave={() => setIsHoveringMainImage(false)}
                                        onClick={() => setIsZoomModalOpen(true)}
                                    >
                                        <img
                                            src={mediaList[activeMediaIndex]?.url}
                                            alt={product.Title}
                                            className={`w-full h-full object-cover transition-transform duration-100 ${isHoveringMainImage ? "opacity-0" : "opacity-100"}`}
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
                                )}

                                {/* Left / Right Focus Navigation Elements */}
                                {mediaList.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setActiveMediaIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1))}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full text-gray-800 hover:bg-white shadow transition text-sm font-bold"
                                        >
                                            &lsaquo;
                                        </button>
                                        <button
                                            onClick={() => setActiveMediaIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full text-gray-800 hover:bg-white shadow transition text-sm font-bold"
                                        >
                                            &rsaquo;
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Weights, Specifications & Authentic Certification Info Meta Block */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 grid grid-cols-2 gap-4 text-xs text-gray-600">
                            <div>
                                <span className="block text-gray-400 font-medium uppercase tracking-wider mb-0.5">Gross Weight</span>
                                <span className="font-semibold text-gray-900 text-sm">{activePriceObj.grossWeight} grams</span>
                            </div>
                            <div>
                                <span className="block text-gray-400 font-medium uppercase tracking-wider mb-0.5">Net Weight</span>
                                <span className="font-semibold text-gray-900 text-sm">{activePriceObj.netWeight} grams</span>
                            </div>
                            <div className="col-span-2 border-t border-gray-200 pt-2 flex items-center space-x-2 text-amber-800 font-medium">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span>100% Certified & Hallmark Guaranteed Settings</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Interactive Control & Specification Management */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-widest text-amber-800">{product.Category}</span>
                                <h1 className="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-gray-900 mt-1">{product.Title}</h1>
                                <p className="text-xs text-gray-400 font-mono mt-1">SKU ID Reference: {product.SKU}</p>
                            </div>

                            <div className="flex space-x-2">
                                <button onClick={handleShareProduct} className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition" title="Share link">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l4.684-2.342m0 3.192l-4.684 2.342m0 0a3 3 0 100 4.243 3 3 0 000-4.243zm4.684-11.232a3 3 0 110 4.243 3 3 0 010-4.243z" />
                                    </svg>
                                </button>
                                <button onClick={handleAddToWishlist} className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-500 hover:text-rose-600 transition" title="Save style">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Price Presentation and Accordion Breakdown Toggle anchor link */}
                        <div className="py-4 border-y border-gray-100 flex items-center justify-between">
                            <div>
                                <span className="text-3xl font-bold text-gray-900">₹{Math.round(activePriceObj.finalPrice).toLocaleString("en-IN")}</span>
                                <span className="text-xs text-gray-400 block mt-0.5">Inclusive of all local production taxes and GST values</span>
                            </div>
                            <button
                                onClick={() => setIsPriceBreakupOpen(!isPriceBreakupOpen)}
                                className="text-xs font-semibold text-amber-800 hover:text-amber-900 underline tracking-wide uppercase"
                            >
                                {isPriceBreakupOpen ? "Hide Price Breakup" : "See Full Price Breakup"}
                            </button>
                        </div>

                        {/* Price Breakup Table Block */}
                        {isPriceBreakupOpen && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-fadeIn space-y-2 text-sm">
                                <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-500 pb-2 border-b">Pricing Component Split</h4>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">Metal & Stone Component Value</span>
                                    <span className="font-medium text-gray-900">₹{Math.round(activePriceObj.totalCost - activePriceObj.makingCharge).toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">Making Charges</span>
                                    <span className="font-medium text-gray-900">₹{Math.round(activePriceObj.makingCharge).toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">GST Value Component (3%)</span>
                                    <span className="font-medium text-gray-900">₹{Math.round(activePriceObj.gst).toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between py-2 border-t border-gray-200 font-semibold text-gray-900 mt-2">
                                    <span>Calculated Net Price</span>
                                    <span>₹{Math.round(activePriceObj.finalPrice).toLocaleString("en-IN")}</span>
                                </div>
                            </div>
                        )}

                        <div className="text-sm text-gray-600 leading-relaxed">
                            <h3 className="font-medium text-gray-900 text-xs uppercase tracking-wider mb-1">Description</h3>
                            <p>{product.Description}</p>
                        </div>

                        {/* VARIANT CONTROLS: Managed dynamically with data filters */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">

                            {/* Karat Selection Track */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                    Select Purity Standard: <span className="text-gray-900 font-bold">{karat.toUpperCase()} Gold</span>
                                </label>
                                <div className="flex gap-2">
                                    {(["9kt", "14kt", "18kt"] as const).map((k) => {
                                        const isAvailable = product.prices.some((p) => p.karat === k);
                                        return (
                                            <button
                                                key={k}
                                                disabled={!isAvailable}
                                                onClick={() => setKarat(k)}
                                                className={`px-4 py-2 text-xs font-semibold rounded-md border tracking-wider uppercase transition ${!isAvailable ? "opacity-30 cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400" :
                                                    karat === k ? "border-amber-700 bg-amber-50 text-amber-800 font-bold shadow-sm" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {k}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Dynamic Color Selector swatches */}
                            {product.colors && product.colors.length > 0 && (
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                        Metal Finish Tone: <span className="text-gray-900 font-bold">{color}</span>
                                    </label>
                                    <div className="flex gap-3">
                                        {product.colors.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setColor(c)}
                                                className={`group relative flex items-center justify-center p-1 rounded-full border transition ${color === c ? "border-amber-700 scale-110" : "border-gray-200 hover:border-gray-400"
                                                    }`}
                                                title={c}
                                            >
                                                <span
                                                    className="w-6 h-6 rounded-full block shadow-inner border border-black/5"
                                                    style={{ backgroundColor: getSwatchHexColor(c) }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Dynamic Size Dropdown Menu field */}
                            {product.size_options && product.size_options.length > 0 && (
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                        Available Size Configuration
                                    </label>
                                    <select
                                        value={size}
                                        onChange={(e) => setSize(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2 border"
                                    >
                                        {product.size_options.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Desktop Action Trigger Track */}
                        <div className="hidden md:flex gap-4 pt-4">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 px-6 py-3 bg-gray-900 text-white font-medium text-sm tracking-wide uppercase rounded-md shadow hover:bg-black transition"
                            >
                                Add to Shopping Cart
                            </button>
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 px-6 py-3 bg-amber-700 text-white font-medium text-sm tracking-wide uppercase rounded-md shadow hover:bg-amber-800 transition"
                            >
                                Buy Style Now
                            </button>
                        </div>

                        {/* Real Dynamic Coupons Grid Block */}
                        {coupons.length > 0 && (
                            <div className="pt-6 border-t border-gray-100 space-y-3">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Eligible Promotional Offers</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {coupons.map((coupon) => (
                                        <div key={coupon.code} className="border border-dashed border-amber-300 bg-amber-50/50 rounded-lg p-3 relative flex flex-col justify-between">
                                            <div>
                                                <span className="inline-block bg-amber-100 text-amber-900 font-mono text-xs font-bold px-2 py-0.5 rounded border border-amber-200 tracking-wider">
                                                    {coupon.code}
                                                </span>
                                                <p className="text-xs text-gray-600 mt-1.5 leading-snug">{coupon.scope}</p>
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase mt-2 block">
                                                Apply code at checkout grid
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- REVIEWS SEGMENT --- */}
                <section className="mt-16 border-t border-gray-200 pt-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                        {/* Reviews Form Block Column */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-serif font-semibold tracking-tight text-gray-900">Customer Experiences</h2>
                            <p className="text-xs text-gray-500 leading-normal">
                                Share your personal satisfaction profile regarding the settings, finish weight, and presentation details of this model.
                            </p>

                            <form onSubmit={handleSubmitReview} className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">Assign Star Rating</label>
                                    <select
                                        value={rating}
                                        onChange={(e) => setRating(Number(e.target.value))}
                                        className="mt-1 block w-full rounded-md border-gray-300 text-sm p-1.5 border"
                                    >
                                        {[5, 4, 3, 2, 1].map((n) => (
                                            <option key={n} value={n}>{n} Stars out of 5</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">Review Text Narrative</label>
                                    <textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        required
                                        rows={3}
                                        placeholder="Describe design aspect details..."
                                        className="mt-1 block w-full rounded-md border-gray-300 text-sm p-2 border shadow-sm focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-gray-900 hover:bg-black tracking-wider uppercase transition"
                                >
                                    Submit For Review Moderation
                                </button>
                            </form>
                        </div>

                        {/* Active Rendered Reviews List Track Feed Column */}
                        <div className="lg:col-span-2 space-y-4 max-h-[450px] overflow-y-auto pr-2">
                            {reviews.length === 0 ? (
                                <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
                                    No verified client evaluations recorded yet for this series SKU.
                                </div>
                            ) : (
                                reviews.map((r) => (
                                    <article key={r._id} className="p-4 rounded-lg border border-gray-100 space-y-1 bg-white shadow-sm">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-gray-900">{r.user?.name || "Verified Customer"}</span>
                                            <span className="text-amber-600 font-bold tracking-wider">★ {r.rating} / 5</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-normal pt-1">{r.text}</p>
                                    </article>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* --- REAL SIMILAR PRODUCTS / SHOWCASE CAROUSEL LAYER --- */}
                {similarProducts.length > 0 && (
                    <section className="mt-20 pt-10 border-t border-gray-100">
                        <div className="flex items-baseline justify-between mb-6">
                            <h2 className="text-xl font-serif font-semibold tracking-tight text-gray-900">Complementary Designs</h2>
                            <Link to={`/products?category=${encodeURIComponent(product.Category)}`} className="text-xs font-semibold text-amber-800 hover:underline uppercase tracking-wider">
                                Explore All
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {similarProducts.map((p) => {
                                const basePrice = p.prices?.[0]?.finalPrice || 0;
                                return (
                                    <Link
                                        key={p.id}
                                        to={`/product/${p.slug}`}
                                        className="group flex flex-col overflow-hidden rounded-lg border border-gray-100 hover:shadow-md transition bg-white"
                                    >
                                        <div className="aspect-square w-full overflow-hidden bg-gray-50 relative">
                                            <img
                                                src={p["image_link-1"]}
                                                alt={p.Title}
                                                className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                                            />
                                        </div>
                                        <div className="p-3 space-y-1 flex-grow flex flex-col justify-between">
                                            <div>
                                                <span className="text-[10px] uppercase text-gray-400 tracking-wider font-medium">{p.Category}</span>
                                                <h3 className="text-xs font-medium text-gray-900 group-hover:text-amber-800 line-clamp-1 transition">{p.Title}</h3>
                                            </div>
                                            <p className="text-xs font-semibold text-gray-900 pt-1">
                                                From ₹{Math.round(basePrice).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}
            </main>

            <Footer onCategoryChange={() => { }} />

            {/* --- MOBILE STICKY FLOATING BOTTOM CONSOLE CONTAINER PANEL --- */}
            <div className="fixed md:hidden inset-x-0 bottom-0 bg-white border-t border-gray-200 p-3 flex gap-3 z-40 shadow-xl">
                <button
                    onClick={handleAddToWishlist}
                    className="p-3 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
                    aria-label="Wishlist"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
                <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3 bg-gray-900 text-white font-medium text-xs tracking-wider uppercase rounded-md shadow-sm active:bg-black"
                >
                    Add to Cart
                </button>
                <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3 bg-amber-700 text-white font-medium text-xs tracking-wider uppercase rounded-md shadow-sm active:bg-amber-800"
                >
                    Buy Now
                </button>
            </div>

            {/* --- FULLSCREEN GALLERY ZOOM OVERLAY MODAL --- */}
            {isZoomModalOpen && mediaList[activeMediaIndex]?.type === "image" && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setIsZoomModalOpen(false)}
                >
                    <button className="absolute top-4 right-4 text-white text-3xl font-light hover:text-gray-300">&times;</button>
                    <img
                        src={mediaList[activeMediaIndex].url}
                        alt=""
                        className="max-w-full max-h-[90vh] object-contain rounded animate-zoomIn"
                    />
                </div>
            )}

            {/* --- INTEGRATED YOUTUBE/NATIVE COMPREHENSIVE VIDEO MODAL STAGE --- */}
            {isVideoModalOpen && product.video_link && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="relative w-full max-w-3xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
                        <button
                            onClick={() => setIsVideoModalOpen(false)}
                            className="absolute -top-10 right-0 md:top-2 md:right-2 z-10 text-white md:bg-black/50 md:p-1 md:rounded-full text-2xl font-bold leading-none hover:text-amber-500"
                        >
                            &times;
                        </button>
                        {extractYouTubeId(product.video_link) ? (
                            <iframe
                                title="Product Exhibition Clip"
                                src={`https://www.youtube.com/embed/${extractYouTubeId(product.video_link)}?autoplay=1&rel=0`}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <video
                                src={product.video_link}
                                controls
                                autoPlay
                                className="w-full h-full"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}