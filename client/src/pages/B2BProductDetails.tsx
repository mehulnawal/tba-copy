import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, Share2 } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ApiRequestError, apiRequest } from "../api/client";
import type { PriceBreakdown, Product } from "../types";
import { useB2BSessionGuard } from "../hooks/useB2BSessionGuard";
import { publicAssetUrl, responsiveImage } from "../utils/image";
import { formatINR } from "../utils/currency";
import PriceBreakup from "../components/PriceBreakup";
import { ProductSkeleton } from "../components/LoadingSkeleton";
import { Seo } from "../components/Seo";

const categoryName = (category?: Product["mainCategory"] | Product["subCategory"]) => typeof category === "string" ? "" : category?.name || "";
const diamondWeight = (product: Product) => (product.diamonds || []).reduce((sum, diamond) => sum + Number(diamond.caratWeight || 0), 0);
const weightFor = (value: Product["grossWeight"] | Product["netWeight"], karat?: string) => typeof value === "number" ? value : karat === "14kt" || karat === "18kt" ? value?.[karat] : undefined;

function ShippingHandling() {
  return <section className="border-t border-stone-200 pt-4"><h3 className="text-xl font-bold uppercase tracking-widest text-stone-700 lg:text-lg">Shipping &amp; Handling</h3><ul className="mt-3 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-stone-600 lg:text-xs">
    <li>Free shipping perks on all orders within India</li><li>Avail your items within 15 business days</li>
    <li>Inspect your package carefully before signing off</li>
    <li>Package will be sealed and wrapped in bubble wrap, small box, or padded envelope</li>
  </ul>
  </section>;
}
function MobileAccordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches);
  return <section className="border border-stone-200 bg-white p-4"><button type="button" onClick={() => setOpen(value => !value)} className="flex w-full items-center justify-between text-left"><h3 className="text-base text-stone-700 lg:text-xs">{title}</h3><ChevronDown size={20} className={`transition-transform ${open ? "rotate-180" : ""}`} /></button>{open && <div className="mt-3">{children}</div>}</section>;
}

function Certificates({ product }: { product: Product }) {
  return <>{(product.certificates || []).length > 0 && <div className="border-t border-stone-200 pt-4"><h3 className="text-xl font-bold uppercase tracking-widest text-stone-700 lg:text-xs">Certificates of Authenticity</h3><div className="mt-3 flex flex-wrap gap-3">{product.certificates?.map((certificate) => <div key={certificate._id} className="flex items-center gap-3 text-lg lg:text-sm"><img src={publicAssetUrl(certificate.logoUrl)} alt="" className="h-14 w-14 object-contain lg:h-10 lg:w-10" />{certificate.name}</div>)}</div></div>}<ShippingHandling /></>;
}

