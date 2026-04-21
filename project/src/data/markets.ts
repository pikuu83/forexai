export interface MarketPair {
  label: string;
  symbol: string;
  basePrice: number;
  pipSize: number;
  decimals: number;
  category: string;
  volatility: number;
  spread: number;
  tvInterval?: string;
}

export interface DurationOption {
  value: number;
  label: string;
}

export const MARKET_PAIRS: MarketPair[] = [
  { label: 'EUR/USD', symbol: 'FX:EURUSD', basePrice: 1.0855, pipSize: 0.0001, decimals: 5, category: 'Forex', volatility: 0.0006, spread: 0.0001 },
  { label: 'GBP/USD', symbol: 'FX:GBPUSD', basePrice: 1.2715, pipSize: 0.0001, decimals: 5, category: 'Forex', volatility: 0.0009, spread: 0.00015 },
  { label: 'USD/JPY', symbol: 'FX:USDJPY', basePrice: 149.80, pipSize: 0.01, decimals: 3, category: 'Forex', volatility: 0.08, spread: 0.02 },
  { label: 'AUD/USD', symbol: 'FX:AUDUSD', basePrice: 0.6540, pipSize: 0.0001, decimals: 5, category: 'Forex', volatility: 0.0007, spread: 0.00012 },
  { label: 'USD/CHF', symbol: 'FX:USDCHF', basePrice: 0.8970, pipSize: 0.0001, decimals: 5, category: 'Forex', volatility: 0.0005, spread: 0.00011 },
  { label: 'USD/CAD', symbol: 'FX:USDCAD', basePrice: 1.3650, pipSize: 0.0001, decimals: 5, category: 'Forex', volatility: 0.0006, spread: 0.00013 },
  { label: 'EUR/GBP', symbol: 'FX:EURGBP', basePrice: 0.8530, pipSize: 0.0001, decimals: 5, category: 'Forex', volatility: 0.0004, spread: 0.00012 },
  { label: 'EUR/JPY', symbol: 'FX:EURJPY', basePrice: 162.40, pipSize: 0.01, decimals: 3, category: 'Forex', volatility: 0.10, spread: 0.03 },
  { label: 'NZD/USD', symbol: 'FX:NZDUSD', basePrice: 0.6050, pipSize: 0.0001, decimals: 5, category: 'Forex', volatility: 0.0007, spread: 0.00014 },
  { label: 'XAU/USD (Gold)', symbol: 'OANDA:XAUUSD', basePrice: 2340.0, pipSize: 0.1, decimals: 2, category: 'Metals', volatility: 2.8, spread: 0.5 },
  { label: 'XAG/USD (Silver)', symbol: 'OANDA:XAGUSD', basePrice: 27.50, pipSize: 0.001, decimals: 3, category: 'Metals', volatility: 0.35, spread: 0.05 },
  { label: 'NASDAQ 100', symbol: 'NASDAQ:NDX', basePrice: 19800, pipSize: 1, decimals: 2, category: 'Indices', volatility: 85, spread: 5, tvInterval: '5' },
  { label: 'S&P 500', symbol: 'SP:SPX', basePrice: 5280, pipSize: 0.1, decimals: 2, category: 'Indices', volatility: 28, spread: 2, tvInterval: '5' },
  { label: 'US Oil (WTI)', symbol: 'NYMEX:CL1!', basePrice: 78.50, pipSize: 0.01, decimals: 2, category: 'Commodities', volatility: 0.65, spread: 0.05 },
  { label: 'Natural Gas', symbol: 'NYMEX:NG1!', basePrice: 2.20, pipSize: 0.001, decimals: 3, category: 'Commodities', volatility: 0.035, spread: 0.003 },
  { label: 'BTC/USD', symbol: 'BINANCE:BTCUSDT', basePrice: 68500, pipSize: 1, decimals: 2, category: 'Crypto', volatility: 480, spread: 20 },
  { label: 'ETH/USD', symbol: 'BINANCE:ETHUSDT', basePrice: 3550, pipSize: 0.01, decimals: 2, category: 'Crypto', volatility: 38, spread: 2 },
  { label: 'BNB/USD', symbol: 'BINANCE:BNBUSDT', basePrice: 590, pipSize: 0.01, decimals: 2, category: 'Crypto', volatility: 10, spread: 0.5 },
];

export const DURATION_OPTIONS: DurationOption[] = [
  { value: 1, label: '1 min' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
];

export const MARKET_CATEGORIES = ['Forex', 'Metals', 'Indices', 'Commodities', 'Crypto'];
