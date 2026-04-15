/**
 * Format amount in PLN with Polish locale (space as thousands separator).
 * Example: 114300 → "114 300 zł"
 */
export function formatPLN(amount: number, decimals = 0): string {
  const rounded = Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);
  const formatted = rounded.toLocaleString("pl-PL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${formatted} zł`;
}

/**
 * Format as short PLN (e.g., "114,3 tys. zł")
 */
export function formatPLNShort(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toLocaleString("pl-PL", { maximumFractionDigits: 1 })} mln zł`;
  }
  if (amount >= 10_000) {
    return `${(amount / 1_000).toLocaleString("pl-PL", { maximumFractionDigits: 1 })} tys. zł`;
  }
  return formatPLN(amount);
}

/**
 * Format percentage with Polish locale (comma as decimal separator).
 * Example: 4.75 → "4,75%"
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${value.toLocaleString("pl-PL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

/**
 * Polish declension of "rok/lata/lat".
 * 1 rok, 2-4 lata, 5-21 lat, 22-24 lata, etc.
 */
export function formatYears(n: number): string {
  if (n === 1) return "1 rok";
  const lastTwo = n % 100;
  const lastOne = n % 10;
  if (lastTwo >= 12 && lastTwo <= 14) return `${n} lat`;
  if (lastOne >= 2 && lastOne <= 4) return `${n} lata`;
  return `${n} lat`;
}

/**
 * Generate a unique ID for goals.
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
