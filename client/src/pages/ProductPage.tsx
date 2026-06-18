// import React, { useState, useMemo, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "motion/react";
// import {
//     Heart,
//     SlidersHorizontal,
//     ArrowUpDown,
//     X,
//     Check,
//     ChevronDown,
//     Sparkles,
//     ShieldCheck
// } from "lucide-react";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import { useSearchParams, Link } from "react-router-dom";
// import { AuthModal } from "./AuthModal";
// import bannerImage from '../assets/banner/productPpage-banner.webp';

// interface StoneConfig {
//     type: "Diamond" | "Emerald" | "Ruby" | "Sapphire" | "Pearl" | "None";
//     carat: number;
//     estimatedValue: number;
// }

// interface JewelryProduct {
//     name: string;
//     slug: string;
//     description: string;
//     category: "All" | "Rings" | "Necklaces" | "Earrings" | "Bangles" | "Pendants";
//     subCategory: string;
//     certifications: ("BIS Hallmarked" | "GIA Certified" | "IGI Certified")[];
//     goldWeight: number; // in grams
//     makingChargePerGram: number; // in INR
//     availableKarats: ("14K" | "18K" | "22K" | "24K")[];
//     stones: StoneConfig[];
//     images: string[]; // [Primary, Secondary/Hover]
//     videos?: string[];
//     metaTitle: string;
//     metaDescription: string;
//     isActive: boolean;
//     isFeatured: boolean;
//     inStock: boolean;
//     averageRating: number;
//     totalReviews: number;
// }

// /* ==========================================================================
//    REALISTIC MOCK GOLD PRICE REGIME
//    ========================================================================== */
// const LIVE_GOLD_PER_GRAM = {
//     "14K": 6230,
//     "18K": 9611,
//     "22K": 11746,
//     "24K": 12815,
// };

// const MOCK_PRODUCTS: JewelryProduct[] = [
//     {
//         name: "The Mayur Royal Heritage Ring",
//         slug: "mayur-royal-heritage-ring",
//         description: "An exquisite statement cocktail ring depicting archival heritage peacock motifs, encrusted with flawless brilliant-cut diamonds.",
//         category: "Rings",
//         subCategory: "Cocktail Rings",
//         certifications: ["BIS Hallmarked", "IGI Certified"],
//         goldWeight: 8.5,
//         makingChargePerGram: 950,
//         availableKarats: ["18K", "22K"],
//         stones: [{ type: "Diamond", carat: 1.2, estimatedValue: 85000 }],
//         images: [
//             "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
//             "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80"
//         ],
//         metaTitle: "Mayur Royal Heritage Ring | TBA",
//         metaDescription: "Purchase handcrafted luxury diamond wedding rings from The Brilliance Atelier.",
//         isActive: true,
//         isFeatured: true,
//         inStock: true,
//         averageRating: 4.9,
//         totalReviews: 24
//     },
//     {
//         name: "Aura Infinite Diamond Band",
//         slug: "aura-infinite-diamond-band",
//         description: "A seamless eternity band structured with precision channel-set VS-GH conflict-free natural diamonds.",
//         category: "Rings",
//         subCategory: "Eternity Bands",
//         certifications: ["BIS Hallmarked", "GIA Certified"],
//         goldWeight: 4.2,
//         makingChargePerGram: 1200,
//         availableKarats: ["14K", "18K"],
//         stones: [{ type: "Diamond", carat: 2.1, estimatedValue: 140000 }],
//         images: [
//             "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=600&q=80",
//             "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=600&q=80"
//         ],
//         metaTitle: "Aura Infinite Diamond Band | TBA",
//         metaDescription: "Minimalist stackable eternity bands handcrafted in pure gold.",
//         isActive: true,
//         isFeatured: false,
//         inStock: true,
//         averageRating: 4.8,
//         totalReviews: 19
//     },
//     {
//         name: "Nizami Empress Choker Necklace",
//         slug: "nizami-empress-choker",
//         description: "A grand imperial choker marrying deep Zambian untreated emerald drop beads with traditional gold kundan craft work.",
//         category: "Necklaces",
//         subCategory: "Chokers",
//         certifications: ["BIS Hallmarked"],
//         goldWeight: 42.0,
//         makingChargePerGram: 1400,
//         availableKarats: ["22K"],
//         stones: [
//             { type: "Emerald", carat: 14.5, estimatedValue: 195000 },
//             { type: "Pearl", carat: 8.0, estimatedValue: 35000 }
//         ],
//         images: [
//             "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
//             "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=600&q=80"
//         ],
//         metaTitle: "Nizami Empress Emerald Choker | TBA",
//         metaDescription: "Experience bespoke royal Indian bridal chokers designed for modern luxury.",
//         isActive: true,
//         isFeatured: true,
//         inStock: true,
//         averageRating: 5.0,
//         totalReviews: 8
//     },
//     {
//         name: "Dewdrop Luminescence Pendant",
//         slug: "dewdrop-luminescence-pendant",
//         description: "A signature solitaire pear-cut diamond suspended gracefully from a delicate, micro-polished yellow gold chain loop.",
//         category: "Pendants",
//         subCategory: "Solitaires",
//         certifications: ["BIS Hallmarked", "GIA Certified"],
//         goldWeight: 3.1,
//         makingChargePerGram: 850,
//         availableKarats: ["18K"],
//         stones: [{ type: "Diamond", carat: 0.9, estimatedValue: 72000 }],
//         images: [
//             "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
//             "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80"
//         ],
//         metaTitle: "Dewdrop Luminescence Pendant | TBA",
//         metaDescription: "Classic elegant diamond solitaire pendants perfect for daily statement wear.",
//         isActive: true,
//         isFeatured: false,
//         inStock: true,
//         averageRating: 4.7,
//         totalReviews: 31
//     }
// ];

// function calculateStartingPrice(product: JewelryProduct): number {
//     const sortedKarats = [...product.availableKarats].sort((a, b) => parseInt(a) - parseInt(b));
//     const lowestKarat = sortedKarats[0] || "18K";
//     const baseGoldPriceRate = LIVE_GOLD_PER_GRAM[lowestKarat];
//     const structuralGoldCost = product.goldWeight * baseGoldPriceRate;
//     const artisanCraftCost = product.goldWeight * product.makingChargePerGram;
//     const preciousStonesCost = product.stones.reduce((acc, stone) => acc + stone.estimatedValue, 0);

//     return Math.round(structuralGoldCost + artisanCraftCost + preciousStonesCost);
// }

// export default function ProductsPage() {
//     const [searchParams, setSearchParams] = useSearchParams();
//     const productsSectionRef = useRef<HTMLDivElement>(null);

//     // --- Core Sync State Framework ---
//     const initialCategory = (searchParams.get("category") as any) || "All";
//     const initialSearch = searchParams.get("q") || "";

//     const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
//     const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
//     const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

//     const [selectedKarat, setSelectedKarat] = useState<string>("All");
//     const [selectedCert, setSelectedCert] = useState<string>("All");
//     const [priceRange, setPriceRange] = useState<number>(1000000);
//     const [toggleFeaturedOnly, setToggleFeaturedOnly] = useState<boolean>(false);
//     const [toggleInStockOnly, setToggleInStockOnly] = useState<boolean>(false);
//     const [currentSortOption, setCurrentSortOption] = useState<string>("featured");

//     // --- Mobile Drawer States ---
//     const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
//     const [isMobileSortOpen, setIsMobileSortOpen] = useState<boolean>(false);

//     // --- Sync URL Search Params and Scroll effects ---
//     useEffect(() => {
//         const urlCategory = searchParams.get("category") || "All";
//         const urlSearch = searchParams.get("q") || "";

//         setSelectedCategory(urlCategory);
//         setSearchQuery(urlSearch);

//         if (searchParams.get("category") || searchParams.get("q")) {
//             productsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
//         }
//     }, [searchParams]);

