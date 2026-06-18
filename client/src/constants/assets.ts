// ALL image paths and links live here ONLY.
// Replace a path here → changes everywhere automatically.

export const BRAND_ASSETS = {
  // Let's use clean text/vector-styled fallbacks or dynamic icons if local files are missing,
  // but we can structure them properly. We can also render the logo inline as beautiful SVG.
  logo: "/images/brand/tba-logo.png",
  logoWhite: "/images/brand/tba-logo-white.png",
} as const;

export const HERO_ASSETS = {
  slide1:
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=85&auto=format",
  slide2:
    "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=1920&q=85&auto=format",
  slide3:
    "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1920&q=85&auto=format",
} as const;

export const PRODUCT_ASSETS = {
  p1: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=85&auto=format",
  p2: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=85&auto=format",
  p3: "https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=600&q=85&auto=format",
  p4: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=85&auto=format",
  p5: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=85&auto=format",
  p6: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=85&auto=format",
} as const;

export const PRIME_ASSETS = {
  look1:
    "https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=1400&q=85&auto=format",
  look2:
    "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=1400&q=85&auto=format",
  look3:
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=85&auto=format",
} as const;

export const AVATAR_ASSETS = {
  a1: "https://i.pravatar.cc/100?img=1",
  a2: "https://i.pravatar.cc/100?img=2",
  a3: "https://i.pravatar.cc/100?img=3",
  a4: "https://i.pravatar.cc/100?img=4",
} as const;

export const SOCIAL_LINKS = {
  whatsapp: "https://wa.me/+918780316413",
  instagram: "https://instagram.com/tbajewels",
} as const;

export const GOLD_API = {
  endpoint: "/api/gold-price",
  refetchMs: 5 * 60 * 1000,
};
