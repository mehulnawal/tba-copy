import { useState } from "react";
import type { PriceBreakdown, Product } from "../types";
import { formatINR } from "../utils/currency";

type Props = { product: Product; price: PriceBreakdown; b2b?: boolean; className?: string };
const number = (value?: number) => Number(value || 0);
const isShown = (price: PriceBreakdown, key: "showMaking" | "showCertificate" | "showGst") => !price.display || price.display[key] !== false;

export default function PriceBreakup({ product, price, b2b = false, className = "" }: Props) {
  const [open, setOpen] = useState(true);
  const isGold = price.metal === "gold" || product.metal === "gold";
  const metalLabel = isGold ? `${price.karat?.toUpperCase() || "Gold"} Gold` : "Fine Silver";
  const metalValue = isGold ? number(price.goldValue) : number(price.silverValue ?? price.metalValue);
  const makingValue = number(price.makingCharge ?? price.makingValue);
  const hasDiamonds = (product.diamonds || []).length > 0;
  const stoneValue = hasDiamonds ? number(price.diamondValue) : number(price.moissaniteValue ?? price.stoneValue);
  const diamondRate = (entry: NonNullable<Product["diamonds"]>[number]) => number(b2b ? (entry.ratePerCtB2B ?? entry.ratePerCt) : (entry.ratePerCtB2C ?? entry.ratePerCt));
  const stoneEntries = hasDiamonds
    ? (product.diamonds || []).map((entry, index) => ({ key: `diamond-${index}`, component: entry.category || "Diamond", clarity: entry.colorClarity || "\u2014", carat: number(entry.caratWeight), rate: diamondRate(entry), value: number(entry.caratWeight) * diamondRate(entry) }))
    : (product.moissaniteEntries || (product.moissaniteCaratWeight === undefined ? [] : [{ caratWeight: product.moissaniteCaratWeight }])).map((entry, index) => ({ key: `moissanite-${index}`, component: "Moissanite", clarity: entry.colorClarity || "\u2014", carat: number(entry.caratWeight), rate: number(price.moissaniteRatePerCarat), value: number(entry.caratWeight) * number(price.moissaniteRatePerCarat) }));
  const showMaking = isShown(price, "showMaking");
  const showCertificate = isShown(price, "showCertificate") && number(price.certificateCharges) > 0;
  const showGst = isShown(price, "showGst");
  const metalRate = isGold ? number(price.goldRate) : number(price.silverRate);
  const makingRate = number(price.makingRatePerGram);

  return <section className={`rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 ${className}`}>
    <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
      <h2 className="font-primary text-lg text-[var(--color-teal)]">Price Breakup</h2>
      <button type="button" onClick={() => setOpen(value => !value)} className="text-xs font-semibold uppercase tracking-wide text-[var(--color-teal)] underline">{open ? "Hide details" : "View breakdown"}</button>
    </div>
    {open && <div className="space-y-5 pt-4 text-sm">
      <div><h3 className="mb-2 font-semibold text-[var(--color-teal)]">{metalLabel}</h3><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="border-y border-[var(--color-border)] text-[var(--color-text-muted)]"><tr><th className="py-2 font-semibold">Component</th><th className="py-2 font-semibold">Rate/Gm</th><th className="py-2 font-semibold">Weight</th><th className="py-2 text-right font-semibold">Value</th></tr></thead><tbody><tr className="border-b border-[var(--color-border)]"><td className="py-2">{isGold ? `${price.karat?.toUpperCase() || "Gold"} Gold` : "Silver"}</td><td className="py-2">{formatINR(metalRate)}</td><td className="py-2">{number(price.grossWeight)} g</td><td className="py-2 text-right">{formatINR(metalValue)}</td></tr>{showMaking && <tr className="border-b border-[var(--color-border)]"><td className="py-2">Making</td><td className="py-2">{formatINR(makingRate)}</td><td className="py-2">{number(price.netWeight ?? price.grossWeight)} g</td><td className="py-2 text-right">{formatINR(makingValue)}</td></tr>}</tbody></table></div></div>
      {stoneEntries.length > 0 && <div><h3 className="mb-2 font-semibold text-[var(--color-teal)]">{hasDiamonds ? `Lab-Grown Diamonds (Total number of diamond - ${product.totalNumberOfDiamonds ?? 0})` : "Moissanite"}</h3><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="border-y border-[var(--color-border)] text-[var(--color-text-muted)]"><tr><th className="py-2 font-semibold">Component</th><th className="py-2 font-semibold">Colour/Clarity</th><th className="py-2 font-semibold">Ct</th><th className="py-2 font-semibold">Rate/Ct</th><th className="py-2 text-right font-semibold">Value</th></tr></thead><tbody>{stoneEntries.map(entry => <tr key={entry.key} className="border-b border-[var(--color-border)]"><td className="py-2">{entry.component}</td><td className="py-2">{entry.clarity}</td><td className="py-2">{entry.carat}</td><td className="py-2">{formatINR(entry.rate)}</td><td className="py-2 text-right">{formatINR(entry.value)}</td></tr>)}</tbody></table></div></div>}
      <div><h3 className="mb-2 font-semibold text-[var(--color-teal)]">Totals</h3><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="border-y border-[var(--color-border)] text-[var(--color-text-muted)]"><tr><th className="py-2 font-semibold">Component</th><th className="py-2 text-right font-semibold">Total</th></tr></thead><tbody>{showCertificate && <tr className="border-b border-[var(--color-border)]"><td className="py-2">Certificate Charge</td><td className="py-2 text-right">{formatINR(number(price.certificateCharges))}</td></tr>}{showGst && <tr className="border-b border-[var(--color-border)]"><td className="py-2">GST (3%)</td><td className="py-2 text-right">{formatINR(number(price.gst))}</td></tr>}<tr className="border-b-2 border-[var(--color-teal)] bg-[var(--color-cream)] font-bold text-[var(--color-teal)]"><td className="py-3">Total Amount</td><td className="py-3 text-right">{formatINR(number(price.finalPrice))}</td></tr></tbody></table></div><p className="mt-2 text-xs text-[var(--color-text-muted)]">*This is an estimated price, actual price may differ as per actual weights.</p>{b2b && price.b2bPricingStatus === "pending" && <p className="mt-2 text-xs text-[var(--color-text-muted)]">Silver B2B pricing is pending; the B2C total is shown.</p>}</div>
    </div>}
  </section>;
}

