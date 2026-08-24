import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthModal } from "./AuthModal";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api/client";
import { cartApi } from "../api/cart.api";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToast } from "../context/ToastContext";
import { useAddToCart } from "../hooks/useCart";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlist,
} from "../hooks/useWishlist";
import {
  BANGLE_ANA_SIZES,
  BANGLE_SIZES,
  RING_SIZES,
} from "../constants/product";
import { getDefaultProductDescription } from "../constants/productDescriptions";
import type { Product } from "../types";
import { formatINR, formatMeasurement } from "../utils/currency";
import { detailImage, publicAssetUrl, responsiveImage } from "../utils/image";
import {
  colorForSlot,
  normalizeVariantImages,
  selectedVariantColors,
} from "../utils/productVariants";
import PriceBreakup from "../components/PriceBreakup";
import { Seo } from "../components/Seo";
import { ProductSkeleton } from "../components/LoadingSkeleton";
import { ProductCard } from "./ProductPage";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
} from "lucide-react";

type CategoryCoupon = {
  discountType: "percentage" | "flat";
  discountValue: number;
  discount: number;
};

type Review = {
  _id: string;
  rating: number;
  text: string;
  user?: { name: string };
};

const productCategoryId = (
  category?: Product["mainCategory"] | Product["subCategory"] | null,
) =>
  !category ? "" : typeof category === "string" ? category : category._id || "";

function getSwatchHexColor(colorName: string): string {
  const normalized = colorName.toLowerCase();
  if (
    normalized.includes("white") ||
    normalized.includes("silver") ||
    normalized.includes("platinum")
  )
    return "#F3F4F6";
  if (normalized.includes("rose") || normalized.includes("pink"))
    return "#E0A899";
  if (normalized.includes("yellow") || normalized.includes("gold"))
    return "#E5C158";
  return "#FFF";
}

function ShippingHandling() {
  return (
    <section className="border-t border-stone-200 pt-4">
      <h3 className="text-base font-bold [-webkit-text-stroke:0.2px_currentColor] uppercase tracking-widest text-stone-700 lg:text-xs">
        Shipping &amp; Handling
      </h3>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-stone-600 lg:text-xs">
        <li>Free shipping perks on all orders within India</li>
        <li>Avail your items within 15 business days</li>
        <li>Inspect your package carefully before signing off</li>
        <li>
          Package will be sealed and wrapped in bubble wrap, small box, or
          padded envelope
        </li>
      </ul>
    </section>
  );
}
function MobileAccordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches,
  );
  return (
    <section className="border border-stone-200 bg-white p-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className="text-base font-bold [-webkit-text-stroke:0.2px_currentColor] text-stone-700 lg:text-xs">
          {title}
        </h3>
        <ChevronDown
          size={20}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </section>
  );
}

function formatFinishLabel(colorName?: string): string {
  if (!colorName) return "?";
  const normalized = colorName.toLowerCase();
  if (normalized.includes("yellow")) return "Yellow";
  if (normalized.includes("rose")) return "Rose";
  if (normalized.includes("white")) return "White";
  return colorName;
}

function weightFor(
  value: Product["grossWeight"] | Product["netWeight"],
  karat: "14kt" | "18kt",
): number | undefined {
  return typeof value === "number" ? value : value?.[karat];
}

