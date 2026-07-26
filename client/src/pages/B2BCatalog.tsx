import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ApiRequestError, apiRequest } from "../api/client";
import type { Product } from "../types";
import { useCategories } from "../hooks/useCategories";
import { useB2BSessionGuard } from "../hooks/useB2BSessionGuard";
import { responsiveImage } from "../utils/image";

type Metal = "gold" | "silver";
type Sort = "featured" | "price-low" | "price-high" | "newest";
const money = (value?: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
const categoryName = (category: Product["mainCategory"] | Product["subCategory"]) => typeof category === "string" ? "" : category?.name || "";
const categoryId = (category: Product["mainCategory"] | Product["subCategory"]) => typeof category === "string" ? category : category?._id || "";

export default function B2BCatalog() {
  const navigate = useNavigate();
  const [metal, setMetal] = useState<Metal>("gold");
  useB2BSessionGuard();
  const { data: categoryData = [] } = useCategories(metal);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("featured");

  const [error, setError] = useState("");

  const { data: products = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["b2b-products", metal],
    queryFn: () => apiRequest<Product[]>(`/b2b/products?metal=${metal}`),
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
  const categories = categoryData;
  useEffect(() => { setActiveCategory("all"); setError(""); }, [metal]);
  useEffect(() => { if (queryError) { const reason = queryError as unknown; if (reason instanceof ApiRequestError && reason.statusCode === 401) navigate("/b2b/access", { replace: true }); else setError(reason instanceof Error ? reason.message : "Unable to load catalogue"); } }, [queryError, navigate]);

  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = activeCategory === "all" || categoryId(product.subCategory) === activeCategory || categoryId(product.mainCategory) === activeCategory;
    const searchText = `${product.title || ""} ${product.SKU || ""} ${categoryName(product.subCategory)}`.toLowerCase();
    return matchesCategory && searchText.includes(search.trim().toLowerCase());
  }).sort((a, b) => {
    if (sort === "price-low") return (a.prices?.[0]?.finalPrice || 0) - (b.prices?.[0]?.finalPrice || 0);
    if (sort === "price-high") return (b.prices?.[0]?.finalPrice || 0) - (a.prices?.[0]?.finalPrice || 0);
    if (sort === "newest") return new Date((b as Product & { createdAt?: string }).createdAt || 0).getTime() - new Date((a as Product & { createdAt?: string }).createdAt || 0).getTime();
    return Number(b.isBestSeller) - Number(a.isBestSeller);
  }), [products, activeCategory, search, sort]);

  return <main className="min-h-screen bg-[var(--color-bg)] pb-16 font-secondary">
    <header className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]"><div className="mx-auto max-w-7xl px-5 py-8 md:px-12"><p className="section-label">Private trade catalogue</p><h1 className="font-primary text-4xl text-[var(--color-teal)]">B2B Collection</h1><p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">Trade pricing, category filters, and products separated by metal.</p><div className="mt-6 inline-flex rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-1"><button onClick={() => setMetal("gold")} className={`rounded-[var(--radius-sm)] px-5 py-2 text-sm font-semibold transition ${metal === "gold" ? "bg-[var(--color-teal)] text-white" : "text-[var(--color-text-muted)]"}`}>Gold jewellery</button><button onClick={() => setMetal("silver")} className={`rounded-[var(--radius-sm)] px-5 py-2 text-sm font-semibold transition ${metal === "silver" ? "bg-[var(--color-teal)] text-white" : "text-[var(--color-text-muted)]"}`}>Silver jewellery</button></div></div></header>
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-12"><div className="mb-8 grid gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-sm)] md:grid-cols-[1fr_190px_auto] md:items-center"><label><span className="sr-only">Search B2B catalogue</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${metal} products or SKU`} className="admin-input w-full rounded-[var(--radius-md)]" /></label><select value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="admin-input rounded-[var(--radius-md)]"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="newest">Newest</option></select><p className="text-sm text-[var(--color-text-muted)]"><b className="text-[var(--color-teal)]">{visibleProducts.length}</b> pieces</p></div>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]"><aside className="h-max rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5 lg:sticky lg:top-6"><div className="mb-4 flex items-center justify-between"><h2 className="font-primary text-xl text-[var(--color-teal)]">Filters</h2><button onClick={() => { setActiveCategory("all"); setSearch(""); }} className="text-xs font-semibold text-[var(--color-teal)] underline">Clear</button></div><h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Category</h3><div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible"><button onClick={() => setActiveCategory("all")} className={`shrink-0 rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm transition ${activeCategory === "all" ? "bg-[var(--color-teal)] text-white" : "text-[var(--color-text-muted)] hover:bg-white hover:text-[var(--color-teal)]"}`}>All {metal} <span className="float-right opacity-70">{products.length}</span></button>{categories.map((category) => <button key={category._id} onClick={() => setActiveCategory(category._id)} className={`shrink-0 rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm transition ${activeCategory === category._id ? "bg-[var(--color-teal)] text-white" : "text-[var(--color-text-muted)] hover:bg-white hover:text-[var(--color-teal)]"}`}>{category.name}<span className="float-right opacity-70">{products.filter((product) => categoryId(product.subCategory) === category._id || categoryId(product.mainCategory) === category._id).length}</span></button>)}</div></aside>
        <section>{error ? <div role="alert" className="rounded-[var(--radius-md)] border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-4 text-sm text-[var(--color-error)]">{error}</div> : loading ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{[1,2,3,4,5,6].map((item) => <div key={item} className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-4"><div className="skeleton aspect-[4/5] w-full" /><div className="skeleton mt-4 h-5 w-2/3" /><div className="skeleton mt-2 h-4 w-1/3" /></div>)}</div> : visibleProducts.length === 0 ? <div className="admin-empty"><span className="text-3xl">◇</span><b>No {metal} trade pieces found</b><span>Change the search or select another category.</span></div> : <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{visibleProducts.map((product) => { const price = product.prices?.[0]; return <Link key={product.id || product._id} to={`/b2b/product/${product.slug || product.SKU}`} className="group overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"><div className="aspect-[4/5] overflow-hidden bg-[var(--color-bg-secondary)]"><img src={responsiveImage(product.images?.[0]?.url, 800)} alt={product.title || product.SKU} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" decoding="async" /></div><div className="space-y-2 p-5"><p className="section-label mb-0">{categoryName(product.subCategory) || categoryName(product.mainCategory) || `${metal} jewellery`}</p><h2 className="font-primary text-xl text-[var(--color-teal)]">{product.title}</h2><p className="text-xs text-[var(--color-text-muted)]">SKU · {product.SKU}</p><div className="flex items-end justify-between border-t border-[var(--color-border-subtle)] pt-3"><span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Trade price from</span><b className="text-[var(--color-teal)]">{money(price?.finalPrice)}</b></div></div></Link>; })}</div>}</section></div>
    </div>
  </main>;
}