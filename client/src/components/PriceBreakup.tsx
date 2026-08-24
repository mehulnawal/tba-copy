import { useState } from "react";
import type { PriceBreakdown, Product } from "../types";
import { formatINR, formatMeasurement } from "../utils/currency";

type CouponBreakup = {
  label: string;
  discount: number;
  subtotalAfterCoupon: number;
};
type Props = {
  product: Product;
  price: PriceBreakdown;
  coupon?: CouponBreakup;
  b2b?: boolean;
  className?: string;
};
type StoneRow = {
  key: string;
  component: string;
  clarity: string;
  carat: number;
  rate: number;
  value: number;
};
type FourRow = {
  component: string;
  weight: string;
  rate: string;
  price: string;
};

const number = (value?: number) => Number(value || 0);
const isShown = (
  price: PriceBreakdown,
  key: "showMaking" | "showCertificate" | "showGst",
) => !price.display || price.display[key] !== false;

const headerCell =
  "py-2 text-[10px] sm:text-xs font-bold leading-[1.15] text-[var(--color-text-muted)] [-webkit-text-stroke:0.2px_currentColor]";
const bodyCell = "py-2 text-[10px] sm:text-xs";
const wrapCell = `${bodyCell} break-words`;
const numCell = `${bodyCell} whitespace-nowrap tabular-nums`;
const numHeader = `${headerCell} whitespace-nowrap`;

const fourColGrid = "grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-baseline gap-x-7 sm:gap-x-10";

function RowDivider() {
  return <div className="col-span-full border-b border-[var(--color-border)]" />;
}

function FourColumnTable({
  title,
  weightLabel,
  rateLabel,
  rows,
}: {
  title: string;
  weightLabel: string;
  rateLabel: string;
  rows: FourRow[];
}) {
  return (
    <div>
      <h3 className="mb-2 font-bold [-webkit-text-stroke:0.2px_currentColor] text-[var(--color-teal)]">
        {title}
      </h3>
      <div className={`${fourColGrid} border-t border-[var(--color-border)]`}>
        <div className={headerCell}>Component</div>
        <div className={numHeader}>{weightLabel}</div>
        <div className={`${numHeader} text-left sm:text-right`}>
          {rateLabel.startsWith("Rate/") ? (
            <>
              <span className="block">Rate/</span>
              <span className="block">{rateLabel.slice(5)}</span>
            </>
          ) : (
            rateLabel
          )}
        </div>
        <div className={`${numHeader} text-right`}>Price</div>
        <RowDivider />
        {rows.map((row) => (
          <FourColumnRow key={row.component} row={row} />
        ))}
      </div>
    </div>
  );
}

function FourColumnRow({ row }: { row: FourRow }) {
  return (
    <>
      <div className={wrapCell}>{row.component}</div>
      <div className={numCell}>{row.weight}</div>
      <div className={`${numCell} text-left sm:text-right`}>{row.rate}</div>
      <div className={`${numCell} text-right`}>{row.price}</div>
      <RowDivider />
    </>
  );
}

const stoneGrid = "grid grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] items-baseline gap-x-7 sm:gap-x-10";

function StoneTable({
  title,
  rows,
  formatAmount = formatINR,
}: {
  title: string;
  rows: StoneRow[];
  formatAmount?: (value: number) => string;
}) {
  return (
    <div>
      <h3 className="mb-2 font-bold [-webkit-text-stroke:0.2px_currentColor] text-[var(--color-teal)]">
        {title}
      </h3>
      <div className={`${stoneGrid} border-t border-[var(--color-border)]`}>
        <div className={headerCell}>Component</div>
        <div className={headerCell}>
          <span className="block">Colour/</span>
          <span className="block">Clarity</span>
        </div>
        <div className={numHeader}>Ct</div>
        <div className={`${numHeader} text-left sm:text-right`}>
          <span className="block">Rate/</span>
          <span className="block">Ct</span>
        </div>
        <div className={`${numHeader} text-right`}>Price</div>
        <RowDivider />
        {rows.map((row) => (
          <StoneRowCells key={row.key} row={row} formatAmount={formatAmount} />
        ))}
      </div>
    </div>
  );
}

