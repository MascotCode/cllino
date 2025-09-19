export function fmtMoney(amount: number, currency: string = 'MAD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'MAD' ? 'USD' : currency, // MAD not widely supported, fallback to USD format
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('$', '') + ` ${currency}`;
  } catch (error) {
    // Fallback for unsupported currencies
    return `${amount} ${currency}`;
  }
}
