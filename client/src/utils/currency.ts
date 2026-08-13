export const formatINR = (value: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits,
  }).format(Number.isFinite(value) ? value : 0);

// Prevent floating-point calculation artifacts from reaching customer-facing measurement displays.
export const formatMeasurement = (value: number, maximumFractionDigits = 3) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits }).format(Number.isFinite(value) ? value : 0);
