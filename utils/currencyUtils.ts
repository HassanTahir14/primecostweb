import { useCurrency } from '@/context/CurrencyContext';

// Cache for exchange rates
let exchangeRates: { [key: string]: number } = {
  SAR: 3.75, // Fallback rate
  AED: 3.67  // Fallback rate
};
let lastFetchTime: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 60 minutes in milliseconds

// Fetch exchange rates immediately when the module is loaded
(async () => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    
    if (data && data.rates) {
      if (data.rates.SAR) exchangeRates.SAR = data.rates.SAR;
      if (data.rates.AED) exchangeRates.AED = data.rates.AED;
      lastFetchTime = Date.now();
    }
  } catch (error) {
    console.error('Failed to fetch initial exchange rates:', error);
  }
})();

async function fetchExchangeRates(): Promise<{ [key: string]: number }> {
  const now = Date.now();
  
  // Always fetch fresh rates if cache is older than 60 minutes
  if ((now - lastFetchTime) > CACHE_DURATION) {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      
      if (data && data.rates) {
        if (data.rates.SAR) exchangeRates.SAR = data.rates.SAR;
        if (data.rates.AED) exchangeRates.AED = data.rates.AED;
        lastFetchTime = now;
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    }
  }
  
  return exchangeRates;
}

export async function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
  if (fromCurrency === toCurrency) return amount;
  
  const rates = await fetchExchangeRates();
  
  if (fromCurrency === 'USD') {
    return amount * (rates[toCurrency] || 1);
  } else if (toCurrency === 'USD') {
    return amount / (rates[fromCurrency] || 1);
  } else {
    // Convert through USD as base currency
    const usdAmount = amount / (rates[fromCurrency] || 1);
    return usdAmount * (rates[toCurrency] || 1);
  }
}

export async function formatCurrencyValue(value: number | null | undefined, currency: string = 'USD'): Promise<string> {
  if (value === null || value === undefined) return 'N/A';
  
  // Convert the value to the target currency
  const convertedValue = await convertCurrency(value, 'USD', currency);
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(convertedValue);
}

export function getCurrencySymbol(currency: string = 'USD'): string {
  switch (currency) {
    case 'USD':
      return '$';
    case 'SAR':
      return '﷼';
    case 'AED':
      return 'د.إ';
    default:
      return '$';
  }
}

export function getCurrencyFromStorage(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('currency') || 'USD';
  }
  return 'USD';
} 