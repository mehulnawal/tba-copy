import React from "react";
import { motion } from "framer-motion";
import { SOCIAL_LINKS } from "../constants/assets";
import { Phone, Mail, MapPin, Instagram, Heart, Shield, Award } from "lucide-react";
import logo from "../assets/logo/logo2.png";

export default function Footer({ onCategoryChange }: { onCategoryChange: (category: string) => void }) {
  const handleExploreClick = (category: string) => {
    onCategoryChange(category);
    const mainSection = document.getElementById("featured-collection-section");
    if (mainSection) {
      mainSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="w-full bg-[var(--color-teal-dark)] text-white pt-4">
      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-4 lg-pb-2">

        {/* COLUMN 1: BRAND PLATFORM */}
        <div className="flex flex-col gap-5 pb-4">
          <div className="flex items-center gap-2 select-none">
            <a href="/" className="flex items-center select-none shrink-0" aria-label="Home">
              <img
                src={logo}
                alt="TBA"
                className="w-24 sm:w-28 md:w-32 lg:w-36 h-auto object-contain"
              />
            </a>
          </div>

          <p className="font-primary italic text-[var(--color-cream)] text-lg leading-snug">
            Where Every Piece Tells a Story
          </p>

          <p className="font-secondary  text-xs leading-relaxed max-w-[280px]">
            Exquisite handcrafted jewelry marrying rich Indian heritage with modern design aesthetics. Curated for the sophisticated connoisseur.
          </p>

          {/* Social icons row */}
          <div className="flex gap-4 mt-2">
            <motion.a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              className="flex items-center justify-center w-10 h-10 rounded-full text-white transition-all"
              style={{ background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" }}
              aria-label="Instagram Profile"
              id="footer-insta-social-btn"
            >
              <Instagram size={18} />
            </motion.a>

            {/* WHATSAPP SOCIAL BUTTON WITH ORIGINAL BRAND SVG */}
            <motion.a
              href={SOCIAL_LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              className="flex items-center justify-center w-10 h-10 rounded-full text-white transition-all bg-[#25D366]"
              aria-label="WhatsApp Hotline"
              id="footer-wa-social-btn"
            >
              <svg
                className="w-[18px] h-[18px] fill-white"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.455L0 24zm6.59-4.846c1.66.986 3.292 1.499 5.341 1.5 5.382 0 9.764-4.35 9.767-9.694.002-2.59-1.001-5.023-2.825-6.849-1.824-1.825-4.255-2.83-6.847-2.83-5.393 0-9.776 4.35-9.779 9.696-.001 2.146.574 4.211 1.664 5.986l-.999 3.647 3.679-.96zm10.155-6.864c-.266-.134-1.574-.775-1.817-.863-.243-.089-.419-.133-.596.134-.176.265-.685.862-.839 1.039-.154.177-.308.199-.574.065-.266-.134-1.123-.414-2.139-1.32-.79-.704-1.323-1.573-1.478-1.839-.154-.266-.016-.41.118-.543.121-.119.266-.31.4-.465.133-.155.177-.266.266-.443.089-.177.044-.332-.022-.465-.066-.133-.596-1.437-.816-1.968-.215-.518-.432-.448-.596-.456-.154-.008-.331-.01-.508-.01-.177 0-.464.066-.707.332-.243.265-.928.907-.928 2.21 0 1.302.946 2.562 1.078 2.739.133.177 1.86 2.84 4.505 3.987.63.272 1.12.435 1.503.556.632.2 1.208.172 1.662.104.507-.076 1.574-.641 1.795-1.26.221-.619.221-1.149.155-1.26-.066-.11-.242-.177-.508-.31z" />
              </svg>
            </motion.a>
          </div>
        </div>

        {/* COLUMN 2: EXPLORE SECTIONS */}
        <div className="flex flex-col gap-4">
          <h4 className="font-secondary text-xs uppercase tracking-[0.3em] font-bold mb-2 !text-[var(--color-cream)]">Explore</h4>
          <ul className="flex flex-col gap-3 font-secondary text-xs ">
            <li>
              <button onClick={() => handleExploreClick("All")} className="hover:text-[var(--color-cream)] bg-transparent border-none text-left cursor-pointer p-0 hover:pl-1 transition-all duration-300">
                All Collections
              </button>
            </li>
            <li>
              <button onClick={() => handleExploreClick("Rings")} className="hover:text-[var(--color-cream)] bg-transparent border-none text-left cursor-pointer p-0 hover:pl-1 transition-all duration-300">
                Gold & Diamond Rings
              </button>
            </li>
            <li>
              <button onClick={() => handleExploreClick("Necklaces")} className="hover:text-[var(--color-cream)] bg-transparent border-none text-left cursor-pointer p-0 hover:pl-1 transition-all duration-300">
                Designer Necklaces
              </button>
            </li>
            <li>
              <button onClick={() => handleExploreClick("Earrings")} className="hover:text-[var(--color-cream)] bg-transparent border-none text-left cursor-pointer p-0 hover:pl-1 transition-all duration-300">
                Statement Earrings
              </button>
            </li>
            <li>
              <button onClick={() => handleExploreClick("Bracelets")} className="hover:text-[var(--color-cream)] bg-transparent border-none text-left cursor-pointer p-0 hover:pl-1 transition-all duration-300">
                Luxury Bracelets
              </button>
            </li>
          </ul>
        </div>

        {/* COLUMN 3: DIRECT CONNECT */}
        <div className="flex flex-col gap-4">
          <h4 className="font-secondary text-xs uppercase tracking-[0.3em] !text-[var(--color-cream)] font-bold mb-2">Get In Touch</h4>
          <ul className="flex flex-col gap-4 font-secondary text-xs ">
            <li className="flex gap-3 items-start">
              <Phone size={14} className="text-[var(--color-cream)] shrink-0 mt-0.5" />
              <a href="tel:+919999999999" className="hover:text-[var(--color-cream)] transition-colors">+91 99999 99999</a>
            </li>
            <li className="flex gap-3 items-start">
              <Mail size={14} className="text-[var(--color-cream)] shrink-0 mt-0.5" />
              <a href="mailto: customercare.tba@gmail.com" className="hover:text-[var(--color-cream)] transition-colors">customercare.tba@gmail.com</a>
            </li>
            <li className="flex gap-3 items-start">
              <MapPin size={14} className="text-[var(--color-cream)] shrink-0 mt-0.5" />
              <span>Surat, Gujarat, India</span>
            </li>
          </ul>
        </div>
      </div>

      {/* BOTTOM COPYRIGHT ROW */}
      <div className="border-t border-white/10 w-full">
        <div className="container py-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] font-secondary text-white/40 tracking-wider">
          <span>© 2026 TBA - The Brilliance Atelier. All rights reserved.</span>
          <span className="flex items-center gap-1">Crafted with <Heart size={10} className="text-red-500 fill-red-500" /> in India</span>
        </div>
      </div>
    </footer>
  );
}