//     const handleFilterCategoryChange = (category: string) => {
//         setSelectedCategory(category);
//         const currentParams = Object.fromEntries(searchParams.entries());
//         setSearchParams({ ...currentParams, category: category });
//     };

//     const handleSearchChange = (query: string) => {
//         setSearchQuery(query);
//         const currentParams = Object.fromEntries(searchParams.entries());
//         if (query) {
//             setSearchParams({ ...currentParams, q: query });
//         } else {
//             const { q, ...rest } = currentParams;
//             setSearchParams(rest);
//         }
//     };

//     // --- Lock Screen Scroll for Open Drawers ---
//     useEffect(() => {
//         const shouldLock = isMobileFilterOpen || isMobileSortOpen;
//         document.body.style.overflow = shouldLock ? "hidden" : "unset";
//         return () => {
//             document.body.style.overflow = "unset";
//         };
//     }, [isMobileFilterOpen, isMobileSortOpen]);

//     // --- Filtering & Sorting Compute Logic Matrix ---
//     const filteredAndSortedProducts = useMemo(() => {
//         let dataset = [...MOCK_PRODUCTS];

//         if (searchQuery.trim() !== "") {
//             const cleanQuery = searchQuery.toLowerCase().trim();
//             dataset = dataset.filter(
//                 (p) => p.name.toLowerCase().includes(cleanQuery) || p.description.toLowerCase().includes(cleanQuery)
//             );
//         }
//         if (selectedCategory !== "All") {
//             dataset = dataset.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
//         }
//         if (selectedKarat !== "All") {
//             dataset = dataset.filter((p) => p.availableKarats.includes(selectedKarat as any));
//         }
//         if (selectedCert !== "All") {
//             dataset = dataset.filter((p) => p.certifications.includes(selectedCert as any));
//         }
//         if (toggleFeaturedOnly) {
//             dataset = dataset.filter((p) => p.isFeatured);
//         }
//         if (toggleInStockOnly) {
//             dataset = dataset.filter((p) => p.inStock);
//         }
//         dataset = dataset.filter((p) => calculateStartingPrice(p) <= priceRange);

//         switch (currentSortOption) {
//             case "price-asc":
//                 dataset.sort((a, b) => calculateStartingPrice(a) - calculateStartingPrice(b));
//                 break;
//             case "price-desc":
//                 dataset.sort((a, b) => calculateStartingPrice(b) - calculateStartingPrice(a));
//                 break;
//             case "reviews":
//                 dataset.sort((a, b) => b.totalReviews - a.totalReviews);
//                 break;
//             case "featured":
//             default:
//                 dataset.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
//                 break;
//         }

//         return dataset;
//     }, [searchQuery, selectedCategory, selectedKarat, selectedCert, priceRange, toggleFeaturedOnly, toggleInStockOnly, currentSortOption]);

//     const clearAllFilters = () => {
//         setSelectedCategory("All");
//         setSelectedKarat("All");
//         setSelectedCert("All");
//         setPriceRange(1000000);
//         setToggleFeaturedOnly(false);
//         setToggleInStockOnly(false);
//         setSearchParams({});
//     };

//     return (
//         <>
//             <Navbar
//                 onSearchChange={handleSearchChange}
//                 activeCategory={selectedCategory}
//                 onCategoryChange={handleFilterCategoryChange}
//                 onAuthOpen={() => setIsAuthOpen(true)}
//             />

//             <main className="w-full pb-4 bg-[var(--color-bg)] min-h-screen font-secondary text-[var(--color-text)]">

//                 {/* Banner */}
//                 <section className="relative w-full h-[320px] md:h-[420px] overflow-hidden flex items-center justify-center bg-[var(--color-teal-dark)]">
//                     <div className="absolute inset-0 bg-black/40 z-10" />
//                     <section className="relative w-full h-[320px] md:h-[420px] lg:h-[520px] overflow-hidden bg-[var(--color-teal-dark)]">
//                         ```
//                         <img
//                             src={bannerImage}
//                             alt="Luxury Jewelry Banner"
//                             className="absolute inset-0 w-full h-full object-cover object-center scale-[1.02] "
//                         />
//                         ```
//                     </section>
//                 </section>

//                 {/* PRODUCTS CONTAINER GRID SYSTEM */}
//                 <div ref={productsSectionRef} id="main-products-section" className="container mt-6 flex gap-8 items-start">
//                     <div className="w-full flex gap-8 items-start">

//                         {/* DESKTOP SIDEBAR FILTER */}
//                         <aside className="hidden lg:block w-[280px] xl:w-[310px] shrink-0 bg-[var(--color-bg-secondary)] border border-border-subtle rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-sm)]">
//                             <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-4 mb-5">
//                                 <h2 className="font-primary text-lg text-[var(--color-teal)] font-medium">Refine Matrix</h2>
//                                 <button onClick={clearAllFilters} className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-teal)] border-b border-transparent hover:border-[var(--color-teal)] pb-0.5 cursor-pointer">
//                                     Reset All
//                                 </button>
//                             </div>

//                             {/* Category Filter Group */}
//                             <div className="mb-6">
//                                 <h3 className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] font-bold mb-3">Collections</h3>
//                                 <div className="flex flex-col gap-1.5">
//                                     {["All", "Rings", "Necklaces", "Earrings", "Bangles", "Pendants"].map((cat) => (
//                                         <button
//                                             key={cat}
//                                             onClick={() => handleFilterCategoryChange(cat)}
//                                             className={`flex items-center justify-between text-xs py-1.5 px-2 rounded-[var(--radius-sm)] transition-all cursor-pointer ${selectedCategory === cat ? "bg-[var(--color-teal)] text-white font-medium" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-cream-light)]/40"}`}
//                                         >
//                                             <span>{cat}</span>
//                                             {selectedCategory === cat && <Check size={12} />}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>

//                             {/* Purity Level Configuration */}
//                             <div className="mb-6">
//                                 <h3 className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] font-bold mb-3">Gold Purity</h3>
//                                 <div className="grid grid-cols-2 gap-2">
//                                     {["All", "14K", "18K", "22K", "24K"].map((k) => (
//                                         <button
//                                             key={k}
//                                             onClick={() => setSelectedKarat(k)}
//                                             className={`text-xs text-center py-2 border rounded-[var(--radius-sm)] transition-all cursor-pointer ${selectedKarat === k ? "border-[var(--color-teal)] bg-[var(--color-teal)] text-white" : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)]"}`}
//                                         >
//                                             {k}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>

//                             {/* Elastic Range Budget Selection */}
//                             <div className="mb-6">
//                                 <h3 className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] font-bold mb-2">Max Pricing Threshold</h3>
//                                 <input
//                                     type="range" min="30000" max="1000000" step="10000" value={priceRange}
//                                     onChange={(e) => setPriceRange(Number(e.target.value))}
//                                     className="w-full accent-[var(--color-teal)] cursor-pointer"
//                                 />
//                                 <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] font-mono mt-1.5">
//                                     <span>₹30,000</span>
//                                     <span className="text-[var(--color-teal)] font-semibold">₹{priceRange.toLocaleString("en-IN")}</span>
//                                 </div>
//                             </div>

//                             {/* Sort Ordering Matrix Selector */}
//                             <div className="border-t border-[var(--color-border-subtle)] pt-4">
//                                 <h3 className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] font-bold mb-3">Sequence Order</h3>
//                                 <select
//                                     value={currentSortOption}
//                                     onChange={(e) => setCurrentSortOption(e.target.value)}
//                                     className="w-full bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] py-2 px-3 text-xs outline-none focus:border-[var(--color-teal)] cursor-pointer"
//                                 >
//                                     <option value="featured">Curated Connoisseur Choice</option>
//                                     <option value="price-asc">Price Sequence: Low to High</option>
//                                     <option value="price-desc">Price Sequence: High to Low</option>
//                                     <option value="reviews">Customer Appreciation Rank</option>
//                                 </select>
//                             </div>
//                         </aside>

