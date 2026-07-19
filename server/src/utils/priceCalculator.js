const KARAT_FIELDS = {
  "9kt": { gold: "gold_price_9kt", gross: "gross_weight_gm-9K", net: "net_weight_gm-9k" },
  "14kt": { gold: "gold_price_14kt", gross: "gross_weight_gm-14K", net: "net_weight_gm-14k" },
  "18kt": { gold: "gold_price_18kt", gross: "gross_weight_gm-18K", net: "net_weight_gm-18k" },
};

const calculatePrice = (product, karat) => {
  const normalizedKarat = String(karat || "14kt").toLowerCase().replace(/kt?$/, "kt");
  const fields = KARAT_FIELDS[normalizedKarat];
  if (!fields) throw new Error("Karat must be 9kt, 14kt, or 18kt");
  const value = (field) => Number(product[field]) || 0;
  const makingCharge = value("making_charge_rate_per_gram") * value(fields.gross);
  const totalCost = value(fields.gold) + makingCharge + value("diamond_price_round") + value("diamond_price_fancy") + value("certificate_charges");
  const gst = totalCost * 0.03;
  return { karat: normalizedKarat, makingCharge, totalCost, gst, finalPrice: totalCost + gst, grossWeight: value(fields.gross), netWeight: value(fields.net) };
};

module.exports = { calculatePrice, KARAT_FIELDS };