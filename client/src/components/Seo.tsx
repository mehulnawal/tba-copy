import { Helmet } from "react-helmet-async";
import logo from "../assets/logo/logo2.png";

type StructuredData = Record<string, unknown> | Array<Record<string, unknown>>;
type SeoProps = { title: string; description: string; keywords?: string[]; image?: string; type?: "website" | "product"; noIndex?: boolean; structuredData?: StructuredData };
const configuredSiteUrl = "https://www.thebrillianceatelier.com";

function absoluteUrl(value: string, siteUrl: string) {
  try { return new URL(value, siteUrl).href; } catch { return siteUrl; }
}

export function Seo({ title, description, keywords, image, type = "website", noIndex = false, structuredData }: SeoProps) {
  const siteUrl = configuredSiteUrl.replace(/\/+$/, "");
  const pathname = typeof window === "undefined" ? "/" : window.location.pathname;
  const canonicalUrl = absoluteUrl(pathname, siteUrl);
  const imageUrl = absoluteUrl(image || logo, siteUrl);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords?.length && <meta name="keywords" content={keywords.join(", ")} />}
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      {structuredData && <script type="application/ld+json">{JSON.stringify(structuredData)}</script>}
    </Helmet>
  );
}