//                         {/* PRODUCT GALLERY CANVAS */}
//                         <section className="flex-1 w-full">
//                             <div className="w-full flex items-center justify-between mb-6 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)] pb-3">
//                                 <div>Showing <span className="font-semibold text-[var(--color-teal)]">{filteredAndSortedProducts.length}</span> Masterpieces</div>
//                             </div>

//                             {filteredAndSortedProducts.length === 0 ? (
//                                 <div className="w-full py-24 text-center border border-dashed border-[var(--color-border)] rounded-[var(--radius-xl)]">
//                                     <Sparkles className="mx-auto text-[var(--color-cream)] mb-3" size={32} />
//                                     <h3 className="font-primary text-xl text-[var(--color-teal)] mb-1">No Matching Manifestations</h3>
//                                     <button onClick={clearAllFilters} className="mt-4 bg-[var(--color-teal)] text-white text-xs uppercase tracking-widest py-2 px-6 rounded-full cursor-pointer">
//                                         Restore Full Vault
//                                     </button>
//                                 </div>
//                             ) : (
//                                 <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-y-10 gap-x-4 sm:gap-6">
//                                     <AnimatePresence mode="popLayout">
//                                         {filteredAndSortedProducts.map((product) => {
//                                             const dynamicStartingPrice = calculateStartingPrice(product);

//                                             return (
//                                                 <motion.article
//                                                     layout
//                                                     key={product.slug}
//                                                     initial={{ opacity: 0, y: 12 }}
//                                                     animate={{ opacity: 1, y: 0 }}
//                                                     exit={{ opacity: 0, scale: 0.95 }}
//                                                     className="group relative flex flex-col bg-[var(--color-white)] rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border-subtle)] hover:shadow-md transition-all duration-300"
//                                                 >
//                                                     {/* IMAGE GRIDS AND HOVER ACTIONS LINK TO PRODUCT PROFILE DETAILS */}
//                                                     <div className="relative w-full aspect-[4/5] overflow-hidden bg-[var(--color-bg-secondary)] select-none">

//                                                         {/* Absolute Nav Link matching layout structure covering entire image footprint */}
//                                                         <Link
//                                                             to={`/product/${product.slug}`}
//                                                             className="absolute inset-0 z-20 cursor-pointer"
//                                                             aria-label={`View details of ${product.name}`}
//                                                         />

//                                                         <div className="absolute top-2 left-2 z-30 flex flex-col gap-1 pointer-events-none">
//                                                             {product.isFeatured && (
//                                                                 <span className="bg-[var(--color-teal-dark)] text-[var(--color-cream)] text-[8px] md:text-[9px] uppercase tracking-[0.15em] font-medium py-1 px-2 rounded-sm shadow-sm">
//                                                                     Curated Masterpiece
//                                                                 </span>
//                                                             )}
//                                                         </div>

//                                                         {/* WISHLIST BUTTON INTERCEPTS CLICK ACTIONS AND TRIGGERS GLOBAL AUTH MODAL */}
//                                                         <button
//                                                             onClick={(e) => {
//                                                                 e.preventDefault();
//                                                                 e.stopPropagation(); // Halts React-Router Link bubble redirection
//                                                                 setIsAuthOpen(true);
//                                                             }}
//                                                             className="absolute top-2 right-2 z-30 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[var(--color-text-muted)] hover:text-red-500 shadow-sm transition-all backdrop-blur-xs cursor-pointer"
//                                                             title="Secure in Wishlist Vault"
//                                                         >
//                                                             <Heart size={15} className="transition-transform duration-200 active:scale-95" />
//                                                         </button>

//                                                         {/* Renders image sequence inside relative bounds */}
//                                                         <div className="w-full h-full relative pointer-events-none z-10">
//                                                             <img
//                                                                 src={product.images[0]}
//                                                                 alt={product.name}
//                                                                 className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
//                                                                 loading="lazy"
//                                                             />
//                                                             {product.images[1] && (
//                                                                 <img
//                                                                     src={product.images[1]}
//                                                                     alt={`${product.name} Alternate`}
//                                                                     className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 hidden lg:block"
//                                                                     loading="lazy"
//                                                                 />
//                                                             )}
//                                                         </div>
//                                                     </div>

//                                                     {/* CARD EXPLANATORY INFORMATION FRAMEWORK */}
//                                                     <div className="p-3 md:p-4 flex-1 flex flex-col justify-between bg-white relative z-20">
//                                                         <div>
//                                                             <span className="block text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] font-medium mb-1">
//                                                                 {product.category} • {product.subCategory}
//                                                             </span>
//                                                             <Link
//                                                                 to={`/product/${product.slug}`}
//                                                                 className="font-primary text-sm md:text-base text-[var(--color-text)] font-normal hover:text-[var(--color-teal-light)] transition-colors line-clamp-1 block mb-2 cursor-pointer"
//                                                             >
//                                                                 {product.name}
//                                                             </Link>
//                                                         </div>

//                                                         <div className="mt-2 pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
//                                                             <div>
//                                                                 <span className="block text-[8px] uppercase tracking-widest text-[var(--color-text-muted)]">Base Value</span>
//                                                                 <span className="font-secondary text-xs md:text-sm font-medium text-[var(--color-teal)] font-mono">
//                                                                     ₹{dynamicStartingPrice.toLocaleString("en-IN")}
//                                                                 </span>
//                                                             </div>
//                                                             <span className="text-[9px] text-[var(--color-text-muted)] italic">
//                                                                 {product.availableKarats[0]} Pure
//                                                             </span>
//                                                         </div>
//                                                     </div>
//                                                 </motion.article>
//                                             );
//                                         })}
//                                     </AnimatePresence>
//                                 </div>
//                             )}
//                         </section>
//                     </div>
//                 </div>

//                 {/* MOBILE FLOATING CONTROL BAR */}
//                 <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[250] bg-[var(--color-teal-dark)]/90 text-white backdrop-blur-md rounded-full shadow-lg px-6 py-3 flex items-center gap-6 border border-white/10 w-[85%] max-w-xs justify-around">
//                     <button onClick={() => setIsMobileFilterOpen(true)} className="flex items-center gap-2 text-xs uppercase tracking-widest cursor-pointer">
//                         <SlidersHorizontal size={14} /> <span>Filter</span>
//                     </button>
//                     <div className="w-[1px] h-4 bg-white/20" />
//                     <button onClick={() => setIsMobileSortOpen(true)} className="flex items-center gap-2 text-xs uppercase tracking-widest cursor-pointer">
//                         <ArrowUpDown size={14} /> <span>Sort</span>
//                     </button>
//                 </div>

//                 {/* MOBILE DEDICATED ANCHORED FILTER BOTTOM SHEET MODAL */}
//                 <AnimatePresence>
//                     {isMobileFilterOpen && (
//                         <>
//                             <motion.div
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 exit={{ opacity: 0 }}
//                                 onClick={() => setIsMobileFilterOpen(false)}
//                                 className="fixed inset-0 bg-black/60 z-[350]"
//                             />

//                             <motion.div
//                                 initial={{ y: "100%" }}
//                                 animate={{ y: 0 }}
//                                 exit={{ y: "100%" }}
//                                 transition={{ type: "spring", damping: 25, stiffness: 200 }}
//                                 className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-[var(--color-bg)] rounded-t-[var(--radius-xl)] z-[360] overflow-y-auto p-6 shadow-[0_-8px_32px_rgba(0,0,0,0.15)] pb-24 text-[var(--color-text)]"
//                             >
//                                 <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-4 mb-4">
//                                     <h3 className="font-primary text-lg text-[var(--color-teal)] font-medium">Refinement Filter</h3>
//                                     <button
//                                         onClick={() => setIsMobileFilterOpen(false)}
//                                         className="p-1 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text)] cursor-pointer"
//                                     >
//                                         <X size={18} />
//                                     </button>
//                                 </div>

