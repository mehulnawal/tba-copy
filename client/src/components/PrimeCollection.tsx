import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { X, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { formatINR } from "../utils/currency";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlist,
} from "../hooks/useWishlist";
import { AuthModal } from "../pages/AuthModal";
import primeCollection from "../assets/primeCollection/img2.png";
import { apiRequest } from "../api/client";
import type { Product as CatalogProduct } from "../types";

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  tags: string[];
  prices: { karat: string; finalPrice: number }[];
  images: string[];
  slug?: string;
}

interface Hotspot {
  id: string;
  x: number; // Plus button X percentage axis
  y: number; // Plus button Y percentage axis
  anchorX: number; // White guide line target X
  anchorY: number; // White guide line target Y
  label: string;
}

interface Look {
  id: string;
  image: string;
  hotspots: Hotspot[];
}

const PRIME_LOOKS: Look[] = [
  {
    id: "look-1",
    image: primeCollection,
    hotspots: [
      {
        id: "spot-necklace",
        x: 49.5,
        y: 54,
        anchorX: 49.5,
        anchorY: 72,
        label: "Prime Collection",
      },
    ],
  },
];

const toPrimeProduct = (product: CatalogProduct): Product => ({
  id: product.SKU,
  code: `#${product.SKU}`,
  name: product.title || product.name || product.SKU,
  category:
    typeof product.subCategory === "object"
      ? product.subCategory.name
      : product.category || "Jewellery",
  tags: ["PRIME COLLECTION"],
  prices: (product.prices || []).map((price) => ({
    karat: price.karat || "",
    finalPrice: price.finalPrice,
  })),
  images: (product.images || []).map((image) => image.url).filter(Boolean),
  slug: product.slug,
});
export default function PrimeSelection() {
  const [currentLookIndex, setCurrentLookIndex] = useState(0);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const { data: primeProducts = [], isLoading: isLoadingPrimeProducts } =
    useQuery({
      queryKey: ["prime-collection"],
      queryFn: async () => {
        const [gold, silver] = await Promise.all([
          apiRequest<CatalogProduct[]>("/products/gold?primeCollection=true"),
          apiRequest<CatalogProduct[]>("/products/silver?primeCollection=true"),
        ]);
        return [...gold, ...silver].map(toPrimeProduct);
      },
      staleTime: 0,
      refetchOnMount: "always",
    });

  const [startCoords, setStartCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [endCoords, setEndCoords] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isDesktop, setIsDesktop] = useState(false);
  const [imageIndices, setImageIndices] = useState<Record<string, number>>({});
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { data: wishlist = [] } = useWishlist(isAuthenticated);
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    product: Product;
    karat: string;
  } | null>(null);
  const [wishlistOverrides, setWishlistOverrides] = useState<
    Record<string, boolean>
  >({});

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // MOBILE LAUNCH LOCK: Full body structure freeze on small viewports
  useEffect(() => {
    if (selectedHotspot && !isDesktop) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [selectedHotspot, isDesktop]);

  // Vector Calculation Module for Desktop Curved Teal Line Pathing
  useEffect(() => {
    if (!selectedHotspot || !canvasRef.current || !isDesktop) return;

    const updateVectorLinePath = () => {
      if (!canvasRef.current) return;
      const canvasRect = canvasRef.current.getBoundingClientRect();

      // 1. Source Coordinates (Hotspot Center relative to Canvas Container)
      const absoluteStartX = (selectedHotspot.x / 100) * canvasRect.width;
      const absoluteStartY = (selectedHotspot.y / 100) * canvasRect.height;
      setStartCoords({ x: absoluteStartX, y: absoluteStartY });

      // 2. Target Drawer Coordinates (Middle-Left edge of the Centered Drawer)
      if (drawerRef.current) {
        const drawerRect = drawerRef.current.getBoundingClientRect();
        const targetX = drawerRect.left - canvasRect.left;
        const targetY = drawerRect.top + drawerRect.height / 2 - canvasRect.top;
        setEndCoords({ x: targetX, y: targetY });
      } else {
        // Fallback estimate if ref hasn't rendered completely yet
        setEndCoords({ x: canvasRect.width - 350, y: canvasRect.height / 2 });
      }
    };

    updateVectorLinePath();
    const settleTimer = window.setTimeout(updateVectorLinePath, 50);
    window.addEventListener("resize", updateVectorLinePath);

    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", updateVectorLinePath);
    };
  }, [selectedHotspot, isDesktop, showDrawer]);

  const handleHotspotClick = (e: React.MouseEvent, hotspot: Hotspot) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedHotspot(hotspot);

    if (isDesktop) {
      // Desktop Flow: Triggers wave line animation first, then launches popup drawer
      setShowDrawer(false);
      setTimeout(() => {
        setShowDrawer(true);
      }, 450);
    } else {
      // Mobile Flow: Direct swift trigger without delay or line calculation paths
      setShowDrawer(true);
    }
  };

  const handleCloseModal = () => {
    setShowDrawer(false);
    setSelectedHotspot(null);
    setStartCoords(null);
    setEndCoords(null);
  };

  const handleWishlistToggle = async (product: Product, karat: string) => {
    if (!isAuthenticated) {
      setPendingAction({ product, karat });
      setIsAuthOpen(true);
      return;
    }
    const saved =
      wishlistOverrides[product.id] ??
      wishlist.some((item) => item.productId === product.id);
    setWishlistOverrides((current) => ({ ...current, [product.id]: !saved }));
    try {
      if (saved) {
        await removeFromWishlistMutation.mutateAsync(product.id);
        showToast("Removed from wishlist.", "success");
      } else {
        await addToWishlistMutation.mutateAsync({
          productId: product.id,
          karat,
        });
        showToast("Product saved to wishlist.", "success");
      }
    } catch (error: unknown) {
      setWishlistOverrides((current) => ({ ...current, [product.id]: saved }));
      showToast(
        error instanceof Error ? error.message : "Could not update wishlist.",
        "error",
      );
    }
  };

  const handleAuthenticated = () => {
    const action = pendingAction;
    setPendingAction(null);
    setIsAuthOpen(false);
    if (action) void handleWishlistToggle(action.product, action.karat);
  };
  const CompactProductCard = ({ product }: { product: Product }) => {
    const imageIndex = imageIndices[product.id] || 0;
    const [selectedKarat, setSelectedKarat] = useState(
      () => product.prices[0]?.karat || "14kt",
    );
    const selectedPrice =
      product.prices.find((price) => price.karat === selectedKarat)
        ?.finalPrice || 0;
    const isWishlisted =
      wishlistOverrides[product.id] ??
      wishlist.some((item) => item.productId === product.id);
    return (
      <article className="group relative flex gap-4 rounded-lg border border-[var(--color-border-subtle)] bg-white p-3.5 shadow-sm">
        <div className="relative h-44 w-32 shrink-0 overflow-hidden rounded-md bg-[var(--color-bg-secondary)] sm:h-56 sm:w-44">
          <Link
            to={`/product/${product.slug || product.id}`}
            onClick={handleCloseModal}
            aria-label={`View ${product.name}`}
          >
            <img
              src={product.images[imageIndex] || "/placeholder-product.png"}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
          {product.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setImageIndices((current) => ({
                    ...current,
                    [product.id]:
                      (imageIndex - 1 + product.images.length) %
                      product.images.length,
                  }))
                }
                className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-[var(--color-teal)] shadow"
                aria-label="Previous product image"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setImageIndices((current) => ({
                    ...current,
                    [product.id]: (imageIndex + 1) % product.images.length,
                  }))
                }
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-[var(--color-teal)] shadow"
                aria-label="Next product image"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
        <div className="min-w-0 flex flex-1 flex-col py-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                {product.code}
              </p>
              <Link
                to={`/product/${product.slug || product.id}`}
                onClick={handleCloseModal}
                className="product-title mt-1 block font-primary text-lg leading-snug text-[var(--color-text)] hover:text-[var(--color-teal)]"
              >
                <h4>{product.name}</h4>
              </Link>
              <p className="mt-1 text-xs tracking-wide text-[var(--color-text-muted)]">
                {product.category}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                void handleWishlistToggle(
                  product,
                  selectedKarat || product.prices[0]?.karat || "14kt",
                )
              }
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              className="rounded-full border border-[var(--color-border-subtle)] bg-white p-2 text-[var(--color-text-muted)] hover:text-rose-600"
            >
              <Heart
                className={`h-4.5 w-4.5 ${isWishlisted ? "fill-rose-600 stroke-rose-600" : ""}`}
              />
            </button>
          </div>
          <div className="mt-4 border-t border-[var(--color-border-subtle)] pt-3">
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-[8px] uppercase tracking-widest text-[var(--color-text-muted)]">
                  Estimated Price
                </p>
                <p className="text-xs font-semibold text-[var(--color-text)]">
                  {formatINR(selectedPrice)}
                </p>
              </div>
              <div className="flex gap-1">
                {product.prices.map((price) => (
                  <button
                    key={price.karat}
                    type="button"
                    onClick={() => setSelectedKarat(price.karat)}
                    className={`rounded border px-1.5 py-0.5 text-[8px] font-semibold ${selectedKarat === price.karat ? "border-[var(--color-teal)] bg-[var(--color-cream-light)] text-[var(--color-teal)]" : "border-[var(--color-border-subtle)] text-[var(--color-text-muted)]"}`}
                  >
                    {price.karat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  };
  return (
    <>
      <section
        ref={containerRef}
        className="my-0 reveal-section py-8 md:py-12 bg-[var(--color-bg)] w-full relative"
        id="prime-selection-section"
      >
        <div className="container mx-auto px-4 flex flex-col items-center w-full">
          {/* Section Titles */}
          <div className="flex flex-col items-center mb-5 text-center">
            <span className="section-label">CRAFTED FOR TIMELESS MOMENTS</span>
            <h2 className="font-primary text-3xl md:text-4xl text-[var(--color-text)] tracking-wide font-light">
              Prime collection
            </h2>
            <div className="w-12 h-[1px] bg-[var(--color-cream)] mt-4" />
          </div>

          {/* Core Canvas Element Viewport Box */}
          <div
            ref={canvasRef}
            className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] rounded-xl overflow-hidden bg-zinc-100 shadow-md border border-[var(--color-border-subtle)]"
          >
            <img
              src={PRIME_LOOKS[currentLookIndex].image}
              alt="Prime Collection Look"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-center select-none pointer-events-none"
            />

            {/* SVG Vector Systems Layer */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <svg className="w-full h-full">
                {/* Constant Static White Reference Guidelines */}
                {PRIME_LOOKS[currentLookIndex].hotspots.map((hotspot) => (
                  <line
                    key={`static-${hotspot.id}`}
                    x1={`${hotspot.x}%`}
                    y1={`${hotspot.y + 1}%`}
                    x2={`${hotspot.anchorX}%`}
                    y2={`${hotspot.anchorY}%`}
                    stroke="white"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    className="opacity-70"
                  />
                ))}

                {/* Sequential Teal Premium Wave Curve - RESTRICTED STRICTLY TO DESKTOP TIERS */}
                {isDesktop && selectedHotspot && startCoords && endCoords && (
                  <AnimatePresence>
                    <motion.path
                      d={`M ${startCoords.x} ${startCoords.y} C ${(startCoords.x + endCoords.x) / 2} ${startCoords.y}, ${(startCoords.x + endCoords.x) / 2} ${endCoords.y}, ${endCoords.x} ${endCoords.y}`}
                      fill="none"
                      stroke="var(--color-teal, #1c3b48)"
                      strokeWidth="4"
                      strokeDasharray="6 6"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </AnimatePresence>
                )}
              </svg>
            </div>

            {/* Dynamic Action Target Trigger Nodes */}
            {PRIME_LOOKS[currentLookIndex].hotspots.map((hotspot) => (
              <div
                key={hotspot.id}
                className="absolute z-20"
                style={{
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="relative flex items-center justify-center w-12 h-12">
                  <div className="absolute inset-0 rounded-full border border-white/40 bg-white/5 animate-[ping_2s_infinite] pointer-events-none" />
                  <button
                    type="button"
                    onClick={(e) => handleHotspotClick(e, hotspot)}
                    className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/30 font-secondary font-light text-xl flex items-center justify-center cursor-pointer shadow-xl hover:bg-[var(--color-teal,#1c3b48)] hover:text-white hover:border-transparent transition-all duration-300 transform hover:scale-110 z-30 select-none"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            {PRIME_LOOKS.length > 1 && (
              <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCloseModal();
                    setCurrentLookIndex(
                      (prev) =>
                        (prev - 1 + PRIME_LOOKS.length) % PRIME_LOOKS.length,
                    );
                  }}
                  className="w-9 h-9 rounded-full bg-white/90 text-zinc-800 hover:bg-white flex items-center justify-center cursor-pointer transition-all shadow-sm border-none"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCloseModal();
                    setCurrentLookIndex(
                      (prev) => (prev + 1) % PRIME_LOOKS.length,
                    );
                  }}
                  className="w-9 h-9 rounded-full bg-white/90 text-zinc-800 hover:bg-white flex items-center justify-center cursor-pointer transition-all shadow-sm border-none"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* DESKTOP HOUSING STRUCTURE: Vertically Centered, Height till content only, Locked inside Section Section boundary */}
            {isDesktop && selectedHotspot && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-[440px] xl:w-[500px] z-40 pointer-events-none flex items-center">
                <AnimatePresence>
                  {showDrawer && (
                    <motion.div
                      ref={drawerRef}
                      initial={{ x: "40px", opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: "40px", opacity: 0 }}
                      transition={{
                        type: "spring",
                        damping: 30,
                        stiffness: 240,
                      }}
                      className="bg-white w-full max-h-[92%] rounded-xl p-6 shadow-2xl border border-zinc-100/80 pointer-events-auto flex flex-col z-50"
                    >
                      <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3 shrink-0">
                        <h3 className="font-secondary text-xs font-semibold tracking-wider uppercase text-zinc-800">
                          Shop {selectedHotspot.label}
                        </h3>
                        <button
                          type="button"
                          onClick={handleCloseModal}
                          className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 cursor-pointer border-none bg-transparent transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar">
                        {isLoadingPrimeProducts ? (
                          <p className="py-6 text-center text-sm text-[var(--color-text-muted)]">
                            Loading collection…
                          </p>
                        ) : primeProducts.length ? (
                          primeProducts.map((product) => (
                            <CompactProductCard
                              key={product.id}
                              product={product}
                            />
                          ))
                        ) : (
                          <p className="py-6 text-center text-sm text-[var(--color-text-muted)]">
                            No Prime Collection products are available yet.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* MOBILE PORTAL DRAWER HOUSING: Screen Bottom Full Lock Component */}
          {!isDesktop && selectedHotspot && (
            <AnimatePresence>
              <div className="fixed inset-0 z-[999999] flex items-end justify-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={handleCloseModal}
                  className="fixed inset-0 bg-black/40"
                />

                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 220 }}
                  className="relative bg-white w-full max-h-[82dvh] rounded-t-2xl px-5 pb-5 pt-4 shadow-[0_-8px_32px_rgba(0,0,0,0.15)] z-50 overflow-y-auto"
                >
                  <div className="w-12 h-1 bg-zinc-200 rounded-full mx-auto mb-4 shrink-0" />

                  <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3 shrink-0">
                    <h3 className="font-secondary text-xs font-semibold tracking-wider uppercase text-zinc-800">
                      Shop {selectedHotspot.label}
                    </h3>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 cursor-pointer border-none bg-transparent transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar flex-1">
                    {primeProducts.map((product) => (
                      <CompactProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </motion.div>
              </div>
            </AnimatePresence>
          )}
        </div>
      </section>
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={handleAuthenticated}
      />
    </>
  );
}
