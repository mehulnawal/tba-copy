import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useCategories } from "../hooks/useCategories";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import type { Category, Product } from "../types";

const PRICE_BUCKETS = [
    { label: "Under ₹20,000", min: "0", max: "20000" },
    { label: "₹20,000 - ₹50,000", min: "20000", max: "50000" },
    { label: "₹50,000 - ₹1,000,000", min: "50000", max: "100000" },
    { label: "Above ₹1,000,000", min: "100000", max: "99999999" },
];

const KARAT_OPTIONS = [
    { label: "9kt Gold", value: "9kt" },
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

export default function ProductPage({ metal = "gold" }: { metal?: "gold" | "silver" }) {
    const [params, setParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const { data: categoryData = [] } = useCategories(metal);
    const categories = categoryData;
    const [loading, setLoading] = useState(true);
    const [selectedKaratFilter, setSelectedKaratFilter] = useState<"9kt" | "14kt" | "18kt">("9kt");
    const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);
    const [isSortMobileOpen, setIsSortMobileOpen] = useState(false);

    // FIX #1: Hybrid Dynamic Auth Check (Checks most common storage names)
    const { isAuthenticated: isLoggedIn } = useAuth();

    const query = params.toString();

    useEffect(() => {
        setLoading(true);
        Promise.all([
            apiRequest<Product[]>(`/products?${query}`),
            apiRequest<Category[]>("/products/categories")
        ])
            .then(([p, c]) => {
                setProducts(p);
                setCategories(c);
            })
            .catch((err) => console.error("Error loading jewelry catalog data:", err))
            .finally(() => setLoading(false));
    }, [query, metal]);

    const categoryId = (
        category?: string | { _id: string; name?: string } | null
    ) => {
        if (!category) return "";

        return typeof category === "string"
            ? category
            : category._id ?? "";
    };


    const parentId = (category: Category) => category.parent ? categoryId(category.parent) : null;
    const selectCategory = (category: Category | null) => {
        const next = new URLSearchParams(params);
        next.delete("category");
        if (!category) { next.delete("mainCategory"); next.delete("subCategory"); }
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
        if (next.get("minPrice") === min && next.get("maxPrice") === max) {
            next.delete("minPrice");
            next.delete("maxPrice");
        } else {
            next.set("minPrice", min);
            next.set("maxPrice", max);
        }
        setParams(next);
    };

    const handleWishlistToggle = async (product: Product) => {
        if (!isLoggedIn) {
            alert("Please login to manage your wishlist items.");
            return;
        }
        try {
            const currentWishlist = await apiRequest<{ productId: string }[]>("/wishlist");
            const alreadySaved = currentWishlist.some((item) => item.productId === product.SKU);

            if (alreadySaved) {
                await apiRequest(`/wishlist/${product.SKU}`, { method: "DELETE" });
                alert("Removed from wishlist.");
            } else {
                const priceObj = product.prices.find((p) => p.karat === "14kt") || product.prices[0];
                await apiRequest("/wishlist", {
                    method: "POST",
                    body: JSON.stringify({ productId: product.SKU, karat: priceObj?.karat || "14kt" }),
                });
                alert("Product saved to wishlist.");
            }
        } catch (err) {
            console.error(err);
            alert("Could not update wishlist.");
        }
    };

    const filteredProducts = products.filter((product) => (!selectedMainCategory || categoryId(product.mainCategory) === selectedMainCategory) && (!selectedSubCategory || categoryId(product.subCategory) === selectedSubCategory));
    const clearFilters = () => { setParams(new URLSearchParams()); };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 antialiased">

            <Navbar
                onSearchChange={(v) => changeParam("search", v || null)}
                activeCategory={params.get("category") || "All"}
                onCategoryChange={(cat) => changeParam("category", cat === "All" ? null : cat)}
            />

            <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-serif font-semibold tracking-tight text-gray-900">{metal === "gold" ? "Gold Jewellery" : "Silver Jewellery"}</h1>
                        <p className="mt-2 text-sm text-gray-500">
                            {metal === "gold" ? "Explore our dedicated gold collection." : "Explore our dedicated silver collection."}
                        </p>
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

                <div className="pt-8 lg:grid lg:grid-cols-4 lg:gap-x-8">
                    {/* Desktop Sidebar Filters */}
                    <aside className="hidden lg:block space-y-6">
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
                                {categories.map((cat) => (
                                    <button
                                        key={cat._id}
                                        onClick={() => selectCategory(cat)}
                                        className={`block text-sm text-left w-full transition ${selectedSubCategory === cat._id || selectedMainCategory === cat._id ? "text-amber-700 font-semibold" : "text-gray-600 hover:text-gray-900"}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </FilterSection>

                        <FilterSection title="Price Range">
                            <div className="space-y-2 pt-2">
                                {PRICE_BUCKETS.map((bucket) => {
                                    const isActive = params.get("minPrice") === bucket.min && params.get("maxPrice") === bucket.max;
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

                        <FilterSection title="Metal Purity">
                            <div className="space-y-2 pt-2">
                                {KARAT_OPTIONS.map((k) => (
                                    <label key={k.value} className="flex items-center space-x-3 cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                                        <input
                                            type="radio"
                                            name="purity-desktop"
                                            checked={selectedKaratFilter === k.value}
                                            onChange={() => setSelectedKaratFilter(k.value as any)}
                                            className="h-4 w-4 border-gray-300 text-amber-600 focus:ring-amber-500"
                                        />
                                        <span className={selectedKaratFilter === k.value ? "text-amber-700 font-medium" : ""}>{k.label}</span>
                                    </label>
                                ))}
                            </div>
                        </FilterSection>
                    </aside>

                    {/* Product Grid Area */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
                            <p className="text-sm text-gray-500 font-medium">
                                Showing <span className="text-gray-900 font-semibold">{products.length}</span> individual items
                            </p>

                            <div className="hidden lg:flex items-center space-x-2">
                                <span className="text-sm text-gray-500">Sort by:</span>
                                <select
                                    value={params.get("sort") || ""}
                                    onChange={(e) => changeParam("sort", e.target.value || null)}
                                    className="rounded-md border-gray-300 text-sm focus:border-amber-500 focus:ring-amber-500 p-1 border"
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex lg:hidden space-x-2 w-full justify-between sm:w-auto">
                                <button onClick={() => setIsFilterMobileOpen(true)} className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50">
                                    Filters
                                </button>
                                <button onClick={() => setIsSortMobileOpen(true)} className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50">
                                    Sort Options
                                </button>
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
                            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 xl:gap-x-8">
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        defaultKarat={selectedKaratFilter}
                                        onWishlistToggle={handleWishlistToggle}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main >



            {/* Mobile Overlays */}
            {
                isFilterMobileOpen && (
                    <div className="fixed inset-0 z-50 flex lg:hidden bg-black bg-opacity-40 transition-opacity">
                        <div className="ml-auto relative max-w-xs w-full h-full bg-white shadow-xl py-4 pb-12 flex flex-col overflow-y-auto px-4">
                            <div className="flex items-center justify-between pb-4 border-b">
                                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                                <button onClick={() => setIsFilterMobileOpen(false)} className="text-gray-500 text-xl font-bold">&times;</button>
                            </div>
                            <div className="mt-4 space-y-6 flex-grow">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Categories</h3>
                                    {categories.map((c) => (
                                        <button key={c._id} onClick={() => { selectCategory(c); setIsFilterMobileOpen(false); }} className={`block py-1 text-sm text-left w-full ${selectedSubCategory === c._id || selectedMainCategory === c._id ? "text-amber-700 font-bold" : "text-gray-600"}`}>
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                                <div className="border-t pt-4">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Price Ranges</h3>
                                    {PRICE_BUCKETS.map((b) => (
                                        <button key={b.label} onClick={() => { handlePriceBucketChange(b.min, b.max); setIsFilterMobileOpen(false); }} className={`block py-1 text-sm text-left w-full ${params.get("minPrice") === b.min ? "text-amber-700 font-bold" : "text-gray-600"}`}>
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
                    <div className="fixed inset-0 z-50 flex items-end lg:hidden bg-black bg-opacity-40" onClick={() => setIsSortMobileOpen(false)}>
                        <div className="relative w-full bg-white shadow-xl rounded-t-xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-medium text-gray-900">Sort Matrix Options</h3>
                                <button onClick={() => setIsSortMobileOpen(false)} className="text-gray-500 text-xl font-bold">&times;</button>
                            </div>
                            <div className="space-y-3">
                                {SORT_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { changeParam("sort", opt.value || null); setIsSortMobileOpen(false); }}
                                        className={`block w-full text-left py-2 text-sm ${params.get("sort") === opt.value || (!params.get("sort") && !opt.value) ? "text-amber-700 font-semibold" : "text-gray-700"}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }

            <Footer onCategoryChange={() => { }} />
        </div >
    );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="border-b border-gray-200 py-6">
            <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between text-sm text-gray-400 hover:text-gray-500">
                <span className="font-medium text-gray-900">{title}</span>
                <span className="ml-6 flex items-center transform transition-transform duration-200 text-gray-600">
                    {isOpen ? "−" : "+"}
                </span>
            </button>
            {isOpen && <div className="pt-4 transition-all duration-300">{children}</div>}
        </div>
    );
}

function ProductCard({ product, defaultKarat, onWishlistToggle }: { product: Product; defaultKarat: "9kt" | "14kt" | "18kt"; onWishlistToggle: (product: Product) => void }) {

    const categoryName = (
        category?: Category | string | null
    ) => {
        if (!category) return "Jewellery";
        if (typeof category === "string") return "Jewellery";
        return category.name ?? "Jewellery";
    };

    const [activeKarat, setActiveKarat] = useState<"9kt" | "14kt" | "18kt">(defaultKarat);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setActiveKarat(defaultKarat);
    }, [defaultKarat]);

    const images = product.images.map((image) => image.url);

    const fallbackImage = "https://via.placeholder.com/600?text=No+Jewelry+Image";
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

    const targetPriceObj = product.prices.find((p) => p.karat === activeKarat) || product.prices[0];
    const displaysPrice = targetPriceObj ? Math.round(targetPriceObj.finalPrice) : 0;

    return (
        <div
            className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md max-w-sm w-full mx-auto"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* FIX #3: Proportional portrait aspect-ratio layout for card structure */}
            <div className="relative aspect-[4/5] w-full bg-gray-50 overflow-hidden">
                <Link to={`/product/${product.slug}`} className="block w-full h-full">
                    <img
                        src={images[currentImgIndex] || fallbackImage}
                        alt={product.title}
                        className="h-full w-full object-cover object-center transition duration-500 scale-100 group-hover:scale-102"
                    />
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
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-gray-500 hover:text-rose-600 hover:bg-white shadow-sm transition"
                    aria-label="Save to Wishlist"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>

                {displaysCarousel && (
                    <div className="absolute inset-x-0 bottom-3 flex justify-center space-x-1.5 pointer-events-none">
                        {images.map((_, idx) => (
                            <span
                                key={idx}
                                className={`h-1 rounded-full transition-all ${idx === currentImgIndex ? "bg-amber-600 w-3" : "bg-gray-300 w-1 opacity-60"}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-4 space-y-2">
                <span className="text-[10px] tracking-wider text-gray-400 uppercase font-semibold">{categoryName(product.subCategory)}</span>

                <Link to={`/product/${product.slug}`} className="block">
                    <h3 className="text-sm font-medium text-gray-900 hover:text-amber-700 line-clamp-2 min-h-[40px] transition">
                        {product.title}
                    </h3>
                </Link>

                <div className="flex items-baseline space-x-1.5 pt-1">
                    <span className="text-base font-bold text-gray-900">
                        ₹{displaysPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-gray-400 font-normal">
                        ({activeKarat})
                    </span>
                </div>

                <div className="pt-3 mt-auto border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-gray-500">Purity:</span>
                    <div className="flex space-x-1">
                        {(["9kt", "14kt", "18kt"] as const).map((kt) => {
                            const hasPurityVariant = product.prices.some((p) => p.karat === kt);
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
                </div>
            </div>
        </div>
    );
}