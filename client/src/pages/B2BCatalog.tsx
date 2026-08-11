import { useState } from "react";
import { useB2BSessionGuard } from "../hooks/useB2BSessionGuard";
import ProductPage from "./ProductPage";

export default function B2BCatalog() {
  useB2BSessionGuard();
  const [metal, setMetal] = useState<"gold" | "silver">("gold");
  return <><div className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-7xl gap-2"><button onClick={() => setMetal("gold")} className={`rounded px-4 py-2 text-sm font-semibold ${metal === "gold" ? "bg-[var(--color-teal)] text-white" : "border border-[var(--color-border)]"}`}>Gold</button><button onClick={() => setMetal("silver")} className={`rounded px-4 py-2 text-sm font-semibold ${metal === "silver" ? "bg-[var(--color-teal)] text-white" : "border border-[var(--color-border)]"}`}>Silver</button></div></div><ProductPage key={metal} metal={metal} b2b /></>;
}