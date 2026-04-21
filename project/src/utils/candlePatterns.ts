export interface PatternResult {
  detected: boolean;
  name: string;
  bullish: boolean;
  reliability: number;
  description: string;
}

interface OHLC {
  open: number;
  high: number;
  low: number;
  close: number;
}

function toCandlesticks(prices: number[], groupSize = 5): OHLC[] {
  const candles: OHLC[] = [];
  for (let i = 0; i + groupSize <= prices.length; i += groupSize) {
    const slice = prices.slice(i, i + groupSize);
    candles.push({
      open: slice[0]!,
      high: Math.max(...slice),
      low: Math.min(...slice),
      close: slice[slice.length - 1]!,
    });
  }
  return candles;
}

function bodySize(c: OHLC) { return Math.abs(c.close - c.open); }
function totalRange(c: OHLC) { return c.high - c.low; }
function upperWick(c: OHLC) { return c.high - Math.max(c.open, c.close); }
function lowerWick(c: OHLC) { return Math.min(c.open, c.close) - c.low; }
function isBull(c: OHLC) { return c.close > c.open; }
function isBear(c: OHLC) { return c.close < c.open; }

function isDoji(c: OHLC): boolean {
  const body = bodySize(c);
  const range = totalRange(c);
  return range > 0 && body / range < 0.12;
}

function isHammer(c: OHLC): boolean {
  const body = bodySize(c);
  const lower = lowerWick(c);
  const upper = upperWick(c);
  const range = totalRange(c);
  return range > 0 && lower >= body * 2.2 && upper <= body * 0.35 && body / range > 0.1;
}

function isShootingStar(c: OHLC): boolean {
  const body = bodySize(c);
  const upper = upperWick(c);
  const lower = lowerWick(c);
  const range = totalRange(c);
  return range > 0 && upper >= body * 2.2 && lower <= body * 0.35 && body / range > 0.1;
}

function isBullEngulfing(prev: OHLC, curr: OHLC): boolean {
  return isBear(prev) && isBull(curr) && curr.open < prev.close && curr.close > prev.open;
}

function isBearEngulfing(prev: OHLC, curr: OHLC): boolean {
  return isBull(prev) && isBear(curr) && curr.open > prev.close && curr.close < prev.open;
}

function isMorningStar(c1: OHLC, c2: OHLC, c3: OHLC): boolean {
  return (
    isBear(c1) && bodySize(c1) > totalRange(c1) * 0.5 &&
    bodySize(c2) < totalRange(c1) * 0.35 &&
    isBull(c3) && c3.close > (c1.open + c1.close) / 2
  );
}

function isEveningStar(c1: OHLC, c2: OHLC, c3: OHLC): boolean {
  return (
    isBull(c1) && bodySize(c1) > totalRange(c1) * 0.5 &&
    bodySize(c2) < totalRange(c1) * 0.35 &&
    isBear(c3) && c3.close < (c1.open + c1.close) / 2
  );
}

function isHarami(prev: OHLC, curr: OHLC): boolean {
  return (
    bodySize(prev) > 0 &&
    curr.open > Math.min(prev.open, prev.close) &&
    curr.open < Math.max(prev.open, prev.close) &&
    curr.close > Math.min(prev.open, prev.close) &&
    curr.close < Math.max(prev.open, prev.close) &&
    bodySize(curr) < bodySize(prev) * 0.5
  );
}

function isPiercingLine(prev: OHLC, curr: OHLC): boolean {
  const midPoint = (prev.open + prev.close) / 2;
  return isBear(prev) && isBull(curr) && curr.open < prev.close && curr.close > midPoint && curr.close < prev.open;
}

function isDarkCloud(prev: OHLC, curr: OHLC): boolean {
  const midPoint = (prev.open + prev.close) / 2;
  return isBull(prev) && isBear(curr) && curr.open > prev.close && curr.close < midPoint && curr.close > prev.open;
}

export function detectCandlePattern(prices: number[]): PatternResult {
  const candles = toCandlesticks(prices.slice(-30), 5);
  if (candles.length < 3) return { detected: false, name: '', bullish: true, reliability: 0, description: '' };

  const last = candles[candles.length - 1]!;
  const prev = candles[candles.length - 2]!;
  const pprev = candles[candles.length - 3]!;

  if (isMorningStar(pprev, prev, last)) {
    return { detected: true, name: 'Morning Star', bullish: true, reliability: 87, description: 'Three-candle reversal pattern at bottom — strong bullish reversal signal confirmed' };
  }
  if (isEveningStar(pprev, prev, last)) {
    return { detected: true, name: 'Evening Star', bullish: false, reliability: 87, description: 'Three-candle reversal pattern at top — strong bearish reversal signal confirmed' };
  }
  if (isBullEngulfing(prev, last)) {
    return { detected: true, name: 'Bullish Engulfing', bullish: true, reliability: 83, description: 'Large bullish candle fully engulfs previous bearish candle — institutional buying surge' };
  }
  if (isBearEngulfing(prev, last)) {
    return { detected: true, name: 'Bearish Engulfing', bullish: false, reliability: 83, description: 'Large bearish candle fully engulfs previous bullish candle — institutional selling surge' };
  }
  if (isPiercingLine(prev, last)) {
    return { detected: true, name: 'Piercing Line', bullish: true, reliability: 76, description: 'Bullish candle pierces through midpoint of prior bearish candle — reversal in progress' };
  }
  if (isDarkCloud(prev, last)) {
    return { detected: true, name: 'Dark Cloud Cover', bullish: false, reliability: 76, description: 'Bearish candle opens above and closes below midpoint of prior bullish candle — distribution signal' };
  }
  if (isHammer(last) && isBear(prev)) {
    return { detected: true, name: 'Hammer', bullish: true, reliability: 75, description: 'Long lower wick shows buyers rejected lower prices — bullish reversal after downtrend' };
  }
  if (isShootingStar(last) && isBull(prev)) {
    return { detected: true, name: 'Shooting Star', bullish: false, reliability: 75, description: 'Long upper wick shows sellers rejected higher prices — bearish reversal after uptrend' };
  }
  if (isHarami(prev, last)) {
    const bullish = isBear(prev);
    return { detected: true, name: bullish ? 'Bullish Harami' : 'Bearish Harami', bullish, reliability: 68, description: `Inside candle signals ${bullish ? 'indecision after downtrend — potential reversal' : 'indecision after uptrend — potential reversal'}` };
  }
  if (isDoji(last)) {
    return { detected: true, name: 'Doji', bullish: false, reliability: 60, description: 'Doji candle — market indecision, wait for confirmation on next candle' };
  }

  return { detected: false, name: 'No pattern', bullish: true, reliability: 0, description: 'No significant candlestick pattern detected in recent candles' };
}
