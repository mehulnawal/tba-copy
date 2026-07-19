// import {useEffect,useState} from "react";import {Link} from "react-router-dom";import {apiRequest} from "../api/client";import Navbar from "../components/Navbar";import Footer from "../components/Footer";type B={_id:string;image:string;order:number};type P={id:string;slug:string;Title:string;Category:string;prices:{karat:string;finalPrice:number}[];[key:string]:any};export default function HomePage(){const [products,setProducts]=useState<P[]>([]);const [banners,setBanners]=useState<B[]>([]);const [category,setCategory]=useState("All");const [search,setSearch]=useState("");useEffect(()=>{apiRequest<B[]>("/banners").then(setBanners);apiRequest<P[]>(`/products?search=${encodeURIComponent(search)}${category!=="All"?`&category=${encodeURIComponent(category)}`:""}`).then(setProducts)},[search,category]);return <><Navbar onSearchChange={setSearch} activeCategory={category} onCategoryChange={setCategory}/><main className="mx-auto max-w-7xl p-8"><h1 className="text-4xl">The Brilliance Atelier</h1><p>Discover our collection.</p><div className="my-6 grid gap-4">{banners.map(b=><img key={b._id} src={b.image} className="w-full object-cover" alt={`TBA banner ${b.order}`}/>)}</div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0,8).map(p=><Link key={p.id} to={`/product/${p.slug}`}><img className="aspect-square w-full object-cover" src={p["image_link-1"]}/><h2>{p.Title}</h2><p>₹{Math.round(p.prices.find(x=>x.karat==="9kt")?.finalPrice||0).toLocaleString("en-IN")}</p></Link>)}</div></main><Footer onCategoryChange={setCategory}/></>}


import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AVATAR_ASSETS } from "../constants/assets";
import { Product, PrimeHotspot, FAQ, Testimonial } from "../types";
import FloatingButtons from "../components/FloatingButtons";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { apiRequest } from "../api/client";

import banner1 from '../assets/banner/banner1.webp';
import banner2 from '../assets/banner/banner2.webp';
import banner3 from '../assets/banner/banner3.webp';

import {
    ChevronLeft,
    ChevronRight,
    Heart,
    X,
    Star,
    CheckCircle2
} from "lucide-react";
import { AuthModal } from "./AuthModal";
import PrimeSelection from "../components/PrimeCollection";
import BestSellerCarousel from "../components/BestSellerCarousel";
import VisitStore from "../components/VisitStore";
import BrandPromise from "../components/BrandCredentials";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useBanners } from "../hooks/useContent";
import { useCart, useAddToCart } from "../hooks/useCart";
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from "../hooks/useWishlist";
import {
    ApiProduct,
    adaptApiProductToUI,
    productToCartPayload,
    productToWishlistPayload
} from "../utils/productHelpers";
import { ApiRequestError } from "../api/client";

const HERO_SLIDES = [
    { id: "1", image: banner1, mobileImage: banner1 },
    { id: "2", image: banner2, mobileImage: banner2 },
    { id: "3", image: banner3, mobileImage: banner3 },
];

const TESTIMONIALS: Testimonial[] = [
    {
        id: "1", name: "Priya Mehta", location: "Mumbai", rating: 5, avatar: AVATAR_ASSETS.a1,
        review: "TBA's craftsmanship is unmatched. The 22K necklace for my daughter's wedding was breathtaking — every detail perfect."
    },
    {
        id: "2", name: "Rajan Shah", location: "Surat", rating: 4.5, avatar: AVATAR_ASSETS.a2,
        review: "Transparent pricing, BIS certified, delivered on time. TBA has completely changed how I buy gold jewelry."
    },
    {
        id: "3", name: "Kavita Desai", location: "Ahmedabad", rating: 5, avatar: AVATAR_ASSETS.a4,
        review: "Purchased earrings as an anniversary gift. The packaging, finish, weight — all premium. Highly recommended."
    },
];

