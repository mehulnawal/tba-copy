/** Delivers Cloudinary assets in a format and size suited to the rendered breakpoint. */
export function responsiveImage(url: string | undefined, width: number) {
  if (!url || !url.includes("res.cloudinary.com")) return url || "";
  return url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
/** Resolves public assets correctly when the storefront is deployed under a base path. */
const PUBLIC_ASSET_BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
export function publicAssetUrl(path: string | undefined) {
  if (!path || /^(?:https?:)?\/\//i.test(path) || path.startsWith("data:")) return path || "";
  return `${PUBLIC_ASSET_BASE_URL}/${path.replace(/^\/+/, "")}`;
}