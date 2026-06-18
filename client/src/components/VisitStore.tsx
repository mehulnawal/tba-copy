import storeImg from "../assets/map/store_banner_homepage.webp";

export default function VisitStore() {
    return (
        <section
            className="w-full overflow-hidden relative"
            style={{ background: "#1c3b48", fontFamily: "Montserrat, Helvetica Neue, sans-serif" }}
            id="visit-store-section"
            aria-label="Visit The Brilliance Atelier store"
        >
            {/* Corner bracket mark */}
            <div
                className="absolute top-6 right-6 w-10 h-10 pointer-events-none"
                style={{
                    borderTop: "1px solid rgba(219,213,181,0.2)",
                    borderRight: "1px solid rgba(219,213,181,0.2)",
                }}
            />

            {/* Top: Image + Content */}
            <div className="grid grid-cols-1 sm:grid-cols-2 min-h-[380px]">

                {/* Left — Store Image */}
                <div className="relative overflow-hidden min-h-[220px] sm:min-h-[380px]">
                    <img
                        src={storeImg}
                        alt="The Brilliance Atelier store"
                        className="w-full h-full object-cover object-center"
                        style={{ filter: "brightness(0.75)" }}
                        loading="lazy"
                    />

                    {/* Open Today tag */}
                    <div className="absolute bottom-0 left-0 right-0 p-6"
                        style={{ background: "linear-gradient(to top, rgba(28,59,72,0.95) 0%, transparent 100%)" }}
                    >
                        <span className="inline-flex items-center gap-2"
                            style={{
                                background: "rgba(219,213,181,0.15)",
                                border: "1px solid rgba(219,213,181,0.3)",
                                padding: "6px 14px",
                                fontSize: "10px",
                                letterSpacing: "0.2em",
                                textTransform: "uppercase",
                                color: "#dbd5b5",
                                fontWeight: 600,
                            }}
                        >
                            {/* Blinking dot */}
                            <span className="w-1.5 h-1.5 rounded-full bg-[#dbd5b5] animate-pulse" />
                            Open Today · 10AM – 8PM
                        </span>
                    </div>
                </div>

                {/* Right — Content */}
                <div
                    className="flex flex-col justify-center gap-8 px-8 md:px-12 py-12 sm:py-14"
                    style={{ borderLeft: "1px solid rgba(219,213,181,0.1)" }}
                >
                    <p style={{
                        fontSize: "9px",
                        letterSpacing: "0.35em",
                        textTransform: "uppercase",
                        color: "rgba(219,213,181,0.5)",
                        margin: 0,
                        fontWeight: 600,
                    }}>
                        The Brilliance Atelier · Surat
                    </p>

                    <h2
                        className="font-primary m-0"
                        style={{
                            fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
                            fontWeight: 300,
                            color: "#faf9f7",
                            lineHeight: 1.1,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Gold is meant
                        <br />to be touched.
                        <span style={{
                            display: "block",
                            fontStyle: "italic",
                            color: "#dbd5b5",
                            fontSize: "0.75em",
                            letterSpacing: "0.02em",
                            marginTop: "4px",
                        }}>
                            — come find yours.
                        </span>
                    </h2>

                    {/* Info Pills */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            { icon: "📍", label: "Surat, Gujarat" },
                            { icon: "✦", label: "BIS Certified" },
                        ].map((item) => (
                            <span
                                key={item.label}
                                className="inline-flex items-center gap-1.5"
                                style={{
                                    padding: "6px 14px",
                                    border: "1px solid rgba(219,213,181,0.2)",
                                    fontSize: "10px",
                                    letterSpacing: "0.1em",
                                    color: "rgba(250,249,247,0.7)",
                                    fontWeight: 500,
                                }}
                            >
                                <span style={{ color: "#dbd5b5", fontSize: "11px" }}>{item.icon}</span>
                                {item.label}
                            </span>
                        ))}
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mt-2">
                        {/* Primary CTA — swap href to actual Google Maps URL */}
                        <a
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Get directions to TBA store on Google Maps"
                            className="inline-flex items-center gap-3 no-underline transition-all duration-300"
                            style={{
                                background: "#dbd5b5",
                                color: "#1c3b48",
                                fontSize: "10px",
                                fontWeight: 800,
                                letterSpacing: "0.2em",
                                textTransform: "uppercase",
                                padding: "15px 28px",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#faf9f7")}
                            onMouseLeave={e => (e.currentTarget.style.background = "#dbd5b5")}
                        >
                            Get Directions
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </a>

                        {/* Secondary CTA — swap href to actual phone number */}
                        <a
                            href="tel:+91XXXXXXXXXX"
                            className="no-underline transition-all duration-300"
                            style={{
                                fontSize: "10px",
                                letterSpacing: "0.15em",
                                textTransform: "uppercase",
                                color: "rgba(219,213,181,0.5)",
                                fontWeight: 600,
                                borderBottom: "1px solid rgba(219,213,181,0.2)",
                                paddingBottom: "2px",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.color = "#dbd5b5";
                                e.currentTarget.style.borderBottomColor = "#dbd5b5";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.color = "rgba(219,213,181,0.5)";
                                e.currentTarget.style.borderBottomColor = "rgba(219,213,181,0.2)";
                            }}
                        >
                            Call Us Instead
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Stats Strip */}
            <div
                className="grid grid-cols-2"
                style={{ borderTop: "1px solid rgba(219,213,181,0.1)" }}
            >
                {[
                    { num: "10+", label: "Years of Craft" },
                    { num: "100%", label: "BIS Hallmarked" },
                ].map((stat, i) => (
                    <div
                        key={stat.label}
                        className="flex flex-col gap-1 px-8 py-6"
                        style={{
                            borderRight: i < 2 ? "1px solid rgba(219,213,181,0.1)" : "none",
                            borderBottom: "1px solid rgba(219,213,181,0.05)",
                        }}
                    >
                        <span
                            className="font-primary"
                            style={{
                                fontSize: "1.6rem",
                                fontWeight: 400,
                                color: "#dbd5b5",
                                lineHeight: 1,
                                letterSpacing: "-0.01em",
                            }}
                        >
                            {stat.num}
                        </span>
                        <span style={{
                            fontSize: "9px",
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: "rgba(250,249,247,0.35)",
                            fontWeight: 600,
                        }}>
                            {stat.label}
                        </span>
                    </div>
                ))}
            </div>

        </section>
    );
}