function StoneRowCells({
  row,
  formatAmount,
}: {
  row: StoneRow;
  formatAmount: (value: number) => string;
}) {
  return (
    <>
      <div className={wrapCell}>{row.component}</div>
      <div className={wrapCell}>{row.clarity}</div>
      <div className={numCell}>{formatMeasurement(row.carat)}</div>
      <div className={`${numCell} text-left sm:text-right`}>{formatAmount(row.rate)}</div>
      <div className={`${numCell} text-right`}>{formatAmount(row.value)}</div>
      <RowDivider />
    </>
  );
}

export default function PriceBreakup({
  product,
  price,
  coupon,
  b2b = false,
  className = "",
}: Props) {
  const [open, setOpen] = useState(true);
  const isGold = price.metal === "gold" || product.metal === "gold";
  const formatBreakupINR = (value: number) =>
    !isGold && value === 0 ? "—" : formatINR(value);
  // Customer-facing silver breakups keep calculated amounts, but do not disclose component rates.
  const hideSilverRates = !isGold;
  const categoryName = (
    value: Product["mainCategory"] | Product["subCategory"],
  ) => (typeof value === "string" ? value : value?.name || "").toLowerCase();
  const isPolki =
    !isGold &&
    [product.mainCategory, product.subCategory].some(
      (value) => categoryName(value) === "polki",
    );
  const hasMoissanite =
    !isGold &&
    !isPolki &&
    ((product.moissaniteEntries || []).length > 0 ||
      product.moissaniteCaratWeight !== undefined);
  const showMaking = isShown(price, "showMaking");
  const showGst = isShown(price, "showGst");
  const silverWeight = number(
    price.grossWeight ??
    (typeof product.grossWeight === "number" ? product.grossWeight : 0),
  );
  const makingValue = number(price.makingCharge ?? price.makingValue);
  const metalValue = number(
    isGold ? price.goldValue : (price.silverValue ?? price.metalValue),
  );
  const metalLabel = isGold
    ? `${price.karat?.toUpperCase() || "Gold"} Gold`
    : "Fine Silver";
  const diamondEntries: StoneRow[] = (product.diamonds || []).map(
    (entry, index) => ({
      key: `diamond-${index}`,
      component: entry.category || "Diamond",
      clarity: entry.colorClarity || "\u2014",
      carat: number(entry.caratWeight),
      rate: hideSilverRates
        ? 0
        : number(
          b2b
            ? (entry.ratePerCtB2B ?? entry.ratePerCt)
            : (entry.ratePerCtB2C ?? entry.ratePerCt),
        ),
      value:
        number(entry.caratWeight) *
        number(
          b2b
            ? (entry.ratePerCtB2B ?? entry.ratePerCt)
            : (entry.ratePerCtB2C ?? entry.ratePerCt),
        ),
    }),
  );
  const moissaniteEntries: StoneRow[] = (
    product.moissaniteEntries ||
    (product.moissaniteCaratWeight === undefined
      ? []
      : [{ caratWeight: product.moissaniteCaratWeight }])
  ).map((entry, index) => ({
    key: `moissanite-${index}`,
    component: "Moissanite",
    clarity: entry.colorClarity || "\u2014",
    carat: number(entry.caratWeight),
    rate: hideSilverRates ? 0 : number(price.moissaniteRatePerCarat),
    value: number(entry.caratWeight) * number(price.moissaniteRatePerCarat),
  }));
  const stoneEntries = diamondEntries.length
    ? diamondEntries
    : moissaniteEntries;
  const goldWeight = `${formatMeasurement(number(price.netWeight ?? price.grossWeight))} g`;
  const metalRows: FourRow[] = isGold
    ? [
      {
        component: metalLabel,
        weight: goldWeight,
        rate: formatINR(number(price.goldRate)),
        price: formatBreakupINR(metalValue),
      },
      ...(showMaking
        ? [
          {
            component: "Design and Craftsmanship",
            weight: goldWeight,
            rate: formatINR(number(price.makingRatePerGram)),
            price: formatBreakupINR(makingValue),
          },
        ]
        : []),
    ]
    : [
      {
        component: "Silver",
        weight: `${formatMeasurement(silverWeight)} g`,
        rate: formatBreakupINR(0),
        price: formatBreakupINR(metalValue),
      },
      ...(showMaking
        ? [
          {
            component: "Design and Craftsmanship",
            weight: `${formatMeasurement(silverWeight)} g`,
            rate: formatBreakupINR(0),
            price: formatBreakupINR(makingValue),
          },
        ]
        : []),
    ];
  const stoneTitle = diamondEntries.length
    ? `Lab-Grown Diamonds${Number(product.totalNumberOfDiamonds || 0) > 0 ? ` (Total diamonds - ${product.totalNumberOfDiamonds})` : ""}`
    : "Moissanite";

  const summary = (
    <div>
      <div>
        <div className="flex items-center justify-between border-b border-[var(--color-border)] py-2">
          <h3 className="font-bold [-webkit-text-stroke:0.2px_currentColor] text-[14px] text-[var(--color-teal)]">
            {coupon ? "Original Subtotal" : "Subtotal"}
          </h3>
          <span className="whitespace-nowrap tabular-nums">
            {formatBreakupINR(
              number(
                coupon
                  ? coupon.subtotalAfterCoupon + coupon.discount
                  : price.totalCost,
              ),
            )}
          </span>
        </div>
        {coupon && (
          <>
            <div className="flex items-center justify-between border-b border-[var(--color-border)] py-2">
              <span>Coupon Applied - {coupon.label}</span>
              <span className="whitespace-nowrap tabular-nums text-[var(--color-teal)]">
                -{formatBreakupINR(number(coupon.discount))}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--color-border)] py-2">
              <h3 className="font-bold [-webkit-text-stroke:0.2px_currentColor] text-[14px] text-[var(--color-teal)]">
                Subtotal After Coupon
              </h3>
              <span className="whitespace-nowrap tabular-nums">
                {formatBreakupINR(number(coupon.subtotalAfterCoupon))}
              </span>
            </div>
          </>
        )}
        {showGst && (
          <div className="flex items-center justify-between border-b border-[var(--color-border)] py-2">
            <h3 className="font-bold [-webkit-text-stroke:0.2px_currentColor] text-[14px] text-[var(--color-teal)]">
              GST (3%)
            </h3>
            <span className="whitespace-nowrap tabular-nums">{formatBreakupINR(number(price.gst))}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-b-2 border-[var(--color-teal)] bg-[var(--color-cream)] px-1 py-3 font-bold [-webkit-text-stroke:0.2px_currentColor] text-[var(--color-teal)]">
          <span>Total Amount</span>
          <span className="whitespace-nowrap tabular-nums">{formatBreakupINR(number(price.finalPrice))}</span>
        </div>
      </div>
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
        *This is an estimated price, actual price may differ as per actual weights.
      </p>
      {b2b && price.b2bPricingStatus === "pending" && (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Silver B2B pricing is pending; the B2C total is shown.
        </p>
      )}
    </div>
  );

  return (
    <section
      className={`rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <h2 className="font-primary text-lg font-bold [-webkit-text-stroke:0.2px_currentColor] text-[var(--color-teal)]">
          Price Breakup
        </h2>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="text-xs font-semibold uppercase tracking-wide text-[var(--color-teal)] underline"
        >
          {open ? "Hide details" : "View breakdown"}
        </button>
      </div>
      {open && (
        <div className="space-y-5 pt-4 text-sm">
          <FourColumnTable
            title={metalLabel}
            weightLabel="Weight"
            rateLabel="Rate/Gm"
            rows={metalRows}
          />

          {!isGold && hasMoissanite && (
            <FourColumnTable
              title="Moissanite"
              weightLabel="Carat"
              rateLabel="Rate/Ct"
              rows={[
                {
                  component: "Moissanite",
                  weight: `${formatMeasurement(number(price.totalMoissaniteWeight ?? product.moissaniteCaratWeight))} ct`,
                  rate: formatBreakupINR(0),
                  price: formatBreakupINR(number(price.moissaniteValue)),
                },
              ]}
            />
          )}
          {((isGold && stoneEntries.length > 0) ||
            (!isGold && hasMoissanite && diamondEntries.length > 0)) && (
              <StoneTable
                title={stoneTitle}
                rows={stoneEntries}
                formatAmount={formatBreakupINR}
              />
            )}
          {summary}
        </div>
      )}
    </section>
  );
}