const FAQS: FAQ[] = [
    {
        id: "1",
        question: "What are Lab-Grown Diamonds?",
        answer: "Lab-grown diamonds are real diamonds created in advanced laboratory environments that perfectly mimic the high-pressure, high-temperature conditions under which diamonds naturally develop deep inside the Earth. They are physically, chemically, and optically identical to natural diamonds. Even professional jewellers and certified gemologists cannot tell the difference with their naked eyes or standard microscopes."
    },
    {
        id: "2",
        question: "Are Lab Grown Diamonds real?",
        answer: "Yes, lab-grown diamonds are 100% real diamonds. A diamond is categorized by its chemical structure and composition—not its origin. Both lab-grown and mined diamonds possess the exact same crystalline structure of pure carbon atoms, ensuring that they share the identical properties of genuine diamonds."
    },
    {
        id: "3",
        question: "Can you tell the difference between Lab-Grown Diamonds and Natural Diamonds?",
        answer: "There is absolutely no visual or physical way to differentiate between a lab diamond and a natural diamond by looking at them. Trained jewellers or experts cannot tell them apart using naked eyes or regular microscopes. Identifying a lab-grown diamond requires specialized, advanced spectroscopic equipment found inside certified gemological laboratories."
    },
    {
        id: "4",
        question: "Are Lab-Grown Diamonds worth buying and do you offer buyback?",
        answer: "Absolutely. Lab-grown diamonds are worth buying because they are real diamonds that last forever. Just like traditional jewellers offer terms on natural diamonds, TBA offers a reliable value-assurance policy including an 80% buyback and a 100% exchange policy on our lab-grown diamond collections."
    },
    {
        id: "5",
        question: "Do Lab-Grown Diamonds cost less than mined diamonds?",
        answer: "Yes, they do. Lab-grown diamonds generally retail at a significant 60% to 90% discount compared to mined diamonds of equivalent quality. Despite the accessible price point, they are evaluated, graded, and priced using the exact same standard matrix—Cut, Colour, Clarity, and Carat weight."
    },
    {
        id: "6",
        question: "Are Lab-Grown Diamonds graded and certified?",
        answer: "Yes. Lab-grown diamonds undergo the same rigorous grading procedures as mined diamonds. They are certified by leading global gemological laboratories, such as IGI, SGL, and EGL. Every single lab-grown diamond piece used by TBA is carefully graded and certified by these renowned, third-party organizations."
    },
    {
        id: "7",
        question: "Are Lab-Grown Diamonds the same as Synthetic Diamonds or Moissanite?",
        answer: "No, lab-grown diamonds are not diamond simulants like Cubic Zirconia (CZ) or Moissanite, which only imitate the look of a diamond. Lab-grown diamonds are pure carbon crystals and constitute genuine diamonds, completely distinct from synthetic imitations."
    },
    {
        id: "8",
        question: "Are Lab-Grown Diamonds durable enough to last?",
        answer: "Diamonds are the hardest known material on Earth, ranking at a maximum 10 on the Mohs Scale of hardness. Lab-grown diamonds share this exact same rank of 10, delivering identical structural strength, hardness, and ultimate durability. You can confidently pass these timeless pieces down to the next generation."
    },
    {
        id: "9",
        question: "Do Lab-Grown Diamonds change colour, shine, or sparkle over time?",
        answer: "No, they do not. Lab-grown diamonds will never fade, discolor, lose their brilliance, or turn cloudy over time. Their optical sparkle and natural fire are permanent and timeless."
    },
    {
        id: "10",
        question: "Do all Lab-Grown Diamonds look alike?",
        answer: "No. While the growth environment is controlled in modern machines, the diamond crystallization process is entirely organic and natural. Just like mined diamonds, nature dictates the outcome, resulting in unique variances in Cut, Colour, Clarity, and Carat size for every individual piece."
    }
];


