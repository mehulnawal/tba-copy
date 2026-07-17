import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Heart, ShoppingBag, Menu, X, ArrowRight, User,
} from "lucide-react";
import { useLenis } from "../providers/LenisProvider";
import logo from "../assets/logo/logo.png";
import { useGoldPrice } from "../hooks/useGoldPrice";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../hooks/useCart";
import { useAnnouncements } from "../hooks/useContent";

const CATEGORIES = [
  "All", "Rings", "Necklaces", "Earrings",
  "Bangles", "Pendants"
];

const SEARCH_SUGGESTIONS = [
  "Gold Rings", "Diamond Necklace", "22K Earrings", "Bridal Set", "Gold Bangles",
];

export default function Navbar({
  onSearchChange,
  activeCategory,
  onCategoryChange,
  onAuthOpen,
}: {
  onSearchChange: (query: string) => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onAuthOpen?: () => void;
}) {

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { data: cartData } = useCart(isAuthenticated);
  const { data: announcementData } = useAnnouncements();

  const cartCount = cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleAuthAction = () => {
    if (onAuthOpen) {
      onAuthOpen();
      return;
    }
    navigate("/auth");
  };

  const handleProtectedNav = (path: string) => {
    if (isAuthenticated) {
      navigate(path);
      return;
    }
    handleAuthAction();
  };

  const handleCategoryClick = (category: string) => {
    if (location.pathname === "/products") {
      // If already on the products page, change state instantly
      onCategoryChange(category);
    } else {
      navigate(`/products?category=${encodeURIComponent(category)}`);
    }
  };

  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();


  const displaySuggestions =
    searchQuery.trim().length >= 2
      ? SEARCH_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : SEARCH_SUGGESTIONS;

  useEffect(() => {
    if (isMobileMenuOpen) {
      lenis.stop();
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden"; // locks <html> too
    } else {
      lenis.start();
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      lenis.start();
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isMobileMenuOpen, lenis]);

  const { data: goldRates, isLoading: isGoldLoading, isError: isGoldError } = useGoldPrice();

  // ── GSAP Marquee ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAnnouncementVisible) return;
    const ctx = gsap.context(() => {
      gsap.to(".ticker-track", {
        x: "-50%",
        duration: 30,
        ease: "none",
        repeat: -1,
      });
    });
    return () => ctx.revert();
  }, [isAnnouncementVisible]);

  // ── Close dropdowns on outside click ──────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(e.target as Node)
      ) {
        setIsAccountDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Escape key closes mobile menu ─────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleDismissAnnouncement = () => {
    setIsAnnouncementVisible(false);
    sessionStorage.setItem("tba_ann_closed", "true");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    onSearchChange(suggestion);
    setIsSearchFocused(false);
    document
      .getElementById("featured-collection-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearchChange(e.target.value);
  };

  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null);

  const handleClearSearch = () => {
    setSearchQuery("");
    onSearchChange("");
  };

  const handleCategorySelect = (category: string) => {
    // 1. Trigger the smart redirection / state change logic you already wrote
    handleCategoryClick(category);

    // 2. Close the mobile drawer safely
    setIsMobileMenuOpen(false);

    // 3. Optional: Only attempt to scroll if the user is actually on the home/landing layout
    if (location.pathname !== "/products") {
      setTimeout(() => {
        document
          .getElementById("featured-collection-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100); // Small timeout gives the page a brief moment to process transitions
    }
  };

  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      setIsAccountDropdownOpen((prev) => !prev);
    } else {
      handleAuthAction();
    }
  };

  const handleLogoutAction = async () => {
    setIsAccountDropdownOpen(false);
    await logout();
    navigate("/");
  };


  const fallbackAnnouncements = [
    "✦ FREE SHIPPING ABOVE ₹25,000 ✦",
    "✦ BIS HALLMARKED JEWELRY ✦",
    "✦ LIFETIME EXCHANGE POLICY ✦",
    "✦ CERTIFIED PURE GOLD ✦",
    "✦ NO HIDDEN CHARGES ✦",
  ];

  const announcements =
    announcementData && announcementData.length > 0
      ? announcementData.map((item) => item.message)
      : fallbackAnnouncements;

  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    if (!isAnnouncementVisible) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % announcements.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isAnnouncementVisible, announcements.length]);

  return (

    // FIX: Outer wrapper is NOT sticky anymore — just a plain column flex
    <div className="w-full flex flex-col bg-[var(--color-bg)]">

      {/* ── NON-STICKY SECTION (scrolls away with page) ──────────────────── */}
      <div className="w-full">

        {/* ROW 1: ANNOUNCEMENT BAR */}
        <AnimatePresence>
          {isAnnouncementVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "var(--announcement-height)", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full bg-[var(--color-teal)] text-[var(--color-cream-light)] overflow-hidden relative flex items-center justify-center"
            >
              {/* Carousel Container */}
              <div className="w-full max-w-4xl mx-auto flex items-center justify-center px-12 h-full relative overflow-hidden">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={currentSlide}
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "-100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute font-secondary text-[11px] tracking-[0.25em] uppercase text-center select-none whitespace-nowrap"
                  >
                    {announcements[currentSlide]}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={handleDismissAnnouncement}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-teal)] cursor-pointer transition-colors p-1 bg-white rounded-full z-10"
                aria-label="Dismiss announcement"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ROW 2: GOLD PRICE BAR */}
        <div
          className="w-full bg-[var(--color-cream-light)] border-b border-[var(--color-border-subtle)] text-[var(--color-teal)] py-2"
          style={{ height: "var(--gold-bar-height)", minHeight: "var(--gold-bar-height)" }}
        >
          <div className="container h-full flex items-center justify-between font-secondary text-xs overflow-x-auto no-scrollbar gap-4">

            {/* Label */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="pulse-dot" />
              {/* FIX: Responsive label — short on mobile, full on sm+ */}
              <span className="font-semibold tracking-wider text-[11px] uppercase hidden sm:inline">
                Today's Live Gold Rate (Per Gram)
              </span>
              <span className="font-semibold tracking-wider text-[11px] uppercase sm:hidden">
                Live Rates
              </span>
            </div>

            {/* Rates */}
            <div className="flex items-center gap-2 md:gap-5 flex-wrap">
              {isGoldLoading ? (
                <div className="flex gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton w-14 h-3.5 rounded" />
                  ))}
                </div>
              ) : isGoldError || !goldRates ? (
                <span className="text-[11px] text-[var(--color-text-muted)] italic">
                  Rates temporarily unavailable
                </span>
              ) : (
                // FIX: On mobile only show 18K + 24K to avoid overflow.
                //      Show all 5 rates on md+.
                <div className="flex gap-3 md:gap-5 text-[12px] md:text-sm whitespace-nowrap">
                  <span className="tracking-wider">
                    9K: <strong className="font-mono">₹{goldRates?.["9K"]}</strong>
                  </span>
                  <span className="tracking-wider">
                    12K: <strong className="font-mono">₹{goldRates?.["12K"]}</strong>
                  </span>
                  <span className="tracking-wider">
                    14K: <strong className="font-mono">₹{goldRates?.["14K"]}</strong>
                  </span>
                  {/* <span className="tracking-wider">
                    18K: <strong className="font-mono">₹{goldRates["18K"]}</strong>
                  </span> */}
                  {/* <span className="tracking-wider hidden sm:inline">
                    22K: <strong className="font-mono">₹{goldRates["22K"]}</strong>
                  </span>
                  <span className="bg-[var(--color-teal)] text-white px-2 py-0.5 rounded-sm text-[9px] tracking-wider">
                    24K: ₹{goldRates["24K"]}
                  </span> */}
                </div>
              )}

              {goldRates?.updatedAt && (
                <span className="text-[12px] text-[var(--color-text-muted)] shrink-0 hidden lg:inline">
                  Updated:{" "}
                  {new Date(goldRates.updatedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      <div className="sticky top-0 z-[var(--z-sticky)] w-full">

        {/* ROW 3: MAIN NAVIGATION BAR */}
        <div
          className="w-full bg-[var(--color-white)] border-b border-[var(--color-border-subtle)] shadow-sm"
          style={{ height: "var(--navbar-height)" }}
        >
          <div className="container h-full flex items-center justify-between">

            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-[var(--color-teal)] hover:text-[var(--color-teal-light)] transition-colors p-1 cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu size={22} />
              </button>

              <a href="/" className="flex items-center select-none shrink-0" aria-label="Home">
                <img
                  src={logo}
                  alt="TBA"
                  className="w-24 sm:w-28 md:w-32 lg:w-36 h-auto object-contain"
                />
              </a>
            </div>

            {/* Center: Desktop Search */}
            <div
              ref={searchContainerRef}
              className="hidden lg:block relative w-[400px] xl:w-[480px]"
            >
              <div
                className={`flex items-center gap-2 bg-[var(--color-bg-secondary)] border rounded-full px-4 py-2 transition-all duration-200 ${isSearchFocused
                  ? "border-[var(--color-teal)] shadow-[0_0_0_3px_rgba(28,59,72,0.08)]"
                  : "border-[var(--color-border)]"
                  }`}
              >
                <Search size={15} className="text-[var(--color-text-muted)] shrink-0" />
                <input
                  type="text"
                  placeholder="Search rings, necklaces, bangles..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full bg-transparent border-none outline-none text-sm text-[var(--color-text)] font-secondary placeholder:text-[var(--color-text-muted)]"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors cursor-pointer shrink-0"
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {isSearchFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-[110%] left-0 right-0 bg-[var(--color-white)] rounded-lg shadow-lg border border-[var(--color-border-subtle)] py-3 overflow-hidden z-[var(--z-dropdown)]"
                  >
                    <p className="px-4 py-1 text-[10px] text-[var(--color-text-muted)] font-secondary uppercase tracking-wider">
                      {searchQuery.trim().length >= 2 ? "Suggestions" : "Popular Searches"}
                    </p>
                    <div className="flex flex-col mt-1">
                      {displaySuggestions.length > 0 ? (
                        displaySuggestions.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => handleSuggestionClick(item)}
                            className="flex items-center justify-between text-left px-4 py-2.5 hover:bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text-secondary)] font-secondary transition-colors cursor-pointer w-full bg-transparent border-none"
                          >
                            <span className="flex items-center gap-2">
                              <Search size={13} className="text-[var(--color-text-muted)]" />
                              {item}
                            </span>
                            <ArrowRight size={11} className="text-[var(--color-text-muted)]" />
                          </button>
                        ))
                      ) : (
                        <p className="px-4 py-4 text-center text-sm text-[var(--color-text-muted)] italic">
                          No results found
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Icon Actions */}
            <div className="flex items-center gap-2 sm:gap-4 md:gap-6 text-[var(--color-text)]">
              <button
                onClick={() => handleProtectedNav("/wishlist")}
                className="hover:text-[var(--color-text-muted)] transition-colors p-1.5 cursor-pointer bg-transparent border-none relative"
              >
                <Heart size={18} className="sm:w-[20px] sm:h-[20px]" />
              </button>
              <button
                onClick={() => handleProtectedNav("/cart")}
                className="hover:text-[var(--color-text-muted)] transition-colors p-1.5 cursor-pointer bg-transparent border-none relative"
              >
                <ShoppingBag size={18} className="sm:w-[20px] sm:h-[20px]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[var(--color-teal)] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Account Dropdown Context Wrapper */}
              <div ref={accountDropdownRef} className="relative flex items-center">
                <button
                  onClick={handleUserButtonClick}
                  className="hover:text-[var(--color-text-muted)] transition-colors p-1.5 cursor-pointer bg-transparent border-none relative flex items-center"
                >
                  <User size={18} className="sm:w-[20px] sm:h-[20px]" />
                  {isAuthenticated && (
                    <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[var(--color-teal)] rounded-full border border-[var(--color-white)]" />
                  )}
                </button>

                <AnimatePresence>
                  {isAccountDropdownOpen && isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-[115%] right-0 bg-[var(--color-white)] shadow-lg border border-[var(--color-border-subtle)] min-w-[160px] py-1.5 z-[var(--z-dropdown)] flex flex-col"
                    >
                      <button
                        onClick={() => {
                          setIsAccountDropdownOpen(false);
                          navigate("/account");
                        }}
                        className="text-left px-4 py-2 hover:bg-[var(--color-bg-secondary)] text-xs uppercase tracking-wider font-secondary text-[var(--color-text)] transition-colors cursor-pointer bg-transparent border-none w-full"
                      >
                        My Account
                      </button>

                      <button
                        onClick={handleLogoutAction}
                        className="text-left px-4 py-2 hover:bg-[var(--color-bg-secondary)] text-xs uppercase tracking-wider font-secondary text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors cursor-pointer bg-transparent border-none w-full border-t border-[var(--color-border-subtle)]"
                      >
                        Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 4: CATEGORY BAR — Desktop only */}
        <div
          className="hidden lg:flex w-full bg-[var(--color-white)] border-b border-[var(--color-border-subtle)]"
          style={{ height: "var(--category-bar-height)" }}
        >
          <div className="container h-full flex items-center justify-center">
            <nav className="flex gap-7 xl:gap-8 items-center font-secondary text-[11px] tracking-[0.12em] uppercase">
              {CATEGORIES.map((category) => {
                const isActive = activeCategory === category;
                return (
                  // 1. Loop ke andar aapka clean optimized button element:
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`font-secondary text-[11px] uppercase tracking-[0.2em] transition-all duration-300 relative py-2 cursor-pointer bg-transparent border-none outline-none group ${activeCategory === category
                      ? "text-[var(--color-text)] font-semibold"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                      }`}
                  >
                    <span className="relative z-10">{category}</span>

                    {/* A. ACTUAL ACTIVE UNDERLINE: Yeh click hone par smoothly slide karegi */}
                    {activeCategory === category && (
                      <motion.div
                        layoutId="navbar-category-indicator"
                        className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[var(--color-teal)] rounded-full z-20"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    {/* B. HOVER UNDERLINE: Pure CSS Tailwind 'group-hover'. Koi line lag ya fading issue nahi */}
                    {activeCategory !== category && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[var(--color-teal)] opacity-0 scale-x-0 group-hover:opacity-50 group-hover:scale-x-100 transition-all duration-300 ease-out origin-center rounded-full z-10" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* MOBILE SEARCH BAR — inside sticky so it stays visible */}
        <div className="lg:hidden w-full bg-[var(--color-white)] border-b border-[var(--color-border-subtle)] py-2">
          <div className="container">
            <div className="flex items-center gap-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-full px-3 py-1.5">
              <Search size={13} className="text-[var(--color-text-muted)] shrink-0" />
              <input
                type="text"
                placeholder="Search jewelry..."
                value={searchQuery}
                onChange={handleInputChange}
                className="w-full bg-transparent border-none outline-none text-xs text-[var(--color-text)] font-secondary placeholder:text-[var(--color-text-muted)]"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors cursor-pointer shrink-0"
                  aria-label="Clear"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE MENU OVERLAY ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[var(--z-overlay)]"
              aria-hidden="true"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-[340px] bg-[var(--color-teal)] z-[var(--z-overlay)] overflow-y-auto overscroll-contain"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="flex flex-col min-h-full p-6 sm:p-8">

                <div className="flex justify-between items-center mb-10">
                  <span className="font-primary text-xl text-[var(--color-cream)] font-semibold tracking-wider">
                    Menu
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-[var(--color-cream)] hover:text-white cursor-pointer transition-colors p-1"
                    aria-label="Close menu"
                  >
                    <X size={22} />
                  </button>
                </div>

                <nav className="flex flex-col flex-1">
                  {CATEGORIES.map((category, index) => (
                    <motion.button
                      key={category}
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.04, duration: 0.3 }}
                      onClick={() => handleCategorySelect(category)}
                      className={`text-left font-primary font-medium text-2xl sm:text-3xl py-3 border-b border-white/10 cursor-pointer bg-transparent border-l-0 border-r-0 border-t-0 transition-all duration-200 ${activeCategory === category
                        ? "text-white pl-2"
                        : "text-[var(--color-cream)] hover:text-white hover:pl-2"
                        }`}
                    >
                      {category}
                    </motion.button>
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}