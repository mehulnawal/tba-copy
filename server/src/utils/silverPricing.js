const GST_RATE = 0.03;
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
const optionalNumber = (value) =>
  value === undefined || value === null || value === ""
    ? undefined
    : requiredNumber(value, "Value");
const moissaniteEntries = (product) =>
  Array.isArray(product?.moissaniteEntries) && product.moissaniteEntries.length
    ? product.moissaniteEntries
    : product?.moissaniteCaratWeight === undefined
      ? []
      : [{ caratWeight: product.moissaniteCaratWeight }];
/*
 * TEMPORARILY DISABLED — restore this for original flow.
 * The original Silver rate × weight + making/stone calculation is retained below
 * so this temporary manual-price flow can be reverted cleanly.
const calculateSilverPriceFromRates = ({ product, rates, settings, buyer = "B2C" }) => {
  if (!settings || settings.metal !== "silver") throw new Error("Silver product requires Silver category settings");
  const grossWeight = requiredNumber(product?.grossWeight, "Gross weight");
  const silverRate = requiredNumber(rates?.silver, "Fine silver rate");
  const makingRate = requiredNumber(settings.makingRatePerGram, "Silver making rate per gram");
  // Kept as separate line items by design: never combine these multipliers.
  const silverValue = grossWeight * silverRate;
  const makingValue = grossWeight * makingRate;
  const isMoissanite = String(settings.categoryType).toLowerCase() === "moissanite";
  const entries = moissaniteEntries(product);
  const totalMoissaniteWeight = isMoissanite ? entries.reduce((sum, entry, index) => sum + requiredNumber(entry?.caratWeight, `Moissanite ${index + 1} carat weight`), 0) : 0;
  // Undefined/null is deliberately an error; a rate of zero is allowed if explicitly configured.
  const moissaniteRatePerCarat = isMoissanite ? optionalNumber(settings.moissaniteRatePerCarat) : undefined;
  if (isMoissanite && moissaniteRatePerCarat === undefined) throw new Error("Moissanite rate per carat has not been set in Admin Settings");
  const moissaniteValue = isMoissanite ? totalMoissaniteWeight * moissaniteRatePerCarat : 0;
  // Polki pricing is deliberately inactive until the client supplies its formula.
  const diamondValue = (Array.isArray(product?.diamonds) ? product.diamonds : []).reduce((sum, entry, index) => sum + requiredNumber(entry?.caratWeight, `Diamond ${index + 1} carat weight`) * requiredNumber(String(buyer).toUpperCase() === "B2B" ? (entry.ratePerCtB2B ?? entry.ratePerCt) : (entry.ratePerCtB2C ?? entry.ratePerCt), `Diamond ${index + 1} ${buyer} rate per ct`), 0);
  const polkiValue = 0;
  const certificateCharges = isMoissanite && settings.certificateApplies ? requiredNumber(rates?.certificateRatePerGram, "Universal certificate rate per carat") * totalMoissaniteWeight : 0;
  const totalCost = silverValue + makingValue + moissaniteValue + diamondValue + polkiValue + certificateCharges;
  const gst = totalCost * GST_RATE;
  return { metal: "silver", buyer: String(buyer).toUpperCase(), b2bPricingStatus: "pending", silverRate, grossWeight, silverValue, metalValue: silverValue, makingRatePerGram: makingRate, makingValue, totalMoissaniteWeight, moissaniteRatePerCarat, moissaniteValue, diamondValue, stoneValue: moissaniteValue + diamondValue + polkiValue, polkiValue, certificateCharges, totalCost, gst, finalPrice: totalCost + gst };
};
*/

// Polki remains a manual pre-GST Silver price entered in Admin. Moissanite uses
// the actual Silver, making and Moissanite rates so the breakup can display them.
const calculateSilverPrice = ({ product, buyer = "B2C", rates, settings }) => {
  const categoryType = String(settings?.categoryType || "")
    .trim()
    .toLowerCase();
  if (!["moissanite", "polki"].includes(categoryType)) {
    const price = requiredNumber(product?.price, "Silver Price");
    const gst = price * GST_RATE;
    return {
      metal: "silver",
      buyer: String(buyer).toUpperCase(),
      price,
      totalCost: price,
      gst,
      finalPrice: price + gst,
    };
  }

  const grossWeight = requiredNumber(product?.grossWeight, "Gross weight");
  const silverRate = requiredNumber(rates?.silver, "Fine silver rate");
  const makingRatePerGram = requiredNumber(
    settings?.makingRatePerGram,
    "Silver making rate per gram",
  );
  const isMoissanite = categoryType === "moissanite";
  const entries = isMoissanite ? moissaniteEntries(product) : [];
  const totalMoissaniteWeight = isMoissanite
    ? entries.reduce(
        (sum, entry, index) =>
          sum +
          requiredNumber(
            entry?.caratWeight,
            `Moissanite ${index + 1} carat weight`,
          ),
        0,
      )
    : 0;
  const moissaniteRatePerCarat = isMoissanite
    ? requiredNumber(
        settings?.moissaniteRatePerCarat,
        "Moissanite rate per carat",
      )
    : undefined;
  const silverValue = grossWeight * silverRate;
  const makingValue = grossWeight * makingRatePerGram;
  const moissaniteValue = isMoissanite
    ? totalMoissaniteWeight * moissaniteRatePerCarat
    : 0;
  const diamondValue = (
    Array.isArray(product?.diamonds) ? product.diamonds : []
  ).reduce(
    (sum, entry, index) =>
      sum +
      requiredNumber(entry?.caratWeight, `Diamond ${index + 1} carat weight`) *
        requiredNumber(
          String(buyer).toUpperCase() === "B2B"
            ? (entry.ratePerCtB2B ?? entry.ratePerCt)
            : (entry.ratePerCtB2C ?? entry.ratePerCt),
          `Diamond ${index + 1} ${buyer} rate per ct`,
        ),
    0,
  );
  const totalCost = silverValue + makingValue + moissaniteValue + diamondValue;
  const gst = totalCost * GST_RATE;
  return {
    metal: "silver",
    buyer: String(buyer).toUpperCase(),
    silverRate,
    grossWeight,
    silverValue,
    metalValue: silverValue,
    makingRatePerGram,
    makingValue,
    makingCharge: makingValue,
    totalMoissaniteWeight,
    moissaniteRatePerCarat,
    moissaniteValue,
    diamondValue,
    stoneValue: moissaniteValue + diamondValue,
    totalCost,
    gst,
    finalPrice: totalCost + gst,
  };
};
module.exports = { calculateSilverPrice };
