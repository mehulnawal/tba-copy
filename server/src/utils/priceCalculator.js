const KARAT_FIELDS = { "9kt": { rate: "gold9kt" }, "14kt": { rate: "gold14kt" }, "18kt": { rate: "gold18kt" } };
const calculatePrice = (product, karat, rates) => {
  const normalized = String(karat || "14kt").toLowerCase().replace(/kt?$/, "kt"); const fields = KARAT_FIELDS[normalized]; if (!fields) throw new Error("Karat must be 9kt, 14kt, or 18kt");
  rates = rates || global.TBA_METAL_RATES; if (!rates) throw new Error("Global metal rates are required");
  const grossWeight = Number(product.grossWeight?.[normalized]) || 0, netWeight = Number(product.netWeight?.[normalized]) || 0;
  const goldRate = Number(rates[fields.rate]) || 0, goldValue = goldRate * netWeight, makingCharge = (Number(product.makingChargeRatePerGram) || 0) * grossWeight;
  const diamondRound = Number(product.diamond?.roundPrice) || 0, diamondFancy = Number(product.diamond?.fancyPrice) || 0, certificateCharges = Number(product.certificateCharges) || 0, totalCost = goldValue + makingCharge + diamondRound + diamondFancy + certificateCharges, gst = totalCost * .03;
  return { karat: normalized, goldRate, goldValue, makingCharge, diamondRound, diamondFancy, certificateCharges, totalCost, gst, finalPrice: totalCost + gst, grossWeight, netWeight };
}; module.exports = { calculatePrice, KARAT_FIELDS };