//                                 {/* Sync Category to Global Search Hook */}
//                                 <div className="mb-5">
//                                     <h4 className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] font-bold mb-2">
//                                         Collections Category
//                                     </h4>
//                                     <div className="flex flex-wrap gap-2">
//                                         {["All", "Rings", "Necklaces", "Earrings", "Bangles", "Pendants"].map((cat) => (
//                                             <button
//                                                 key={cat}
//                                                 onClick={() => handleFilterCategoryChange(cat)}
//                                                 className={`text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer ${selectedCategory === cat
//                                                     ? "bg-[var(--color-teal)] text-white"
//                                                     : "bg-white text-[var(--color-text-secondary)] border border-[var(--color-border)]"
//                                                     }`}
//                                             >
//                                                 {cat}
//                                             </button>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 <div className="mb-5">
//                                     <h4 className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] font-bold mb-2">
//                                         Gold Karat Purity
//                                     </h4>
//                                     <div className="flex flex-wrap gap-2">
//                                         {["All", "14K", "18K", "22K", "24K"].map((k) => (
//                                             <button
//                                                 key={k}
//                                                 onClick={() => setSelectedKarat(k)}
//                                                 className={`text-xs px-4 py-1.5 rounded-sm transition-all cursor-pointer ${selectedKarat === k
//                                                     ? "bg-[var(--color-teal)] text-white border border-[var(--color-teal)]"
//                                                     : "bg-white text-[var(--color-text-secondary)] border border-[var(--color-border)]"
//                                                     }`}
//                                             >
//                                                 {k}
//                                             </button>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 <div className="mb-5">
//                                     <h4 className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] font-bold mb-1">
//                                         Financial Boundary Threshold
//                                     </h4>
//                                     <input
//                                         type="range"
//                                         min="30000"
//                                         max="1000000"
//                                         step="10000"
//                                         value={priceRange}
//                                         onChange={(e) => setPriceRange(Number(e.target.value))}
//                                         className="w-full accent-[var(--color-teal)] cursor-pointer mt-2"
//                                     />
//                                     <div className="flex justify-between text-[11px] font-mono mt-1 text-[var(--color-text-muted)]">
//                                         <span>₹30K</span>
//                                         <span className="text-[var(--color-teal)] font-bold">₹{priceRange.toLocaleString("en-IN")} Max</span>
//                                     </div>
//                                 </div>

//                                 <div className="mb-5">
//                                     <h4 className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] font-bold mb-2">
//                                         Assurance Agency Seal
//                                     </h4>
//                                     <div className="grid grid-cols-2 gap-2">
//                                         {["All", "BIS Hallmarked", "GIA Certified", "IGI Certified"].map((cert) => (
//                                             <button
//                                                 key={cert}
//                                                 onClick={() => setSelectedCert(cert)}
//                                                 className={`text-xs py-2 px-3 text-left border rounded-xs transition-all cursor-pointer flex items-center justify-between ${selectedCert === cert
//                                                     ? "border-[var(--color-teal)] bg-[var(--color-teal)]/5 text-[var(--color-teal)] font-medium"
//                                                     : "border-[var(--color-border)] text-[var(--color-text-secondary)] bg-white"
//                                                     }`}
//                                             >
//                                                 <span>{cert}</span>
//                                                 {selectedCert === cert && <Check size={12} />}
//                                             </button>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 <div className="border-t border-[var(--color-border-subtle)] pt-4 flex flex-col gap-3">
//                                     <label className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
//                                         <span>Show Highlighted Curator Choices Only</span>
//                                         <input
//                                             type="checkbox"
//                                             checked={toggleFeaturedOnly}
//                                             onChange={(e) => setToggleFeaturedOnly(e.target.checked)}
//                                             className="accent-[var(--color-teal)] w-4 h-4"
//                                         />
//                                     </label>
//                                     <label className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
//                                         <span>Show Immediate Ready Dispatch Only</span>
//                                         <input
//                                             type="checkbox"
//                                             checked={toggleInStockOnly}
//                                             onChange={(e) => setToggleInStockOnly(e.target.checked)}
//                                             className="accent-[var(--color-teal)] w-4 h-4"
//                                         />
//                                     </label>
//                                 </div>

//                                 <div className="mt-6 pt-2">
//                                     <button
//                                         onClick={() => setIsMobileFilterOpen(false)}
//                                         className="w-full bg-[var(--color-teal)] text-white text-xs font-secondary uppercase tracking-widest py-3 rounded-[var(--radius-md)] cursor-pointer"
//                                     >
//                                         Apply Selections ({filteredAndSortedProducts.length} Items)
//                                     </button>
//                                     <button
//                                         onClick={() => {
//                                             clearAllFilters();
//                                             setIsMobileFilterOpen(false);
//                                         }}
//                                         className="w-full bg-transparent text-[var(--color-text-muted)] text-xs font-secondary uppercase tracking-widest py-2.5 mt-2 cursor-pointer"
//                                     >
//                                         Clear All Filters
//                                     </button>
//                                 </div>
//                             </motion.div>
//                         </>
//                     )}
//                 </AnimatePresence>

//                 {/* MOBILE DEDICATED ANCHORED SORT ORDER BOTTOM SHEET */}
//                 <AnimatePresence>
//                     {isMobileSortOpen && (
//                         <>
//                             <motion.div
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 exit={{ opacity: 0 }}
//                                 onClick={() => setIsMobileSortOpen(false)}
//                                 className="fixed inset-0 bg-black/60 z-[350]"
//                             />

//                             <motion.div
//                                 initial={{ y: "100%" }}
//                                 animate={{ y: 0 }}
//                                 exit={{ y: "100%" }}
//                                 transition={{ type: "spring", damping: 25, stiffness: 220 }}
//                                 className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg)] rounded-t-[var(--radius-xl)] z-[360] p-6 shadow-[0_-8px_32px_rgba(0,0,0,0.15)] pb-12 text-[var(--color-text)]"
//                             >
//                                 <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-4 mb-4">
//                                     <h3 className="font-primary text-lg text-[var(--color-teal)] font-medium">Sequence Matrix</h3>
//                                     <button
//                                         onClick={() => setIsMobileSortOpen(false)}
//                                         className="p-1 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text)] cursor-pointer"
//                                     >
//                                         <X size={18} />
//                                     </button>
//                                 </div>

//                                 <div className="flex flex-col gap-1">
//                                     {[
//                                         { value: "featured", label: "Curated Connoisseur Choices" },
//                                         { value: "price-asc", label: "Financial Scaling: Low to High" },
//                                         { value: "price-desc", label: "Financial Scaling: High to Low" },
//                                         { value: "reviews", label: "Appreciation Volume Reviews Rank" },
//                                     ].map((opt) => (
//                                         <button
//                                             key={opt.value}
//                                             onClick={() => {
//                                                 setCurrentSortOption(opt.value);
//                                                 setIsMobileSortOpen(false);
//                                             }}
//                                             className={`w-full text-left py-3 px-3 rounded-xs text-xs font-secondary transition-all cursor-pointer flex items-center justify-between ${currentSortOption === opt.value
//                                                 ? "bg-[var(--color-teal)] text-white font-semibold"
//                                                 : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
//                                                 }`}
//                                         >
//                                             <span>{opt.label}</span>
//                                             {currentSortOption === opt.value && <Check size={14} />}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </motion.div>
//                         </>
//                     )}
//                 </AnimatePresence>

//                 {/* AUTHENTICATION MODAL HUB OVERLAY LINK */}
//                 <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

//             </main>

