const PRODUCT_IMAGE_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 1000'%3E%3Crect width='800' height='1000' fill='%23f6f3ee'/%3E%3Cpath d='M400 310 540 450 400 590 260 450Z' fill='none' stroke='%230f4c4c' stroke-width='18'/%3E%3Ctext x='400' y='690' text-anchor='middle' fill='%230f4c4c' font-family='serif' font-size='34'%3ETBA%3C/text%3E%3C/svg%3E";

/** Delivers Cloudinary assets in a format and size suited to the rendered breakpoint. */
export function responsiveImage(url: string | undefined, width: number) {
  if (!url || !url.includes("res.cloudinary.com")) return url || PRODUCT_IMAGE_PLACEHOLDER;
  return url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
/** Uses the uploaded original for detail galleries, avoiding format/crop transformations. */
export function detailImage(url: string | undefined) { return url || PRODUCT_IMAGE_PLACEHOLDER; }

/** Resolves public assets correctly when the storefront is deployed under a base path. */
const PUBLIC_ASSET_BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
export function publicAssetUrl(path: string | undefined) {
  if (!path || /^(?:https?:)?\/\//i.test(path) || path.startsWith("data:")) return path || "";
  return `${PUBLIC_ASSET_BASE_URL}/${path.replace(/^\/+/, "")}`;
}