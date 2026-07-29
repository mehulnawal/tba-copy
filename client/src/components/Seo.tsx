import { Helmet } from "react-helmet-async";
import logo from "../assets/logo/logo.png";

type SeoProps = { title: string; description: string };

export function Seo({ title, description }: SeoProps) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const canonicalUrl = `${origin}${typeof window === "undefined" ? "/" : window.location.pathname}`;
  const imageUrl = `${origin}${logo}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
}
