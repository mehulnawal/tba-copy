import React from "react";
import { motion } from "framer-motion";
import { SOCIAL_LINKS } from "../constants/assets";
import { Instagram } from "lucide-react";

export default function FloatingButtons() {
  return (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[var(--z-float)] flex flex-col gap-3">
      {/* INSTAGRAM PORT */}
      <motion.a
        href={SOCIAL_LINKS.instagram}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        whileHover={{ scale: 1.12 }}
        className="group relative w-11 h-11 md:w-13 md:h-13 rounded-full flex items-center justify-center shadow-lg hover:shadow-[var(--shadow-cream)] transition-all cursor-pointer"
        style={{
          background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
        }}
        id="floating-insta-btn"
      >
        <Instagram className="w-5 h-5 md:w-5.5 md:h-5.5 text-white" />

        {/* Tooltip */}
        <span className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-[var(--color-teal)] text-white text-[10px] md:text-xs font-secondary tracking-wider py-1 px-3 rounded-sm opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 pointer-events-none transition-all duration-300 shadow-md whitespace-nowrap">
          Follow on Instagram
        </span>
      </motion.a>

      {/* WHATSAPP PORT WITH ORIGINAL BRAND SVG */}
      <motion.a
        href={SOCIAL_LINKS.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.7, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        whileHover={{ scale: 1.12 }}
        className="group relative w-11 h-11 md:w-13 md:h-13 rounded-full flex items-center justify-center shadow-lg hover:shadow-[var(--shadow-cream)] transition-all cursor-pointer bg-[#25D366]"
        id="floating-wa-btn"
      >
        {/* Authentic Original WhatsApp Logo SVG */}
        <svg
          className="w-5 h-5 md:w-6 md:h-6 fill-white"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.455L0 24zm6.59-4.846c1.66.986 3.292 1.499 5.341 1.5 5.382 0 9.764-4.35 9.767-9.694.002-2.59-1.001-5.023-2.825-6.849-1.824-1.825-4.255-2.83-6.847-2.83-5.393 0-9.776 4.35-9.779 9.696-.001 2.146.574 4.211 1.664 5.986l-.999 3.647 3.679-.96zm10.155-6.864c-.266-.134-1.574-.775-1.817-.863-.243-.089-.419-.133-.596.134-.176.265-.685.862-.839 1.039-.154.177-.308.199-.574.065-.266-.134-1.123-.414-2.139-1.32-.79-.704-1.323-1.573-1.478-1.839-.154-.266-.016-.41.118-.543.121-.119.266-.31.4-.465.133-.155.177-.266.266-.443.089-.177.044-.332-.022-.465-.066-.133-.596-1.437-.816-1.968-.215-.518-.432-.448-.596-.456-.154-.008-.331-.01-.508-.01-.177 0-.464.066-.707.332-.243.265-.928.907-.928 2.21 0 1.302.946 2.562 1.078 2.739.133.177 1.86 2.84 4.505 3.987.63.272 1.12.435 1.503.556.632.2 1.208.172 1.662.104.507-.076 1.574-.641 1.795-1.26.221-.619.221-1.149.155-1.26-.066-.11-.242-.177-.508-.31z" />
        </svg>

        {/* Tooltip */}
        <span className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-[var(--color-teal)] text-white text-[10px] md:text-xs font-secondary tracking-wider py-1 px-3 rounded-sm opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 pointer-events-none transition-all duration-300 shadow-md whitespace-nowrap">
          Chat on WhatsApp
        </span>
      </motion.a>
    </div>
  );
}