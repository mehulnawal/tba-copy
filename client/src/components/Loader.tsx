import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function Loader() {
  const [show, setShow] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const monogramLettersRef = useRef<HTMLDivElement>(null);
  const brandTitleRef = useRef<HTMLDivElement>(null);
  const brandSubtitleRef = useRef<HTMLDivElement>(null);
  const counterTextRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Session Guard Check
    const isLoaded = sessionStorage.getItem("tba_loaded");
    if (isLoaded) {
      document.documentElement.setAttribute("data-loaded", "true");
      setShow(false);
      return;
    }

    // Lock screen scrolling while animating
    document.body.style.overflow = "hidden";

    // Counter counting object
    const counterObj = { value: 0 };

    // 2. High-Fidelity Performance Master Timeline
    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem("tba_loaded", "true");
        document.documentElement.setAttribute("data-loaded", "true");
        document.body.style.overflow = "";
        setShow(false);
      }
    });

    // Make the system visible smoothly at boot
    tl.set(containerRef.current, { display: "flex", opacity: 1 })

      // Phase 1: High-Fashion Typographic Masked Entrance
      .fromTo(monogramLettersRef.current,
        { yPercent: 100, rotateX: -40, opacity: 0 },
        { yPercent: 0, rotateX: 0, opacity: 1, duration: 0.6, ease: "power4.out" }
      )
      .fromTo([brandTitleRef.current, brandSubtitleRef.current],
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power3.out" },
        "-=0.4"
      )

      // Phase 2: Concurrent Tracking Progress Line & Micro-Counter Ticking
      .fromTo(progressLineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.1, ease: "power2.inOut", transformOrigin: "left center" },
        "-=0.5"
      )
      .to(counterObj, {
        value: 100,
        duration: 1.1,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counterTextRef.current) {
            // Keeps the number formatting clean with premium padding (00, 05, etc.)
            counterTextRef.current.innerText = Math.floor(counterObj.value)
              .toString()
              .padStart(2, "0");
          }
        }
      }, "-=1.1")

      // Phase 3: Ultra-Premium Luxury Cinematic Exit (Scale, Blur & Lift Out)
      .to(containerRef.current, {
        yPercent: -100,
        scale: 1.02,
        filter: "blur(10px)",
        duration: 0.65,
        ease: "power4.inOut",
        delay: 0.05
      });

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!show) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "var(--color-teal-dark)", // #132831[cite: 11]
        display: "none",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-cream)", // #e4d5c3[cite: 11]
        willChange: "transform, filter",
        backfaceVisibility: "hidden",
      }}
      className="perspective-1000"
    >
      {/* ATMOSPHERIC BACKGROUND RADIAL BREATH GAIN */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, var(--color-teal-light) 0%, transparent 70%)"
        }}
      />

      {/* CENTER PIECE BRAND ARCHITECTURE BLOCK */}
      <div className="text-center select-none px-8 flex flex-col items-center relative z-10">

        {/* Monogram Wrapped in a Text Clipping Mask Zone */}
        <div className="overflow-hidden py-1 mb-2">
          <div
            ref={monogramLettersRef}
            className="font-display text-[40px] md:text-[56px] tracking-[0.4em] font-light text-white pl-[0.4em]"
          >
            TBA
          </div>
        </div>

        {/* Minimal Sophisticated Horizontal Line Ornament */}
        <div className="w-10 h-[1px] bg-[var(--color-cream)]/20 my-4" />

        {/* Brand Name Title Wrapped in a Text Clipping Zone */}
        <div className="overflow-hidden py-0.5">
          <div
            ref={brandTitleRef}
            className="font-primary text-sm md:text-lg tracking-[0.25em] uppercase font-normal text-[var(--color-cream)] pl-[0.25em]"
          >
            The Brilliance Atelier
          </div>
        </div>

        {/* Brand Subtitle Gist Statement Wrapped in a Text Clipping Zone */}
        <div className="overflow-hidden py-0.5 mt-1">
          <div
            ref={brandSubtitleRef}
            className="font-secondary text-[8px] md:text-[9px] tracking-[0.45em] uppercase text-[var(--color-text-muted)] pl-[0.45em]"
          >
            Fine Handcrafted Jewelry
          </div>
        </div>
      </div>

      {/* RE-ENGINEERED HIGH-END METRIC PROGRESS AREA */}
      <div className="absolute bottom-20 flex flex-col items-center gap-3 w-40 md:w-48 z-10">

        {/* Luxury Micro Ticking Counter Indicator */}
        <div className="font-display text-xs tracking-widest text-[var(--color-cream)]/70 font-light flex items-center gap-1">
          <span ref={counterTextRef}>00</span>
          <span className="text-[9px] opacity-40">/ 100</span>
        </div>

        {/* Premium ScaleX Hairline Anchor */}
        <div className="w-full h-[1px] bg-white/10 relative overflow-hidden">
          <div
            ref={progressLineRef}
            className="w-full h-full bg-[var(--color-cream)] shadow-[0_0_8px_rgba(228,213,195,0.7)]"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </div>
  );
}