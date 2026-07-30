import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    filteredProducts: any[];
    isProductInWishlist: (id: string) => boolean;
    getProductPrice: (product: any) => number;
    isLoggedIn: boolean;
    setIsAuthOpen: (val: boolean) => void;
    toggleWishlist: (product: any) => void;
    addToCart: (product: any) => void;
}

export default function BestSellerCarousel({
    filteredProducts,
    isProductInWishlist,
    getProductPrice,
    isLoggedIn,
    setIsAuthOpen,
    toggleWishlist,
    addToCart,
}: Props) {
const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'start',
        slidesToScroll: 1,
        breakpoints: {
            '(min-width: 640px)': { slidesToScroll: 2 },
            '(min-width: 1024px)': { slidesToScroll: 3 },
        },
    });

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
    const [imageIndices, setImageIndices] = useState<Record<string, number>>({});
    const [selectedKarats, setSelectedKarats] = useState<Record<string, string>>({});

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on('select', onSelect);
        onSelect();
    }, [emblaApi, onSelect]);

    const scrollTo = useCallback(
        (index: number) => emblaApi && emblaApi.scrollTo(index),
        [emblaApi]
    );

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    if (filteredProducts.length === 0) return null;
return (
        <div className="relative w-full">

            {/* Navigation Buttons */}
            <button
                onClick={scrollPrev}
                className="flex absolute left-1 lg:left-[-20px] top-1/2 -translate-y-1/2 z-30 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white shadow-lg border border-[var(--color-border-subtle)] items-center justify-center text-[var(--color-teal)] hover:bg-[var(--color-teal)] hover:text-white transition-all cursor-pointer"
                aria-label="Previous products"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            <button
                onClick={scrollNext}
                className="flex absolute right-1 lg:right-[-20px] top-1/2 -translate-y-1/2 z-30 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white shadow-lg border border-[var(--color-border-subtle)] items-center justify-center text-[var(--color-teal)] hover:bg-[var(--color-teal)] hover:text-white transition-all cursor-pointer"
                aria-label="Next products"
            >
                <ChevronRight className="w-5 h-5" />
            </button>

            {/* Embla Viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-x-6 touch-pan-y">
                    {filteredProducts.map((product) => {
                        const isInWishlist = isProductInWishlist(product.id);
                        const standardPrice = getProductPrice(product);
                        const images = Array.isArray(product.images) && product.images.length ? product.images.map((image: { url: string }) => image.url) : [product.image];
                        const imageIndex = imageIndices[product.id] || 0;
                        const priceOptions = Array.isArray(product.prices) ? Array.from(new Map(product.prices.filter((price: { karat?: string }) => price.karat === "14kt" || price.karat === "18kt").map((price: { karat: string }) => [price.karat, price])).values()) : [];
                        const selectedKarat = selectedKarats[product.id] || priceOptions[0]?.karat || product.karat;
                        const selectedPrice = priceOptions.find((price: { karat?: string }) => price.karat === selectedKarat)?.finalPrice ?? standardPrice;

                        return (
                            <div
                                key={product.id}
                                // Responsive slide width: 1 on mobile, 2 on sm, 3 on lg
                                className="flex-none w-[92%] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                            >
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="group relative flex flex-col justify-between bg-white/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-[var(--color-border-subtle)] hover:border-[var(--color-cream)] hover:shadow-xl hover:shadow-[var(--color-cream)]/10 transition-all duration-500 ease-out h-full"
                                >
                                    <Link
                                        to={`/product/${product.slug}`}
                                        className="no-underline text-inherit flex flex-col flex-1"
                                    >
                                        {/* Image */}
                                        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[var(--color-bg-secondary)] mb-5">
                                            <img
                                                src={images[imageIndex]}
                                                alt={product.name}
                                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                                                loading="lazy"
                                            />
                                            {images.length > 1 && <><button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setImageIndices((current) => ({ ...current, [product.id]: (imageIndex - 1 + images.length) % images.length })); }} className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-[var(--color-teal)] shadow" aria-label="Previous product image"><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setImageIndices((current) => ({ ...current, [product.id]: (imageIndex + 1) % images.length })); }} className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-[var(--color-teal)] shadow" aria-label="Next product image"><ChevronRight className="h-4 w-4" /></button></>}
                                            {/* Badges */}
                                            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                                                {product.tags?.map((tag: string) => (
                                                    <span
                                                        key={tag}
                                                        className={`font-secondary text-[9px] tracking-widest font-semibold uppercase px-2 py-1 rounded-sm text-white ${tag === "BESTSELLER" ? "bg-[var(--color-teal)]" : "bg-amber-700"}`}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Text */}
                                        <div className="flex flex-col flex-1 px-1">
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <h3 className="font-primary text-base text-[var(--color-text)] tracking-wide font-light line-clamp-1 group-hover:text-[var(--color-teal-light)] transition-colors duration-300">
                                                    {product.name}
                                                </h3>
                                            </div>
                                            <p className="font-secondary text-xs text-[var(--color-text-muted)] tracking-wider mb-4">
                                                {product.category}
                                            </p>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (!isLoggedIn) setIsAuthOpen(true);
                                            else toggleWishlist(product);
                                        }}
                                        aria-label={isInWishlist ? "Remove from vault" : "Add to vault"}
                                        className="absolute top-7 right-7 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md text-[var(--color-text-muted)] hover:text-rose-600 border border-[var(--color-border-subtle)] hover:border-transparent transition-all duration-300 cursor-pointer z-20 focus:outline-none"
                                    >
                                        <Heart className={`w-4 h-4 transition-transform duration-300 ${isInWishlist ? "fill-rose-600 stroke-rose-600" : "stroke-[1.5]"}`} />
                                    </button>

                                    {/* Price + Cart */}
                                    <div className="flex flex-col gap-3 mt-auto pt-3 border-t border-[var(--color-border-subtle)] px-1 z-20">
                                        <div className="flex flex-col">
                                            <span className="font-secondary text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest leading-none mb-1">
                                                Estimated Price
                                            </span>
                                            <span className="font-secondary text-sm font-semibold text-[var(--color-text)]">
                                                {"\u20B9"}{Number(selectedPrice).toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                        {priceOptions.length > 1 && <div className="flex gap-1">{priceOptions.map((price: { karat: string }) => <button key={price.karat} type="button" onClick={() => setSelectedKarats((current) => ({ ...current, [product.id]: price.karat }))} className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${selectedKarat === price.karat ? "border-[var(--color-teal)] bg-[var(--color-cream-light)] text-[var(--color-teal)]" : "border-[var(--color-border-subtle)] text-[var(--color-text-muted)]"}`}>{price.karat.toUpperCase()}</button>)}</div>}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (!isLoggedIn) setIsAuthOpen(true);
                                                else addToCart(product);
                                            }}
                                            className="flex w-full items-center justify-center gap-2 bg-[var(--color-teal)] hover:bg-[var(--color-teal-light)] text-white px-4 py-2.5 rounded-md font-secondary text-xs uppercase tracking-widest transition-all duration-300 ease-out border-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--color-teal)]"
                                        >
                                            <ShoppingBag className="w-3.5 h-3.5 stroke-[1.75]" />
                                            <span>Add to Cart</span>
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Dot Navigation */}
            <div className="flex justify-center gap-2 mt-8">
                {scrollSnaps.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`transition-all duration-300 rounded-full border-none cursor-pointer focus:outline-none ${index === selectedIndex
                            ? 'w-6 h-2 bg-[var(--color-teal)]'
                            : 'w-2 h-2 bg-[var(--color-border-subtle)] hover:bg-[var(--color-teal)]/50'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}