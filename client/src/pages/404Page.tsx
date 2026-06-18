import React, { useState } from 'react';
import { ArrowLeft, Home, HelpCircle, Compass, ShoppingBag, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import assets and existing design layouts
import logoAsset from "../assets/logo/logo.png";
import Footer from '../components/Footer';
import FloatingButtons from '../components/FloatingButtons';
import Navbar from '../components/Navbar';

const ERROR_CODE = "404";
const ERROR_TITLE = "An Uncharted Discovery";
const ERROR_SUBTEXT = "Like an unpolished stone or a design sketch yet realized, this specific space remains undefined. Let our advisors guide you back to our curated collections.";

export default function NotFoundPage() {
    const navigate = useNavigate();
    const [activeCard, setActiveCard] = useState<number | null>(null);

    const handleCategoryRedirect = (category: string) => {
        navigate(`/products?category=${encodeURIComponent(category)}`);
    };

    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <>

            {/* <Navbar
                onSearchChange={setSearchQuery}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
            /> */}

            <div
                className="w-full flex flex-col min-h-screen select-none antialiased relative overflow-x-hidden"
                style={{
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-secondary)'
                }}
            >
                <style>{`
                @keyframes orbit-slow {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(40px, -60px) scale(1.15); }
                    66% { transform: translate(-30px, 30px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @keyframes orbit-reverse {
                    0% { transform: translate(0px, 0px) scale(1.1); }
                    50% { transform: translate(-50px, 50px) scale(0.85); }
                    100% { transform: translate(0px, 0px) scale(1.1); }
                }
                @keyframes subtle-pulse {
                    0%, 100% { opacity: 0.15; transform: scale(1); }
                    50% { opacity: 0.35; transform: scale(1.03); }
                }
                .animate-orbit-1 { animation: orbit-slow 22s infinite ease-in-out; }
                .animate-orbit-2 { animation: orbit-reverse 28s infinite ease-in-out; }
                .animate-pulse-subtle { animation: subtle-pulse 4s infinite ease-in-out; }
            `}</style>

                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
                    {/* Luxury Ambient Teal Orbs */}
                    <div
                        className="absolute top-[-10%] right-[-10%] w-[45rem] h-[45rem] rounded-full blur-[160px] opacity-[0.06] animate-orbit-1"
                        style={{ backgroundColor: 'var(--color-teal)' }}
                    />
                    <div
                        className="absolute bottom-[5%] left-[-5%] w-[40rem] h-[40rem] rounded-full blur-[140px] opacity-[0.04] animate-orbit-2"
                        style={{ backgroundColor: 'var(--color-cream)' }}
                    />

                    {/* Premium Abstract Design Frame */}
                    <div className="absolute inset-10 border border-[var(--color-border-subtle)] opacity-40 pointer-events-none hidden md:block" />
                </div>

                <header className="w-full h-[var(--navbar-height)] border-b border-[var(--color-border-subtle)] bg-white/80 backdrop-blur-md flex items-center justify-center shrink-0 z-30 sticky top-0">
                    <a href="/" className="flex items-center select-none focus:outline-none transition-transform duration-300 active:scale-95" aria-label="Home">
                        <img
                            src={logoAsset}
                            alt="TBA"
                            className="w-24 sm:w-28 md:w-32 lg:w-36 h-auto object-contain"
                        />
                    </a>
                </header>

                <main className="flex-grow flex flex-col justify-center items-center py-2 md:py-3 relative z-10 container px-4 sm:px-8">
                    <div className="mx-auto flex flex-col items-center text-center">

                        {/* Massive Elegant Watermark Background Group */}
                        <div className="relative mb-4 select-none">
                            <span
                                className="font-primary text-[9rem] sm:text-[12rem] md:text-[15rem] font-extralight tracking-tighter text-[var(--color-teal)] opacity-[0.04] leading-none block select-none"
                                style={{ fontFamily: 'var(--font-primary)' }}
                            >
                                {ERROR_CODE}
                            </span>
                            <div className="absolute inset-0 flex items-center justify-center mt-6">
                                <span
                                    className="text-[10px] sm:text-xs font-medium tracking-[0.45em] uppercase text-[var(--color-cream)] bg-[var(--color-teal-dark)] px-4 py-1.5 shadow-sm"
                                    style={{ fontFamily: 'var(--font-secondary)' }}
                                >
                                    Page Missing
                                </span>
                            </div>
                        </div>

                        {/* Core Display Typography Heading */}
                        <h1
                            className="font-primary text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-[var(--color-teal)] leading-tight text-balance"
                            style={{ fontFamily: 'var(--font-primary)' }}
                        >
                            {ERROR_TITLE}
                        </h1>

                        {/* Luxury Description Framework */}
                        <p
                            className="font-secondary text-xs sm:text-sm text-[var(--color-text-muted)] mt-6 leading-relaxed tracking-wide text-balance font-light"
                            style={{ fontFamily: 'var(--font-secondary)' }}
                        >
                            {ERROR_SUBTEXT}
                        </p>

                        {/* PRIMARY INTERACTIVE ACTION HUBS */}
                        <div className="w-full max-w-md mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 font-secondary px-4 sm:px-0">
                            <button
                                onClick={() => {
                                    if (window.history.length > 1) {
                                        window.history.back();
                                    } else {
                                        navigate('/');
                                    }
                                }}
                                className="w-full px-6 py-4 text-[11px] font-medium tracking-[0.25em] uppercase border border-[var(--color-teal)] bg-transparent text-[var(--color-teal)] flex items-center justify-center gap-2.5 transition-all duration-300 hover:bg-[var(--color-teal)] hover:text-white active:scale-[0.98] cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" aria-hidden="true" />
                                <span>Return Back</span>
                            </button>

                            <a
                                href="/"
                                className="w-full px-6 py-4 text-[11px] font-medium tracking-[0.25em] uppercase bg-[var(--color-teal)] !text-white flex items-center justify-center gap-2.5 transition-all duration-300 hover:bg-[var(--color-teal-dark)] hover:shadow-lg active:scale-[0.98]"
                            >
                                <Home className="w-3.5 h-3.5 stroke-[1.5]" aria-hidden="true" />
                                <span>Atelier Home</span>
                            </a>
                        </div>

                        {/* LUXURY EXPERENTIAL DIRECTORY MATRIX */}
                        <div className="w-full mt-16 pt-12 border-t border-[var(--color-border-subtle)] px-2 sm:px-0">
                            <div className="flex items-center justify-center gap-3 mb-8">
                                <div className="w-8 h-[1px] bg-[var(--color-cream)] animate-pulse-subtle" />
                                <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-text-muted)] font-semibold">
                                    Begin Navigating From The Studio
                                </p>
                                <div className="w-8 h-[1px] bg-[var(--color-cream)] animate-pulse-subtle" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: 'Gold Rings', category: 'Rings', description: 'Timeless statements for fingers.' },
                                    { label: 'Necklaces', category: 'Necklaces', description: 'Sculpted chains and links.' },
                                    { label: 'Statement Earrings', category: 'Earrings', description: 'Refined structural drop pairs.' },
                                    { label: 'Luxury Bracelets', category: 'Bracelets', description: 'Classic wrist ornamentation.' }
                                ].map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleCategoryRedirect(item.category)}
                                        onMouseEnter={() => setActiveCard(idx)}
                                        onMouseLeave={() => setActiveCard(null)}
                                        className="bg-white/40 border border-[var(--color-border-subtle)] p-5 flex flex-col justify-between items-start text-left cursor-pointer transition-all duration-300 group hover:bg-white hover:border-[var(--color-teal)] hover:shadow-md min-h-[120px] relative overflow-hidden"
                                    >
                                        <div className="w-full flex justify-between items-center mb-2">
                                            <Compass className={`w-4 h-4 transition-transform duration-500 ${activeCard === idx ? 'text-[var(--color-teal)] rotate-45' : 'text-[var(--color-text-muted)] opacity-60'}`} />
                                            <span className="text-[9px] tracking-widest text-[var(--color-cream)] font-mono">0{idx + 1}</span>
                                        </div>
                                        <div>
                                            <span className="text-[11px] font-medium tracking-wider uppercase text-[var(--color-text)] block group-hover:text-[var(--color-teal)] transition-colors">
                                                {item.label}
                                            </span>
                                            <span className="text-[10px] text-[var(--color-text-muted)] font-light mt-1 block opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-10 transition-all duration-300 ease-out">
                                                {item.description}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ASSISTANCE SUPPORT PLATFORM ROW */}
                        <div className="mt-12 flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--color-text-muted)]">
                            <a
                                href="mailto:customercare.tba@gmail.com"
                                className="flex items-center gap-2 hover:text-[var(--color-teal)] transition-colors py-1 border-b border-transparent hover:border-[var(--color-teal)]/20"
                            >
                                <HelpCircle className="w-3.5 h-3.5 stroke-[1.5]" />
                                <span>Customer Care</span>
                            </a>
                            {/* <a
                                href="/cart"
                                className="flex items-center gap-2 hover:text-[var(--color-teal)] transition-colors py-1 border-b border-transparent hover:border-[var(--color-teal)]/20"
                            >
                                <ShoppingBag className="w-3.5 h-3.5 stroke-[1.5]" />
                                <span>View Bag</span>
                            </a> */}
                        </div>
                    </div>
                </main>

                <FloatingButtons />

                <Footer onCategoryChange={handleCategoryRedirect} />
            </div>

        </>
    );
}