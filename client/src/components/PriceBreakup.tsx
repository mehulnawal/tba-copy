import { useState } from "react";
import type { PriceBreakdown, Product } from "../types";
import { formatINR, formatMeasurement } from "../utils/currency";

type CouponBreakup = { label: string; discount: number; subtotalAfterCoupon: number };
type Props = { product: Product; price: PriceBreakdown; coupon?: CouponBreakup; b2b?: boolean; className?: string };
type StoneRow = { key: string; component: string; clarity: string; carat: number; rate: number; value: number };
type FourRow = { component: string; weight: string; rate: string; price: string };

const number = (value?: number) => Number(value || 0);
const isShown = (price: PriceBreakdown, key: "showMaking" | "showCertificate" | "showGst") => !price.display || price.display[key] !== false;
const leftCell = "break-words px-0.5 py-2 sm:px-1";
const leftHeader = "whitespace-nowrap px-0.5 py-2 font-bold leading-[1.15] [-webkit-text-stroke:0.2px_currentColor] sm:px-1";
const valueCell = "whitespace-nowrap px-0.5 py-2 text-left tabular-nums sm:px-1";
const valueHeader = "whitespace-nowrap px-0.5 py-2 text-left font-bold [-webkit-text-stroke:0.2px_currentColor] sm:px-1";
const priceCell = "whitespace-nowrap py-2 pl-0.5 pr-0 text-right tabular-nums sm:pl-1";
const priceHeader = "whitespace-nowrap py-2 pl-0.5 pr-0 text-right font-bold [-webkit-text-stroke:0.2px_currentColor] sm:pl-1";

function PriceBreakupColgroup() {
  return <colgroup><col className="w-[22%] sm:w-[18%]" /><col className="w-[24%] sm:w-[22%]" /><col className="w-[14%] sm:w-[21%]" /><col className="w-[18%] sm:w-[19%]" /><col className="w-[22%] sm:w-[20%]" /></colgroup>;
}

