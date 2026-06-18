import React from "react";
import { Shield, Award, CheckCircle } from "lucide-react";

import cert1 from "../assets/whyChooseUs/IGILogo.png";
import cert2 from "../assets/whyChooseUs/sglLogo.png";
import cert3 from "../assets/whyChooseUs/bisLogo.png";

export default function BrandPromise() {
    const credentials = [
        {
            id: 1,
            num: "01",
            title: "IGI Diamond Certification (IGI)",
            subtitle: "International Gemological Institute (IGI)",
            desc: "Every single diamond is meticulously screened to authenticate precision grading on the global 4Cs matrix.",
            img: cert1,
            icon: <Award className="w-5 h-5 text-[var(--color-cream)]" />,
            align: "md:pt-0" // Natural staggered alignment
        },
        {
            id: 2,
            num: "02",
            title: "SGL Lab Verification (SGL)",
            subtitle: "Solitaire Gemological Laboratories (SGL)",
            desc: "Advanced spectroscopy audits guarantee structural carbon purity and independent gemstone validation.",
            img: cert2,
            icon: <Shield className="w-5 h-5 text-[var(--color-cream)]" />,
            align: "md:pt-12" // Displace slightly lower for a designer boutique feel
        },
        {
            id: 3,
            num: "03",
            title: "BIS Gold Hallmarking (BIS)",
            subtitle: "Bureau of Indian Standards (BIS)",
            desc: "Official government-mandated laser-etched purity codes certifying absolute legal gold authenticity.",
            img: cert3,
            icon: <CheckCircle className="w-5 h-5 text-[var(--color-cream)]" />,
            align: "md:pt-0"
        }
    ];

    return (
        <>
            {/* Part 1: Why Choose Us (Existing Cards) */}
            <section className="bg-[var(--color-bg-secondary)]" id="brand-promise-section">
                <div className="section-padding container">
                    <div className="text-center mb-16 reveal-section">
                        <span className="section-label">Our Promise</span>
                        <h2 className="text-4xl md:text-5xl font-primary text-[var(--color-teal)] font-normal tracking-wide">
                            Why Choose TBA
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
                        {/* Card 1 */}
                        <div className="bg-[var(--color-white)] rounded-lg p-8 border border-[var(--color-border-subtle)] shadow-xs flex flex-col gap-4 reveal-section">
                            <Shield size={36} className="text-[var(--color-teal)] shrink-0" />
                            <h3 className="font-primary text-xl font-medium text-[var(--color-teal)]">
                                BIS Hallmarked
                            </h3>
                            <p className="font-secondary text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                Every jewelry item carries raw certification and physical BIS Hallmark verifying gold purity, guaranteeing official government standards.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-[var(--color-white)] rounded-lg p-8 border border-[var(--color-border-subtle)] shadow-xs flex flex-col gap-4 reveal-section">
                            <Award size={36} className="text-[var(--color-teal)] shrink-0" />
                            <h3 className="font-primary text-xl font-medium text-[var(--color-teal)]">
                                Bespoke Customization
                            </h3>
                            <p className="font-secondary text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                Bring your unique vision to life. From minor design tweaks to personalized layouts, our team provides highly custom tailoring to craft jewelry exactly as per your desire.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-[var(--color-white)] rounded-lg p-8 border border-[var(--color-border-subtle)] shadow-xs flex flex-col gap-4 reveal-section">
                            <Award size={36} className="text-[var(--color-teal)] shrink-0" />
                            <h3 className="font-primary text-xl font-medium text-[var(--color-teal)]">
                                Master Craftsmanship
                            </h3>
                            <p className="font-secondary text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                Engineered and finished by direct generational artisans pulling centuries of traditional jewelry expertise into every detail.
                            </p>
                        </div>

                        {/* Card 4 */}
                        <div className="bg-[var(--color-white)] rounded-lg p-8 border border-[var(--color-border-subtle)] shadow-xs flex flex-col gap-4 reveal-section">
                            <Shield size={36} className="text-[var(--color-teal)] shrink-0" />
                            <h3 className="font-primary text-xl font-medium text-[var(--color-teal)]">
                                Live Gold Pricing
                            </h3>
                            <p className="font-secondary text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                Complete buying transparency. Items prices are calculated directly from market spot-prices, without hidden overhead.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Part 2: NEW ASYMMETRIC LUXURY HORIZON (ALWAYS OPEN & DISPLAYED) */}
                <div className="w-full bg-[var(--color-teal)] py-16 md:py-24 text-white border-t border-white/10 relative overflow-hidden">

                    {/* Subtle architectural background grid lines for premium vibe */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                    <div className="container max-w-5xl mx-auto px-4 relative z-10">

                        {/* Section Header */}
                        <div className="text-center mb-16 md:mb-10">
                            <span className="text-[var(--color-cream)] font-secondary text-[10px] md:text-xs tracking-[0.35em] uppercase block mb-3">
                                Guaranteed Authenticity
                            </span>
                            <h3 className="font-primary text-3xl md:text-4xl font-light tracking-wide max-w-3xl mx-auto leading-snug !text-[var(--color-cream)]">
                                Verifiable Quality Credentials From Autonomous Labs
                            </h3>
                            <div className="w-16 h-[1px] bg-[var(--color-cream)] mx-auto mt-6 opacity-60" />
                        </div>

                        {/* Premium Multi-Column Static Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">

                            {/* Horizontal Connecting Minimal Line (Only Visible on Desktop) */}
                            <div className="hidden md:block absolute top-[26px] left-[10%] right-[10%] h-[1px] bg-white/10 z-0" />

                            {credentials.map((item) => (
                                <div
                                    key={item.id}
                                    className={`flex flex-col items-center md:items-start text-center md:text-left z-10 group ${item.align}`}
                                >
                                    {/* Top Numeric Node */}
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-teal)] border border-white/20 mb-6 transition-all duration-300 group-hover:border-[var(--color-cream)] group-hover:shadow-[0_0_15px_rgba(245,245,220,0.15)]">
                                        <span className="font-mono text-xs tracking-widest text-[var(--color-cream)] font-medium">
                                            {item.num}
                                        </span>
                                    </div>

                                    {/* Text Header */}
                                    <div className="flex items-center gap-2 mb-2 justify-center md:justify-start ">
                                        {item.icon}
                                        <h4 className="font-secondary text-sm font-semibold tracking-wider uppercase !text-[var(--color-cream)]">
                                            {item.title}
                                        </h4>
                                    </div>

                                    {/* Subtitle */}
                                    <span className="font-primary italic text-[var(--color-cream)] text-sm opacity-90 block mb-3">
                                        {item.subtitle}
                                    </span>

                                    {/* Paragraph Description */}
                                    <p className="font-secondary text-xs text-white/70 leading-relaxed font-light mb-6 max-w-xs">
                                        {item.desc}
                                    </p>

                                    {/* Image Card Canvas (Clean Display) */}
                                    <div className="w-full max-w-[240px] aspect-[2.2/1] bg-white/5 backdrop-blur-xs border border-white/10 rounded-lg p-4 flex items-center justify-center transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20 shadow-xs relative overflow-hidden">
                                        {/* Shimmer light effect on layout hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

                                        <img
                                            src={item.img}
                                            alt={item.title}
                                            className="max-h-[55px] md:max-h-[60px] w-auto object-contain filter brightness-100 contrast-100 select-none transition-transform duration-500 group-hover:scale-102"
                                        />
                                    </div>
                                </div>
                            ))}

                        </div>

                    </div>
                </div>
            </section>
        </>
    );
}