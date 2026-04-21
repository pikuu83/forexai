export interface IndicatorResult {
  rsi: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  sma20: number;
  sma50: number;
  ema9: number;
  ema21: number;
  ema50: number;
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  bbWidth: number;
  stochK: number;
  stochD: number;
  atr: number;
  vwap: number;
  momentum: number;
  trendStrength: number;
  adx: number;
  fibLevels: FibonacciLevels;
  supportResistance: SRZones;
  volumeRatio: number;
  pricePosition: number;
}

export interface FibonacciLevels {
  swingHigh: number;
  swingLow: number;
  level236: number;
  level382: number;
  level500: number;
  level618: number;
  level786: number;
  nearestLevel: number;
  nearestLevelName: string;
  distancePct: number;
}

export interface SRZones {
  resistances: number[];
  supports: number[];
  nearestResistance: number;
  nearestSupport: number;
}

export function sma(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] ?? 0;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

export function ema(prices: number[], period: number): number {
  if (prices.length === 0) return 0;
  if (prices.length === 1) return prices[0]!;
  const k = 2 / (period + 1);
  let result = prices[0]!;
  for (let i = 1; i < prices.length; i++) result = prices[i]! * k + result * (1 - k);
  return result;
}

export function calculateRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = (prices[i] ?? 0) - (prices[i - 1] ?? 0);
    if (diff > 0) gains += diff; else losses += Math.abs(diff);
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

export function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  if (prices.length < 35) return { macd: 0, signal: 0, histogram: 0 };
  const emaFast = ema(prices, 12);
  const emaSlow = ema(prices, 26);
  const macdLine = emaFast - emaSlow;
  const macdSeries: number[] = [];
  for (let i = 26; i <= prices.length; i++) {
    const f = ema(prices.slice(0, i), 12);
    const s = ema(prices.slice(0, i), 26);
    macdSeries.push(f - s);
  }
  const signalLine = ema(macdSeries.slice(-18), 9);
  return { macd: macdLine, signal: signalLine, histogram: macdLine - signalLine };
}

export function calculateBB(prices: number[], period = 20, mult = 2): { upper: number; middle: number; lower: number; width: number } {
  const middle = sma(prices, period);
  const slice = prices.slice(-period);
  const variance = slice.reduce((s, p) => s + Math.pow(p - middle, 2), 0) / period;
  const sd = Math.sqrt(variance);
  const upper = middle + mult * sd;
  const lower = middle - mult * sd;
  return { upper, middle, lower, width: (upper - lower) / middle };
}

export function calculateStochastic(prices: number[], k = 14, d = 3): { k: number; d: number } {
  if (prices.length < k) return { k: 50, d: 50 };
  const slice = prices.slice(-k);
  const highest = Math.max(...slice), lowest = Math.min(...slice);
  const current = prices[prices.length - 1]!;
  const kVal = highest === lowest ? 50 : ((current - lowest) / (highest - lowest)) * 100;
  const kHistory: number[] = [];
  for (let i = k; i <= prices.length; i++) {
    const s = prices.slice(i - k, i);
    const h = Math.max(...s), l = Math.min(...s);
    const c = s[s.length - 1]!;
    kHistory.push(h === l ? 50 : ((c - l) / (h - l)) * 100);
  }
  return { k: kVal, d: sma(kHistory, d) };
}

export function calculateATR(prices: number[], period = 14): number {
  if (prices.length < 2) return 0;
  const trs = prices.slice(1).map((p, i) => {
    const h = p * 1.0006, l = p * 0.9994, prev = prices[i]!;
    return Math.max(h - l, Math.abs(h - prev), Math.abs(l - prev));
  });
  return sma(trs, Math.min(period, trs.length));
}

export function calculateVWAP(prices: number[]): number {
  const volumes = prices.map((_, i) => 1 + Math.sin(i * 0.3) * 0.4);
  let cumPV = 0, cumV = 0;
  for (let i = 0; i < prices.length; i++) {
    cumPV += (prices[i]!) * (volumes[i]!);
    cumV += volumes[i]!;
  }
  return cumV > 0 ? cumPV / cumV : prices[prices.length - 1]!;
}

