import React, { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  User,
  ChevronDown,
} from "lucide-react";
import { useLenis } from "../providers/LenisProvider";
import logo from "../assets/logo/logo.png";
import { useMetalRates } from "../hooks/useMetalRates";
import { useCategories } from "../hooks/useCategories";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../hooks/useCart";
import { useAnnouncements } from "../hooks/useContent";

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

  const cartCount =
    cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

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
    if (category === "Gold") { navigate("/gold-jewellery"); return; }
    if (category === "Silver") { navigate("/silver-jewellery"); return; }
    if (location.pathname === "/products") {
      onCategoryChange(category);
    } else {
      navigate(
        category === "All"
          ? "/products"
          : `/products?category=${encodeURIComponent(category)}`
      );
    }
  };

  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Mobile Accordion States
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({
    Gold: false,
    Silver: false,
  });

  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  const toggleMobileAccordion = (title: string) => {
    setMobileExpanded((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      lenis.stop();
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
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

  const { data: categories } = useCategories();
  const navStructure = useMemo(() => {
    if (!categories) return [];
    return categories.filter((category) => !category.parent && category.isActive).map((main) => ({
      title: main.name, hasDropdown: true, categoryId: main._id, path: undefined,
      categories: ["All", ...categories.filter((category) => {
        const parentId = typeof category.parent === "string" ? category.parent : category.parent?._id;
        return parentId === main._id && category.isActive;
      }).sort((a, b) => a.displayOrder - b.displayOrder).map((subcategory) => subcategory.name)],
    }));
  }, [categories]);
  const {
    data: metalRates,
    isLoading: isMetalLoading,
    isError: isMetalError,
  } = useMetalRates();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearchChange(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onSearchChange("");
  };

  const handleCategorySelect = (category: string) => {
    handleCategoryClick(category);
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);

    if (location.pathname !== "/products") {
      setTimeout(() => {
        document
          .getElementById("featured-collection-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
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
    <div className="w-full flex flex-col bg-[var(--color-bg)]">
      {/* ── NON-STICKY SECTION (Announcement & Gold Bar) ────────────────── */}
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
          style={{
            height: "var(--gold-bar-height)",
            minHeight: "var(--gold-bar-height)",
          }}
        >
          <div className="container h-full flex items-center justify-between font-secondary text-xs overflow-x-auto no-scrollbar gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 shrink-0">
              <span className="pulse-dot" />
              <span className="font-semibold tracking-wider text-[11px] uppercase hidden sm:inline">
                Today's Live Gold Rate (Per Gram)
              </span>
              <span className="font-semibold tracking-wider text-[11px] uppercase sm:hidden">
                Live Rates
              </span>
            </div>

            <div className="flex items-center gap-2 md:gap-5 flex-wrap">
              {isMetalLoading ? (
                <div className="flex gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton w-14 h-3.5 rounded" />
                  ))}
                </div>
              ) : isMetalError || !metalRates ? (
                <span className="text-[11px] text-[var(--color-text-muted)] italic">
                  Rates temporarily unavailable
                </span>
              ) : (
                <div className="flex gap-3 md:gap-5 text-[12px] md:text-sm whitespace-nowrap">
                  <span className="tracking-wider">
                    Gold 24K: <strong className="font-mono">₹{metalRates?.gold24kt}</strong>
                  </span>
                  <span className="tracking-wider">
                    Silver: <strong className="font-mono">₹{metalRates?.silver}</strong>
                  </span>
                </div>
              )}

              {metalRates?.updatedAt && (
                <span className="text-[12px] text-[var(--color-text-muted)] shrink-0 hidden lg:inline">
                  Updated:{" "}
                  {new Date(metalRates.updatedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY SINGLE-ROW MAIN NAVBAR ───────────────────────────────── */}
      <div className="sticky top-0 z-[var(--z-sticky)] w-full">
        <div
          className="w-full bg-[var(--color-white)] border-b border-[var(--color-border-subtle)] shadow-sm"
          style={{ height: "var(--navbar-height)" }}
        >
          {/* 3-Column Layout Grid for Balanced Symmetry */}
          <div className="container h-full px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-3 items-center">

            {/* Left Column: Mobile Hamburger & Logo (Padded & Balanced) */}
            <div className="flex items-center gap-4 justify-start">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-[var(--color-text)] hover:text-[var(--color-teal)] transition-colors duration-200 p-1 cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu size={22} />
              </button>

              <a
                href="/"
                className="flex items-center select-none transition-opacity duration-200 hover:opacity-90"
                aria-label="Home"
              >
                <img
                  src={logo}
                  alt="TBA"
                  className="w-24 sm:w-28 md:w-32 lg:w-36 h-auto object-contain"
                />
              </a>
            </div>

            {/* Center Column: Desktop Integrated Navigation Links (Centered) */}
            <nav className="hidden lg:flex items-center justify-center gap-7 xl:gap-9 h-full">
              {navStructure.map((item) => {
                if (item.hasDropdown) {
                  return (
                    <div
                      key={item.title}
                      className="relative h-full flex items-center"
                      onMouseEnter={() => setActiveDropdown(item.title)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <button
                        className="font-secondary text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--color-text)] hover:text-[var(--color-teal)] transition-colors duration-200 relative py-2 cursor-pointer bg-transparent border-none outline-none group flex items-center gap-1.5"
                      >
                        <span className="relative z-10">{item.title}</span>
                        <ChevronDown
                          size={13}
                          className={`transition-transform duration-200 ${activeDropdown === item.title ? "rotate-180 text-[var(--color-teal)]" : "text-[var(--color-text-muted)]"
                            }`}
                        />

                        {/* Premium Underline Hover Transition */}
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-teal)] opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 transition-all duration-300 ease-out origin-center rounded-full z-10" />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeDropdown === item.title && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="absolute top-[85%] left-1/2 -translate-x-1/2 w-48 bg-[var(--color-white)] shadow-xl border border-[var(--color-border-subtle)] py-2 z-[var(--z-dropdown)] rounded-b-md"
                          >
                            {item.categories?.map((category) => {
                              const isActive = activeCategory === category;
                              return (
                                <button
                                  key={category}
                                  onClick={() => handleCategorySelect(category)}
                                  className={`w-full text-left px-4 py-2 text-xs font-medium uppercase tracking-wider font-secondary transition-colors cursor-pointer bg-transparent border-none flex items-center justify-between ${isActive
                                    ? "text-[var(--color-teal)] font-semibold bg-[var(--color-bg-secondary)]"
                                    : "text-[var(--color-text)] hover:text-[var(--color-teal)] hover:bg-[var(--color-bg-secondary)]"
                                    }`}
                                >
                                  <span>{category}</span>
                                  {isActive && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-teal)]" />
                                  )}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.title}
                    onClick={() => item.path && navigate(item.path)}
                    className="font-secondary text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--color-text)] hover:text-[var(--color-teal)] transition-colors duration-200 relative py-2 cursor-pointer bg-transparent border-none outline-none group"
                  >
                    <span className="relative z-10">{item.title}</span>
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-teal)] opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 transition-all duration-300 ease-out origin-center rounded-full z-10" />
                  </button>
                );
              })}
            </nav>

            {/* Right Column: Action Icons (Wishlist, Cart, Account) */}
            <div className="flex items-center justify-end gap-3 sm:gap-5 text-[var(--color-text)]">
              <button
                onClick={() => handleProtectedNav("/wishlist")}
                className="hover:text-[var(--color-teal)] transition-colors duration-200 p-2 cursor-pointer bg-transparent border-none relative flex items-center justify-center"
                aria-label="Wishlist"
              >
                <Heart size={20} />
              </button>

              <button
                onClick={() => handleProtectedNav("/cart")}
                className="hover:text-[var(--color-teal)] transition-colors duration-200 p-2 cursor-pointer bg-transparent border-none relative flex items-center justify-center"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[var(--color-teal)] text-white text-[9px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Account Dropdown Context Wrapper */}
              <div ref={accountDropdownRef} className="relative flex items-center">
                <button
                  onClick={handleUserButtonClick}
                  className="hover:text-[var(--color-teal)] transition-colors duration-200 p-2 cursor-pointer bg-transparent border-none relative flex items-center justify-center"
                  aria-label="Account"
                >
                  <User size={20} />
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
                      className="absolute top-[115%] right-0 bg-[var(--color-white)] shadow-lg border border-[var(--color-border-subtle)] min-w-[160px] py-1.5 z-[var(--z-dropdown)] flex flex-col rounded-sm"
                    >
                      <button
                        onClick={() => {
                          setIsAccountDropdownOpen(false);
                          navigate("/account");
                        }}
                        className="text-left px-4 py-2 hover:bg-[var(--color-bg-secondary)] text-xs font-medium uppercase tracking-wider font-secondary text-[var(--color-text)] transition-colors cursor-pointer bg-transparent border-none w-full"
                      >
                        My Account
                      </button>

                      <button
                        onClick={handleLogoutAction}
                        className="text-left px-4 py-2 hover:bg-[var(--color-bg-secondary)] text-xs font-medium uppercase tracking-wider font-secondary text-[var(--color-text-muted)] hover:text-[var(--color-teal)] transition-colors cursor-pointer bg-transparent border-none w-full border-t border-[var(--color-border-subtle)]"
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

        {/* MOBILE SEARCH BAR */}
        <div className="lg:hidden w-full bg-[var(--color-white)] border-b border-[var(--color-border-subtle)] py-2">
          <div className="container px-4 sm:px-6">
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

      {/* ── MOBILE MENU OVERLAY & ACCORDION DRAWER ─────────────────────── */}
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
              <div className="flex flex-col min-h-full p-6 sm:p-8 text-[var(--color-cream)]">
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                  <span className="font-primary text-xl font-semibold tracking-wider text-white">
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

                <nav className="flex flex-col gap-2 flex-1 font-primary">
                  {navStructure.map((item) => {
                    if (item.hasDropdown) {
                      const isExpanded = !!mobileExpanded[item.title];
                      return (
                        <div key={item.title} className="border-b border-white/10 pb-2">
                          <button
                            onClick={() => toggleMobileAccordion(item.title)}
                            className="w-full flex items-center justify-between text-left font-medium text-2xl sm:text-3xl py-2 cursor-pointer bg-transparent border-none text-[var(--color-cream)] hover:text-white transition-colors"
                          >
                            <span>{item.title}</span>
                            <ChevronDown
                              size={20}
                              className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                                }`}
                            />
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden flex flex-col pl-4 border-l border-white/20 mt-1 space-y-2 py-2"
                              >
                                {item.categories?.map((cat) => (
                                  <button
                                    key={cat}
                                    onClick={() => handleCategorySelect(cat)}
                                    className={`text-left text-sm font-secondary tracking-wider uppercase py-1 cursor-pointer bg-transparent border-none transition-colors ${activeCategory === cat
                                      ? "text-white font-bold"
                                      : "text-white/70 hover:text-white"
                                      }`}
                                  >
                                    › {cat}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={item.title}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          if (item.path) navigate(item.path);
                        }}
                        className="text-left font-medium text-2xl sm:text-3xl py-3 border-b border-white/10 cursor-pointer bg-transparent text-[var(--color-cream)] hover:text-white transition-colors"
                      >
                        {item.title}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}