export function parsePrice(priceString) {
  if (priceString == null) return 0;

  if (typeof priceString === "number") return priceString;

  // Remove $ and spaces
  priceString = priceString.replaceAll("$", "").replaceAll(/\s+/g, "");

  // Remove thousand separators
  priceString = priceString.replaceAll(",", "");

  return Number(priceString);
}

export const formatPrice = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return "$0";
  return `$${num}`;
};

export function calcPriceFromBase(basePrice) {
  return {
    adult: basePrice,
    child: Math.round(basePrice * 0.6),
    smallChild: Math.round(basePrice * 0.3),
    infant: 0
  };
}
