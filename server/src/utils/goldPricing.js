const GOLD_18KT_FACTOR = 0.76;
const GOLD_14KT_FACTOR = 0.6;
const GST_RATE = 0.03;
const B2B_MAKING_DISCOUNT_PER_GRAM = 50;
const requiredNumber = (value, label) => {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    !Number.isFinite(Number(value))
  )
    throw new Error(`${label} is required for pricing`);
  if (Number(value) < 0) throw new Error(`${label} cannot be negative`);
  return Number(value);
};
const karatValue = (karat) => {
  const value = String(karat || "14kt")
    .toLowerCase()
    .replace(/k$/, "kt");
  if (!["14kt", "18kt"].includes(value))
    throw new Error("Gold karat must be 14kt or 18kt");
  return value;
};

const weight = (product, name, karat) => {
  const value = product?.[name];
  return requiredNumber(
    value && typeof value === "object" ? value[karat] : value,
    name,
  );
};
const entriesFor = (product) =>
  Array.isArray(product?.diamonds) ? product.diamonds : [];
const totalDiamondWeight = (product) =>
  entriesFor(product).reduce(
    (total, entry, index) =>
      total +
      requiredNumber(entry.caratWeight, `Diamond ${index + 1} carat weight`),
    0,
  );
// Gold diamond rates are deliberately entered per product, including Lab-Grown products.
const diamondValue = (product, buyer) =>
  entriesFor(product).reduce(
    (total, entry, index) =>
      total +
      requiredNumber(entry.caratWeight, `Diamond ${index + 1} carat weight`) *
        requiredNumber(buyer === "B2B" ? (entry.ratePerCtB2B ?? entry.ratePerCt) : (entry.ratePerCtB2C ?? entry.ratePerCt), `Diamond ${index + 1} ${buyer} rate per ct`),
    0,
  );
const calculateGoldPrice = ({
  product,
  karat,
  buyer = "B2C",
  rates,
  settings,
}) => {
  if (!settings || settings.metal !== "gold")
    throw new Error("Gold product requires Gold category settings");
  const selectedKarat = karatValue(karat);
  const normalizedBuyer = String(buyer).toUpperCase();
  if (!["B2C", "B2B"].includes(normalizedBuyer))
    throw new Error("Buyer must be B2C or B2B");
  const rate24PerTenGrams = requiredNumber(rates?.gold24kt, "24kt gold rate per 10 grams");
  const karatRatePerTenGrams = rate24PerTenGrams * (selectedKarat === "18kt" ? GOLD_18KT_FACTOR : GOLD_14KT_FACTOR);
  const goldRate = karatRatePerTenGrams / 10;
  const grossWeight = weight(product, "grossWeight", selectedKarat);
  const netWeight = weight(product, "netWeight", selectedKarat);
  // Gold Lab-Grown B2B is configuration-driven so charges can be enabled later without rebuilding.
  const exemptB2BCharges =
    normalizedBuyer === "B2B" && Boolean(settings.b2bExcludeCharges);
  const baseMakingRate = requiredNumber(
    rates?.makingRatePerGram,
    "Universal making rate per gram",
  );
  const makingRate = exemptB2BCharges
    ? 0
    : baseMakingRate -
      (normalizedBuyer === "B2B" ? B2B_MAKING_DISCOUNT_PER_GRAM : 0);
  if (makingRate < 0) throw new Error("B2B making rate cannot be negative");
  const goldValue = goldRate * netWeight;
  const makingCharge = makingRate * netWeight;
  const diamondTotal = diamondValue(product, normalizedBuyer);

  const certificateCharges =
    !exemptB2BCharges && settings.certificateApplies
      ? requiredNumber(
          rates?.certificateRatePerGram,
          "Universal certificate rate per carat",
        ) * totalDiamondWeight(product)
      : 0;

  const totalCost =
    goldValue + makingCharge + diamondTotal + certificateCharges;

  const gst = exemptB2BCharges ? 0 : totalCost * GST_RATE;
  return {
    metal: "gold",
    buyer: normalizedBuyer,
    karat: selectedKarat,
    goldRate,
    goldValue,
    grossWeight,
    netWeight,
    totalDiamondWeight: totalDiamondWeight(product),
    makingRatePerGram: makingRate,
    makingCharge,
    diamondValue: diamondTotal,
    certificateCharges,
    totalCost,
    gst,
    finalPrice: totalCost + gst,
    display:
      normalizedBuyer === "B2B"
        ? {
            showGoldWeight: true,
            showDiamondWeight: true,
            showMaking:
              !exemptB2BCharges && Boolean(settings.b2bDisplay?.showMaking),
            showCertificate:
              !exemptB2BCharges &&
              Boolean(settings.b2bDisplay?.showCertificate),
            showGst: !exemptB2BCharges && Boolean(settings.b2bDisplay?.showGst),
          }
        : undefined,
  };
};
module.exports = { calculateGoldPrice, GOLD_18KT_FACTOR, GOLD_14KT_FACTOR };
