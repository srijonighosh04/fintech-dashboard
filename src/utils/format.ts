const EXCHANGE_RATES = {
  USD: 1.0,
  EUR: 0.915,
  GBP: 0.785,
};

/**
 * Formats a numeric value into a specific currency string with exchange rate conversion.
 */
export function formatCurrency(
  amount: number,
  currency: 'USD' | 'EUR' | 'GBP' = 'USD'
): string {
  const convertedAmount = amount * (EXCHANGE_RATES[currency] || 1.0);
  
  const locale = currency === 'USD' ? 'en-US' : currency === 'EUR' ? 'de-DE' : 'en-GB';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(convertedAmount);
}

/**
 * Formats a ISO date string or Date object into a readable date string.
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Masks a banking account number to only display the last N digits.
 */
export function maskAccountNumber(accountNumber: string, visibleDigits = 4): string {
  if (!accountNumber) return '';
  const trimmed = accountNumber.trim();
  if (trimmed.length <= visibleDigits) return trimmed;
  const maskedLength = trimmed.length - visibleDigits;
  const mask = '•'.repeat(maskedLength);
  
  // Format into blocks for better readability
  const formattedMask = mask.replace(/(.{4})/g, '$1 ').trim();
  const visible = trimmed.slice(-visibleDigits);
  
  return `${formattedMask} ${visible}`;
}
