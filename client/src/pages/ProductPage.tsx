import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useCategories } from "../hooks/useCategories";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthModal } from "./AuthModal";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from "../hooks/useWishlist";
import type { Category, Product } from "../types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PRICE_BUCKETS = [{ label: "All Prices", min: "", max: "" },
{ label: "Under INR 20,000", min: "0", max: "20000" },
{ label: "INR 20,000 - INR 50,000", min: "20000", max: "50000" },
{ label: "INR 50,000 - INR 1,000,000", min: "50000", max: "100000" },
{ label: "Above INR 1,000,000", min: "100000", max: "99999999" },
];

const KARAT_OPTIONS = [
    { label: "14kt Gold", value: "14kt" },
    { label: "18kt Gold", value: "18kt" },
];

const SORT_OPTIONS = [
    { label: "Featured", value: "" },
    { label: "Price: Low to High", value: "price-low-high" },
    { label: "Price: High to Low", value: "price-high-low" },
    { label: "Newest", value: "newest" },
    { label: "Best Sellers", value: "best-sellers" },
];

const responsiveImage = (url: string, width = 800) => url.includes("res.cloudinary.com") ? url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`) : url;

const formatCatalogProductTitle = (title: string) =>
    title.toLocaleLowerCase("en-IN").replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase("en-IN"));
export default function ProductPage({ metal = "gold", b2b = false }: { metal?: "gold" | "silver"; b2b?: boolean }) {
    const [params, setParams] = useSearchParams();

    const { data: categoryData = [] } = useCategories(metal);
    const categories = categoryData ?? [];

    const [selectedKaratFilter, setSelectedKaratFilter] = useState<"14kt" | "18kt">((params.get("karat") as "14kt" | "18kt") || "14kt");
    const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);
    const [isSortMobileOpen, setIsSortMobileOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        const open = isFilterMobileOpen || isSortMobileOpen;
        document.body.classList.toggle("modal-open", open);
        return () => document.body.classList.remove("modal-open");
    }, [isFilterMobileOpen, isSortMobileOpen]);

    // FIX #1: Hybrid Dynamic Auth Check (Checks most common storage names)
    const { isAuthenticated: isLoggedIn } = useAuth();
    const { data: wishlist = [] } = useWishlist(isLoggedIn);
    const addToWishlistMutation = useAddToWishlist();
    const removeFromWishlistMutation = useRemoveFromWishlist();
    const [pendingWishlistProduct, setPendingWishlistProduct] = useState<Product | null>(null);

    const query = params.toString();

    const { data: products = [], isLoading: loading } = useQuery({
        queryKey: ["products", metal, query],
        queryFn: () => { const b2bParams = new URLSearchParams({ metal });["minPrice", "maxPrice", "karat"].forEach((key) => { const value = params.get(key); if (value) b2bParams.set(key, value); }); return apiRequest<Product[]>(b2b ? `/b2b/products?${b2bParams.toString()}` : `/products/${metal}?${query}`); },
        staleTime: 2 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
    });

    const categoryId = (
        category?: string | { _id: string; name?: string } | null
    ) => {
        if (!category) return "";

        return typeof category === "string"
            ? category
            : category._id ?? "";
    };


    const parentId = (category: Category) => category.parent ? categoryId(category.parent) : null;
    const categoryOptions = metal === "gold"
        ? categories.filter((category) => category.categoryKind === "subcategory" && parentId(category) === categories.find((root) => root.categoryKind === "metal-root")?._id)
        : categories.filter((category) => category.categoryKind === "type").flatMap((type) => [type, ...categories.filter((child) => categoryId(child.parent) === type._id)]);
    const selectCategory = (category: Category | null) => {
        const next = new URLSearchParams(params);
        next.delete("category");
        if (!category) { next.delete("mainCategory"); next.delete("subCategory"); }
        else if (category.categoryKind === "type") { next.set("mainCategory", category._id); next.delete("subCategory"); }
        else if (category.parent) { next.set("mainCategory", parentId(category) || ""); next.set("subCategory", category._id); }
        else { next.set("mainCategory", category._id); next.delete("subCategory"); }
        setParams(next);
    };
    const selectedMainCategory = params.get("mainCategory");
    const selectedSubCategory = params.get("subCategory");
    const activeCategoryName = categories.find((category) => category._id === (selectedSubCategory || selectedMainCategory))?.name || "All";
    const changeParam = (key: string, value: string | null) => {
        const next = new URLSearchParams(params);
        if (value) {
            next.set(key, value);
        } else {
            next.delete(key);
        }
        setParams(next);
    };

    const handlePriceBucketChange = (min: string, max: string) => {
        const next = new URLSearchParams(params);
        if (!min && !max) {
            next.delete("minPrice");
            next.delete("maxPrice");
        } else if (next.get("minPrice") === min && next.get("maxPrice") === max) {
            next.delete("minPrice");
            next.delete("maxPrice");
        } else {
            next.set("minPrice", min);
            next.set("maxPrice", max);
        }
        setParams(next);
    };

    const performWishlistToggle = async (product: Product) => {
        const alreadySaved = wishlist.some((item) => item.productId === product.SKU);
        try {
            if (alreadySaved) { await removeFromWishlistMutation.mutateAsync(product.SKU); showToast("Removed from wishlist.", "success"); }
            else {
                const productPrices = Array.isArray(product.prices) ? product.prices : [];
                const priceObj = productPrices.find((price) => price.karat === "14kt") || productPrices[0];
                await addToWishlistMutation.mutateAsync({ productId: product.SKU, karat: priceObj?.karat || "14kt" });
                showToast("Product saved to wishlist.", "success");
            }
        } catch { showToast("Could not update wishlist.", "error"); }
    };
    const handleWishlistToggle = (product: Product) => {
        if (!isLoggedIn) { setPendingWishlistProduct(product); setIsAuthOpen(true); return; }
        void performWishlistToggle(product);
    };
    const handleWishlistAuthenticated = () => {
        const product = pendingWishlistProduct;
        setPendingWishlistProduct(null);
        if (product) void performWishlistToggle(product);
    };

    const productCategoryLabel = (product: Product) => {
        const selectedCategoryId = categoryId(product.subCategory) || categoryId(product.mainCategory);
        return categories.find((category) => category._id === selectedCategoryId)?.name || (typeof product.subCategory === "object" ? product.subCategory?.name : "") || (typeof product.mainCategory === "object" ? product.mainCategory?.name : "") || product.category || (product as Product & { Category?: string }).Category || "Jewellery";
    };
    const filteredProducts = products.filter((product) => (!selectedMainCategory || categoryId(product.mainCategory) === selectedMainCategory) && (!selectedSubCategory || categoryId(product.subCategory) === selectedSubCategory) && (metal !== "gold" || product.prices?.some((price) => price.karat === selectedKaratFilter)));
    const clearFilters = () => { setParams(new URLSearchParams()); };

    return (
        <div className="catalog-page min-h-screen flex flex-col antialiased">

            {!b2b && <Navbar
                onSearchChange={(v) => changeParam("search", v || null)}
                activeCategory={params.get("category") || "All"}
                onCategoryChange={(cat) => changeParam("category", cat === "All" ? null : cat)}
            />}<main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
                <div className="catalog-title-bar border-b pb-5 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-primary font-semibold tracking-tight text-gray-900">{metal === "gold" ? "Diamond Jewellery" : "Silver Jewellery"}</h1>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-4">
                        <input
                            type="text"
                            value={params.get("search") || ""}
                            onChange={(e) => changeParam("search", e.target.value)}
                            placeholder="Search specific styles..."
                            className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:border-amber-500 focus:ring-amber-500 p-2 border"
                        />
                    </div>
                </div>

                <div className="pt-5 lg:grid lg:grid-cols-4 lg:gap-x-8">
                    {/* Desktop Sidebar Filters */}
                    <aside className="catalog-filter-panel hidden lg:sticky lg:top-4 lg:self-start lg:block lg:max-h-[calc(100vh-1rem)] lg:overflow-y-auto lg:pr-2 space-y-0">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                            <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                            <button onClick={clearFilters} className="text-xs font-medium text-amber-700 hover:text-amber-800 underline">
                                Clear all
                            </button>
                        </div>

                        <FilterSection title="Category">
                            <div className="space-y-2 pt-2">
                                <button
                                    onClick={() => selectCategory(null)}
                                    className={`block text-sm text-left w-full transition ${!selectedMainCategory ? "text-amber-700 font-semibold" : "text-gray-600 hover:text-gray-900"}`}
                                >
                                    All Categories
                                </button>
                                {categoryOptions.map((cat) => (
                                    <button
                                        key={cat._id}
                                        onClick={() => selectCategory(cat)}
                                        className={`block text-sm text-left w-full transition ${metal === "gold" ? "" : cat.categoryKind === "type" ? "font-semibold text-gray-900" : "ml-4 border-l border-gray-200 pl-3"} ${selectedSubCategory === cat._id || selectedMainCategory === cat._id ? "text-amber-700 font-semibold" : "text-gray-600 hover:text-gray-900"}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </FilterSection>

                        <FilterSection title="Price Range">
                            <div className="space-y-2 pt-2">
                                {PRICE_BUCKETS.map((bucket) => {
                                    const isActive = !bucket.min && !bucket.max ? !params.get("minPrice") && !params.get("maxPrice") : params.get("minPrice") === bucket.min && params.get("maxPrice") === bucket.max;
                                    return (
                                        <label key={bucket.label} className="flex items-center space-x-3 cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                                            <input
                                                type="checkbox"
                                                checked={isActive}
                                                onChange={() => handlePriceBucketChange(bucket.min, bucket.max)}
                                                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                            />
                                            <span className={isActive ? "text-amber-700 font-medium" : ""}>{bucket.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </FilterSection>

                        {metal === "gold" && <FilterSection title="Purity / KT"><div className="flex gap-2 pt-2">{[{ label: "14KT", value: "14kt" }, { label: "18KT", value: "18kt" }].map((option) => (<button key={option.label} type="button" onClick={() => { setSelectedKaratFilter(option.value as "14kt" | "18kt"); changeParam("karat", option.value || null); }} className={`rounded border px-3 py-2 text-xs font-semibold ${selectedKaratFilter === option.value ? "border-amber-600 bg-amber-50 text-amber-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{option.label}</button>))}</div></FilterSection>}
                    </aside>

                    {/* Product Grid Area */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
                            <p className="text-sm text-gray-500 font-medium">
                                Showing <span className="text-gray-900 font-semibold">{filteredProducts.length}</span> individual items
                            </p>

                            <div className="hidden lg:flex items-center space-x-2">
                                <span className="text-sm text-gray-500">Sort by:</span>
                                <select
                                    value={params.get("sort") || "price-low-high"}
                                    onChange={(e) => changeParam("sort", e.target.value || null)}
                                    className="rounded-md border-gray-300 text-sm focus:border-amber-500 focus:ring-amber-500 p-1 border"
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>


                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-3">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700" />
                                <p className="text-sm text-gray-500 tracking-wide font-medium">Curating live collection...</p>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-lg border border-dashed border-gray-300 p-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                                <p className="mt-1 text-sm text-gray-500">Try modifying search criteria or extending pricing limits.</p>
                                <div className="mt-6">
                                    <button onClick={clearFilters} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-700 hover:bg-amber-800">
                                        Reset Filter View
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 xl:gap-x-8">
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        categoryLabel={productCategoryLabel(product)}
                                        defaultKarat={selectedKaratFilter || "14kt"} b2b={b2b}
                                        onWishlistToggle={handleWishlistToggle}
                                        isWishlisted={wishlist.some((item) => item.productId === product.SKU)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main >

            <div className="catalog-mobile-bar fixed inset-x-0 bottom-0 z-[var(--z-sticky)] flex gap-3 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]/95 p-3 shadow-[var(--shadow-lg)] backdrop-blur lg:hidden">
                <button onClick={() => setIsFilterMobileOpen(true)} className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-teal)] px-4 py-3 text-sm font-semibold text-[var(--color-teal)]">
                    Filters
                </button>
                <button onClick={() => setIsSortMobileOpen(true)} className="flex-1 rounded-[var(--radius-sm)] bg-[var(--color-teal)] px-4 py-3 text-sm font-semibold text-white">
                    Sort options
                </button>
            </div>



            {/* Mobile Overlays */}
            {
                isFilterMobileOpen && (
                    <div className="catalog-sheet-backdrop fixed inset-0 z-[var(--z-modal)] flex items-end bg-black/40 lg:hidden" onClick={() => setIsFilterMobileOpen(false)}>
                        <div className="catalog-bottom-sheet relative max-h-[85vh] w-full rounded-t-[var(--radius-xl)] bg-[var(--color-bg-secondary)] shadow-[var(--shadow-lg)] py-5 pb-10 flex flex-col overflow-y-auto px-5 animate-[slideUp_220ms_ease-out]" onClick={(event) => event.stopPropagation()}>
                            <div className="flex items-center justify-between pb-4 border-b">
                                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                                <button onClick={() => setIsFilterMobileOpen(false)} className="text-gray-500 text-xl font-bold">&times;</button>
                            </div>
                            <div className="mt-3 space-y-4 flex-grow">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Categories</h3>
                                    <button onClick={() => { selectCategory(null); setIsFilterMobileOpen(false); }} className={`block py-1 text-sm text-left w-full ${!selectedMainCategory ? "text-amber-700 font-bold" : "text-gray-600"}`}>All Categories</button>
                                    {categoryOptions.map((c) => (
                                        <button key={c._id} onClick={() => { selectCategory(c); setIsFilterMobileOpen(false); }} className={`block py-1 text-sm text-left w-full ${metal === "gold" ? "" : c.categoryKind === "type" ? "font-semibold text-gray-900" : "ml-4 border-l border-gray-200 pl-3"} ${selectedSubCategory === c._id || selectedMainCategory === c._id ? "text-amber-700 font-bold" : "text-gray-600"}`}>
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                                {metal === "gold" && <div className="border-t pt-4"><h3 className="text-sm font-semibold text-gray-900 mb-1">Purity / KT</h3><div className="flex gap-2">{[{ label: "14KT", value: "14kt" }, { label: "18KT", value: "18kt" }].map((option) => (<button key={option.label} type="button" onClick={() => { setSelectedKaratFilter(option.value as "14kt" | "18kt"); changeParam("karat", option.value || null); }} className={`rounded border px-3 py-2 text-xs font-semibold ${selectedKaratFilter === option.value ? "border-amber-600 bg-amber-50 text-amber-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{option.label}</button>))}</div></div>}
                                <div className="border-t pt-4">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Price Ranges</h3>
                                    {PRICE_BUCKETS.map((b) => (
                                        <button key={b.label} onClick={() => { handlePriceBucketChange(b.min, b.max); setIsFilterMobileOpen(false); }} className={`block py-1 text-sm text-left w-full ${(params.get("minPrice") || "") === b.min && (params.get("maxPrice") || "") === b.max ? "text-amber-700 font-bold" : "text-gray-600"}`}>
                                            {b.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                isSortMobileOpen && (
                    <div className="catalog-sheet-backdrop fixed inset-0 z-[var(--z-modal)] flex items-end lg:hidden bg-black/40" onClick={() => setIsSortMobileOpen(false)}>
                        <div className="catalog-bottom-sheet relative w-full bg-[var(--color-bg-secondary)] shadow-[var(--shadow-lg)] rounded-t-[var(--radius-xl)] p-6 space-y-4 animate-[slideUp_220ms_ease-out]" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-medium text-gray-900">Sort Matrix Options</h3>
                                <button onClick={() => setIsSortMobileOpen(false)} className="text-gray-500 text-xl font-bold">&times;</button>
                            </div>
                            <div className="space-y-3">
                                {SORT_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { changeParam("sort", opt.value || null); setIsSortMobileOpen(false); }}
                                        className={`block w-full text-left py-2 text-sm ${params.get("sort") === opt.value || (!params.get("sort") && opt.value === "price-low-high") ? "text-amber-700 font-semibold" : "text-gray-700"}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }

            {!b2b && <Footer onCategoryChange={() => { }} />}
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onAuthenticated={handleWishlistAuthenticated} />
        </div >
    );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="border-b border-gray-200 py-4">
            <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between text-sm text-gray-400 hover:text-gray-500">
                <span className="font-medium text-gray-900">{title}</span>
                <span className="ml-6 flex items-center transform transition-transform duration-200 text-gray-600">
                    {isOpen ? "-" : "+"}
                </span>
            </button>
            {isOpen && <div className="pt-2 transition-all duration-300">{children}</div>}
        </div>
    );
}

export function ProductCard({ product, categoryLabel, defaultKarat, onWishlistToggle, isWishlisted, b2b = false }: { product: Product; categoryLabel: string; defaultKarat: "14kt" | "18kt"; onWishlistToggle: (product: Product) => void; isWishlisted: boolean; b2b?: boolean }) {

    const categoryName = (
        category?: Category | string | null
    ) => {
        if (!category) return "Jewellery";
        if (typeof category === "string") return "Jewellery";
        return category.name ?? "Jewellery";
    };

    const [activeKarat, setActiveKarat] = useState<"14kt" | "18kt">(defaultKarat);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setActiveKarat(defaultKarat);
    }, [defaultKarat]);

    const images = (product.images ?? []).map((image) => image.url);
    const displaysCarousel = images.length > 1;

    const handleMouseEnter = () => {
        if (!displaysCarousel) return;
        timerRef.current = setInterval(() => {
            setCurrentImgIndex((prev) => (prev + 1) % images.length);
        }, 1800);
    };

    const handleMouseLeave = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setCurrentImgIndex(0);
    };

    const productPrices = Array.isArray(product.prices) ? product.prices : [];
    const targetPriceObj = productPrices.find((p) => p.karat === activeKarat) || productPrices[0];
    const displaysPrice = targetPriceObj ? Math.round(b2b ? (targetPriceObj.b2bFinalPrice ?? targetPriceObj.finalPrice) : targetPriceObj.finalPrice) : 0;
    const isSilver = product.metal === "silver";

    return (
        <div
            className="catalog-product-card group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border bg-white shadow-sm transition max-w-sm w-full mx-auto"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* FIX #3: Proportional portrait aspect-ratio layout for card structure */}
            <div className="relative aspect-[4/5] w-full bg-gray-50 overflow-hidden">
                <Link to={`${b2b ? "/b2b/product/" : "/product/"}${product.slug || product.SKU}`} className="block w-full h-full">
                    {images[currentImgIndex] ? <img src={responsiveImage(images[currentImgIndex], 800)} alt={product.title} className="h-full w-full object-contain object-center transition duration-500 group-hover:scale-102" /> : <div className="grid h-full place-items-center p-6 text-center text-xs text-gray-500">Product image unavailable</div>}
                </Link>

                <div className="absolute top-3 left-3 flex flex-col space-y-1">
                    {product.isBestSeller && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 uppercase tracking-wider shadow-sm">
                            Bestseller
                        </span>
                    )}
                    {product.isNewProduct && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wider shadow-sm">
                            New
                        </span>
                    )}
                </div>

                <button
                    onClick={() => onWishlistToggle(product)}
                    className={`absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition ${isWishlisted ? "text-rose-600" : "text-gray-500 hover:text-rose-600"}`}
                    aria-label="Save to Wishlist"
                >
                    <svg className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>

                {displaysCarousel && (<><button type="button" onClick={() => setCurrentImgIndex((current) => (current - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-700 shadow" aria-label="Previous product image"><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={() => setCurrentImgIndex((current) => (current + 1) % images.length)} className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-700 shadow" aria-label="Next product image"><ChevronRight className="h-4 w-4" /></button><div className="absolute inset-x-0 bottom-3 flex justify-center space-x-1.5 pointer-events-none">
                    {images.map((_, idx) => (
                        <span
                            key={idx}
                            className={`h-1 rounded-full transition-all ${idx === currentImgIndex ? "bg-amber-600 w-3" : "bg-gray-300 w-1 opacity-60"}`}
                        />
                    ))}
                </div>
                </>)}
            </div>

            <div className="flex flex-1 flex-col p-4 space-y-2">
                <span className="text-xs sm:text-[10px] tracking-wider text-gray-400 uppercase font-semibold">{categoryLabel}</span>

                <Link to={`${b2b ? "/b2b/product/" : "/product/"}${product.slug || product.SKU}`} className="block">
                    <h3 className="product-title normal-case text-lg leading-snug text-gray-900 hover:text-amber-700 line-clamp-2 min-h-[48px] transition sm:text-xl" style={{ textTransform: "none" }}>
                        {formatCatalogProductTitle(product.title)}
                    </h3>
                </Link>

                <div className="flex items-baseline space-x-1.5 pt-1">
                    <span className="text-lg sm:text-base font-bold text-gray-900">
                        {"\u20B9"}{displaysPrice.toLocaleString("en-IN")}
                    </span>
                    {!isSilver && <span className="text-xs text-gray-400 font-normal">
                        ({activeKarat})
                    </span>}
                </div>

                {!isSilver && <div className="pt-3 mt-auto border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-gray-500">Purity:</span>
                    <div className="flex space-x-1">
                        {(["14kt", "18kt"] as const).map((kt) => {
                            const hasPurityVariant = (product.prices ?? []).some((p) => p.karat === kt);
                            return (
                                <button
                                    key={kt}
                                    disabled={!hasPurityVariant}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveKarat(kt);
                                    }}
                                    className={`px-2 py-0.5 text-[10px] font-semibold rounded transition ${!hasPurityVariant ? "opacity-30 cursor-not-allowed bg-gray-100 text-gray-400" :
                                        activeKarat === kt ? "border-amber-600 bg-amber-50 text-amber-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    {kt.toUpperCase()}
                                </button>
                            );
                        })}
                    </div>
                </div>}
            </div>
        </div>
    );
}