export default function ProductDetails() {
  const { slug = "" } = useParams();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const addToCartMutation = useAddToCart();
  const queryClient = useQueryClient();
  const { data: wishlist = [] } = useWishlist(isAuthenticated);
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [karat, setKarat] = useState<"14kt" | "18kt">("14kt");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const similarProductsRef = useRef<HTMLDivElement>(null);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "cart" | "wishlist" | null
  >(null);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isPriceBreakupOpen, setIsPriceBreakupOpen] = useState(true);
  const [zoomMousePos, setZoomMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringMainImage, setIsHoveringMainImage] = useState(false);
  const [categoryCoupon, setCategoryCoupon] = useState<CategoryCoupon | null>(
    null,
  );
  const [appliedCouponSkus, setAppliedCouponSkus] = useState<
    Record<string, true>
  >({});

  useEffect(() => {
    setSimilarProducts([]);
    window.scrollTo(0, 0);
    apiRequest<Product>(`/products/${slug}`)
      .then((p) => {
        setProduct(p);
        const defaultColors = selectedVariantColors(p);
        const variantImages = normalizeVariantImages(p.images);
        const defaultImage =
          variantImages.find((image) =>
            defaultColors.includes(colorForSlot(p, image.slot || 0)),
          ) || variantImages[0];
        const defaultColor = defaultImage
          ? colorForSlot(p, defaultImage.slot || 0)
          : defaultColors[0];
        setColor(
          defaultColors.includes(defaultColor)
            ? defaultColor
            : defaultColors[0],
        );
        setActiveMediaIndex(
          defaultImage
            ? variantImages.findIndex(
                (image) => image.slot === defaultImage.slot,
              )
            : 0,
        );
        setSize("");

        apiRequest<Review[]>(`/reviews/${p.SKU}`)
          .then(setReviews)
          .catch(() => {});
        apiRequest<Product[]>(`/products/${p.metal || "gold"}`)
          .then((products) => {
            const currentId = p.id || p._id || p.SKU;
            const sameSubCategory = productCategoryId(p.subCategory);
            const sameMainCategory = productCategoryId(p.mainCategory);
            const candidates = products.filter(
              (item) =>
                item.isActive !== false &&
                (item.id || item._id || item.SKU) !== currentId,
            );
            const exactCategoryProducts = candidates.filter((item) =>
              sameSubCategory
                ? productCategoryId(item.subCategory) === sameSubCategory
                : productCategoryId(item.mainCategory) === sameMainCategory,
            );
            const otherCategoryProducts = candidates.filter(
              (item) =>
                !exactCategoryProducts.some(
                  (related) =>
                    (related.id || related._id || related.SKU) ===
                    (item.id || item._id || item.SKU),
                ),
            );
            // Keep recommendations category-led: up to six exact matches, plus at most two same-metal alternatives.
            setSimilarProducts([
              ...exactCategoryProducts.slice(0, 6),
              ...otherCategoryProducts.slice(0, 2),
            ]);
          })
          .catch(() => setSimilarProducts([]));
      })
      .catch(() => setProduct(null));
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    setCategoryCoupon(null);
    if (!product?.SKU)
      return () => {
        cancelled = true;
      };
    const params =
      product.metal === "gold" ? `?karat=${encodeURIComponent(karat)}` : "";
    apiRequest<{ coupon: CategoryCoupon | null }>(
      `/products/${encodeURIComponent(product.SKU)}/category-coupon${params}`,
    )
      .then(({ coupon }) => {
        if (cancelled) return;
        setCategoryCoupon(coupon);
        if (!coupon)
          setAppliedCouponSkus((current) => {
            if (!current[product.SKU]) return current;
            const next = { ...current };
            delete next[product.SKU];
            return next;
          });
      })
      .catch(() => {
        if (!cancelled) setCategoryCoupon(null);
      });
    return () => {
      cancelled = true;
    };
  }, [product?.SKU, product?.metal, karat]);
  if (!product) {
    return (
      <>
        <Navbar
          onSearchChange={() => {}}
          activeCategory="All"
          onCategoryChange={() => {}}
        />
        <main className="flex items-center justify-center min-h-[60vh] bg-[#FAF9F6]">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-800 mx-auto" />
            <p className="text-xs uppercase tracking-widest text-amber-900 font-medium font-secondary">
              Loading Product Details...
            </p>
          </div>
        </main>
        <Footer onCategoryChange={() => {}} />
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </>
    );
  }

  const productPrices = Array.isArray(product.prices) ? product.prices : [];
  const activePriceObj = productPrices.find((price) => price.karat === karat) ||
    productPrices[0] || { totalCost: 0, gst: 0, finalPrice: 0, grossWeight: 0 };
  const roundMoney = (value: number) =>
    Math.round((value + Number.EPSILON) * 100) / 100;
  const originalSubtotal = Math.max(
    0,
    roundMoney(Number(activePriceObj.totalCost) || 0),
  );
  const couponApplied = Boolean(
    categoryCoupon && appliedCouponSkus[product.SKU],
  );
  const couponDiscount = couponApplied
    ? Math.min(
        originalSubtotal,
        Math.max(0, roundMoney(Number(categoryCoupon?.discount) || 0)),
      )
    : 0;
  const subtotalAfterCoupon = roundMoney(
    Math.max(0, originalSubtotal - couponDiscount),
  );
  const discountedGst = roundMoney(subtotalAfterCoupon * 0.03);
  const displayedPrice = couponApplied
    ? {
        ...activePriceObj,
        totalCost: subtotalAfterCoupon,
        gst: discountedGst,
        finalPrice: roundMoney(subtotalAfterCoupon + discountedGst),
      }
    : activePriceObj;
  const couponLabel = categoryCoupon
    ? categoryCoupon.discountType === "percentage"
      ? `${categoryCoupon.discountValue}% OFF`
      : `${formatINR(categoryCoupon.discountValue)} OFF`
    : "";
  const grossWeight =
    activePriceObj.grossWeight ?? weightFor(product.grossWeight, karat);
  const netWeight =
    activePriceObj.netWeight ?? weightFor(product.netWeight, karat);

  const categoryName = (
    category?: Product["mainCategory"] | Product["subCategory"] | null,
  ) => {
    if (!category) return "Jewellery";

    if (typeof category === "string") return "Jewellery";

    return category.name ?? "Jewellery";
  };

  const categoryId = (
    category?: Product["mainCategory"] | Product["subCategory"] | null,
  ) => {
    if (!category) return "";

    if (typeof category === "string") return category;

    return category._id ?? "";
  };

  const defaultDescription = getDefaultProductDescription(product.metal, [
    categoryName(product.mainCategory),
    categoryName(product.subCategory),
  ]);
  const storedDescription = product.description?.trim();
  // Always append the category description after any admin-entered text.
  const productDescription = [storedDescription, defaultDescription?.plainText]
    .filter(Boolean)
    .join("\n\n");
  const productDescriptionContent = (
    <>
      {storedDescription}
      {storedDescription && defaultDescription ? "\n\n" : null}
      {defaultDescription?.content}
    </>
  );

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
  const isRing = [
    categoryName(product.mainCategory),
    categoryName(product.subCategory),
  ].some((name) => /\brings?\b/i.test(name));
  const isBracelet =
    !isRing &&
    [
      categoryName(product.mainCategory),
      categoryName(product.subCategory),
    ].some((name) => /\bbracelets?\b/i.test(name));
  const isBangle =
    !isRing &&
    [
      categoryName(product.mainCategory),
      categoryName(product.subCategory),
    ].some((name) => /\bbangles?\b/i.test(name));
  const mediaList = [
    ...normalizeVariantImages(product.images).map((image) => ({
      type: "image" as const,
      url: image.url,
      slot: image.slot,
    })),
    ...(product.videoLink
      ? [{ type: "video" as const, url: product.videoLink }]
      : []),
  ];
  const productImage = mediaList[activeMediaIndex]?.url;

  const availableColors = selectedVariantColors(product);
  const siteUrl = (
    import.meta.env.VITE_SITE_URL || "https://thebrillianceatelier.com"
  ).replace(/\/+$/, "");
  const productPath = `/product/${product.slug || slug}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: productDescription || `TBA jewellery ${product.title}`,
    sku: product.SKU,
    image: (product.images || []).map((item) => item.url),
    brand: { "@type": "Brand", name: "TBA jewellery" },
    category: [
      categoryName(product.mainCategory),
      categoryName(product.subCategory),
    ]
      .filter(Boolean)
      .join(" > "),
    material: isGold ? "Gold" : "Silver",
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: Number(activePriceObj.finalPrice || 0).toFixed(2),
      availability: "https://schema.org/InStock",
      url: `${siteUrl}${productPath}`,
      itemCondition: "https://schema.org/NewCondition",
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName(product.mainCategory),
        item: `${siteUrl}${mainCategoryPath}`,
      },
      ...(subCategoryId
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: categoryName(product.subCategory),
              item: `${siteUrl}${subCategoryPath}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: subCategoryId ? 4 : 3,
        name: product.title,
        item: `${siteUrl}${productPath}`,
      },
    ],
  };

  // FIX 2: Fancy Diamond & Round Diamond display logic
  const roundCarat = product.diamond?.roundCarat ?? 0;
  const fancyCarat = product.diamond?.fancyCarat ?? 0;
  const certCharges =
    activePriceObj.certificateCharges ?? product.certificateCharges;

  const computedGoldValue =
    activePriceObj.goldValue ||
    Math.max(
      0,
      activePriceObj.totalCost - activePriceObj.makingCharge - certCharges,
    );

  const handleMouseMoveZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomMousePos({ x, y });
  };

  const isWishlisted = wishlist.some((item) => item.productId === product.SKU);
  const addProductToCart = async () => {
    try {
      await addToCartMutation.mutateAsync({
        productId: product.SKU,
        karat,
        color,
        size,
        quantity: 1,
        categoryCouponApplied: couponApplied,
      });
      showToast("Item added to cart!", "success");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to add to cart.",
        "error",
      );
    }
  };
  const toggleWishlist = async () => {
    try {
      if (isWishlisted) {
        await removeFromWishlistMutation.mutateAsync(product.SKU);
        showToast("Removed from wishlist.", "success");
      } else {
        await addToWishlistMutation.mutateAsync({
          productId: product.SKU,
          karat,
        });
        showToast("Product saved to wishlist.", "success");
      }
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Could not update wishlist.",
        "error",
      );
    }
  };
  const toggleCategoryCoupon = async () => {
    const applied = !couponApplied;
    setAppliedCouponSkus((current) =>
      applied
        ? { ...current, [product.SKU]: true }
        : (() => {
            const next = { ...current };
            delete next[product.SKU];
            return next;
          })(),
    );
    if (!isAuthenticated) return;
    try {
      await cartApi.setCategoryCoupon({
        productId: product.SKU,
        karat,
        color,
        size,
        applied,
      });
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to update coupon in cart.",
        "error",
      );
    }
  };
  const handleAddToCart = async () => {
    if ((isRing || isBracelet || isBangle) && !size) {
      showToast(
        `Select a ${isBangle ? "bangle" : isBracelet ? "bracelet" : "ring"} size before adding this product.`,
        "error",
      );
      return;
    }
    if (!isAuthenticated) {
      setPendingAction("cart");
      setIsAuthOpen(true);
      return;
    }
    await addProductToCart();
  };
  const handleSimilarWishlistToggle = async (relatedProduct: Product) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    const relatedKarat =
      relatedProduct.prices?.find((price) => price.karat === "14kt")?.karat ||
      relatedProduct.prices?.[0]?.karat ||
      "14kt";
    try {
      if (wishlist.some((item) => item.productId === relatedProduct.SKU)) {
        await removeFromWishlistMutation.mutateAsync(relatedProduct.SKU);
        showToast("Removed from wishlist.", "success");
      } else {
        await addToWishlistMutation.mutateAsync({
          productId: relatedProduct.SKU,
          karat: relatedKarat,
        });
        showToast("Product saved to wishlist.", "success");
      }
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Could not update wishlist.",
        "error",
      );
    }
  };
  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      setPendingAction("wishlist");
      setIsAuthOpen(true);
      return;
    }
    void toggleWishlist();
  };
  const handleAuthenticated = () => {
    const action = pendingAction;
    setPendingAction(null);
    if (action === "wishlist") void toggleWishlist();
    if (action === "cart") void addProductToCart();
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
      showToast(
        err instanceof Error ? err.message : "Could not submit review.",
        "error",
      );
    }
  };

  return (
    <>
      <Seo
        title={`${product.title} | TBA jewellery`}
        description={
          productDescription ||
          `Explore ${product.title} at TBA jewellery, with product specifications and complete price details.`
        }
        image={product.images[0]?.url}
        type="product"
        structuredData={[productSchema, breadcrumbSchema]}
      />
      <div className="min-h-screen bg-[#FAF9F6] text-stone-900 antialiased font-secondary pb-0">
        <Navbar
          onSearchChange={() => {}}
          activeCategory="All"
          onCategoryChange={() => {}}
        />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-16">
          {/* Breadcrumbs */}
          <nav className="mb-6 text-[11px] tracking-widest text-amber-900/60 uppercase font-medium space-x-2 border-b border-stone-200/60 pb-3">
            <Link to="/" className="hover:text-amber-900">
              Home
            </Link>
            <span>/</span>
            <Link to={mainCategoryPath}>
              {categoryName(product.mainCategory)}
            </Link>
            {subCategoryId && (
              <>
                <span>/</span>
                <Link to={subCategoryPath}>
                  {categoryName(product.subCategory)}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-stone-900 font-semibold">
              {product.title}
            </span>
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
                      className={`w-20 h-20 aspect-square border rounded transition bg-white overflow-hidden ${
                        idx === activeMediaIndex
                          ? "border-amber-800 ring-1 ring-amber-800"
                          : "border-stone-200 opacity-70"
                      }`}
                    >
                      {media.type === "video" ? (
                        <video
                          src={media.url}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={media.url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      )}
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
                  >
                    {" "}
                    {mediaList[activeMediaIndex]?.type === "video" ? (
                      <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        controls
                        className="w-full h-full object-contain"
                        src={mediaList[activeMediaIndex]?.url}
                      />
                    ) : (
                      <img
                        src={detailImage(productImage)}
                        alt={product.title || "Product image"}
                        className={`w-full h-full object-cover transition-opacity duration-200 ${isHoveringMainImage ? "opacity-0" : "opacity-100"}`}
                      />
                    )}
                    {mediaList[activeMediaIndex]?.type !== "video" &&
                      isHoveringMainImage && (
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
              <div className="hidden space-y-3 lg:block">
                <MobileAccordion title="Description">
                  <p className="whitespace-pre-line text-base leading-relaxed text-stone-600 lg:text-xs">
                    {productDescriptionContent}
                  </p>
                </MobileAccordion>
                {(product.certificates || []).length > 0 && (
                  <MobileAccordion title="Certificates of Authenticity">
                    <div className="flex gap-3">
                      {product.certificates?.map((certificate) => (
                        <div
                          key={certificate._id}
                          className="flex items-center gap-3 text-lg lg:text-sm"
                        >
                          <img
                            src={publicAssetUrl(certificate.logoUrl)}
                            alt=""
                            className="h-14 w-14 object-contain lg:h-10 lg:w-10"
                          />
                          {certificate.name}
                        </div>
                      ))}
                    </div>
                    <a
                      href="/certificates/viewCertificate.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex w-fit items-center rounded border border-[var(--color-teal)] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-teal)] transition hover:bg-[var(--color-teal)] hover:!text-white"
                    >
                      View PDF
                    </a>
                  </MobileAccordion>
                )}
                <MobileAccordion title="Shipping & Handling">
                  <ul className="list-disc space-y-1.5 pl-5 text-base leading-relaxed text-stone-600 lg:text-xs">
                    <li>Free shipping perks on all orders within India</li>
                    <li>Avail your items within 15 business days</li>
                    <li>Inspect your package carefully before signing off</li>
                    <li>
                      Package will be sealed and wrapped in bubble wrap, small
                      box, or padded envelope
                    </li>
                  </ul>
                </MobileAccordion>
                <MobileAccordion title="Important Guide">
                  <ol className="list-decimal space-y-1.5 pl-5 text-base leading-relaxed text-stone-600 lg:text-xs">
                    <li>
                      The prices are indicative of approximate gold rate, as
                      there are daily fluctuations. Expect a call from Team TBA
                      once you place the order.
                    </li>
                    <li>
                      The price is also subject to the final diamond weight of
                      +/- 5% on the basis of size selected.
                    </li>
                    <li>
                      Each piece is customized and made to order. Center
                      solitaires can be set according to your preference.
                    </li>
                  </ol>
                </MobileAccordion>
              </div>
            </div>

            {/* RIGHT COLUMN: Product Configurator */}
            <div className="lg:col-span-6 flex flex-col gap-5">
              <div className="order-1 lg:order-1">
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-amber-900">
                  {categoryName(product.mainCategory)}
                </span>
                <p className="mt-2 text-sm text-stone-500">
                  SKU: {product.SKU}
                </p>
                <h1 className="text-2xl md:text-3xl font-primary text-stone-900 tracking-tight mt-1">
                  {product.title}
                </h1>
              </div>

              {/* Price Row */}
              <div className="order-2 flex items-baseline justify-between border-y border-stone-200/80 py-3 lg:order-2">
                <div>
                  {couponApplied && (
                    <span className="mr-2 text-lg text-stone-400 line-through">
                      {formatINR(activePriceObj.finalPrice)}
                    </span>
                  )}
                  <span className="text-3xl font-secondary text-stone-900">
                    {formatINR(displayedPrice.finalPrice)}
                  </span>
                  <span className="text-[11px] text-stone-500 block">
                    Inclusive of all taxes
                  </span>
                  <span className="text-[11px] text-stone-500 block">
                    *This is an estimated price, actual price may differ as per
                    actual weights.
                  </span>
                </div>
                <div className="flex gap-6">
                  <button
                    type="button"
                    onClick={() =>
                      navigator.share
                        ? void navigator.share({
                            title: product.title,
                            url: window.location.href,
                          })
                        : void navigator.clipboard
                            .writeText(window.location.href)
                            .then(() =>
                              showToast("Product link copied.", "success"),
                            )
                    }
                    className="inline-flex items-center gap-3 py-3 text-sm text-stone-700 cursor-pointer"
                  >
                    <Share2 size={22} />
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={handleWishlistClick}
                    className="inline-flex items-center gap-1.5 py-3 text-sm text-stone-700"
                  >
                    <Heart
                      size={22}
                      fill={isWishlisted ? "#dc2626" : "none"}
                      className={isWishlisted ? "text-red-600" : ""}
                    />
                    Add to Wishlist
                  </button>
                </div>
              </div>
              {categoryCoupon && (
                <div className="order-3 flex items-center justify-between gap-3 border-b border-stone-200/80 pb-3 lg:order-3">
                  <div className="text-xs text-stone-600">
                    <span className="font-semibold text-stone-800">
                      Category offer: {couponLabel}
                    </span>
                    <span className="block text-[11px] text-stone-500">
                      Applied to this product before GST.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void toggleCategoryCoupon()}
                    className="shrink-0 border border-[var(--color-teal)] px-3 py-2 text-xs font-semibold text-[var(--color-teal)] transition hover:bg-[var(--color-teal)] hover:text-white"
                  >
                    {couponApplied ? "Remove Coupon" : "Apply Coupon"}
                  </button>
                </div>
              )}
              {/* Specs */}
              <div className="order-4 rounded-lg border border-stone-200/80 bg-stone-50 p-4 space-y-3 lg:order-3">
                <h4 className="text-[11px] font-bold [-webkit-text-stroke:0.2px_currentColor] uppercase tracking-widest text-stone-700">
                  Weight Specifications
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-3 rounded border border-stone-100">
                    <span className="block text-[10px] text-stone-400 uppercase">
                      Gross Weight
                    </span>
                    <span className="text-sm font-secondary font-semibold text-stone-900">
                      {formatMeasurement(grossWeight ?? 0)} g
                    </span>
                  </div>
                  {isGold && (
                    <div className="bg-white p-3 rounded border border-stone-100">
                      <span className="block text-[10px] text-stone-400 uppercase">
                        Net Weight
                      </span>
                      <span className="text-sm font-secondary font-semibold text-stone-900">
                        {formatMeasurement(netWeight ?? 0)} g
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Purity Selection */}
              {isGold && (
                <div className="order-6 space-y-2 lg:order-6">
                  <label className="block text-xs uppercase tracking-widest font-bold [-webkit-text-stroke:0.2px_currentColor] text-stone-600">
                    Select Purity Standard:{" "}
                    <span className="text-stone-900">
                      {karat.toUpperCase()} Gold
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["14kt", "18kt"] as const).map((k) => (
                      <button
                        key={k}
                        onClick={() => setKarat(k)}
                        className={`py-2.5 text-xs font-semibold uppercase rounded transition border ${
                          karat === k
                            ? "border-[var(--color-teal)] bg-[var(--color-teal)] text-white"
                            : "border-stone-300 bg-white text-stone-700 hover:border-[var(--color-teal)]"
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <PriceBreakup
                product={product}
                price={displayedPrice}
                coupon={
                  couponApplied
                    ? {
                        label: couponLabel,
                        discount: couponDiscount,
                        subtotalAfterCoupon,
                      }
                    : undefined
                }
                className="order-7 lg:order-7"
              />

              <div className="order-8 lg:hidden">
                <MobileAccordion title="Description">
                  <p className="whitespace-pre-line text-base leading-relaxed text-stone-600">
                    {productDescriptionContent}
                  </p>
                </MobileAccordion>
              </div>
              {(product.certificates || []).length > 0 && (
                <div className="order-9 lg:hidden">
                  <MobileAccordion title="Certificates of Authenticity">
                    <div className="mt-3 flex flex-col gap-3">
                      {product.certificates?.map((certificate) => (
                        <div
                          key={certificate._id}
                          className="flex min-w-0 items-center gap-2 text-xs"
                        >
                          <img
                            src={publicAssetUrl(certificate.logoUrl)}
                            alt=""
                            className="h-14 w-14 shrink-0 object-contain lg:h-10 lg:w-10"
                          />
                          <span className="min-w-0 break-words">
                            {certificate.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </MobileAccordion>
                </div>
              )}
              <div className="order-[10] space-y-3 lg:hidden">
                <MobileAccordion title="Shipping & Handling">
                  <ul className="list-disc space-y-1.5 pl-5 text-base leading-relaxed text-stone-600">
                    <li>Free shipping perks on all orders within India</li>
                    <li>Avail your items within 15 business days</li>
                    <li>Inspect your package carefully before signing off</li>
                    <li>
                      Package will be sealed and wrapped in bubble wrap, small
                      box, or padded envelope
                    </li>
                  </ul>
                </MobileAccordion>
                <MobileAccordion title="Important Guide">
                  <ol className="list-decimal space-y-1.5 pl-5 text-base leading-relaxed text-stone-600 lg:text-xs">
                    <li>
                      The prices are indicative of approximate gold rate, as
                      there are daily fluctuations. Expect a call from Team
                      Ivana once you place the order.
                    </li>
                    <li>
                      The price is also subject to the final diamond weight of
                      +/- 5% on the basis of size selected.
                    </li>
                    <li>
                      Each piece is customized and made to order. Center
                      solitaires can be set according to your preference.
                    </li>
                  </ol>
                </MobileAccordion>
              </div>
              {/* Metal Finish Swatches with Proper White Color */}
              <div className="order-5 space-y-2 lg:order-5">
                <label className="block text-xs uppercase tracking-widest font-bold [-webkit-text-stroke:0.2px_currentColor] text-stone-600">
                  Metal Finish:{" "}
                  <span className="text-stone-900">
                    {formatFinishLabel(color)}
                  </span>
                </label>
                <div className="flex gap-3">
                  {availableColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setColor(c);
                        const mediaIndex = mediaList.findIndex(
                          (media) =>
                            media.type === "image" &&
                            colorForSlot(product, media.slot || 0) === c,
                        );
                        if (mediaIndex >= 0) setActiveMediaIndex(mediaIndex);
                      }}
                      className={`flex items-center space-x-2 px-3.5 py-2 rounded-full border transition ${
                        color === c
                          ? "border-[var(--color-teal)] bg-[var(--color-cream)] ring-1 ring-[var(--color-teal)]"
                          : "border-stone-200 bg-white"
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
                {isRing && (
                  <div className="mt-5 space-y-2">
                    <label
                      htmlFor="ring-size"
                      className="block text-xs uppercase tracking-widest font-bold [-webkit-text-stroke:0.2px_currentColor] text-stone-600"
                    >
                      Ring Size
                    </label>
                    <select
                      id="ring-size"
                      value={size}
                      onChange={(event) => setSize(event.target.value)}
                      className="w-full rounded border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-800 focus:border-amber-800 focus:outline-none"
                      aria-required="true"
                    >
                      <option value="">Select size</option>
                      {RING_SIZES.map((ringSize) => (
                        <option key={ringSize} value={ringSize}>
                          {ringSize}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {isBracelet && (
                  <div className="mt-5 space-y-2">
                    <label
                      htmlFor="bracelet-size"
                      className="block text-xs uppercase tracking-widest font-bold [-webkit-text-stroke:0.2px_currentColor] text-stone-600"
                    >
                      Bracelet Size (inches)
                    </label>
                    <select
                      id="bracelet-size"
                      value={size}
                      onChange={(event) => setSize(event.target.value)}
                      className="w-full rounded border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-800 focus:border-amber-800 focus:outline-none"
                      aria-required="true"
                    >
                      <option value="">Select size</option>
                      {BANGLE_SIZES.map((bangleSize) => (
                        <option key={bangleSize} value={bangleSize}>
                          {bangleSize}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {isBangle && (
                  <div className="mt-5 space-y-2">
                    <label
                      htmlFor="bangle-ana-size"
                      className="block text-xs uppercase tracking-widest font-bold [-webkit-text-stroke:0.2px_currentColor] text-stone-600"
                    >
                      Bangle (Ana)
                    </label>
                    <select
                      id="bangle-ana-size"
                      value={size}
                      onChange={(event) => setSize(event.target.value)}
                      className="w-full rounded border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-800 focus:border-amber-800 focus:outline-none"
                      aria-required="true"
                    >
                      <option value="">Select size</option>
                      {BANGLE_ANA_SIZES.map((bangleSize) => (
                        <option key={bangleSize} value={bangleSize}>
                          {bangleSize}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="order-[11] flex gap-4 pt-2 lg:order-11">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 border border-[var(--color-teal)] bg-[var(--color-teal)] px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-[var(--color-teal-light)]"
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
            <h2 className="text-xl font-primary text-stone-900 mb-6">
              Customer Reviews
            </h2>

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
                          <span
                            className={
                              (hoverRating || rating) >= star
                                ? "text-amber-500"
                                : "text-stone-300"
                            }
                          >
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
                    No verified client reviews recorded yet. Be the first to
                    review.
                  </div>
                ) : (
                  reviews.map((r) => (
                    <article
                      key={r._id}
                      className="p-5 bg-white rounded-lg border border-stone-200 shadow-xs space-y-2"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-stone-900">
                          {r.user?.name || "Verified Client"}
                        </span>
                        <span className="text-amber-500 font-bold">
                          {"\u2605".repeat(r.rating)}
                          {"\u2606".repeat(5 - r.rating)}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600">{r.text}</p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>
          {similarProducts.length > 0 && (
            <section
              className="mt-16 border-t border-stone-200 pt-12"
              aria-labelledby="similar-products-heading"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    Curated for you
                  </p>
                  <h2
                    id="similar-products-heading"
                    className="mt-1 text-2xl font-primary text-stone-900 sm:text-3xl"
                  >
                    Similar Products
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      similarProductsRef.current?.scrollBy({
                        left: -Math.max(
                          similarProductsRef.current.clientWidth * 0.85,
                          300,
                        ),
                        behavior: "smooth",
                      })
                    }
                    className="grid h-10 w-10 place-items-center rounded-full border border-stone-300 bg-white text-stone-700 transition hover:border-[var(--color-teal)] hover:text-[var(--color-teal)]"
                    aria-label="Previous similar products"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      similarProductsRef.current?.scrollBy({
                        left: Math.max(
                          similarProductsRef.current.clientWidth * 0.85,
                          300,
                        ),
                        behavior: "smooth",
                      })
                    }
                    className="grid h-10 w-10 place-items-center rounded-full border border-stone-300 bg-white text-stone-700 transition hover:border-[var(--color-teal)] hover:text-[var(--color-teal)]"
                    aria-label="Next similar products"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              <div
                ref={similarProductsRef}
                className="grid snap-x snap-mandatory auto-cols-[minmax(240px,85vw)] grid-flow-col gap-4 overflow-x-auto pb-3 pr-1 sm:auto-cols-[minmax(260px,calc((100%-1rem)/2))] lg:auto-cols-[minmax(260px,calc((100%-2rem)/3))]"
              >
                {similarProducts.map((relatedProduct) => (
                  <div
                    key={
                      relatedProduct.id ||
                      relatedProduct._id ||
                      relatedProduct.SKU
                    }
                    className="snap-start"
                  >
                    <ProductCard
                      product={relatedProduct}
                      categoryLabel={
                        categoryName(relatedProduct.subCategory) !== "Jewellery"
                          ? categoryName(relatedProduct.subCategory)
                          : categoryName(relatedProduct.mainCategory)
                      }
                      defaultKarat="14kt"
                      onWishlistToggle={(item) =>
                        void handleSimilarWishlistToggle(item)
                      }
                      isWishlisted={wishlist.some(
                        (item) => item.productId === relatedProduct.SKU,
                      )}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}{" "}
        </main>

        <Footer onCategoryChange={() => {}} />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onAuthenticated={handleAuthenticated}
        />
      </div>
    </>
  );
}
