const KARAT_FIELDS = {
  "9kt": {
    gross: "gross_weight_gm-9K",
    net: "net_weight_gm-9k",
    rate: "gold9kt",
  },
  "14kt": {
    gross: "gross_weight_gm-14K",
    net: "net_weight_gm-14k",
    rate: "gold14kt",
  },
  "18kt": {
    gross: "gross_weight_gm-18K",
    net: "net_weight_gm-18k",
    rate: "gold18kt",
  },
};
const calculatePrice = (product, karat, rates) => {
  const normalized = String(karat || "14kt")
    .toLowerCase()
    .replace(/kt?$/, "kt");
  const fields = KARAT_FIELDS[normalized];
  if (!fields) throw new Error("Karat must be 9kt, 14kt, or 18kt");

  rates = rates || global.TBA_METAL_RATES;
  console.log("Using Rates:", rates);

  if (!rates) throw new Error("Global metal rates are required");
  const value = (f) => Number(product[f]) || 0;

  const goldRate = Number(rates[fields.rate]) || 0;

  const goldValue = goldRate * value(fields.net);

  const makingCharge =
    value("making_charge_rate_per_gram") * value(fields.gross);

  const totalCost =
    goldValue +
    makingCharge +
    value("diamond_price_round") +
    value("diamond_price_fancy") +
    value("certificate_charges");

  const gst = totalCost * 0.03;

  console.log({
    goldRate,
    netWeight: value(fields.net),
    goldValue,
    makingCharge,
    totalCost,
    finalPrice: totalCost + gst,
  });

  return {
    karat: normalized,
    goldRate,
    goldValue,
    makingCharge,
    diamondRound: value("diamond_price_round"),
    diamondFancy: value("diamond_price_fancy"),
    certificateCharges: value("certificate_charges"),
    totalCost,
    gst,
    finalPrice: totalCost + gst,
    grossWeight: value(fields.gross),
    netWeight: value(fields.net),
  };
};
module.exports = { calculatePrice, KARAT_FIELDS };