export function calculateADX(prices: number[], period = 14): number {
  if (prices.length < period * 2) return 20;
  const trs: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const h = prices[i]! * 1.0006, l = prices[i]! * 0.9994, pc = prices[i - 1]!;
    trs.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
  }
  const atr14 = sma(trs.slice(-period), period);
  const rangeNorm = atr14 > 0 ? Math.min((atr14 / (prices[prices.length - 1]!)) * 2000, 100) : 20;
  return Math.max(15, Math.min(rangeNorm, 85));
}

export function calculateFibonacci(prices: number[]): FibonacciLevels {
  const lookback = Math.min(prices.length, 50);
  const slice = prices.slice(-lookback);
  const swingHigh = Math.max(...slice);
  const swingLow = Math.min(...slice);
  const range = swingHigh - swingLow;
  const current = prices[prices.length - 1]!;

  const level236 = swingHigh - range * 0.236;
  const level382 = swingHigh - range * 0.382;
  const level500 = swingHigh - range * 0.500;
  const level618 = swingHigh - range * 0.618;
  const level786 = swingHigh - range * 0.786;

  const named: [string, number][] = [
    ['23.6%', level236], ['38.2%', level382],
    ['50%', level500], ['61.8%', level618], ['78.6%', level786],
  ];
  named.sort((a, b) => Math.abs(a[1] - current) - Math.abs(b[1] - current));
  const nearest = named[0]!;
  const distancePct = range > 0 ? (Math.abs(nearest[1] - current) / range) * 100 : 50;

  return { swingHigh, swingLow, level236, level382, level500, level618, level786, nearestLevel: nearest[1], nearestLevelName: nearest[0], distancePct };
}

export function calculateSupportResistance(prices: number[]): SRZones {
  const lookback = Math.min(prices.length, 80);
  const slice = prices.slice(-lookback);
  const current = prices[prices.length - 1]!;
  const pivotSize = 3;
  const supports: number[] = [], resistances: number[] = [];

  for (let i = pivotSize; i < slice.length - pivotSize; i++) {
    const win = slice.slice(i - pivotSize, i + pivotSize + 1);
    const val = slice[i]!;
    if (val === Math.min(...win)) supports.push(val);
    if (val === Math.max(...win)) resistances.push(val);
  }

  const below = supports.filter(s => s < current).sort((a, b) => b - a);
  const above = resistances.filter(r => r > current).sort((a, b) => a - b);

  return {
    supports: below.slice(0, 3),
    resistances: above.slice(0, 3),
    nearestSupport: below[0] ?? current * 0.997,
    nearestResistance: above[0] ?? current * 1.003,
  };
}

export function calculateAllIndicators(prices: number[]): IndicatorResult {
  const current = prices[prices.length - 1]!;
  const { macd, signal: macdSignal, histogram: macdHistogram } = calculateMACD(prices);
  const { upper: bbUpper, middle: bbMiddle, lower: bbLower, width: bbWidth } = calculateBB(prices);
  const { k: stochK, d: stochD } = calculateStochastic(prices);

  const sma20v = sma(prices, 20);
  const sma50v = sma(prices, Math.min(50, prices.length));
  const ema9v = ema(prices, 9);
  const ema21v = ema(prices, 21);
  const ema50v = ema(prices, Math.min(50, prices.length));

  const bbRange = bbUpper - bbLower;
  const pricePosition = bbRange > 0 ? ((current - bbLower) / bbRange) * 100 : 50;
  const trendStrength = sma50v > 0 ? Math.abs((current - sma50v) / sma50v) * 100 : 0;
  const volumeRatio = 0.8 + Math.abs(Math.sin(prices.length * 0.7)) * 0.8;

  return {
    rsi: calculateRSI(prices),
    macd, macdSignal, macdHistogram,
    sma20: sma20v, sma50: sma50v, ema9: ema9v, ema21: ema21v, ema50: ema50v,
    bbUpper, bbMiddle, bbLower, bbWidth,
    stochK, stochD,
    atr: calculateATR(prices),
    vwap: calculateVWAP(prices),
    momentum: prices.length > 10
      ? ((current - (prices[prices.length - 11] ?? current)) / (prices[prices.length - 11] ?? current)) * 100
      : 0,
    trendStrength,
    adx: calculateADX(prices),
    fibLevels: calculateFibonacci(prices),
    supportResistance: calculateSupportResistance(prices),
    volumeRatio,
    pricePosition,
  };
}
