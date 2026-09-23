import { describe, it, expect } from 'vitest';
import { formatINR, formatCompactINR, formatPercentage } from '../currencyFormatter';

describe('currencyFormatter', () => {
  it('formats standard INR numbers properly with ₹ symbol', () => {
    const formatted = formatINR(75000);
    expect(formatted).toContain('75,000');
    expect(formatted).toContain('₹');
  });

  it('formats with decimals when requested', () => {
    const formatted = formatINR(1250.5, { showDecimals: true });
    expect(formatted).toContain('1,250.50');
  });

  it('formats compact Lakhs and Crores properly', () => {
    expect(formatCompactINR(150000)).toBe('₹1.50 L');
    expect(formatCompactINR(25000000)).toBe('₹2.50 Cr');
  });

  it('formats percentages correctly', () => {
    expect(formatPercentage(22.456)).toBe('22.5%');
    expect(formatPercentage(15, 0)).toBe('15%');
  });
});