function FourColumnTable({ title, weightLabel, rateLabel, rows }: { title: string; weightLabel: string; rateLabel: string; rows: FourRow[] }) {
  return <div>
    <h3 className="mb-2 font-bold [-webkit-text-stroke:0.2px_currentColor] text-[var(--color-teal)]">{title}</h3>
    <div className="overflow-x-auto">
      <table className="w-full table-fixed text-left text-[10px] sm:text-xs">
        <PriceBreakupColgroup />
        <thead className="border-t border-[var(--color-border)] text-[var(--color-text-muted)]"><tr>
          <th className={leftHeader} colSpan={2}>Component</th>
          <th className={valueHeader}>{weightLabel}</th><th className={valueHeader}>{rateLabel.startsWith("Rate/") ? <span className="block leading-tight"><span className="block">Rate/</span><span className="block">{rateLabel.slice(5)}</span></span> : rateLabel}</th><th className={priceHeader}>Price</th>
        </tr></thead>
        <tbody>{rows.map(row => <tr key={row.component} className="border-b border-[var(--color-border)]">
          <td className={leftCell} colSpan={2}>{row.component}</td><td className={valueCell}>{row.weight}</td><td className={valueCell}>{row.rate}</td><td className={priceCell}>{row.price}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}

function StoneTable({ title, rows }: { title: string; rows: StoneRow[] }) {
  return <div>
    <h3 className="mb-2 font-bold [-webkit-text-stroke:0.2px_currentColor] text-[var(--color-teal)]">{title}</h3>
    <div className="overflow-x-auto">
      <table className="w-full table-fixed text-left text-[10px] sm:text-xs">
        <PriceBreakupColgroup />
        <thead className="border-t border-[var(--color-border)] text-[var(--color-text-muted)]"><tr>
          <th className={leftHeader}>Component</th>
          <th className={leftHeader}><span className="block leading-tight"><span className="block">Colour/</span><span className="block">Clarity</span></span></th>
          <th className={valueHeader}>Ct</th><th className={valueHeader}><span className="block leading-tight"><span className="block">Rate/</span><span className="block">Ct</span></span></th><th className={priceHeader}>Price</th>
        </tr></thead>
        <tbody>{rows.map(row => <tr key={row.key} className="border-b border-[var(--color-border)]">
          <td className={leftCell}>{row.component}</td><td className={leftCell}>{row.clarity}</td><td className={valueCell}>{formatMeasurement(row.carat)}</td><td className={valueCell}>{formatINR(row.rate)}</td><td className={priceCell}>{formatINR(row.value)}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}

export default function PriceBreakup({ product, price, coupon, b2b = false, className = "" }: Props) {
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
  const diamondEntries: StoneRow[] = (product.diamonds || []).map((entry, index) => ({
    key: `diamond-${index}`, component: entry.category || "Diamond", clarity: entry.colorClarity || "\u2014", carat: number(entry.caratWeight),
    rate: number(b2b ? (entry.ratePerCtB2B ?? entry.ratePerCt) : (entry.ratePerCtB2C ?? entry.ratePerCt)),
    value: number(entry.caratWeight) * number(b2b ? (entry.ratePerCtB2B ?? entry.ratePerCt) : (entry.ratePerCtB2C ?? entry.ratePerCt)),
  }));
  const moissaniteEntries: StoneRow[] = (product.moissaniteEntries || (product.moissaniteCaratWeight === undefined ? [] : [{ caratWeight: product.moissaniteCaratWeight }])).map((entry, index) => ({
    key: `moissanite-${index}`, component: "Moissanite", clarity: entry.colorClarity || "\u2014", carat: number(entry.caratWeight), rate: number(price.moissaniteRatePerCarat), value: number(entry.caratWeight) * number(price.moissaniteRatePerCarat),
  }));
  const stoneEntries = diamondEntries.length ? diamondEntries : moissaniteEntries;
  const goldWeight = `${formatMeasurement(number(price.netWeight ?? price.grossWeight))} g`;
  const metalRows: FourRow[] = isGold
    ? [{ component: metalLabel, weight: goldWeight, rate: formatINR(number(price.goldRate)), price: formatINR(metalValue) }, ...(showMaking ? [{ component: "Design and Craftsmanship", weight: goldWeight, rate: formatINR(number(price.makingRatePerGram)), price: formatINR(makingValue) }] : [])]
    : [{ component: "Silver", weight: `${formatMeasurement(silverWeight)} g`, rate: formatINR(number(price.silverRate)), price: formatINR(metalValue) }, ...(showMaking ? [{ component: "Design and Craftsmanship", weight: `${formatMeasurement(silverWeight)} g`, rate: formatINR(number(price.makingRatePerGram)), price: formatINR(makingValue) }] : [])];
  const stoneTitle = diamondEntries.length ? `Lab-Grown Diamonds${Number(product.totalNumberOfDiamonds || 0) > 0 ? ` (Total diamonds - ${product.totalNumberOfDiamonds})` : ""}` : "Moissanite";

  const summary = <div>
    <table className="w-full table-fixed text-left text-xs"><colgroup><col className="w-2/3" /><col className="w-1/3" /></colgroup><tbody>
      <tr className="border-b border-[var(--color-border)]"><td className="py-2"><h3 className="font-bold [-webkit-text-stroke:0.2px_currentColor] text-[14px] text-[var(--color-teal)]">{coupon ? "Original Subtotal" : "Subtotal"}</h3></td><td className={priceCell}>{formatINR(number(coupon ? coupon.subtotalAfterCoupon + coupon.discount : price.totalCost))}</td></tr>
      {coupon && <><tr className="border-b border-[var(--color-border)]"><td className="py-2">Coupon Applied - {coupon.label}</td><td className={`${priceCell} text-[var(--color-teal)]`}>-{formatINR(number(coupon.discount))}</td></tr><tr className="border-b border-[var(--color-border)]"><td className="py-2"><h3 className="font-bold [-webkit-text-stroke:0.2px_currentColor] text-[14px] text-[var(--color-teal)]">Subtotal After Coupon</h3></td><td className={priceCell}>{formatINR(number(coupon.subtotalAfterCoupon))}</td></tr></>}
      {showGst && <tr className="border-b border-[var(--color-border)]"><td className="py-2"><h3 className="font-bold [-webkit-text-stroke:0.2px_currentColor] text-[14px] text-[var(--color-teal)]">GST (3%)</h3></td><td className={priceCell}>{formatINR(number(price.gst))}</td></tr>}
      <tr className="border-b-2 border-[var(--color-teal)] bg-[var(--color-cream)] font-bold [-webkit-text-stroke:0.2px_currentColor] text-[var(--color-teal)]"><td className="py-3 px-1">Total Amount</td><td className="whitespace-nowrap py-3 pl-1 pr-0 text-right tabular-nums">{formatINR(number(price.finalPrice))}</td></tr>
    </tbody></table>
    <p className="mt-2 text-xs text-[var(--color-text-muted)]">*This is an estimated price, actual price may differ as per actual weights.</p>
    {b2b && price.b2bPricingStatus === "pending" && <p className="mt-2 text-xs text-[var(--color-text-muted)]">Silver B2B pricing is pending; the B2C total is shown.</p>}
  </div>;

  return <section className={`rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 ${className}`}>
    <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3"><h2 className="font-primary text-lg font-bold [-webkit-text-stroke:0.2px_currentColor] text-[var(--color-teal)]">Price Breakup</h2><button type="button" onClick={() => setOpen(value => !value)} className="text-xs font-semibold uppercase tracking-wide text-[var(--color-teal)] underline">{open ? "Hide details" : "View breakdown"}</button></div>
    {open && <div className="space-y-5 pt-4 text-sm">
      <FourColumnTable title={metalLabel} weightLabel="Weight" rateLabel="Rate/Gm" rows={metalRows} />
      {!isGold && hasMoissanite && <FourColumnTable title="Moissanite" weightLabel="Carat" rateLabel="Rate/Ct" rows={[{ component: "Moissanite", weight: `${formatMeasurement(number(price.totalMoissaniteWeight ?? product.moissaniteCaratWeight))} ct`, rate: formatINR(number(price.moissaniteRatePerCarat)), price: formatINR(number(price.moissaniteValue)) }]} />}
      {((isGold && stoneEntries.length > 0) || (!isGold && hasMoissanite && diamondEntries.length > 0)) && <StoneTable title={stoneTitle} rows={stoneEntries} />}
      {summary}
    </div>}
  </section>;
}
