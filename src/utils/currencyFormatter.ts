/**
 * Currency and date formatting utilities for Indian Rupee (INR) and general finance
 */

export function formatINR(
  amount: number,
  options?: {
    showDecimals?: boolean;
    compact?: boolean;
  }
): string {
  const { showDecimals = false, compact = false } = options || {};

  if (compact && Math.abs(amount) >= 100000) {
    // Format in Lakhs / Crores for compact view if huge
    if (Math.abs(amount) >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(amount) >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  return formatter.format(amount);
}

export function formatCompactINR(amount: number): string {
  return formatINR(amount, { compact: true });
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