//             <Footer onCategoryChange={handleFilterCategoryChange} />
//         </>
//     );
// }


import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Heart,
    SlidersHorizontal,
    ArrowUpDown,
    X,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Check,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useSearchParams, Link } from "react-router-dom";
import { AuthModal } from "./AuthModal";
import bannerImage from "../assets/banner/productPpage-banner.webp";

/* ==========================================================================
   INTERFACES
   ========================================================================== */
interface StoneConfig {
    type: "Diamond" | "Emerald" | "Ruby" | "Sapphire" | "Pearl" | "None";
    carat: number;
    estimatedValue: number;
}

interface JewelryProduct {
    name: string;
    slug: string;
    description: string;
    category: "All" | "Rings" | "Necklaces" | "Earrings" | "Bangles" | "Pendants";
    subCategory: string;
    certifications: ("BIS Hallmarked" | "GIA Certified" | "IGI Certified")[];
    goldWeight: number;
    makingChargePerGram: number;
    availableKarats: ("9K" | "14K" | "24K")[];
    stones: StoneConfig[];
    images: string[];
    metaTitle: string;
    metaDescription: string;
    isActive: boolean;
    isFeatured: boolean;
    inStock: boolean;
    averageRating: number;
    totalReviews: number;
    // Filter fields
    occasion?: string[];
    stoneTypes?: string[];
    priceRange?: "under-20k" | "20k-50k" | "50k-1l" | "above-1l";
    shopFor?: ("Women" | "Men")[];
}

/* ==========================================================================
   GOLD RATES — 9K / 14K / 24K only
   ========================================================================== */
const GOLD_RATE: Record<string, number> = {
    "9K": 4820,
    "14K": 6230,
    "24K": 12815,
};

/* ==========================================================================
   MOCK PRODUCTS
   ========================================================================== */
const MOCK_PRODUCTS: JewelryProduct[] = [
    {
        name: "The Mayur Royal Heritage Ring",
        slug: "mayur-royal-heritage-ring",
        description: "An exquisite statement cocktail ring depicting archival heritage peacock motifs, encrusted with flawless brilliant-cut diamonds.",
        category: "Rings",
        subCategory: "Cocktail Rings",
        certifications: ["BIS Hallmarked", "IGI Certified"],
        goldWeight: 8.5,
        makingChargePerGram: 950,
        availableKarats: ["14K", "24K"],
        stones: [{ type: "Diamond", carat: 1.2, estimatedValue: 85000 }],
        images: [
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=600&q=80",
        ],
        metaTitle: "Mayur Royal Heritage Ring | TBA",
        metaDescription: "Purchase handcrafted luxury diamond wedding rings from The Brilliance Atelier.",
        isActive: true, isFeatured: true, inStock: true, averageRating: 4.9, totalReviews: 24,
        occasion: ["Wedding", "Party wear"],
        stoneTypes: ["Diamond"],
        shopFor: ["Women"],
    },
    {
        name: "Aura Infinite Diamond Band",
        slug: "aura-infinite-diamond-band",
        description: "A seamless eternity band structured with precision channel-set VS-GH conflict-free natural diamonds.",
        category: "Rings",
        subCategory: "Eternity Bands",
        certifications: ["BIS Hallmarked", "GIA Certified"],
        goldWeight: 4.2,
        makingChargePerGram: 1200,
        availableKarats: ["9K", "14K"],
        stones: [{ type: "Diamond", carat: 2.1, estimatedValue: 140000 }],
        images: [
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=600&q=80",
        ],
        metaTitle: "Aura Infinite Diamond Band | TBA",
        metaDescription: "Minimalist stackable eternity bands handcrafted in pure gold.",
        isActive: true, isFeatured: false, inStock: true, averageRating: 4.8, totalReviews: 19,
        occasion: ["Everyday wear"],
        stoneTypes: ["Diamond"],
        shopFor: ["Women"],
    },
    {
        name: "Nizami Empress Choker Necklace",
        slug: "nizami-empress-choker",
        description: "A grand imperial choker marrying deep Zambian untreated emerald drop beads with traditional gold kundan craft work.",
        category: "Necklaces",
        subCategory: "Chokers",
        certifications: ["BIS Hallmarked"],
        goldWeight: 42.0,
        makingChargePerGram: 1400,
        availableKarats: ["24K"],
        stones: [
            { type: "Emerald", carat: 14.5, estimatedValue: 195000 },
            { type: "Pearl", carat: 8.0, estimatedValue: 35000 },
        ],
        images: [
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=600&q=80",
        ],
        metaTitle: "Nizami Empress Emerald Choker | TBA",
        metaDescription: "Experience bespoke royal Indian bridal chokers designed for modern luxury.",
        isActive: true, isFeatured: true, inStock: true, averageRating: 5.0, totalReviews: 8,
        occasion: ["Wedding", "Festive"],
        stoneTypes: ["Emerald", "Pearl"],
        shopFor: ["Women"],
    },
    {
        name: "Dewdrop Luminescence Pendant",
        slug: "dewdrop-luminescence-pendant",
        description: "A signature solitaire pear-cut diamond suspended gracefully from a delicate, micro-polished yellow gold chain loop.",
        category: "Pendants",
        subCategory: "Solitaires",
        certifications: ["BIS Hallmarked", "GIA Certified"],
        goldWeight: 3.1,
        makingChargePerGram: 850,
        availableKarats: ["14K"],
        stones: [{ type: "Diamond", carat: 0.9, estimatedValue: 72000 }],
        images: [
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80",
        ],
        metaTitle: "Dewdrop Luminescence Pendant | TBA",
        metaDescription: "Classic elegant diamond solitaire pendants perfect for daily statement wear.",
        isActive: true, isFeatured: false, inStock: true, averageRating: 4.7, totalReviews: 31,
        occasion: ["Everyday wear", "Work wear"],
        stoneTypes: ["Diamond"],
        shopFor: ["Women"],
    },
    {
        name: "Orion Men's Diamond Band",
        slug: "orion-mens-diamond-band",
        description: "A bold, structured band for men featuring channel-set black and white diamonds in a masculine brushed gold finish.",
        category: "Rings",
        subCategory: "Men's Rings",
        certifications: ["BIS Hallmarked"],
        goldWeight: 10.0,
        makingChargePerGram: 800,
        availableKarats: ["9K", "14K", "24K"],
        stones: [{ type: "Diamond", carat: 0.5, estimatedValue: 42000 }],
        images: [
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
        ],
        metaTitle: "Orion Men's Diamond Band | TBA",
        metaDescription: "Bold diamond bands crafted for the modern gentleman.",
        isActive: true, isFeatured: false, inStock: true, averageRating: 4.6, totalReviews: 12,
        occasion: ["Everyday wear"],
        stoneTypes: ["Diamond"],
        shopFor: ["Men"],
    },
    {
        name: "Soleil Ruby Earrings",
        slug: "soleil-ruby-earrings",
        description: "Radiant drop earrings featuring Burmese rubies framed in a halo of brilliant-cut diamonds set in 14K gold.",
        category: "Earrings",
        subCategory: "Drops",
        certifications: ["BIS Hallmarked", "IGI Certified"],
        goldWeight: 5.5,
        makingChargePerGram: 1100,
        availableKarats: ["14K", "24K"],
        stones: [
            { type: "Ruby", carat: 2.4, estimatedValue: 96000 },
            { type: "Diamond", carat: 0.6, estimatedValue: 45000 },
        ],
        images: [
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
        ],
        metaTitle: "Soleil Ruby Earrings | TBA",
        metaDescription: "Radiant ruby drop earrings for the discerning collector.",
        isActive: true, isFeatured: true, inStock: true, averageRating: 4.9, totalReviews: 17,
        occasion: ["Party wear", "Festive"],
        stoneTypes: ["Ruby", "Diamond"],
        shopFor: ["Women"],
    },
];

