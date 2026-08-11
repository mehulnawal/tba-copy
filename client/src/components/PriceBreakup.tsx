import { useState } from "react";
import type { PriceBreakdown, Product } from "../types";
import { formatINR } from "../utils/currency";

type Props = { product: Product; price: PriceBreakdown; b2b?: boolean; className?: string };
const number = (value?: number) => Number(value || 0);
const isShown = (price: PriceBreakdown, key: "showMaking" | "showCertificate" | "showGst") => !price.display || price.display[key] !== false;

export default function PriceBreakup({ product, price, b2b = false, className = "" }: Props) {
  const [open, setOpen] = useState(true);
  const isGold = price.metal === "gold" || product.metal === "gold";
  const categoryName = (value: Product["mainCategory"] | Product["subCategory"]) => (typeof value === "string" ? value : value?.name || "").toLowerCase();
  const isPolki = !isGold && [product.mainCategory, product.subCategory].some(value => categoryName(value) === "polki");
  const hasMoissanite = !isGold && !isPolki && ((product.moissaniteEntries || []).length > 0 || product.moissaniteCaratWeight !== undefined);
  const showMaking = isShown(price, "showMaking");
  const showGst = isShown(price, "showGst");
  const silverWeight = number(price.grossWeight ?? (typeof product.grossWeight === "number" ? product.grossWeight : 0));
  const makingValue = number(price.makingCharge ?? price.makingValue);
  const metalValue = number(isGold ? price.goldValue : (price.silverValue ?? price.metalValue));
  const metalLabel = isGold ? `${price.karat?.toUpperCase() || "Gold"} Gold` : "Fine Silver";
  const stoneEntries = (product.diamonds || []).length > 0
    ? (product.diamonds || []).map((entry, index) => ({ key: `diamond-${index}`, component: entry.category || "Diamond", clarity: entry.colorClarity || "—", carat: number(entry.caratWeight), rate: number(b2b ? (entry.ratePerCtB2B ?? entry.ratePerCt) : (entry.ratePerCtB2C ?? entry.ratePerCt)) }))
    : (product.moissaniteEntries || (product.moissaniteCaratWeight === undefined ? [] : [{ caratWeight: product.moissaniteCaratWeight }])).map((entry, index) => ({ key: `moissanite-${index}`, component: "Moissanite", clarity: entry.colorClarity || "—", carat: number(entry.caratWeight), rate: number(price.moissaniteRatePerCarat) }));

  const totals = (fixedColumns: boolean, columnCount = 2) => <div>
    <div className="overflow-x-auto">
      <table className={`w-full text-left text-xs${fixedColumns ? " table-fixed" : ""}`}>
        {fixedColumns && (columnCount === 3 ? <colgroup><col className="w-1/3" /><col className="w-1/3" /><col className="w-1/3" /></colgroup> : <colgroup><col className="w-2/3" /><col className="w-1/3" /></colgroup>)}
        <tbody>
          <tr className="border-b border-[var(--color-border)]"><td className="py-2" colSpan={fixedColumns ? columnCount - 1 : 1}><h3 className="font-semibold text-[14px] text-[var(--color-teal)]">Subtotal</h3></td><td className={fixedColumns ? "whitespace-nowrap py-2 text-right tabular-nums" : "py-2 text-right"}>{formatINR(number(price.totalCost))}</td></tr>
          {showGst && <tr className="border-b border-[var(--color-border)]"><td className="py-2" colSpan={fixedColumns ? columnCount - 1 : 1}><h3 className="font-semibold text-[14px] text-[var(--color-teal)]">GST (3%)</h3></td><td className={fixedColumns ? "whitespace-nowrap py-2 text-right tabular-nums" : "py-2 text-right"}>{formatINR(number(price.gst))}</td></tr>}
          <tr className="border-b-2 border-[var(--color-teal)] bg-[var(--color-cream)] font-bold text-[var(--color-teal)]"><td className="py-3 px-1" colSpan={fixedColumns ? columnCount - 1 : 1}>Total Amount</td><td className={fixedColumns ? "whitespace-nowrap py-3 px-1 text-right tabular-nums" : "py-3 px-1 text-right"}>{formatINR(number(price.finalPrice))}</td></tr>
        </tbody>
      </table>
    </div>
    <p className="mt-2 text-xs text-[var(--color-text-muted)]">*This is an estimated price, actual price may differ as per actual weights.</p>
    {b2b && price.b2bPricingStatus === "pending" && <p className="mt-2 text-xs text-[var(--color-text-muted)]">Silver B2B pricing is pending; the B2C total is shown.</p>}
  </div>;

  const silverBreakup = <>
    <div>
      <h3 className="mb-2 font-bold text-[var(--color-teal)]">Fine Silver</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left text-xs">
          <colgroup><col className="w-1/3" /><col className="w-1/3" /><col className="w-1/3" /></colgroup>
          <thead className="border-t border-[var(--color-border)] text-[var(--color-text-muted)]"><tr><th className="py-2 font-semibold">Component</th><th className="whitespace-nowrap py-2 text-right font-semibold">Weight</th><th className="whitespace-nowrap py-2 text-right font-semibold">Price</th></tr></thead>
          <tbody>
            <tr className="border-b border-[var(--color-border)]"><td className="py-2">Silver</td><td className="whitespace-nowrap py-2 text-right tabular-nums">{silverWeight} g</td><td className="py-2" /></tr>
            {showMaking && <tr className="border-b border-[var(--color-border)]"><td className="py-2">Making</td><td className="whitespace-nowrap py-2 text-right tabular-nums">{silverWeight} g</td><td className="py-2" /></tr>}
          </tbody>
        </table>
      </div>
    </div>
    {hasMoissanite && <div>
      <h3 className="py-2 font-semibold text-[var(--color-teal)]">Moissanite</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left text-xs">
          <colgroup><col className="w-1/3" /><col className="w-1/3" /><col className="w-1/3" /></colgroup>
          <thead className="border-t border-[var(--color-border)] text-[var(--color-text-muted)]"><tr><th className="py-2 font-semibold">Component</th><th className="whitespace-nowrap py-2 text-right font-semibold">Carat</th><th className="whitespace-nowrap py-2 text-right font-semibold">Price</th></tr></thead>
          <tbody><tr className="border-b border-[var(--color-border)]"><td className="py-2">Moissanite</td><td className="whitespace-nowrap py-2 text-right tabular-nums">{number(price.totalMoissaniteWeight ?? product.moissaniteCaratWeight)} ct</td><td className="py-2" /></tr></tbody>
        </table>
      </div>
    </div>}
    {totals(true, 3)}
  </>;

  const goldBreakup = <>
    <div>
      <h3 className="mb-2 font-bold text-[var(--color-teal)]">{metalLabel}</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left text-xs">
          <colgroup><col className="w-1/3" /><col className="w-1/5" /><col className="w-1/5" /><col className="w-[27%]" /></colgroup>
          <thead className="border-t border-[var(--color-border)] text-[var(--color-text-muted)]"><tr><th className="py-2 font-semibold">Component</th><th className="py-2 font-semibold">Rate/Gm</th><th className="whitespace-nowrap py-2 text-right font-semibold">Weight</th><th className="whitespace-nowrap py-2 text-right font-semibold">Price</th></tr></thead>
          <tbody>
            <tr className="border-b border-[var(--color-border)]"><td className="py-2">{metalLabel}</td><td className="py-2">{formatINR(number(price.goldRate))}</td><td className="whitespace-nowrap py-2 text-right tabular-nums">{number(price.grossWeight)} g</td><td className="whitespace-nowrap py-2 text-right tabular-nums">{formatINR(metalValue)}</td></tr>
            {showMaking && <tr className="border-b border-[var(--color-border)]"><td className="py-2">Making</td><td className="py-2">{formatINR(number(price.makingRatePerGram))}</td><td className="whitespace-nowrap py-2 text-right tabular-nums">{number(price.netWeight ?? price.grossWeight)} g</td><td className="whitespace-nowrap py-2 text-right tabular-nums">{formatINR(makingValue)}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
    {stoneEntries.length > 0 && <div>
      <h3 className="py-2 font-semibold text-[var(--color-teal)]">{(product.diamonds || []).length > 0 ? `Lab-Grown Diamonds${Number(product.totalNumberOfDiamonds || 0) > 0 ? ` (Total diamonds - ${product.totalNumberOfDiamonds})` : ""}` : "Moissanite"}</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left text-xs">
          {b2b && <colgroup><col className="w-2/5" /><col className="w-1/4" /><col className="w-1/6" /><col className="w-[11%]" /></colgroup>}
          <thead className="border-t border-[var(--color-border)] text-[var(--color-text-muted)]"><tr><th className="py-2 font-semibold">Component</th><th className="py-2 font-semibold">Colour/Clarity</th><th className="py-2 font-semibold">Ct</th><th className="py-2 font-semibold">Rate/Ct</th></tr></thead>
          <tbody>{stoneEntries.map(entry => <tr key={entry.key} className="border-b border-[var(--color-border)]"><td className="py-2">{entry.component}</td><td className="py-2">{entry.clarity}</td><td className="py-2">{entry.carat}</td><td className={b2b ? "whitespace-nowrap py-2 text-right tabular-nums" : "py-2"}>{formatINR(entry.rate)}</td></tr>)}</tbody>
        </table>
      </div>
    </div>}
    {totals(b2b)}
  </>;

  return <section className={`rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 ${className}`}>
    <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3"><h2 className="font-primary text-lg text-[var(--color-teal)]">Price Breakup</h2><button type="button" onClick={() => setOpen(value => !value)} className="text-xs font-semibold uppercase tracking-wide text-[var(--color-teal)] underline">{open ? "Hide details" : "View breakdown"}</button></div>
    {open && <div className="space-y-5 pt-4 text-sm">{isGold ? goldBreakup : silverBreakup}</div>}
  </section>;
}