export const formatINR = (value: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits,
  }).format(Number.isFinite(value) ? value : 0);

// Prevent floating-point calculation artifacts from reaching customer-facing measurement displays.
export const formatMeasurement = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(
    Number.isFinite(value) ? value : 0,
  );