/* ==========================================================================
   PRICE CALCULATION
   ========================================================================== */
function calculatePrice(product: JewelryProduct, karat: string): number {
    const rate = GOLD_RATE[karat] ?? GOLD_RATE["14K"];
    const goldCost = product.goldWeight * rate;
    const makingCost = product.goldWeight * product.makingChargePerGram;
    const stoneCost = product.stones.reduce((acc, s) => acc + s.estimatedValue, 0);
    return Math.round(goldCost + makingCost + stoneCost);
}

function calculateStartingPrice(product: JewelryProduct): number {
    const lowestKarat = [...product.availableKarats].sort((a, b) => parseInt(a) - parseInt(b))[0] || "14K";
    return calculatePrice(product, lowestKarat);
}

function formatINR(amount: number): string {
    return "₹" + amount.toLocaleString("en-IN");
}

/* ==========================================================================
   FILTER CONFIG
   ========================================================================== */
const PRICE_BUCKETS = [
    { label: "Under ₹20,000", value: "under-20k" },
    { label: "₹20,000 – ₹50,000", value: "20k-50k" },
    { label: "₹50,000 – ₹1,00,000", value: "50k-1l" },
    { label: "Above ₹1,00,000", value: "above-1l" },
];

const KARAT_OPTIONS = ["9K", "14K", "24K"];
const CERT_OPTIONS = ["BIS Hallmarked", "GIA Certified", "IGI Certified"];
const STONE_OPTIONS = ["Diamond", "Emerald", "Ruby", "Sapphire", "Pearl"];
const OCCASION_OPTIONS = ["Everyday wear", "Work wear", "Party wear", "Wedding", "Festive", "Gifting"];
const FOR_OPTIONS = ["Women", "Men"];

const SORT_OPTIONS = [
    { value: "featured", label: "Featured" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "new", label: "New Arrivals" },
];

