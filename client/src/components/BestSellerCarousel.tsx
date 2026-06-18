import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';

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

    return (
        <div className="w-full">
            {/* Embla Viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-x-6 touch-pan-y">
                    {filteredProducts.map((product) => {
                        const isInWishlist = isProductInWishlist(product.id);
                        const standardPrice = getProductPrice(product);

                        return (
                            <div
                                key={product.id}
                                // Responsive slide width: 1 on mobile, 2 on sm, 3 on lg
                                className="flex-none w-[85%] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                            >
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="group relative flex flex-col justify-between bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-[var(--color-border-subtle)] hover:border-[var(--color-cream)] hover:shadow-xl hover:shadow-[var(--color-cream)]/10 transition-all duration-500 ease-out h-full"
                                >
                                    <Link
                                        to={`/product/${product.slug}`}
                                        className="no-underline text-inherit flex flex-col flex-1"
                                    >
                                        {/* Image */}
                                        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[var(--color-bg-secondary)] mb-5">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                                                loading="lazy"
                                            />
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
                                                <span className="font-secondary text-[11px] font-medium tracking-wider text-[var(--color-teal)] bg-[var(--color-cream-light)] px-2 py-0.5 rounded-full whitespace-nowrap self-center">
                                                    {product.karat}
                                                </span>
                                            </div>
                                            <p className="font-secondary text-xs text-[var(--color-text-muted)] tracking-wider mb-4">
                                                {product.category}
                                            </p>
                                        </div>
                                    </Link>

                                    {/* Wishlist Button */}
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
                                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--color-border-subtle)] px-1 z-20">
                                        <div className="flex flex-col">
                                            <span className="font-secondary text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest leading-none mb-1">
                                                Estimated Price
                                            </span>
                                            <span className="font-secondary text-sm font-semibold text-[var(--color-text)]">
                                                ₹{standardPrice.toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (!isLoggedIn) setIsAuthOpen(true);
                                                else addToCart(product);
                                            }}
                                            className="flex items-center gap-2 bg-[var(--color-teal)] hover:bg-[var(--color-teal-light)] text-white px-4 py-2.5 rounded-md font-secondary text-xs uppercase tracking-widest transition-all duration-300 ease-out border-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--color-teal)]"
                                        >
                                            <ShoppingBag className="w-3.5 h-3.5 stroke-[1.75]" />
                                            <span>Acquire</span>
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