export default function B2BProductDetails() {
  useB2BSessionGuard();
  const { identifier = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isMockAccess = Boolean((location.state as { b2bMock?: boolean } | null)?.b2bMock) || window.sessionStorage.getItem("tba-b2b-preview-access") === "true";
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [karat, setKarat] = useState<"14kt" | "18kt">("14kt");
  const [selectedColor, setSelectedColor] = useState("");
  useEffect(() => { apiRequest<Product>((isMockAccess ? "/products/" : "/b2b/products/") + encodeURIComponent(identifier)).then((item) => { setProduct(item); setSelectedColor(item.colors?.[0] || ""); }).catch((reason) => { if (reason instanceof ApiRequestError && reason.statusCode === 401) navigate("/b2b/access", { replace: true }); else setError(reason instanceof Error ? reason.message : "Unable to load product"); }); }, [identifier, isMockAccess, navigate]);
  if (error) return <main className="p-10 text-[var(--color-error)]">{error}</main>;
  if (!product) return <ProductSkeleton />;
  const isGold = product.metal === "gold";
  const media = [...(product.images || []).map((image) => ({ type: "image" as const, url: image.url })), ...(product.videoLink ? [{ type: "video" as const, url: product.videoLink }] : [])];
  const prices = product.prices || [];
  const selectedPrice = prices.find((price) => price.karat === karat) || prices[0];
  if (!selectedPrice) return <main className="p-10 text-[var(--color-error)]">B2B pricing is unavailable for this product.</main>;
  const displayPrice = selectedPrice.b2bFinalPrice ?? selectedPrice.finalPrice;
  const priceForBreakup: PriceBreakdown = { ...selectedPrice, finalPrice: displayPrice };
  const grossWeight = selectedPrice.grossWeight ?? weightFor(product.grossWeight, karat);
  const netWeight = selectedPrice.netWeight ?? weightFor(product.netWeight, karat);
  const specificationRows = [["SKU", product.SKU], ["Metal", product.metal?.toUpperCase()], ["Category", [categoryName(product.mainCategory), categoryName(product.subCategory)].filter(Boolean).join(" / ")], ["Gross weight", grossWeight !== undefined ? `${grossWeight} g` : ""], ["Net weight", netWeight !== undefined ? `${netWeight} g` : ""], ["Diamond weight", diamondWeight(product) ? `${diamondWeight(product)} ct` : ""]].filter(([, value]) => Boolean(value));
  const activeMedia = media[activeMediaIndex];
  return <><Seo title={`${product.title} | TBA B2B`} description={product.description || `Review ${product.title} specifications and B2B pricing at TBA Jewelry.`} /><main className="min-h-screen bg-[var(--color-bg)] px-5 py-10 md:px-12"><Link to="/b2b/catalog" className="inline-flex items-center gap-1 text-sm text-[var(--color-teal)]"><ChevronLeft size={16} /> Back to catalogue</Link><section className="mx-auto mt-6 grid max-w-7xl gap-8 xl:grid-cols-12 xl:gap-12"><div className="xl:col-span-6 space-y-6"><div className="flex flex-col-reverse gap-4 md:flex-row"><div className="flex shrink-0 gap-3 overflow-x-auto md:flex-col md:overflow-x-visible">{media.map((item, index) => <button key={`${item.url}-${index}`} type="button" onClick={() => setActiveMediaIndex(index)} className={`h-20 w-20 shrink-0 overflow-hidden rounded border bg-white ${index === activeMediaIndex ? "border-[var(--color-teal)] ring-1 ring-[var(--color-teal)]" : "border-[var(--color-border)] opacity-70"}`}>{item.type === "video" ? <video src={item.url} muted className="h-full w-full object-cover" /> : <img src={responsiveImage(item.url, 180)} alt="" className="h-full w-full object-cover" />}</button>)}
  </div>
    <div className="aspect-square flex-1 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xs">{activeMedia?.type === "video" ? <video controls className="h-full w-full object-contain" src={activeMedia.url} /> : <img src={responsiveImage(activeMedia?.url, 1200)} alt={product.title || product.SKU} className="h-full w-full object-contain" />}</div>
  </div>
    <div className="hidden space-y-3 lg:block"><MobileAccordion title="Description"><p className="whitespace-pre-line text-base leading-relaxed text-stone-600 lg:text-xs">{product.description || "No description available."}</p></MobileAccordion>{(product.certificates || []).length > 0 && <MobileAccordion title="Certificates of Authenticity"><div className="flex flex-wrap gap-3">{product.certificates?.map((certificate) => <div key={certificate._id} className="flex items-center gap-3 text-lg lg:text-sm"><img src={publicAssetUrl(certificate.logoUrl)} alt="" className="h-14 w-14 object-contain lg:h-10 lg:w-10" />{certificate.name}</div>)}</div></MobileAccordion>}<MobileAccordion title="Shipping & Handling"><ul className="list-disc space-y-1.5 pl-5 text-base leading-relaxed text-stone-600 lg:text-xs"><li>Free shipping perks on all orders within India</li><li>Avail your items within 15 business days</li><li>Inspect your package carefully before signing off</li><li>Package will be sealed and wrapped in bubble wrap, small box, or padded envelope</li></ul></MobileAccordion></div></div><div className="xl:col-span-6 flex flex-col gap-5"><div className="order-1 lg:order-1"><span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-teal)]">{categoryName(product.mainCategory)}</span><h1 className="mt-1 font-primary text-3xl text-[var(--color-teal)]">{product.title}</h1><p className="mt-2 text-sm text-[var(--color-text-muted)]">SKU: {product.SKU}</p></div><div className="order-2 flex items-start justify-between gap-4 border-y border-stone-200 py-3 lg:order-2"><div><span className="font-primary text-3xl text-stone-900">{formatINR(displayPrice)}</span><span className="mt-1 block text-[11px] text-stone-500">Inclusive of all taxes</span><span className="block text-[11px] text-stone-500">*This is an estimated price, actual price may differ as per actual weights.</span><span className="mt-2 block text-xs font-medium text-stone-700">Metal rate: {formatINR(isGold ? Number(selectedPrice.goldRate || 0) : Number(selectedPrice.silverRate || 0))} / g</span></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => navigator.share ? void navigator.share({ title: product.title, url: window.location.href }) : void navigator.clipboard.writeText(window.location.href)} className="inline-flex items-center gap-2 py-2 text-sm text-stone-700"><Share2 size={20} />Share</button></div></div>{isGold && <div className="order-6 space-y-2 lg:order-4"><label className="block text-xs font-semibold uppercase tracking-widest text-stone-600">Select Purity Standard: <span className="text-stone-900">{karat.toUpperCase()} Gold</span></label><div className="grid max-w-xs grid-cols-2 gap-3">{(["14kt", "18kt"] as const).map((value) => <button key={value} type="button" onClick={() => setKarat(value)} className={`rounded border py-2.5 text-xs font-semibold uppercase ${karat === value ? "border-[var(--color-teal)] bg-[var(--color-teal)] text-white" : "border-stone-300 bg-white text-stone-700"}`}>{value}</button>)}</div></div>}{product.colors?.length ? <div className="order-5 lg:order-3"><h2 className="mb-2 text-sm font-semibold text-[var(--color-teal)]">Available finishes</h2><div className="flex flex-wrap gap-2">{product.colors.map((color) => <button key={color} type="button" onClick={() => setSelectedColor(color)} className={`rounded border px-3 py-2 text-sm ${selectedColor === color ? "border-[var(--color-teal)] bg-[var(--color-cream)]" : "border-[var(--color-border)]"}`}>{color}</button>)}</div></div> : null}<dl className="order-4 grid grid-cols-2 gap-3 lg:order-5 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 text-sm">{specificationRows.map(([label, value]) => <div key={label}><dt className="text-[var(--color-text-muted)]">{label}</dt><dd className="font-semibold">{value}</dd></div>)}</dl>{product.diamonds?.length ? <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"><h2 className="font-semibold text-[var(--color-teal)]">Diamond details</h2>{product.diamonds.map((diamond, index) => <p key={`${diamond.category}-${index}`} className="mt-2 text-sm">{diamond.category} {diamond.subType ? `\u2022 ${diamond.subType}` : ""}: {diamond.caratWeight} ct</p>)}</div> : null}<PriceBreakup product={product} price={priceForBreakup} b2b className="order-7 lg:order-6" /><div className="order-8 lg:hidden"><MobileAccordion title="Description"><p className="whitespace-pre-line text-base leading-relaxed text-stone-600">{product.description || "No description available."}</p></MobileAccordion></div><div className="order-9 lg:hidden">{(product.certificates || []).length > 0 && <MobileAccordion title="Certificates of Authenticity"><div className="flex flex-wrap gap-3">{product.certificates?.map((certificate) => <div key={certificate._id} className="flex items-center gap-3 text-lg"><img src={publicAssetUrl(certificate.logoUrl)} alt="" className="h-14 w-14 object-contain" />{certificate.name}</div>)}</div></MobileAccordion>}</div><div className="order-[10] lg:hidden"><MobileAccordion title="Shipping & Handling"><ul className="list-disc space-y-1.5 pl-5 text-base leading-relaxed text-stone-600"><li>Free shipping perks on all orders within India</li><li>Avail your items within 15 business days</li><li>Inspect your package carefully before signing off</li><li>Package will be sealed and wrapped in bubble wrap, small box, or padded envelope</li></ul></MobileAccordion></div></div></section></main></>;
}
