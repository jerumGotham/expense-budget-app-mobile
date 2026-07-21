export function formatMoney(amount: number, currency: "USD" | "PHP" = "USD") {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-PH", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
