import React from 'react';
import { ArrowRight } from 'lucide-react';

// Brand & Text Constants for high maintainability
const BRAND_NAME = "TBA";
const BRAND_SUBTEXT = "THE BRILLIANCE ATELIER";
const HERO_TITLE = "Coming Soon";
const HERO_SUBTEXT = "Crafting a timeless jewelry experience designed for elegance, luxury, and modern sophistication.";
const FOOTER_TEXT = "All Rights Reserved.";

export default function ComingSoonPage() {
    // Render dynamic year server-safe / performance-optimized without useEffect triggers
    const currentYear = new Date().getFullYear();

    return (
        <div
            className="relative min-h-screen w-full flex flex-col justify-between select-none antialiased bg-[#faf8f5] text-[#0f1a1c] px-6 sm:px-8 md:px-12"
            style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
        >
            {/* --- HEADER LOGO & BRAND SECTION --- */}
            <header className="w-full pt-10 md:pt-16 flex flex-col items-center text-center z-10 shrink-0">
                <div className="flex flex-col items-center max-w-full">
                    {/* Optional Logo Slot - Handled safely with absolute sizing bounds */}
                    {/* <img 
                        src="/assets/logo.png" 
                        alt={`${BRAND_NAME} Logo`} 
                        className="w-10 h-10 md:w-12 md:h-12 object-contain mb-4"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    /> */}

                    <span className="text-2xl md:text-3xl font-light tracking-[0.25em] leading-none block break-words max-w-xs sm:max-w-md">
                        {BRAND_NAME}
                    </span>

                    <span
                        className="text-[9px] md:text-[10px] tracking-[0.35em] uppercase font-medium mt-3 opacity-70 block break-words max-w-xs sm:max-w-md"
                        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    >
                        {BRAND_SUBTEXT}
                    </span>
                </div>
            </header>

            {/* --- MAIN HERO CONTENT SECTION --- */}
            {/* min-h-0 prevents container from busting layout in ultra-short viewports */}
            <main className="flex-grow flex flex-col items-center justify-center py-12 md:py-16 min-h-0 z-10">
                <div className="max-w-2xl w-full mx-auto flex flex-col items-center text-center">

                    {/* Core Typography Block */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight tracking-tight leading-tight text-balance">
                        {HERO_TITLE}
                    </h1>

                    <p
                        className="max-w-md mx-auto text-sm sm:text-base font-light leading-relaxed tracking-wide opacity-80 mt-6 md:mt-8 text-balance"
                        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    >
                        {HERO_SUBTEXT}
                    </p>

                    {/* CTA Section (Completely Static Luxury Button) */}
                    <div className="mt-10 md:mt-12">
                        <button
                            disabled
                            aria-disabled="true"
                            className="px-8 py-3.5 rounded-none text-[11px] font-light tracking-[0.2em] uppercase border border-[#005c53]/20 bg-white/60 text-[#1c2b29] cursor-not-allowed opacity-70 flex items-center justify-center gap-2.5"
                            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                        >
                            <span>Launching Soon</span>
                            <ArrowRight className="w-3.5 h-3.5 opacity-50 stroke-[1.5]" aria-hidden="true" />
                        </button>
                    </div>

                </div>
            </main>

            {/* --- FOOTER SECTION --- */}
            <footer className="w-full pb-8 md:pb-12 flex flex-col items-center space-y-4 z-10 shrink-0">
                {/* Minimalist Micro Divider Line */}
                <div className="w-12 h-[1px] bg-[#005c53]/10" aria-hidden="true" />

                <p
                    className="text-[10px] md:text-xs tracking-widest text-center font-light opacity-50 text-balance"
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                    &copy; {currentYear} {BRAND_SUBTEXT}. {FOOTER_TEXT}
                </p>
            </footer>
        </div>
    );
}