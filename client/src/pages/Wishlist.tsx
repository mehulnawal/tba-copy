import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Heart, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useWishlist, useRemoveFromWishlist } from '../hooks/useWishlist';
import { useAddToCart } from '../hooks/useCart';
import { useToast } from '../context/ToastContext';
import { ApiRequestError } from '../api/client';

/* ==========================================================================
   MOCK WISHLIST DATA
   ========================================================================== */
interface WishlistItem {
    id: string;
    productId: string;
    slug: string;
    name: string;
    category: string;
    image: string;
    price: number;
}

/* ==========================================================================
   ANIMATION VARIIANTS (Subtle, Cinematic Editorial)
   ========================================================================== */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: [0.215, 0.610, 0.355, 1.000] as const }
    },
    exit: {
        opacity: 0,
        scale: 0.98,
        transition: { duration: 0.3, ease: [0.4, 0, 1, 1] as const }
    }
};

/* ==========================================================================
   WISHLIST PRODUCT CARD ARCHITECTURE
   ========================================================================== */
interface CardProps {
    item: WishlistItem;
    onRemove: (productId: string) => void;
    onAddToCart: (item: WishlistItem) => void;
    isActionLoading: string | null;
}

const WishlistCard: React.FC<CardProps> = ({ item, onRemove, onAddToCart, isActionLoading }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const isLoadingThis = isActionLoading === item.id;

    return (
        <motion.article
            variants={cardVariants}
            layout
            className="group relative flex flex-col bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] overflow-hidden transition-all duration-300 focus-within:ring-1 focus-within:ring-[var(--color-teal)]"
        >
            {/* Aspect-Locked Editorial Canvas Container */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--color-cream-light)]">

                {/* Native Theme Skeleton System Integrator */}
                {!imageLoaded && !imageError && (
                    <div className="skeleton absolute inset-0 w-full h-full" />
                )}

                {imageError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-[var(--color-cream-light)]">
                        <Sparkles className="w-5 h-5 text-[var(--color-text-muted)] opacity-40 mb-2 stroke-[1.25]" />
                        <span className="font-secondary text-[11px] tracking-widest uppercase text-[var(--color-text-muted)]">
                            Piece Display Offline
                        </span>
                    </div>
                ) : (
                    <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        className={`w-full h-full object-cover object-center transition-transform duration-700 ease-[0.25,1,0.5,1] group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                    />
                )}

                {/* Absolute Floating Remove Shield Interaction */}
                <button
                    onClick={() => onRemove(item.productId)}
                    className="absolute top-4 right-4 z-10 p-2.5 bg-[var(--color-bg)]/80 backdrop-blur-md text-[var(--color-text)] opacity-80 hover:opacity-100 hover:text-red-800 transition-all duration-200 shadow-sm border border-[var(--color-border-subtle)] focus:outline-none focus:ring-1 focus:ring-[var(--color-teal)]"
                    aria-label={`Remove ${item.name} from wishlist`}
                >
                    <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                </button>

                {/* Fine Category Crest Accent */}
                <span className="absolute bottom-4 left-4 font-secondary text-[9px] tracking-[0.25em] uppercase px-2 py-1 bg-[var(--color-bg)]/70 backdrop-blur-sm text-[var(--color-text)] border border-[var(--color-border-subtle)] pointer-events-none">
                    {item.category}
                </span>
            </div>

            {/* Card Metadata Dossier */}
            <div className="flex flex-col flex-1 p-5 sm:p-6 bg-[var(--color-bg)]">
                <div className="flex-1 min-w-0 mb-4">
                    <h3 className="font-primary text-base sm:text-lg text-[var(--color-text)] tracking-wide line-clamp-2 leading-tight group-hover:text-[var(--color-teal-light)] transition-colors duration-300">
                        {item.name}
                    </h3>
                </div>

                <div className="flex items-baseline justify-between gap-2 border-t border-[var(--color-border-subtle)] pt-4 mt-auto">
                    <span className="font-secondary text-xs tracking-widest text-[var(--color-text-muted)] uppercase">
                        Value
                    </span>
                    <span className="font-display text-base font-medium text-[var(--color-teal)]">
                        ₹{item.price.toLocaleString()}
                    </span>
                </div>

                {/* High-Tactility Premium Call To Action */}
                <button
                    onClick={() => onAddToCart(item)}
                    disabled={isLoadingThis}
                    className="w-full mt-5 bg-[var(--color-teal)] text-[var(--color-cream)] font-secondary tracking-[0.2em] text-[11px] uppercase py-3.5 px-4 border border-transparent hover:bg-transparent hover:text-[var(--color-teal)] hover:border-[var(--color-teal)] disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 ease-out focus:outline-none focus:ring-1 focus:ring-[var(--color-teal)] flex items-center justify-center gap-2 cursor-pointer"
                >
                    {isLoadingThis ? (
                        <RefreshCw className="w-3 h-3 animate-spin stroke-[1.5]" />
                    ) : (
                        <ShoppingBag className="w-3.5 h-3.5 stroke-[1.5]" />
                    )}
                    <span>{isLoadingThis ? 'Curating...' : 'Move to Bag'}</span>
                </button>
            </div>
        </motion.article>
    );
};

/* ==========================================================================
   MAIN WISHLIST PAGE VIEW
   ========================================================================== */
export default function WishlistPage() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { data: wishlistData, isLoading: isWishlistLoading, isError } = useWishlist();
    const removeWishlistMutation = useRemoveFromWishlist();
    const addToCartMutation = useAddToCart();

    const [isPageLoading, setIsPageLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const wishlist: WishlistItem[] = useMemo(
        () =>
            (wishlistData || []).map((item) => ({
                id: item._id,
                productId: item.productId,
                slug: item.slug,
                name: item.name,
                category: item.category,
                image: item.image,
                price: item.price,
            })),
        [wishlistData],
    );

    useEffect(() => {
        if (!isWishlistLoading) {
            const timer = setTimeout(() => setIsPageLoading(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isWishlistLoading]);

    useEffect(() => {
        if (isError) {
            showToast('Unable to load wishlist', 'error');
        }
    }, [isError, showToast]);

    const handleRemoveItem = async (productId: string) => {
        try {
            await removeWishlistMutation.mutateAsync(productId);
            showToast('Removed from wishlist', 'success');
        } catch (error) {
            const message = error instanceof ApiRequestError ? error.message : 'Failed to remove item';
            showToast(message, 'error');
        }
    };

    const handleAddToCart = async (item: WishlistItem) => {
        setActionLoadingId(item.id);
        try {
            await addToCartMutation.mutateAsync({
                productId: item.productId,
                slug: item.slug,
                name: item.name,
                category: item.category,
                image: item.image,
                price: item.price,
                quantity: 1,
            });
            await removeWishlistMutation.mutateAsync(item.productId);
            showToast('Added to cart', 'success');
            navigate('/cart');
        } catch (error) {
            const message = error instanceof ApiRequestError ? error.message : 'Failed to add to cart';
            showToast(message, 'error');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleResetDemo = () => {
        navigate('/products');
    };

    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <>

            <Navbar
                onSearchChange={setSearchQuery}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
            />

            <main className="min-h-screen bg-[var(--color-bg)] transition-colors duration-300 text-[var(--color-text)] styled-scrollbar antialiased">
                <div className="container section-padding">

                    {/* Editorial Page Header Module */}
                    <header className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 md:mb-20">
                        <span className="section-label">Private Collection</span>
                        <h1 className="font-primary text-3xl sm:text-4xl md:text-5xl tracking-wide font-light text-[var(--color-teal)] mb-4">
                            My Wishlist
                        </h1>
                        <div className="h-[1px] w-12 bg-[var(--color-cream)] mx-auto mb-5" />
                        <p className="font-secondary text-sm text-[var(--color-text-muted)] tracking-wide font-light max-w-md mx-auto leading-relaxed">
                            A curated gallery of your saved treasures. Review, manage, or transfer your chosen pieces to the shopping vault.
                        </p>

                        {/* Dev Demo Controller Anchor - Hidden visually from real assistive structures */}
                        {wishlist.length === 0 && !isPageLoading && (
                            <button
                                onClick={handleResetDemo}
                                className="mt-4 font-secondary text-[10px] tracking-widest uppercase text-[var(--color-teal)]/40 hover:text-[var(--color-teal)] transition-colors duration-200 underline underline-offset-4"
                            >
                                Reset Private Gallery Simulation
                            </button>
                        )}
                    </header>

                    <AnimatePresence mode="wait">
                        {/* Skeleton Framework State */}
                        {isPageLoading ? (
                            <motion.div
                                key="loading-skeleton"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
                            >
                                {Array.from({ length: wishlist.length || 4 }).map((_, i) => (
                                    <div key={`skeleton-${i}`} className="flex flex-col space-y-4">
                                        <div className="skeleton aspect-[4/5] w-full" />
                                        <div className="skeleton h-5 w-3/4" />
                                        <div className="skeleton h-4 w-1/2" />
                                        <div className="skeleton h-10 w-full pt-2" />
                                    </div>
                                ))}
                            </motion.div>
                        ) : wishlist.length > 0 ? (
                            /* Active Grid Interface */
                            <motion.div
                                key="active-wishlist"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
                            >
                                <AnimatePresence mode="popLayout">
                                    {wishlist.map((item) => (
                                        <WishlistCard
                                            key={item.id}
                                            item={item}
                                            onRemove={handleRemoveItem}
                                            onAddToCart={handleAddToCart}
                                            isActionLoading={actionLoadingId}
                                        />
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            /* Refined Cinematic Empty State */
                            <motion.div
                                key="empty-wishlist"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="max-w-md mx-auto text-center py-12 px-6 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex flex-col items-center justify-center shadow-sm"
                            >
                                <div className="w-12 h-12 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] mb-6 opacity-80">
                                    <Heart className="w-5 h-5 stroke-[1.25]" />
                                </div>
                                <h2 className="font-primary text-xl sm:text-2xl text-[var(--color-text)] tracking-wide font-light mb-3">
                                    Your Vault is Empty
                                </h2>
                                <p className="font-secondary text-xs sm:text-sm text-[var(--color-text-muted)] tracking-wide font-light max-w-xs mx-auto leading-relaxed mb-8">
                                    As you explore our seasonal haute collections, flag the timeless statement designs that inspire you.
                                </p>
                                <button
                                    onClick={() => alert('Navigating to collection showcase...')}
                                    className="group flex items-center justify-center gap-2.5 bg-[var(--color-teal)] text-[var(--color-cream)] font-secondary tracking-[0.25em] text-[11px] uppercase py-4 px-8 border border-transparent hover:bg-transparent hover:text-[var(--color-teal)] hover:border-[var(--color-teal)] transition-all duration-400 ease-out focus:outline-none focus:ring-1 focus:ring-[var(--color-teal)] cursor-pointer"
                                >
                                    <span>Explore Creations</span>
                                    <ArrowRight className="w-3.5 h-3.5 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-1" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </main>

            <Footer onCategoryChange={setActiveCategory} />

        </>
    );
}