import { formatPhone, calculateTotalTime, formatPercentage, formatNumber } from '../format';

describe('formatPhone', () => {
  it('should format a valid phone number correctly', () => {
    expect(formatPhone('5511999887766')).toBe('+55 (11) 9 9988-7766');
    expect(formatPhone('5511987654321')).toBe('+55 (11) 9 8765-4321');
  });

  it('should return null for invalid phone numbers', () => {
    expect(formatPhone('123')).toBeNull();
    expect(formatPhone('abc')).toBeNull();
    expect(formatPhone('5511')).toBeNull();
  });
});

describe('calculateTotalTime', () => {
  it('should calculate time correctly', () => {
    const result = calculateTotalTime(10, 30);
    expect(result.totalSeconds).toBe(300);
    expect(result.minutes).toBe(5);
    expect(result.seconds).toBe(0);
    expect(result.formatted).toBe('5m');
  });

  it('should handle large intervals', () => {
    const result = calculateTotalTime(100, 60);
    expect(result.totalSeconds).toBe(6000);
    expect(result.hours).toBe(1);
    expect(result.minutes).toBe(40);
    expect(result.formatted).toBe('1h 40m');
  });
});

describe('formatPercentage', () => {
  it('should format percentage with default decimals', () => {
    expect(formatPercentage(75.5678)).toBe('75.6%');
  });

  it('should format percentage with custom decimals', () => {
    expect(formatPercentage(75.5678, 2)).toBe('75.57%');
  });
});

describe('formatNumber', () => {
  it('should format numbers correctly', () => {
    expect(formatNumber(1234)).toBe('1.2k');
    expect(formatNumber(1000000)).toBe('1.0M');
    expect(formatNumber(500)).toBe('500');
  });
}); 