/* ==========================================================================
   FILTER SECTION COMPONENT — collapsible accordion
   ========================================================================== */
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="border-b border-[var(--color-border-subtle)] pb-4 mb-4">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between text-left mb-3 cursor-pointer"
            >
                <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] font-bold">{title}</span>
                <ChevronDown size={14} className={`text-[var(--color-text-muted)] transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && children}
        </div>
    );
}

/* ==========================================================================
   PRODUCT CARD COMPONENT
   ========================================================================== */
function ProductCard({ product, onWishlist }: { product: JewelryProduct; onWishlist: () => void }) {
    const [imgIndex, setImgIndex] = useState(0);
    const [selectedKarat, setSelectedKarat] = useState<string>(product.availableKarats[0]);
    const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const price = calculatePrice(product, selectedKarat);

    // Auto-advance carousel on hover
    const startAuto = useCallback(() => {
        if (product.images.length <= 1) return;
        autoRef.current = setInterval(() => {
            setImgIndex((p) => (p + 1) % product.images.length);
        }, 1800);
    }, [product.images.length]);

    const stopAuto = useCallback(() => {
        if (autoRef.current) {
            clearInterval(autoRef.current);
            autoRef.current = null;
        }
    }, []);

    useEffect(() => () => stopAuto(), [stopAuto]);

    const goTo = (idx: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setImgIndex(idx);
    };

    const prevImg = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setImgIndex((p) => (p === 0 ? product.images.length - 1 : p - 1));
    };

    const nextImg = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setImgIndex((p) => (p + 1) % product.images.length);
    };

    return (
        <motion.article
            layout
            key={product.slug}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative flex flex-col bg-white rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border-subtle)] hover:shadow-md transition-all duration-300"
        >
            {/* IMAGE CAROUSEL */}
            <div
                className="relative w-full aspect-[4/5] overflow-hidden bg-[var(--color-bg-secondary)] select-none"
                onMouseEnter={startAuto}
                onMouseLeave={() => { stopAuto(); }}
            >
                {/* Full-card link */}
                <Link
                    to={`/product/${product.slug}`}
                    className="absolute inset-0 z-20 cursor-pointer"
                    aria-label={`View ${product.name}`}
                />

                {/* Badges */}
                <div className="absolute top-2 left-2 z-30 flex flex-col gap-1 pointer-events-none">
                    {product.isFeatured && (
                        <span className="bg-[var(--color-teal-dark)] text-[var(--color-cream)] text-[8px] uppercase tracking-[0.15em] font-medium py-1 px-2 rounded-sm shadow-sm">
                            Featured
                        </span>
                    )}
                    {!product.inStock && (
                        <span className="bg-gray-700 text-white text-[8px] uppercase tracking-[0.15em] font-medium py-1 px-2 rounded-sm">
                            Sold Out
                        </span>
                    )}
                </div>

                {/* Wishlist */}
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWishlist(); }}
                    className="absolute top-2 right-2 z-30 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[var(--color-text-muted)] hover:text-red-500 shadow-sm transition-all cursor-pointer"
                >
                    <Heart size={15} />
                </button>

                {/* Images */}
                <div className="w-full h-full relative z-10 pointer-events-none">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.img
                            key={imgIndex}
                            src={product.images[imgIndex]}
                            alt={`${product.name} view ${imgIndex + 1}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35 }}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                        />
                    </AnimatePresence>
                </div>

                {/* Prev / Next arrows — only if multiple images */}
                {product.images.length > 1 && (
                    <>
                        <button
                            onClick={prevImg}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-[var(--color-teal)] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            onClick={nextImg}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-[var(--color-teal)] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            <ChevronRight size={14} />
                        </button>

                        {/* Dot indicators */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-1 pointer-events-none">
                            {product.images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => goTo(i, e)}
                                    className={`pointer-events-auto w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${i === imgIndex ? "bg-white scale-125" : "bg-white/50"}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* CARD BODY */}
            <div className="p-3 md:p-4 flex-1 flex flex-col gap-2 bg-white relative z-20">
                {/* Category label */}
                <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] font-medium">
                    {product.category} • {product.subCategory}
                </span>

                {/* Product name */}
                <Link
                    to={`/product/${product.slug}`}
                    className="font-primary text-sm md:text-base text-[var(--color-text)] hover:text-[var(--color-teal-light)] transition-colors line-clamp-2 leading-snug cursor-pointer"
                >
                    {product.name}
                </Link>

                {/* Karat selector */}
                {product.availableKarats.length > 1 && (
                    <div className="flex gap-1.5 flex-wrap">
                        {product.availableKarats.map((k) => (
                            <button
                                key={k}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedKarat(k); }}
                                className={`text-[10px] px-2 py-1 rounded border transition-all cursor-pointer font-medium ${selectedKarat === k
                                        ? "border-[var(--color-teal)] bg-[var(--color-teal)] text-white"
                                        : "border-[var(--color-border)] text-[var(--color-text-muted)] bg-transparent hover:border-[var(--color-teal)]"
                                    }`}
                            >
                                {k}
                            </button>
                        ))}
                    </div>
                )}

                {/* Price */}
                <div className="mt-auto pt-2 border-t border-[var(--color-border-subtle)] flex items-end justify-between">
                    <div>
                        <span className="block text-[8px] uppercase tracking-widest text-[var(--color-text-muted)] mb-0.5">
                            {product.availableKarats.length > 1 ? `${selectedKarat} Gold` : `${selectedKarat} Gold`}
                        </span>
                        <motion.span
                            key={price}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="font-secondary text-sm md:text-base font-semibold text-[var(--color-teal)] font-mono"
                        >
                            {formatINR(price)}
                        </motion.span>
                    </div>
                    {product.availableKarats.length === 1 && (
                        <span className="text-[9px] text-[var(--color-text-muted)] italic">{product.availableKarats[0]} Pure</span>
                    )}
                </div>
            </div>
        </motion.article>
    );
}

/* ==========================================================================
   MAIN PAGE
   ========================================================================== */
export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const productsSectionRef = useRef<HTMLDivElement>(null);

    // Core state
    const initialCategory = (searchParams.get("category") as any) || "All";
    const initialSearch = searchParams.get("q") || "";

    const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
    const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    // Filter state
    const [selectedKarats, setSelectedKarats] = useState<string[]>([]);
    const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
    const [selectedPriceBucket, setSelectedPriceBucket] = useState<string>("");
    const [selectedStones, setSelectedStones] = useState<string[]>([]);
    const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
    const [selectedFor, setSelectedFor] = useState<string[]>([]);
    const [currentSort, setCurrentSort] = useState("featured");

    // Mobile drawers
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);

    // URL sync
    useEffect(() => {
        setSelectedCategory(searchParams.get("category") || "All");
        setSearchQuery(searchParams.get("q") || "");
        if (searchParams.get("category") || searchParams.get("q")) {
            productsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [searchParams]);

    useEffect(() => {
        document.body.style.overflow = (isMobileFilterOpen || isMobileSortOpen) ? "hidden" : "unset";
        return () => { document.body.style.overflow = "unset"; };
    }, [isMobileFilterOpen, isMobileSortOpen]);

    const handleFilterCategoryChange = (cat: string) => {
        setSelectedCategory(cat);
        setSearchParams({ ...Object.fromEntries(searchParams.entries()), category: cat });
    };

    const handleSearchChange = (q: string) => {
        setSearchQuery(q);
        const p = Object.fromEntries(searchParams.entries());
        if (q) setSearchParams({ ...p, q });
        else { const { q: _, ...rest } = p; setSearchParams(rest); }
    };

    // Toggle helper
    const toggleItem = (list: string[], item: string, setter: (v: string[]) => void) => {
        setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
    };

    const activeFilterCount =
        selectedKarats.length +
        selectedCerts.length +
        selectedStones.length +
        selectedOccasions.length +
        selectedFor.length +
        (selectedPriceBucket ? 1 : 0) +
        (selectedCategory !== "All" ? 1 : 0);

    const clearAllFilters = () => {
        setSelectedCategory("All");
        setSelectedKarats([]);
        setSelectedCerts([]);
        setSelectedPriceBucket("");
        setSelectedStones([]);
        setSelectedOccasions([]);
        setSelectedFor([]);
        setSearchParams({});
    };

    // Filtering + sorting
    const filteredProducts = useMemo(() => {
        let data = [...MOCK_PRODUCTS];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            data = data.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
        }
        if (selectedCategory !== "All") {
            data = data.filter((p) => p.category === selectedCategory);
        }
        if (selectedKarats.length > 0) {
            data = data.filter((p) => selectedKarats.some((k) => p.availableKarats.includes(k as any)));
        }
        if (selectedCerts.length > 0) {
            data = data.filter((p) => selectedCerts.some((c) => p.certifications.includes(c as any)));
        }
        if (selectedStones.length > 0) {
            data = data.filter((p) => selectedStones.some((s) => p.stoneTypes?.includes(s)));
        }
        if (selectedOccasions.length > 0) {
            data = data.filter((p) => selectedOccasions.some((o) => p.occasion?.includes(o)));
        }
        if (selectedFor.length > 0) {
            data = data.filter((p) => selectedFor.some((f) => p.shopFor?.includes(f as any)));
        }
        if (selectedPriceBucket) {
            data = data.filter((p) => {
                const price = calculateStartingPrice(p);
                if (selectedPriceBucket === "under-20k") return price < 20000;
                if (selectedPriceBucket === "20k-50k") return price >= 20000 && price < 50000;
                if (selectedPriceBucket === "50k-1l") return price >= 50000 && price < 100000;
                if (selectedPriceBucket === "above-1l") return price >= 100000;
                return true;
            });
        }

        switch (currentSort) {
            case "price-asc": data.sort((a, b) => calculateStartingPrice(a) - calculateStartingPrice(b)); break;
            case "price-desc": data.sort((a, b) => calculateStartingPrice(b) - calculateStartingPrice(a)); break;
            case "new": data.sort((a, b) => b.totalReviews - a.totalReviews); break;
            default: data.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        }

        return data;
    }, [searchQuery, selectedCategory, selectedKarats, selectedCerts, selectedStones, selectedOccasions, selectedFor, selectedPriceBucket, currentSort]);

    /* ---- Shared filter panel content (used in both desktop sidebar + mobile sheet) ---- */
    const FilterPanelContent = (
        <div className="space-y-0">
            {/* Category */}
            <FilterSection title="Shop By Category">
                <div className="flex flex-col gap-1">
                    {["All", "Rings", "Necklaces", "Earrings", "Bangles", "Pendants"].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleFilterCategoryChange(cat)}
                            className={`flex items-center justify-between text-xs py-1.5 px-2 rounded-[var(--radius-sm)] transition-all cursor-pointer ${selectedCategory === cat
                                    ? "bg-[var(--color-teal)] text-white font-medium"
                                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
                                }`}
                        >
                            <span>{cat}</span>
                            {selectedCategory === cat && <Check size={11} />}
                        </button>
                    ))}
                </div>
            </FilterSection>

            {/* Price */}
            <FilterSection title="Shop By Price">
                <div className="flex flex-col gap-1.5">
                    {PRICE_BUCKETS.map((b) => (
                        <label key={b.value} className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                                type="radio"
                                name="price-bucket"
                                checked={selectedPriceBucket === b.value}
                                onChange={() => setSelectedPriceBucket(selectedPriceBucket === b.value ? "" : b.value)}
                                className="accent-[var(--color-teal)] cursor-pointer"
                            />
                            <span className="text-xs text-[var(--color-text-secondary)] group-hover:text-[var(--color-teal)] transition-colors">
                                {b.label}
                            </span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Metal Purity */}
            <FilterSection title="Shop By Metal Purity">
                <div className="flex gap-2 flex-wrap">
                    {KARAT_OPTIONS.map((k) => (
                        <button
                            key={k}
                            onClick={() => toggleItem(selectedKarats, k, setSelectedKarats)}
                            className={`text-xs px-3 py-1.5 rounded border transition-all cursor-pointer font-medium ${selectedKarats.includes(k)
                                    ? "border-[var(--color-teal)] bg-[var(--color-teal)] text-white"
                                    : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-teal)]"
                                }`}
                        >
                            {k}
                        </button>
                    ))}
                </div>
            </FilterSection>

            {/* Stone Type */}
            <FilterSection title="Shop By Stone">
                <div className="flex flex-col gap-1.5">
                    {STONE_OPTIONS.map((s) => (
                        <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedStones.includes(s)}
                                onChange={() => toggleItem(selectedStones, s, setSelectedStones)}
                                className="accent-[var(--color-teal)] cursor-pointer"
                            />
                            <span className="text-xs text-[var(--color-text-secondary)] group-hover:text-[var(--color-teal)] transition-colors">{s}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Certification */}
            <FilterSection title="Certification">
                <div className="flex flex-col gap-1.5">
                    {CERT_OPTIONS.map((c) => (
                        <label key={c} className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedCerts.includes(c)}
                                onChange={() => toggleItem(selectedCerts, c, setSelectedCerts)}
                                className="accent-[var(--color-teal)] cursor-pointer"
                            />
                            <span className="text-xs text-[var(--color-text-secondary)] group-hover:text-[var(--color-teal)] transition-colors">{c}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Shop For */}
            <FilterSection title="Shop For">
                <div className="flex gap-2">
                    {FOR_OPTIONS.map((f) => (
                        <button
                            key={f}
                            onClick={() => toggleItem(selectedFor, f, setSelectedFor)}
                            className={`text-xs px-3 py-1.5 rounded border transition-all cursor-pointer ${selectedFor.includes(f)
                                    ? "border-[var(--color-teal)] bg-[var(--color-teal)] text-white"
                                    : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-teal)]"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </FilterSection>

            {/* Occasion */}
            <FilterSection title="Occasion">
                <div className="flex flex-col gap-1.5">
                    {OCCASION_OPTIONS.map((o) => (
                        <label key={o} className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedOccasions.includes(o)}
                                onChange={() => toggleItem(selectedOccasions, o, setSelectedOccasions)}
                                className="accent-[var(--color-teal)] cursor-pointer"
                            />
                            <span className="text-xs text-[var(--color-text-secondary)] group-hover:text-[var(--color-teal)] transition-colors">{o}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>
        </div>
    );

    return (
        <>
            <Navbar
                onSearchChange={handleSearchChange}
                activeCategory={selectedCategory}
                onCategoryChange={handleFilterCategoryChange}
                onAuthOpen={() => setIsAuthOpen(true)}
            />

            <main className="w-full pb-16 bg-[var(--color-bg)] min-h-screen font-secondary text-[var(--color-text)]">

                {/* BANNER */}
                <section className="relative w-full h-[260px] md:h-[380px] overflow-hidden bg-[var(--color-teal-dark)]">
                    <div className="absolute inset-0 bg-black/40 z-10" />
                    <img
                        src={bannerImage}
                        alt="Luxury Jewelry Banner"
                        className="absolute inset-0 w-full h-full object-cover object-center scale-[1.02]"
                    />
                </section>

                {/* MAIN LAYOUT */}
                <div ref={productsSectionRef} id="main-products-section" className="container mx-auto px-4 md:px-6 max-w-[1320px] mt-8 flex gap-8 items-start">

                    {/* DESKTOP SIDEBAR */}
                    <aside className="hidden lg:flex flex-col w-[260px] xl:w-[290px] shrink-0 bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] sticky top-6 max-h-[calc(100vh-80px)] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5 pb-4 border-b border-[var(--color-border-subtle)]">
                            <h2 className="font-primary text-base text-[var(--color-teal)] font-medium">
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="ml-2 bg-[var(--color-teal)] text-white text-[9px] px-1.5 py-0.5 rounded-full font-secondary">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </h2>
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={clearAllFilters}
                                    className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors cursor-pointer"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                        {FilterPanelContent}
                    </aside>

                    {/* PRODUCT GRID */}
                    <section className="flex-1 w-full min-w-0">
                        {/* Top bar */}
                        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--color-border-subtle)]">
                            <p className="text-xs text-[var(--color-text-muted)]">
                                Showing <span className="font-semibold text-[var(--color-teal)]">{filteredProducts.length}</span> items
                            </p>
                            {/* Desktop sort */}
                            <div className="hidden lg:flex items-center gap-2">
                                <span className="text-xs text-[var(--color-text-muted)]">Sort by</span>
                                <select
                                    value={currentSort}
                                    onChange={(e) => setCurrentSort(e.target.value)}
                                    className="bg-white border border-[var(--color-border)] rounded py-1.5 px-3 text-xs outline-none focus:border-[var(--color-teal)] cursor-pointer"
                                >
                                    {SORT_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="w-full py-24 text-center border border-dashed border-[var(--color-border)] rounded-[var(--radius-xl)]">
                                <Sparkles className="mx-auto text-[var(--color-cream)] mb-3" size={32} />
                                <h3 className="font-primary text-xl text-[var(--color-teal)] mb-1">No products found</h3>
                                <p className="text-xs text-[var(--color-text-muted)] mb-4">Try adjusting your filters</p>
                                <button
                                    onClick={clearAllFilters}
                                    className="bg-[var(--color-teal)] text-white text-xs uppercase tracking-widest py-2 px-6 rounded-full cursor-pointer"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-y-8 gap-x-4 sm:gap-6">
                                <AnimatePresence mode="popLayout">
                                    {filteredProducts.map((product) => (
                                        <ProductCard
                                            key={product.slug}
                                            product={product}
                                            onWishlist={() => setIsAuthOpen(true)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </section>
                </div>

                {/* MOBILE FLOATING BAR */}
                <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[250] bg-[var(--color-teal-dark)]/90 text-white backdrop-blur-md rounded-full shadow-lg px-6 py-3 flex items-center gap-6 border border-white/10 w-[85%] max-w-xs justify-around">
                    <button
                        onClick={() => setIsMobileFilterOpen(true)}
                        className="flex items-center gap-2 text-xs uppercase tracking-widest cursor-pointer"
                    >
                        <SlidersHorizontal size={14} />
                        <span>Filter</span>
                        {activeFilterCount > 0 && (
                            <span className="bg-white text-[var(--color-teal-dark)] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                    <div className="w-[1px] h-4 bg-white/20" />
                    <button
                        onClick={() => setIsMobileSortOpen(true)}
                        className="flex items-center gap-2 text-xs uppercase tracking-widest cursor-pointer"
                    >
                        <ArrowUpDown size={14} />
                        <span>Sort</span>
                    </button>
                </div>

                {/* MOBILE FILTER SHEET */}
                <AnimatePresence>
                    {isMobileFilterOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="fixed inset-0 bg-black/60 z-[350]"
                            />
                            <motion.div
                                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed bottom-0 left-0 right-0 max-h-[88vh] bg-[var(--color-bg)] rounded-t-[var(--radius-xl)] z-[360] overflow-y-auto p-5 shadow-[0_-8px_32px_rgba(0,0,0,0.15)] pb-28 text-[var(--color-text)]"
                            >
                                <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-4 mb-4">
                                    <h3 className="font-primary text-lg text-[var(--color-teal)] font-medium">
                                        Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                                    </h3>
                                    <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 rounded-full bg-[var(--color-bg-secondary)] cursor-pointer">
                                        <X size={18} />
                                    </button>
                                </div>

                                {FilterPanelContent}

                                <div className="mt-6 flex flex-col gap-2 sticky bottom-0 pt-3 bg-[var(--color-bg)]">
                                    <button
                                        onClick={() => setIsMobileFilterOpen(false)}
                                        className="w-full bg-[var(--color-teal)] text-white text-xs font-secondary uppercase tracking-widest py-3 rounded-[var(--radius-md)] cursor-pointer"
                                    >
                                        Apply ({filteredProducts.length} items)
                                    </button>
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={() => { clearAllFilters(); setIsMobileFilterOpen(false); }}
                                            className="w-full text-[var(--color-text-muted)] text-xs font-secondary uppercase tracking-widest py-2.5 cursor-pointer"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* MOBILE SORT SHEET */}
                <AnimatePresence>
                    {isMobileSortOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setIsMobileSortOpen(false)}
                                className="fixed inset-0 bg-black/60 z-[350]"
                            />
                            <motion.div
                                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                                className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg)] rounded-t-[var(--radius-xl)] z-[360] p-6 shadow-[0_-8px_32px_rgba(0,0,0,0.15)] pb-12 text-[var(--color-text)]"
                            >
                                <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-4 mb-4">
                                    <h3 className="font-primary text-lg text-[var(--color-teal)] font-medium">Sort by</h3>
                                    <button onClick={() => setIsMobileSortOpen(false)} className="p-1 rounded-full bg-[var(--color-bg-secondary)] cursor-pointer">
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="flex flex-col gap-1">
                                    {SORT_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => { setCurrentSort(opt.value); setIsMobileSortOpen(false); }}
                                            className={`w-full text-left py-3 px-3 rounded text-xs font-secondary transition-all cursor-pointer flex items-center justify-between ${currentSort === opt.value
                                                    ? "bg-[var(--color-teal)] text-white font-semibold"
                                                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
                                                }`}
                                        >
                                            <span>{opt.label}</span>
                                            {currentSort === opt.value && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
            </main>

            <Footer onCategoryChange={handleFilterCategoryChange} />
        </>
    );
}