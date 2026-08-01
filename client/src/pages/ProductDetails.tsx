import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthModal } from "./AuthModal";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api/client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToast } from "../context/ToastContext";
import { useAddToCart } from "../hooks/useCart";
import { RING_SIZES } from "../constants/product";
import type { Product } from "../types";
import { formatINR } from "../utils/currency";
import { publicAssetUrl } from "../utils/image";
import PriceBreakup from "../components/PriceBreakup";
import { Seo } from "../components/Seo";
import { Heart, Share2 } from "lucide-react";

type Review = {
    _id: string;
    rating: number;
    text: string;
    user?: { name: string };
};

function getSwatchHexColor(colorName: string): string {
    const normalized = colorName.toLowerCase();
    if (normalized.includes("white") || normalized.includes("silver") || normalized.includes("platinum")) return "#F3F4F6";
    if (normalized.includes("rose") || normalized.includes("pink")) return "#E0A899";
    if (normalized.includes("yellow") || normalized.includes("gold")) return "#E5C158";
    return "#FFF";
}

function ShippingHandling() {
    return <section className="border-t border-stone-200 pt-4"><h3 className="text-base font-bold uppercase tracking-widest text-stone-700 lg:text-xs">Shipping &amp; Handling</h3><ul className="mt-3 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-stone-600 lg:text-xs"><li>Free shipping perks on all orders within India</li><li>Avail your items within 15 business days</li><li>Inspect your package carefully before signing off</li><li>Package will be sealed and wrapped in bubble wrap, small box, or padded envelope</li></ul></section>;
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
    const { isAuthenticated } = useAuth();
    const addToCartMutation = useAddToCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [karat, setKarat] = useState<"14kt" | "18kt">("14kt");
    const [color, setColor] = useState("");
    const [size, setSize] = useState("");
    const [reviews, setReviews] = useState<Review[]>([]);

    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    const [activeMediaIndex, setActiveMediaIndex] = useState(0);
    const [isPriceBreakupOpen, setIsPriceBreakupOpen] = useState(true);
    const [zoomMousePos, setZoomMousePos] = useState({ x: 0, y: 0 });
    const [isHoveringMainImage, setIsHoveringMainImage] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        apiRequest<Product>(`/products/${slug}`)
            .then((p) => {
                setProduct(p);
                const defaultColors = p.metal === "silver" ? (p.colors || ["White"]).filter((item) => !item.toLowerCase().includes("rose")) : (p.colors && p.colors.length > 0 ? p.colors : ["Yellow", "Rose", "White"]);
                setColor(defaultColors[0]);
                setSize("");

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
                <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onAuthenticated={() => void addToCartMutation.mutateAsync({ productId: product.SKU, karat, color, size, quantity: 1 }).then(() => showToast("Item added to cart!", "success")).catch((error: unknown) => showToast(error instanceof Error ? error.message : "Failed to add to cart.", "error"))} />
            </>
        );
    }

    const productPrices = Array.isArray(product.prices) ? product.prices : [];
    const activePriceObj = productPrices.find((price) => price.karat === karat) || productPrices[0] || { totalCost: 0, gst: 0, finalPrice: 0, grossWeight: 0 };

    const categoryName = (
        category?: Product["mainCategory"] | Product["subCategory"] | null
    ) => {
        if (!category) return "Jewellery";

        if (typeof category === "string") return "Jewellery";

        return category.name ?? "Jewellery";
    };

    const categoryId = (
        category?: Product["mainCategory"] | Product["subCategory"] | null
    ) => {
        if (!category) return "";

        if (typeof category === "string") return category;

        return category._id ?? "";
    };

    const isGold = product.metal === "gold";
    const catalogPath = `/${isGold ? "gold-jewellery" : "silver-jewellery"}`;
    const mainCategoryId = categoryId(product.mainCategory);
    const subCategoryId = categoryId(product.subCategory);
    const mainCategoryPath = mainCategoryId
        ? `${catalogPath}?mainCategory=${encodeURIComponent(mainCategoryId)}`
        : catalogPath;
    const subCategoryPath = subCategoryId
        ? `${catalogPath}?${new URLSearchParams({
            ...(mainCategoryId ? { mainCategory: mainCategoryId } : {}),
            subCategory: subCategoryId,
        }).toString()}`
        : mainCategoryPath;
    const isRing = [categoryName(product.mainCategory), categoryName(product.subCategory)].some((name) => /\brings?\b/i.test(name));
    const mediaList = [...product.images.map((image) => ({ type: "image" as const, url: image.url })), ...(product.videoLink ? [{ type: "video" as const, url: product.videoLink }] : [])];

    const availableColors = (product.colors && product.colors.length > 0 ? product.colors : ["Yellow", "Rose", "White"]).filter((finish) => isGold || !finish.toLowerCase().includes("rose"));
    const siteUrl = (import.meta.env.VITE_SITE_URL || "https://thebrillianceatelier.com").replace(/\/+$/, "");
    const productPath = `/product/${product.slug || slug}`;
    const productSchema = {
        "@context": "https://schema.org", "@type": "Product", name: product.title,
        description: product.description || `TBA Jewelry ${product.title}`, sku: product.SKU,
        image: product.images.map((item) => item.url),
        brand: { "@type": "Brand", name: "TBA Jewelry" },
        category: [categoryName(product.mainCategory), categoryName(product.subCategory)].filter(Boolean).join(" > "),
        material: isGold ? "Gold" : "Silver",
        offers: { "@type": "Offer", priceCurrency: "INR", price: Number(activePriceObj.finalPrice || 0).toFixed(2), availability: "https://schema.org/InStock", url: `${siteUrl}${productPath}`, itemCondition: "https://schema.org/NewCondition" },
    };
    const breadcrumbSchema = {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            { "@type": "ListItem", position: 2, name: categoryName(product.mainCategory), item: `${siteUrl}${mainCategoryPath}` },
            ...(subCategoryId ? [{ "@type": "ListItem", position: 3, name: categoryName(product.subCategory), item: `${siteUrl}${subCategoryPath}` }] : []),
            { "@type": "ListItem", position: subCategoryId ? 4 : 3, name: product.title, item: `${siteUrl}${productPath}` },
        ],
    };

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
        if (isRing && !size) {
            showToast("Select a size before adding this product.", "error");
            return;
        }
        if (!isAuthenticated) { setIsAuthOpen(true); return; }
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
        <>
            <Seo title={`${product.title} | TBA Jewelry`} description={product.description || `Explore ${product.title} at TBA Jewelry, with product specifications and complete price details.`} image={product.images[0]?.url} type="product" structuredData={[productSchema, breadcrumbSchema]} />
            <div className="min-h-screen bg-[#FAF9F6] text-stone-900 antialiased font-sans pb-0">
                <Navbar onSearchChange={() => { }} activeCategory="All" onCategoryChange={() => { }} />

                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-16">

                    {/* Breadcrumbs */}
                    <nav className="mb-6 text-[11px] tracking-widest text-amber-900/60 uppercase font-medium space-x-2 border-b border-stone-200/60 pb-3">
                        <Link to="/" className="hover:text-amber-900">Home</Link>
                        <span>/</span>
                        <Link to={mainCategoryPath}>{categoryName(product.mainCategory)}</Link>
                        {subCategoryId && <>
                            <span>/</span>
                            <Link to={subCategoryPath}>{categoryName(product.subCategory)}</Link>
                        </>}
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
                                            {media.type === "video" ? <video src={media.url} muted className="w-full h-full object-cover" /> : <img src={media.url} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />}
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
                                    >                                    {mediaList[activeMediaIndex]?.type === "video" ? <video controls className="w-full h-full object-contain" src={mediaList[activeMediaIndex]?.url} /> : <img src={mediaList[activeMediaIndex]?.url} alt={product.title} className={`w-full h-full object-cover transition-opacity duration-200 ${isHoveringMainImage ? "opacity-0" : "opacity-100"}`} />}{mediaList[activeMediaIndex]?.type !== "video" && isHoveringMainImage && (
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
                                <h3 className="text-base font-bold uppercase tracking-widest text-stone-700 lg:text-xs">Description</h3>
                                <p className="text-base leading-relaxed text-stone-600 lg:text-xs">{product.description}</p>{(product.certificates || []).length > 0 && <div className="hidden lg:block border-t pt-4"><h3 className="text-base font-bold uppercase tracking-widest text-stone-700 lg:text-xs">Certificates of Authenticity</h3><div className="mt-3 flex gap-3">{product.certificates?.map((certificate) => <div key={certificate._id} className="flex items-center gap-3 text-lg lg:text-sm"><img src={publicAssetUrl(certificate.logoUrl)} alt="" className="h-14 w-14 object-contain lg:h-10 lg:w-10" />{certificate.name}</div>)}</div></div>}<div className="hidden lg:block"><ShippingHandling /></div>
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
                                        {formatINR(activePriceObj.finalPrice)}
                                    </span>
                                    <span className="text-[11px] text-stone-500 block">Inclusive of all taxes</span><span className="text-[11px] text-stone-500 block">*This is an estimated price, actual price may differ as per actual weights.</span>
                                </div>
                                {/* <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                                In Stock & Ready to Ship
                            </span> */}
                            </div>

                            {/* Specs */}
                            <div className="bg-stone-50 border border-stone-200/80 rounded-lg p-4 space-y-3">
                                <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-700">
                                    Weight Specifications
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div className="bg-white p-3 rounded border border-stone-100">
                                        <span className="block text-[10px] text-stone-400 uppercase">Gross Weight</span>
                                        <span className="text-sm font-serif font-semibold text-stone-900">{activePriceObj.grossWeight} g</span>
                                    </div>
                                    {isGold && <div className="bg-white p-3 rounded border border-stone-100"><span className="block text-[10px] text-stone-400 uppercase">Net Weight</span><span className="text-sm font-serif font-semibold text-stone-900">{activePriceObj.netWeight} g</span></div>}
                                </div>
                            </div>

                            <div className="flex gap-2"><button type="button" onClick={() => navigator.share ? void navigator.share({ title: product.title, url: window.location.href }) : void navigator.clipboard.writeText(window.location.href).then(() => showToast("Product link copied.", "success"))} className="inline-flex items-center gap-3 py-3 text-sm text-stone-700 cursor-pointer"><Share2 size={22} />Share</button><button type="button" onClick={() => isAuthenticated ? window.location.assign("/wishlist") : setIsAuthOpen(true)} className="inline-flex items-center gap-3 py-3 text-sm text-stone-700"><Heart size={22} />Add to Wishlist</button></div>

                            {/* Purity Selection */}
                            {isGold && <div className="space-y-2">
                                <label className="block text-xs uppercase tracking-widest font-semibold text-stone-600">
                                    Select Purity Standard: <span className="text-stone-900">{karat.toUpperCase()} Gold</span>
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(["14kt", "18kt"] as const).map((k) => (
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
                            </div>}

                            <PriceBreakup product={product} price={activePriceObj} />{(product.certificates || []).length > 0 && <div className="lg:hidden border border-stone-200 bg-white p-4">

                                <h3 className="text-xl font-bold uppercase tracking-widest text-stone-700 lg:text-xs">Certificates of Authenticity</h3>

                                <div className="mt-3 flex gap-3">{product.certificates?.map((certificate) => <div key={certificate._id} className="flex items-center gap-2 text-xs">
                                    <img src={publicAssetUrl(certificate.logoUrl)} alt="" className="h-14 w-14 object-contain lg:h-10 lg:w-10" />{certificate.name}
                                </div>
                                )}
                                </div>
                            </div>
                            }
                            <div className="lg:hidden"><ShippingHandling /></div>

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

                            {isRing && <div className="space-y-2">
                                <label htmlFor="ring-size" className="block text-xs uppercase tracking-widest font-semibold text-stone-600">Ring Size</label>
                                <select id="ring-size" value={size} onChange={(event) => setSize(event.target.value)} className="w-full rounded border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-800 focus:border-amber-800 focus:outline-none" aria-required="true">
                                    <option value="">Select size</option>
                                    {RING_SIZES.map((ringSize) => <option key={ringSize} value={ringSize}>{ringSize}</option>)}
                                </select>
                            </div>}

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
                                                        {"\u2605"}
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
                                                <span className="text-amber-500 font-bold">{"\u2605".repeat(r.rating)}{"\u2606".repeat(5 - r.rating)}</span>
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
                <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onAuthenticated={() => void addToCartMutation.mutateAsync({ productId: product.SKU, karat, color, size, quantity: 1 }).then(() => showToast("Item added to cart!", "success")).catch((error: unknown) => showToast(error instanceof Error ? error.message : "Failed to add to cart.", "error"))} />
            </div>
        </>
    );
}
