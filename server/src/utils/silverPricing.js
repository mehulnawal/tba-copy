const GST_RATE = 0.03;
const requiredNumber = (value, label) => { if (value === undefined || value === null || value === "" || !Number.isFinite(Number(value))) throw new Error(`${label} is required for pricing`); if (Number(value) < 0) throw new Error(`${label} cannot be negative`); return Number(value); };
const optionalNumber = value => value === undefined || value === null || value === "" ? undefined : requiredNumber(value, "Value");
const moissaniteEntries = product => Array.isArray(product?.moissaniteEntries) && product.moissaniteEntries.length ? product.moissaniteEntries : product?.moissaniteCaratWeight === undefined ? [] : [{ caratWeight: product.moissaniteCaratWeight }];
const calculateSilverPrice = ({ product, rates, config }) => {
  if (!config || config.metal !== "silver") throw new Error("Silver product requires a silver category pricing configuration");
  const grossWeight = requiredNumber(product?.grossWeight, "Gross weight");
  const silverRate = requiredNumber(rates?.silver, "Fine silver rate");
  const makingRate = requiredNumber(config.makingRatePerGram, "Silver making rate per gram");
  // Kept as separate line items by design: never combine these multipliers.
  const silverValue = grossWeight * silverRate;
  const makingValue = grossWeight * makingRate;
  const isMoissanite = String(config.categoryType).toLowerCase() === "moissanite";
  const entries = moissaniteEntries(product);
  const totalMoissaniteWeight = isMoissanite ? entries.reduce((sum, entry, index) => sum + requiredNumber(entry?.caratWeight, `Moissanite ${index + 1} carat weight`), 0) : 0;
  // Undefined/null is deliberately an error; a rate of zero is allowed if explicitly configured.
  const moissaniteRatePerCarat = isMoissanite ? optionalNumber(config.moissaniteRatePerCarat) : undefined;
  if (isMoissanite && moissaniteRatePerCarat === undefined) throw new Error("Moissanite rate per carat has not been set in Admin Settings");
  const moissaniteValue = isMoissanite ? totalMoissaniteWeight * moissaniteRatePerCarat : 0;
  // Polki pricing is deliberately inactive until the client supplies its formula.
  const polkiValue = 0;
  const certificateCharges = isMoissanite && config.certificateApplies ? requiredNumber(rates?.certificateRatePerGram, "Universal certificate rate per carat") * totalMoissaniteWeight : 0;
  const totalCost = silverValue + makingValue + moissaniteValue + polkiValue + certificateCharges;
  const gst = totalCost * GST_RATE;
  return { metal: "silver", buyer: "B2C", b2bPricingStatus: "pending", silverRate, grossWeight, silverValue, metalValue: silverValue, makingRatePerGram: makingRate, makingValue, totalMoissaniteWeight, moissaniteRatePerCarat, moissaniteValue, stoneValue: moissaniteValue + polkiValue, polkiValue, certificateCharges, totalCost, gst, finalPrice: totalCost + gst };
};
module.exports = { calculateSilverPrice };
