/** Delivers Cloudinary assets in a format and size suited to the rendered breakpoint. */
export function responsiveImage(url: string | undefined, width: number) {
  if (!url || !url.includes("res.cloudinary.com")) return url || "";
  return url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}