export default function HomePage() {
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState<ApiProduct[]>([]);

    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const [isHoveringHero, setIsHoveringHero] = useState(false);
    const [testimonialIndex, setTestimonialIndex] = useState(0);
    const [faqOpenId, setFaqOpenId] = useState<string | null>(null);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const { data: bannerData } = useBanners();
    const { data: apiCart } = useCart(isAuthenticated);
    const { data: apiWishlist } = useWishlist(isAuthenticated);

    const addToCartMutation = useAddToCart();
    const addToWishlistMutation = useAddToWishlist();
    const removeFromWishlistMutation = useRemoveFromWishlist();

    // Fetch dynamic category & query params search filtered products
    useEffect(() => {
        const categoryParam = activeCategory !== "All" ? `&category=${encodeURIComponent(activeCategory)}` : "";
        apiRequest<ApiProduct[]>(`/products?search=${encodeURIComponent(searchQuery)}${categoryParam}`)
            .then(setProducts)
            .catch(err => console.error("Error loading live product catalog matrices:", err));
    }, [searchQuery, activeCategory]);

    // Hero carousel fallback system setup
    const heroSlides = useMemo(() => {
        if (bannerData && bannerData.length > 0) {
            return bannerData.map((banner) => ({
                id: banner._id,
                image: banner.image,
                mobileImage: banner.mobileImage || banner.image,
            }));
        }
        return HERO_SLIDES;
    }, [bannerData]);

    // Autoplay calculations loop
    useEffect(() => {
        if (isHoveringHero) return;
        const interval = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5500);
        return () => clearInterval(interval);
    }, [isHoveringHero, heroSlides.length]);

    // Global KeyListeners overlay setup
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsWishlistOpen(false);
                setIsAuthOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Locking standard layout dimensions for layers
    useEffect(() => {
        const shouldLock = isWishlistOpen || isAuthOpen;
        document.body.style.overflow = shouldLock ? "hidden" : "unset";
        return () => { document.body.style.overflow = "unset"; };
    }, [isWishlistOpen, isAuthOpen]);

    const nextHeroSlide = () => setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    const prevHeroSlide = () => setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

    // Map the real filtered API records to what UI items/carousels expect
    const uiProducts = useMemo(() => {
        return products.map(adaptApiProductToUI);
    }, [products]);

    // Specifically resolve items that match best seller criteria flags
    const bestSellerProducts = useMemo(() => {
        return products.filter(p => p.Is_Best_Seller).map(adaptApiProductToUI);
    }, [products]);

    // Safely extract price based on product reference tracking IDs matching live engine maps
    const resolveLiveProductPrice = (product: Product): number => {
        const matchedRaw = products.find(p => p.id === product.id);
        if (!matchedRaw || !matchedRaw.prices || matchedRaw.prices.length === 0) return 0;
        // Lookup standard presentation variant or default first available index
        const targetPrice = matchedRaw.prices.find(p => p.karat === product.karat) || matchedRaw.prices[0];
        return Math.round(targetPrice.finalPrice || 0);
    };

    const addToCart = async (product: Product) => {
        if (!isAuthenticated) {
            setIsAuthOpen(true);
            return;
        }
        const activePrice = resolveLiveProductPrice(product);
        try {
            await addToCartMutation.mutateAsync(productToCartPayload(product, activePrice));
            showToast("Added to cart successfully", "success");
        } catch (error) {
            const message = error instanceof ApiRequestError ? error.message : "Failed to add to cart";
            showToast(message, "error");
        }
    };

    const toggleWishlist = async (product: Product) => {
        if (!isAuthenticated) {
            setIsAuthOpen(true);
            return;
        }
        const activePrice = resolveLiveProductPrice(product);
        const isInWishlist = apiWishlist?.some((item) => item.productId === product.id);

        try {
            if (isInWishlist) {
                await removeFromWishlistMutation.mutateAsync(product.id);
                showToast("Removed from wishlist", "success");
            } else {
                await addToWishlistMutation.mutateAsync(productToWishlistPayload(product, activePrice));
                showToast("Added to wishlist", "success");
            }
        } catch (error) {
            const message = error instanceof ApiRequestError ? error.message : "Wishlist update failed";
            showToast(message, "error");
        }
    };

    const isProductInWishlist = (productId: string) => {
        return apiWishlist?.some((item) => item.productId === productId) || false;
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg)] flex flex-col relative antialiased selection:bg-[var(--color-cream)] selection:text-[var(--color-teal)]">
            <Navbar
                onSearchChange={setSearchQuery}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                onAuthOpen={() => setIsAuthOpen(true)}
            />

            <main className="flex-1 w-full flex flex-col gap-0">
                {/* 1. Hero banner carousel */}
                <section
                    onMouseEnter={() => setIsHoveringHero(true)}
                    onMouseLeave={() => setIsHoveringHero(false)}
                    className="relative w-full bg-[var(--color-bg)] py-3 md:py-4"
                    id="hero-banner-section"
                >
                    <div className="w-full px-2 md:px-4">
                        <div
                            className="relative w-full overflow-hidden rounded-[18px] md:rounded-[28px] bg-[var(--color-teal)]"
                            style={{ aspectRatio: "16/9", maxHeight: "520px" }}
                        >
                            {heroSlides.map((slide, i) => (
                                <div
                                    key={slide.id}
                                    className={`absolute inset-0 hero-slide-${i}`}
                                    style={{
                                        opacity: i === activeSlide ? 1 : 0,
                                        zIndex: i === activeSlide ? 1 : 0,
                                        transition: "opacity 1000ms ease-in-out",
                                    }}
                                >
                                    <img
                                        src={slide.image}
                                        alt={`Banner slide ${i + 1}`}
                                        className="w-full h-full object-cover object-left pointer-events-none block"
                                    />
                                </div>
                            ))}

                            {/* Dot indicators */}
                            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10">
                                {heroSlides.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveSlide(i)}
                                        aria-label={`Go to slide ${i + 1}`}
                                        className="bg-transparent border-none p-1 cursor-pointer flex items-center"
                                    >
                                        <span
                                            className={`block h-0.5 rounded-xs transition-all duration-500 ${i === activeSlide ? 'w-10 bg-white' : 'w-3.5 bg-white/35'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Prev / Next controls */}
                            <div className="absolute bottom-4 left-5 flex gap-2.5 z-10">
                                <button
                                    onClick={prevHeroSlide}
                                    aria-label="Previous slide"
                                    className="w-[38px] h-[38px] rounded-full border border-white/30 bg-black/15 text-white flex items-center justify-center cursor-pointer backdrop-blur-xs transition-colors hover:bg-white hover:text-[var(--color-teal)]"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={nextHeroSlide}
                                    aria-label="Next slide"
                                    className="w-[38px] h-[38px] rounded-full border border-white/30 bg-black/15 text-white flex items-center justify-center cursor-pointer backdrop-blur-xs transition-colors hover:bg-white hover:text-[var(--color-teal)]"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. PrimeSelection Component */}
                <PrimeSelection />

                {/* 3. Best Seller Showcase */}
                <section className="reveal-section py-3 bg-[var(--color-bg)]" id="collection-grid">
                    <div className="container">
                        <div className="flex flex-col items-center mb-16 text-center">
                            <span className="section-label">Selected Statement Masterpieces</span>
                            <h2 className="font-primary text-3xl md:text-4xl text-[var(--color-text)] tracking-wide font-light">
                                The Best Seller Showcase
                            </h2>
                            <div className="w-12 h-[1px] bg-[var(--color-cream)] mt-4" />
                        </div>

                        <BestSellerCarousel
                            filteredProducts={bestSellerProducts}
                            isProductInWishlist={isProductInWishlist}
                            getProductPrice={resolveLiveProductPrice}
                            isLoggedIn={isAuthenticated}
                            setIsAuthOpen={setIsAuthOpen}
                            toggleWishlist={toggleWishlist}
                            addToCart={addToCart}
                        />
                    </div>
                </section>

                {/* 4. BrandPromise ("Why Choose Us") */}
                <BrandPromise />

                {/* 5. Testimonials static section */}
                <section className="section-padding bg-[var(--color-bg)] overflow-hidden" id="testimonials-section">
                    <div className="container flex flex-col items-center gap-12">
                        <div className="text-center reveal-section">
                            <span className="section-label">Testimonials</span>
                            <h2 className="text-4xl md:text-5xl font-primary text-[var(--color-teal)] font-normal tracking-wide">
                                Customer Reviews
                            </h2>
                            <p className="mt-3 font-secondary text-sm text-[var(--color-text-muted)] max-w-lg mx-auto">
                                Read the stories from our clients who have acquired pieces of unmatched brilliance.
                            </p>
                        </div>

                        <div className="w-full max-w-2xl relative flex flex-col items-center reveal-section min-h-[300px]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={testimonialIndex}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4 }}
                                    className="w-full bg-[var(--color-white)] rounded-2xl border border-[var(--color-border-subtle)] p-8 md:p-10 shadow-lg relative flex flex-col gap-6"
                                >
                                    <div className="flex gap-1.5">
                                        {Array.from({ length: Math.floor(TESTIMONIALS[testimonialIndex].rating) }).map((_, i) => (
                                            <Star key={i} size={16} className="text-amber-500 fill-amber-500" />
                                        ))}
                                    </div>

                                    <blockquote className="font-primary text-lg md:text-xl text-[var(--color-teal)] italic leading-relaxed font-normal">
                                        "{TESTIMONIALS[testimonialIndex].review}"
                                    </blockquote>

                                    <div className="flex items-center gap-3 border-t border-[var(--color-border-subtle)] pt-5">
                                        <img
                                            src={TESTIMONIALS[testimonialIndex].avatar}
                                            alt={TESTIMONIALS[testimonialIndex].name}
                                            className="w-12 h-12 rounded-full object-cover shrink-0 border border-cream"
                                            referrerPolicy="no-referrer"
                                        />
                                        <div>
                                            <h4 className="font-secondary text-sm font-semibold text-[var(--color-teal)]">
                                                {TESTIMONIALS[testimonialIndex].name}
                                            </h4>
                                            <address className="font-secondary text-xs text-[var(--color-text-muted)] not-italic">
                                                {TESTIMONIALS[testimonialIndex].location}
                                            </address>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center gap-5 reveal-section">
                            <button
                                onClick={() => setTestimonialIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                                className="w-11 h-11 rounded-full bg-white border border-[var(--color-border)] text-[var(--color-teal)] hover:bg-[var(--color-teal)] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                                aria-label="Previous Testimonial"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div className="flex gap-2">
                                {TESTIMONIALS.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setTestimonialIndex(i)}
                                        className={`h-2 rounded-full transition-all duration-300 border-none cursor-pointer p-0 ${i === testimonialIndex ? 'w-6 bg-[var(--color-teal)]' : 'w-2 bg-[var(--color-border)]'}`}
                                        aria-label={`Go to Testimonial ${i + 1}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={() => setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length)}
                                className="w-11 h-11 rounded-full bg-white border border-[var(--color-border)] text-[var(--color-teal)] hover:bg-[var(--color-teal)] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                                aria-label="Next Testimonial"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* 6. FAQ Accordion section */}
                <section className="section-padding bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-subtle)]" id="faq-section" >
                    <div className="container max-w-4xl flex flex-col gap-10">
                        <div className="text-center reveal-section">
                            <h2 className="text-4xl md:text-5xl font-primary text-[var(--color-teal)] font-normal tracking-wide">
                                Top Customer Questions
                            </h2>
                        </div>

                        <div className="w-full flex flex-col gap-3 reveal-section">
                            {FAQS.map((faq) => {
                                const isOpen = faqOpenId === faq.id;
                                return (
                                    <div key={faq.id} className="bg-[var(--color-white)] rounded-lg border border-[var(--color-border)] overflow-hidden shadow-xs">
                                        <button
                                            onClick={() => setFaqOpenId(isOpen ? null : faq.id)}
                                            className="w-full flex justify-between items-center px-6 py-5 bg-transparent border-none text-left cursor-pointer"
                                        >
                                            <span className="font-secondary font-semibold text-[var(--color-teal)] text-sm md:text-base tracking-wide pr-4">
                                                {faq.question}
                                            </span>
                                            <span
                                                className="text-2xl font-light text-[var(--color-teal)] flex shrink-0 transition-transform duration-300"
                                                style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0)" }}
                                            >
                                                +
                                            </span>
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
                                                >
                                                    <div className="px-6 pb-6 pt-1 border-t border-[var(--color-border-subtle)] font-secondary text-xs md:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                                        {faq.answer}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 7. VisitStore Component */}
                <VisitStore />

                {/* 8. Footer Section */}
                <Footer onCategoryChange={setActiveCategory} />
            </main>

            {/* 9. FloatingButtons */}
            <FloatingButtons />

            {/* 10. Wishlist Drawer */}
            <AnimatePresence>
                {isWishlistOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsWishlistOpen(false)}
                            className="fixed inset-0 bg-black/60 z-[var(--z-overlay)] cursor-pointer"
                        />

                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="fixed top-0 right-0 bottom-0 w-full md:w-[450px] bg-white z-[var(--z-overlay)] flex flex-col border-l border-[var(--color-border-subtle)] shadow-xl"
                            id="wishlist-drawer"
                        >
                            <div className="p-6 border-b border-[var(--color-border-subtle)] flex justify-between items-center">
                                <div className="flex items-center gap-2.5">
                                    <Heart size={20} className="text-red-500 fill-red-500" />
                                    <span className="font-primary font-bold text-xl text-[var(--color-teal)]">My Atelier Wishlist</span>
                                    <span className="bg-red-50 text-red-500 text-xs font-mono font-bold px-2 py-0.5 rounded-sm">
                                        {(apiWishlist?.length || 0)} item{(apiWishlist?.length || 0) !== 1 && 's'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsWishlistOpen(false)}
                                    className="text-[var(--color-teal)] hover:text-red-500 cursor-pointer p-1.5 transition-colors border-none bg-transparent"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4">
                                {(apiWishlist?.length || 0) === 0 ? (
                                    <div className="my-auto flex flex-col items-center gap-4 text-center py-10">
                                        <Heart size={48} className="text-[var(--color-border)] stroke-[1.25px]" />
                                        <p className="font-primary italic text-lg text-[var(--color-teal)]">Your wishlist is currently tranquil</p>
                                    </div>
                                ) : (
                                    (apiWishlist || []).map((item) => {
                                        const mappedProduct: Product = {
                                            id: item.productId,
                                            name: item.name,
                                            category: item.category,
                                            karat: item.karat || "18kt",
                                            image: item.image,
                                            tags: [],
                                        };
                                        return (
                                            <div key={item._id} className="flex gap-4 border border-[var(--color-border-subtle)] p-4 rounded-lg bg-[var(--color-bg-secondary)] relative group">
                                                <div className="w-18 h-22 bg-zinc-200 rounded-sm overflow-hidden shrink-0">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover object-center" />
                                                </div>

                                                <div className="flex-1 flex flex-col justify-between py-0.5">
                                                    <div>
                                                        <h5 className="font-primary text-sm font-semibold text-[var(--color-teal)]">{item.name}</h5>
                                                        <span className="font-secondary text-[10px] text-[var(--color-text-muted)] block">{item.category}</span>
                                                        <div className="font-mono text-xs font-bold text-[var(--color-teal)] mt-1.5">
                                                            ₹{item.price.toLocaleString("en-IN")}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            onClick={() => {
                                                                addToCart(mappedProduct);
                                                                toggleWishlist(mappedProduct);
                                                            }}
                                                            className="text-[10px] uppercase tracking-wider font-semibold font-secondary bg-[var(--color-teal)] text-white hover:bg-[var(--color-cream)] hover:text-[var(--color-teal)] py-1.5 px-3 rounded-sm transition-colors border-none cursor-pointer flex-1"
                                                        >
                                                            Move To Bag
                                                        </button>
                                                        <button
                                                            onClick={() => toggleWishlist(mappedProduct)}
                                                            className="text-[10px] uppercase tracking-wider font-semibold font-secondary border border-[var(--color-border)] text-red-500 hover:bg-red-50 py-1.5 px-3 rounded-sm transition-colors cursor-pointer bg-white"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* 11. AuthModal system hooks */}
            <AnimatePresence>
                {isAuthOpen && (
                    <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}