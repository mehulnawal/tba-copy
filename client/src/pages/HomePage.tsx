import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PRODUCT_ASSETS, HERO_ASSETS, PRIME_ASSETS, AVATAR_ASSETS } from "../constants/assets";
import { Product, PrimeLook, PrimeHotspot, FAQ, Testimonial } from "../types";
import { useGoldPrice } from "../hooks/useGoldPrice";
import FloatingButtons from "../components/FloatingButtons";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import useEmblaCarousel from 'embla-carousel-react';

import banner1 from '../assets/banner/banner1.webp'
import banner2 from '../assets/banner/banner2.webp'
import banner3 from '../assets/banner/banner3.webp'

// import { useLenis } from "../providers/LenisProvider";

import {
    ChevronLeft,
    ChevronRight,
    Heart,
    ShoppingBag,
    X,
    Plus,
    Minus,
    Shield,
    RefreshCw,
    Award,
    TrendingUp,
    Star,
    Trash2,
    CheckCircle2,
    Sparkles,
    ShoppingBag as BagIcon,
    MapPin,
    Mail,
    Phone,
    ArrowRight
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
import { productToCartPayload, productToWishlistPayload } from "../utils/productHelpers";
import { ApiRequestError } from "../api/client";


gsap.registerPlugin(ScrollTrigger);

const FEATURED_PRODUCTS: Product[] = [
    { id: "1", name: "Sia Gold Ring", category: "Rings", karat: "18K", image: PRODUCT_ASSETS.p1, tags: ["NEW", "HOT"] },
    { id: "2", name: "Elvira Necklace", category: "Necklaces", karat: "22K", image: PRODUCT_ASSETS.p2, tags: ["BESTSELLER"], couponTag: "SAVE10" },
    { id: "3", name: "Zara Earrings", category: "Earrings", karat: "14K", image: PRODUCT_ASSETS.p3, tags: ["NEW"] },
    { id: "4", name: "Aria Bracelet", category: "Bracelets", karat: "18K", image: PRODUCT_ASSETS.p4, tags: ["HOT"] },
    { id: "5", name: "Celeste Ring", category: "Rings", karat: "22K", image: PRODUCT_ASSETS.p5, tags: ["BESTSELLER"] },
    { id: "6", name: "Mira Pendant", category: "Necklaces", karat: "18K", image: PRODUCT_ASSETS.p6, tags: ["NEW"], couponTag: "FLAT500" },
];

const HERO_SLIDES = [
    {
        id: "1",
        image: banner1,
        mobileImage: banner1
    },
    {
        id: "2",
        image: banner2,
        mobileImage: banner2
    },
    {
        id: "3",
        image: banner3,
        mobileImage: banner3
    },
];

const PRIME_LOOKS: PrimeLook[] = [
    {
        id: "1",
        image: PRIME_ASSETS.look1,
        hotspots: [
            { id: "h1", x: 42, y: 28, product: { id: "1", name: "Sia Gold Ring", karat: "18K", image: PRODUCT_ASSETS.p1 } },
            { id: "h2", x: 58, y: 60, product: { id: "2", name: "Elvira Necklace", karat: "22K", image: PRODUCT_ASSETS.p2 } },
        ]
    },
    {
        id: "2",
        image: PRIME_ASSETS.look2,
        hotspots: [
            { id: "h3", x: 35, y: 32, product: { id: "4", name: "Aria Bracelet", karat: "18K", image: PRODUCT_ASSETS.p4 } },
            { id: "h4", x: 62, y: 48, product: { id: "3", name: "Zara Earrings", karat: "14K", image: PRODUCT_ASSETS.p3 } },
        ]
    },
    {
        id: "3",
        image: PRIME_ASSETS.look3,
        hotspots: [
            { id: "h5", x: 48, y: 22, product: { id: "5", name: "Celeste Ring", karat: "22K", image: PRODUCT_ASSETS.p5 } },
            { id: "h6", x: 38, y: 68, product: { id: "6", name: "Mira Pendant", karat: "18K", image: PRODUCT_ASSETS.p6 } },
        ]
    },
];

const TESTIMONIALS: Testimonial[] = [
    {
        id: "1", name: "Priya Mehta", location: "Mumbai", rating: 5, avatar: AVATAR_ASSETS.a1,
        review: "TBA's craftsmanship is unmatched. The 22K necklace for my daughter's wedding was breathtaking — every detail perfect."
    },
    {
        id: "2", name: "Rajan Shah", location: "Surat", rating: 5, avatar: AVATAR_ASSETS.a2,
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


interface CartItem {
    product: Product;
    quantity: number;
}

export default function HomePage() {
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");


    // const lenis = useLenis();

    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);

    const [activeSlide, setActiveSlide] = useState(0);
    const [isHoveringHero, setIsHoveringHero] = useState(false);

    const [currentLookIndex, setCurrentLookIndex] = useState(0);
    const [selectedHotspot, setSelectedHotspot] = useState<PrimeHotspot | null>(null);
    const [isPrimeModalOpen, setIsPrimeModalOpen] = useState(false);

    const [testimonialIndex, setTestimonialIndex] = useState(0);
    const [faqOpenId, setFaqOpenId] = useState<string | null>(null);

    const { data: goldRates } = useGoldPrice();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const { data: bannerData } = useBanners();
    const { data: apiCart } = useCart(isAuthenticated);
    const { data: apiWishlist } = useWishlist(isAuthenticated);
    const addToCartMutation = useAddToCart();
    const addToWishlistMutation = useAddToWishlist();
    const removeFromWishlistMutation = useRemoveFromWishlist();

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


    // useEffect(() => {
    //     const ctx = gsap.context(() => {

    //         gsap.utils.toArray<HTMLElement>(".reveal-section").forEach((section) => {
    //             gsap.fromTo(section,
    //                 { y: 50, opacity: 0 },
    //                 {
    //                     y: 0,
    //                     opacity: 1,
    //                     duration: 1,
    //                     ease: "power2.out",
    //                     scrollTrigger: {
    //                         trigger: section,
    //                         start: "top 85%",
    //                         toggleActions: "play none none none"
    //                     }
    //                 }
    //             );
    //         });

    //         gsap.fromTo(`.hero-slide-${activeSlide} img`,
    //             { scale: 1.08 },
    //             { scale: 1, duration: 2.5, ease: "power2.out" }
    //         );
    //     });
    //     return () => ctx.revert();
    // }, [activeSlide]);

    // Autoplay Hero banner timers

    useEffect(() => {
        if (isHoveringHero) return;
        const interval = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5500);
        return () => clearInterval(interval);
    }, [isHoveringHero, heroSlides.length]);

    // Escape keys listeners to close popups
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsPrimeModalOpen(false);
                setIsWishlistOpen(false);
                setShowCheckoutSuccess(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Update body scroll blocking depending on modals status
    useEffect(() => {
        const shouldLock = isPrimeModalOpen || isWishlistOpen || showCheckoutSuccess || isAuthOpen;

        if (shouldLock) {
            // If you use Lenis scroll provider, uncomment the line below:
            // lenis.stop();
            document.body.style.overflow = "hidden";
            document.body.classList.add("modal-open");
        } else {
            // If you use Lenis scroll provider, uncomment the line below:
            // lenis.start();
            document.body.style.overflow = "unset";
            document.body.classList.remove("modal-open");
        }

        return () => {
            document.body.style.overflow = "unset";
            document.body.classList.remove("modal-open");
        };
    }, [isPrimeModalOpen, isWishlistOpen, showCheckoutSuccess, isAuthOpen]);

    // Hero navigate handlers
    const nextHeroSlide = () => {
        setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    };
    const prevHeroSlide = () => {
        setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    };

    // Filtered jewelry products collection
    const filteredProducts = FEATURED_PRODUCTS.filter((p) => {
        const matchesCategory = activeCategory === "All" || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.karat.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Calculate pricing estimates of a specific product using its Karat multiplier
    const getProductPrice = (product: Product) => {
        const defaultWeights: { [key: string]: number } = {
            "Rings": 4.5,
            "Necklaces": 32,
            "Earrings": 8.2,
            "Bracelets": 15.5,
        };

        const weight = defaultWeights[product.category] || 10;
        let baseGramRate = 6000; // Safe standard state rates

        if (goldRates) {
            const k = product.karat as keyof typeof goldRates;
            const rateValue = goldRates[k];
            if (typeof rateValue === "number") baseGramRate = rateValue;
        } else {
            // General backup mapping
            if (product.karat === "14K") baseGramRate = 3800;
            else if (product.karat === "18K") baseGramRate = 4900;
            else if (product.karat === "22K") baseGramRate = 5900;
            else if (product.karat === "24K") baseGramRate = 6500;
        }

        const rawGoldValue = baseGramRate * weight;
        const makingCharges = rawGoldValue * 0.12; // 12% craftsmanship
        const gstAndInsurance = (rawGoldValue + makingCharges) * 0.03; // tax levies
        return Math.round(rawGoldValue + makingCharges + gstAndInsurance);
    };

    // Shopping Ops Cart / Wishlist Actions
    const addToCart = async (product: Product) => {
        if (!isAuthenticated) {
            setIsAuthOpen(true);
            return;
        }

        const price = getProductPrice(product);

        try {
            await addToCartMutation.mutateAsync(productToCartPayload(product, price));
            showToast("Added to cart", "success");
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

        const price = getProductPrice(product);
        const isInWishlist = apiWishlist?.some((item) => item.productId === product.id);

        try {
            if (isInWishlist) {
                await removeFromWishlistMutation.mutateAsync(product.id);
                showToast("Removed from wishlist", "success");
            } else {
                await addToWishlistMutation.mutateAsync(productToWishlistPayload(product, price));
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

    // Prime look switching
    const handleLookChange = (index: number) => {
        setCurrentLookIndex(index);
    };

    const openHotspotModal = (hotspot: PrimeHotspot) => {
        setSelectedHotspot(hotspot);
        setIsPrimeModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg)] flex flex-col relative antialiased selection:bg-[var(--color-cream)] selection:text-[var(--color-teal)]">

            {/* GLOBAL HEADINGS & HEADER SYSTEM */}
            <Navbar
                onSearchChange={setSearchQuery}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                onAuthOpen={() => setIsAuthOpen(true)}
            />

            <main className="flex-1 w-full flex flex-col gap-0">

                {/* Banner */}
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

                            {/* SLIDES */}
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
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            objectPosition: "left center",
                                            display: "block",
                                            pointerEvents: "none",
                                        }}
                                    />
                                </div>
                            ))}

                            {/* Slide indicator lines */}
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: 20,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    zIndex: 10,
                                }}
                            >
                                {heroSlides.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveSlide(i)}
                                        aria-label={`Go to slide ${i + 1}`}
                                        style={{
                                            background: "transparent",
                                            border: "none",
                                            padding: "6px 2px",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <span
                                            style={{
                                                display: "block",
                                                height: 2,
                                                borderRadius: 2,
                                                transition: "width 500ms ease, background-color 500ms ease",
                                                width: i === activeSlide ? 40 : 14,
                                                backgroundColor:
                                                    i === activeSlide
                                                        ? "rgba(255,255,255,1)"
                                                        : "rgba(255,255,255,0.35)",
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* buttons */}
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: 16,
                                    left: 20,
                                    display: "flex",
                                    gap: 10,
                                    zIndex: 10,
                                }}
                            >
                                <button
                                    onClick={prevHeroSlide}
                                    aria-label="Previous slide"
                                    style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: "50%",
                                        border: "1px solid rgba(255,255,255,0.3)",
                                        background: "rgba(0,0,0,0.15)",
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        backdropFilter: "blur(4px)",
                                        transition: "background 300ms, color 300ms",
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = "white";
                                        e.currentTarget.style.color = "var(--color-teal)";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = "rgba(0,0,0,0.15)";
                                        e.currentTarget.style.color = "white";
                                    }}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={nextHeroSlide}
                                    aria-label="Next slide"
                                    style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: "50%",
                                        border: "1px solid rgba(255,255,255,0.3)",
                                        background: "rgba(0,0,0,0.15)",
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        backdropFilter: "blur(4px)",
                                        transition: "background 300ms, color 300ms",
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = "white";
                                        e.currentTarget.style.color = "var(--color-teal)";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = "rgba(0,0,0,0.15)";
                                        e.currentTarget.style.color = "white";
                                    }}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Prime collection */}
                <PrimeSelection />

                {/* Best Seller */}
                <section className="reveal-section py-3 bg-[var(--color-bg)]" id="collection-grid">
                    <div className="container">

                        {/* Section Title Header */}
                        <div className="flex flex-col items-center mb-16 text-center">
                            <span className="section-label">Selected Statement Masterpieces</span>
                            <h2 className="font-primary text-3xl md:text-4xl text-[var(--color-text)] tracking-wide font-light">
                                The Best Seller Showcase
                            </h2>
                            <div className="w-12 h-[1px] bg-[var(--color-cream)] mt-4" />
                        </div>

                        {/* Embla Carousel Wrapper */}
                        <BestSellerCarousel
                            filteredProducts={filteredProducts}
                            isProductInWishlist={isProductInWishlist}
                            getProductPrice={getProductPrice}
                            isLoggedIn={isAuthenticated}
                            setIsAuthOpen={setIsAuthOpen}
                            toggleWishlist={toggleWishlist}
                            addToCart={addToCart}
                        />

                    </div>
                </section>


                {/* Why Choose Us */}
                <BrandPromise />

                {/* Testimonials  */}
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
                                        {Array.from({ length: TESTIMONIALS[testimonialIndex].rating }).map((_, i) => (
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

                            {/* Side cards preview fading boundaries (visual mockup layers) */}
                            <div className="absolute right-[-2.5%] top-4 bottom-4 w-4 bg-[var(--color-cream-light)] rounded-r-2xl border-y border-r border-[var(--color-border-subtle)] opacity-40 -z-1 hidden lg:block" />
                            <div className="absolute left-[-2.5%] top-4 bottom-4 w-4 bg-[var(--color-cream-light)] rounded-l-2xl border-y border-l border-[var(--color-border-subtle)] opacity-40 -z-1 hidden lg:block" />

                        </div>

                        <div className="flex items-center gap-5 reveal-section">
                            <button
                                onClick={() => setTestimonialIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                                className="w-11 h-11 rounded-full bg-white border border-[var(--color-border)] text-[var(--color-teal)] hover:bg-[var(--color-teal)] hover:text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                                aria-label="Previous Testimonial"
                                id="testimonial-btn-prev"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {/* Dots active metrics */}
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
                                className="w-11 h-11 rounded-full bg-white border border-[var(--color-border)] text-[var(--color-teal)] hover:bg-[var(--color-teal)] hover:text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                                aria-label="Next Testimonial"
                                id="testimonial-btn-next"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </section >

                {/* FAQS */}
                <section className="section-padding bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-subtle)]" id="faq-section" >
                    <div className="container max-w-4xl flex flex-col gap-10">

                        {/* Titles headings */}
                        <div className="text-center reveal-section">
                            {/* <span className="section-label">Got Questions?</span> */}
                            <h2 className="text-4xl md:text-5xl font-primary text-[var(--color-teal)] font-normal tracking-wide">
                                Top Customer Questions
                            </h2>
                        </div>

                        {/* Accordions container list */}
                        <div className="w-full flex flex-col gap-3 reveal-section">
                            {FAQS.map((faq) => {
                                const isOpen = faqOpenId === faq.id;
                                return (
                                    <div
                                        key={faq.id}
                                        className="bg-[var(--color-white)] rounded-lg border border-[var(--color-border)] overflow-hidden transition-all duration-300 shadow-xs"
                                    >
                                        <button
                                            onClick={() => setFaqOpenId(isOpen ? null : faq.id)}
                                            className="w-full flex justify-between items-center px-6 py-5 bg-transparent border-none text-left cursor-pointer transition-all duration-200"
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

                                        {/* Animated heights drawers */}
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
                </section >

                {/* Visit store */}
                <VisitStore />

                {/* Footer */}
                <Footer onCategoryChange={setActiveCategory} />

            </main >


            {/* Floating buttons */}
            <FloatingButtons />

            {/* Wishlist drawer */}
            <AnimatePresence>
                {isWishlistOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsWishlistOpen(false)}
                            className="fixed inset-0 bg-black/60 z-[var(--z-overlay)] cursor-pointer"
                        />

                        {/* Wishlist Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="fixed top-0 right-0 bottom-0 w-full md:w-[450px] bg-white z-[var(--z-overlay)] flex flex-col border-l border-[var(--color-border-subtle)] shadow-xl"
                            id="wishlist-drawer"
                        >
                            {/* Header */}
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

                            {/* Items Panel */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar flex flex-col gap-4">
                                {(apiWishlist?.length || 0) === 0 ? (
                                    <div className="my-auto flex flex-col items-center gap-4 text-center py-10">
                                        <Heart size={48} className="text-[var(--color-border)] stroke-[1.25px]" />
                                        <p className="font-primary italic text-lg text-[var(--color-teal)]">Your wishlist is currently tranquil</p>
                                        <button
                                            onClick={() => {
                                                setIsWishlistOpen(false);
                                                const collectionsSec = document.getElementById("featured-collection-section");
                                                if (collectionsSec) collectionsSec.scrollIntoView({ behavior: "smooth" });
                                            }}
                                            className="bg-[var(--color-teal)] text-white hover:bg-[var(--color-cream)] hover:text-[var(--color-teal)] font-secondary text-[11px] font-bold tracking-widest uppercase py-3.5 px-8 rounded-sm cursor-pointer transition-colors border-none"
                                        >
                                            Explore Jewels
                                        </button>
                                    </div>
                                ) : (
                                    (apiWishlist || []).map((item) => {
                                        const mappedProduct: Product = {
                                            id: item.productId,
                                            name: item.name,
                                            category: item.category,
                                            karat: "",
                                            image: item.image,
                                            tags: [],
                                        };
                                        const priceEst = item.price;
                                        return (
                                            <div
                                                key={item._id}
                                                className="flex gap-4 border border-[var(--color-border-subtle)] p-4 rounded-lg bg-[var(--color-bg-secondary)] shadow-2xs relative group"
                                            >
                                                {/* Image aspect */}
                                                <div className="w-18 h-22 bg-zinc-200 rounded-sm overflow-hidden shrink-0">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover object-center"
                                                    />
                                                </div>

                                                {/* Title weights */}
                                                <div className="flex-1 flex flex-col justify-between py-0.5">
                                                    <div>
                                                        <h5 className="font-primary text-sm font-semibold text-[var(--color-teal)]">{item.name}</h5>
                                                        <span className="font-secondary text-[10px] text-[var(--color-text-muted)] block">
                                                            {item.category}
                                                        </span>
                                                        <div className="font-mono text-xs font-bold text-[var(--color-teal)] mt-1.5">
                                                            ₹{priceEst.toLocaleString("en-IN")}
                                                        </div>
                                                    </div>

                                                    {/* Actions button */}
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            onClick={() => {
                                                                addToCart(mappedProduct);
                                                                toggleWishlist(mappedProduct);
                                                            }}
                                                            className="text-[10px] uppercase tracking-wider font-semibold font-secondary bg-[var(--color-teal)] text-white hover:bg-[var(--color-cream)] hover:text-[var(--color-teal)] py-1.5 px-3 rounded-sm transition-colors border-none cursor-pointer flex-1 text-center"
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

            {/* DYNAMIC CHECKOUT SUCCESS POPUP MODAL */}
            <AnimatePresence>
                {showCheckoutSuccess && (
                    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCheckoutSuccess(false)}
                            className="absolute inset-0 bg-black/60 cursor-pointer"
                        />

                        {/* Success Box Body */}
                        <motion.div
                            initial={{ scale: 0.94, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.94, opacity: 0, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                            className="relative bg-white rounded-xl shadow-2xl p-8 max-w-[420px] w-[90%] text-center flex flex-col items-center gap-4 z-10"
                            id="checkout-success-popup"
                        >
                            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2">
                                <CheckCircle2 size={36} className="stroke-[1.5px]" />
                            </div>

                            <h4 className="font-primary text-2xl font-bold text-[var(--color-teal)] leading-none">
                                Atelier Acquired
                            </h4>

                            <p className="font-secondary text-xs text-[var(--color-text-muted)] leading-relaxed max-w-[280px]">
                                Your jewelry reservation has been filed with TBA — The Brilliance Atelier. Our certified secure gateway has generated order receipt {`#TBA-${Math.floor(Math.random() * 900000 + 100000)}`}.
                            </p>

                            <div className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] p-4 rounded-lg my-2 text-left font-secondary text-xs text-[var(--color-text-secondary)] flex flex-col gap-2">
                                <div className="flex justify-between">
                                    <span className="text-[var(--color-text-muted)]">Reservation status:</span>
                                    <span className="font-bold text-emerald-600">INSURED PENDING</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--color-text-muted)]">Atelier address:</span>
                                    <span>Surat main depository</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--color-text-muted)]">Client dispatch:</span>
                                    <span>5-7 business days</span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setShowCheckoutSuccess(false);
                                }}
                                className="w-full bg-[var(--color-teal)] hover:bg-[var(--color-cream)] text-white hover:text-[var(--color-teal)] font-secondary text-xs uppercase tracking-widest font-bold py-3.5 rounded-sm transition-colors border-none cursor-pointer mt-4"
                            >
                                Conclude Transaction
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isAuthOpen && (
                    <AuthModal
                        isOpen={isAuthOpen}
                        onClose={() => setIsAuthOpen(false)}
                    />
                )}
            </AnimatePresence>

        </div >
    );
}