import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiRequestError, apiRequest } from "../api/client";
import type { PriceBreakdown, Product } from "../types";
import { useB2BSessionGuard } from "../hooks/useB2BSessionGuard";
import { responsiveImage } from "../utils/image";
import { formatINR } from "../utils/currency";

const categoryName = (category?: Product["mainCategory"] | Product["subCategory"]) => typeof category === "string" ? "" : category?.name || "";
const diamondWeight = (product: Product) => (product.diamonds || []).reduce((sum, diamond) => sum + Number(diamond.caratWeight || 0), 0);
const weightFor = (value: Product["grossWeight"] | Product["netWeight"], karat?: string) => typeof value === "number" ? value : karat === "14kt" || karat === "18kt" ? value?.[karat] : undefined;

function PriceCard({ product, price }: { product: Product; price: PriceBreakdown }) {
  return <article className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5 space-y-3">
    <h2 className="font-primary text-xl text-[var(--color-teal)]">{price.karat?.toUpperCase() || product.metal?.toUpperCase()} trade price</h2>
    <p className="flex justify-between text-sm"><span>Gross weight</span><b>{price.grossWeight} g</b></p>
    {price.netWeight !== undefined && <p className="flex justify-between text-sm"><span>Net weight</span><b>{price.netWeight} g</b></p>}
    {diamondWeight(product) > 0 && <p className="flex justify-between text-sm"><span>Diamond weight</span><b>{diamondWeight(product)} ct</b></p>}
    {price.makingCharge !== undefined && <p className="flex justify-between text-sm"><span>Making charge</span><b>{formatINR(price.makingCharge)}</b></p>}
    {price.certificateCharges !== undefined && <p className="flex justify-between text-sm"><span>Certificate charge</span><b>{formatINR(price.certificateCharges)}</b></p>}
    <p className="flex justify-between text-sm"><span>GST</span><b>{formatINR(price.gst)}</b></p>
    <p className="flex justify-between border-t border-[var(--color-border)] pt-3 font-semibold text-[var(--color-teal)]"><span>Final total</span><b>{formatINR(price.finalPrice)}</b></p>
  </article>;
}

export default function B2BProductDetails() {
  useB2BSessionGuard();
  const { identifier = "" } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  useEffect(() => { apiRequest<Product>("/b2b/products/" + encodeURIComponent(identifier)).then((item) => { setProduct(item); setSelectedColor(item.colors?.[0] || ""); }).catch((reason) => { if (reason instanceof ApiRequestError && reason.statusCode === 401) navigate("/b2b/access", { replace: true }); else setError(reason instanceof Error ? reason.message : "Unable to load product"); }); }, [identifier, navigate]);
  const images = product?.images || [];
  const prices = product?.prices || [];
  const specificationRows = useMemo(() => !product ? [] : [
    ["SKU", product.SKU], ["Metal", product.metal?.toUpperCase()], ["Category", [categoryName(product.mainCategory), categoryName(product.subCategory)].filter(Boolean).join(" / ")],
    ["Gross weight", typeof product.grossWeight === "number" ? `${product.grossWeight} g` : ""], ["Net weight", typeof product.netWeight === "number" ? `${product.netWeight} g` : ""],
    ["Diamond weight", diamondWeight(product) ? `${diamondWeight(product)} ct` : ""],
  ].filter(([, value]) => Boolean(value)), [product]);
  if (error) return <main className="p-10 text-[var(--color-error)]">{error}</main>;
  if (!product) return <main className="p-10 text-[var(--color-text-muted)]">Loading B2B product...</main>;
  const changeImage = (offset: number) => setActiveImage((index) => images.length ? (index + offset + images.length) % images.length : 0);
  return <main className="min-h-screen bg-[var(--color-bg)] px-5 py-10 md:px-12"><Link to="/b2b/catalog" className="inline-flex items-center gap-1 text-sm text-[var(--color-teal)]"><ChevronLeft size={16} /> Back to catalogue</Link><section className="mx-auto mt-6 grid max-w-7xl gap-10 lg:grid-cols-2">
    <div className="space-y-3"><div className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-secondary)]"><img src={responsiveImage(images[activeImage]?.url, 1200)} alt={product.title || product.SKU} className="h-full w-full object-contain" />{images.length > 1 && <><button type="button" onClick={() => changeImage(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-[var(--color-teal)]" aria-label="Previous image"><ChevronLeft /></button><button type="button" onClick={() => changeImage(1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-[var(--color-teal)]" aria-label="Next image"><ChevronRight /></button></>}</div>{images.length > 1 && <div className="flex gap-3 overflow-x-auto">{images.map((image, index) => <button type="button" key={`${image.url}-${index}`} onClick={() => setActiveImage(index)} className={`h-20 w-20 shrink-0 overflow-hidden rounded border ${index === activeImage ? "border-[var(--color-teal)]" : "border-[var(--color-border)]"}`} aria-label={`Show image ${index + 1}`}><img src={responsiveImage(image.url, 180)} alt="" className="h-full w-full object-contain" /></button>)}</div>}</div>
    <div className="space-y-6"><div><p className="section-label">Private trade catalogue</p><h1 className="font-primary text-4xl text-[var(--color-teal)]">{product.title}</h1><p className="mt-2 text-sm text-[var(--color-text-muted)]">SKU: {product.SKU}</p>{product.description && <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">{product.description}</p>}</div>
      {product.colors?.length ? <div><h2 className="mb-2 text-sm font-semibold text-[var(--color-teal)]">Available finishes</h2><div className="flex flex-wrap gap-2">{product.colors.map((color) => <button key={color} type="button" onClick={() => setSelectedColor(color)} className={`rounded border px-3 py-2 text-sm ${selectedColor === color ? "border-[var(--color-teal)] bg-[var(--color-cream)]" : "border-[var(--color-border)]"}`}>{color}</button>)}</div></div> : null}
      <dl className="grid grid-cols-2 gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 text-sm">{specificationRows.map(([label, value]) => <div key={label}><dt className="text-[var(--color-text-muted)]">{label}</dt><dd className="font-semibold">{value}</dd></div>)}</dl>
      {product.diamonds?.length ? <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"><h2 className="font-semibold text-[var(--color-teal)]">Diamond details</h2>{product.diamonds.map((diamond, index) => <p key={`${diamond.category}-${index}`} className="mt-2 text-sm">{diamond.category} {diamond.subType ? `• ${diamond.subType}` : ""}: {diamond.caratWeight} ct</p>)}</div> : null}
      <div className="grid gap-4">{prices.map((price) => <PriceCard key={price.karat || product.metal} product={product} price={price} />)}</div>
    </div></section></main>;
}
