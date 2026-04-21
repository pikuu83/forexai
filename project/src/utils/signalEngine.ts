import type { MarketPair } from '../data/markets';
import { calculateAllIndicators, type IndicatorResult } from './indicators';
import { detectCandlePattern, type PatternResult } from './candlePatterns';

export type SignalDirection = 'BUY' | 'SELL';

export interface LogicPoint {
  label: string;
  detail: string;
  weight: 'strong' | 'medium' | 'weak';
  bullish: boolean;
}

export interface SystemScore {
  name: string;
  vote: 1 | -1 | 0;
  confidence: number;
  reason: string;
}

export interface MarketContext {
  trendDirection: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS';
  trendStrength: 'STRONG' | 'MODERATE' | 'WEAK';
  volatilityState: 'HIGH' | 'NORMAL' | 'LOW';
  marketPhase: 'TRENDING' | 'RANGING' | 'BREAKOUT' | 'REVERSAL';
  volumeContext: 'INSTITUTIONAL' | 'NORMAL' | 'THIN';
  smartMoneyBias: 'ACCUMULATION' | 'DISTRIBUTION' | 'NEUTRAL';
}

export interface SignalResult {
  direction: SignalDirection;
  confidence: number;
  entryLow: number;
  entryHigh: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  currentPrice: number;
  indicators: IndicatorResult;
  candlePattern: PatternResult;
  systemScores: SystemScore[];
  logicPoints: LogicPoint[];
  rejectedReasons: string[];
  isHighConfidence: boolean;
  marketContext: MarketContext;
}

export interface WeakSignalError {
  type: 'WEAK_SIGNAL';
  message: string;
  details: string[];
}

function generatePriceSeries(pair: MarketPair, count = 300): number[] {
  const prices: number[] = [pair.basePrice];
  let trend = (Math.random() - 0.5) * 0.00006 * pair.basePrice;
  let momentum = 0;
  let regime = Math.random() > 0.5 ? 1 : -1;

  for (let i = 1; i < count; i++) {
    const meanReversion = (pair.basePrice - prices[i - 1]!) * 0.00015;
    const shock = (Math.random() - 0.5) * pair.volatility * 2.2;
    const volumeImpact = Math.sin(i * 0.12) * pair.volatility * 0.25;
    const cycleComponent = Math.sin(i * 0.04) * pair.volatility * 0.6;

    if (i % 35 === 0) {
      trend = (Math.random() - 0.5) * 0.00006 * pair.basePrice;
      regime = Math.random() > 0.5 ? 1 : -1;
    }
    if (i % 15 === 0) momentum = momentum * 0.7 + regime * pair.volatility * 0.4;
    momentum = momentum * 0.93 + shock * 0.07;

    const next = Math.max(
      prices[i - 1]! + trend + meanReversion + shock + volumeImpact + momentum + cycleComponent,
      pair.basePrice * 0.82
    );
    prices.push(next);
  }
  return prices;
}

function generateMultiTimeframe(pair: MarketPair): {
  fast: number[];
  medium: number[];
  slow: number[];
} {
  const base = generatePriceSeries(pair, 350);
  const medium: number[] = [];
  const slow: number[] = [];
  for (let i = 3; i < base.length; i += 3) medium.push(base[i]!);
  for (let i = 5; i < base.length; i += 5) slow.push(base[i]!);
  return { fast: base, medium, slow };
}

function getTrendDirection(prices: number[], fast: IndicatorResult): 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS' {
  const len = prices.length;
  if (len < 20) return 'SIDEWAYS';

  const recent20 = prices.slice(-20);
  const earliest = recent20.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
  const latest = recent20.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const priceTrend = (latest - earliest) / earliest;

  const emaTrend = fast.ema9 > fast.ema21 && fast.ema21 > fast.ema50 ? 1
    : fast.ema9 < fast.ema21 && fast.ema21 < fast.ema50 ? -1 : 0;

  const overallTrend = priceTrend * 1000 + emaTrend;

  if (overallTrend > 0.5) return 'UPTREND';
  if (overallTrend < -0.5) return 'DOWNTREND';
  return 'SIDEWAYS';
}

function getTrendStrength(adx: number, rsi: number, emaTrend: number): 'STRONG' | 'MODERATE' | 'WEAK' {
  const emaAgrees = emaTrend !== 0 ? 1 : 0;
  const score = adx * 0.6 + Math.abs(rsi - 50) * 0.4;
  if (score > 28 && emaAgrees) return 'STRONG';
  if (score > 18) return 'MODERATE';
  return 'WEAK';
}

function getVolatilityState(bbWidth: number, atr: number, price: number): 'HIGH' | 'NORMAL' | 'LOW' {
  const atrPct = (atr / price) * 100;
  if (bbWidth > 0.025 || atrPct > 0.8) return 'HIGH';
  if (bbWidth < 0.008 || atrPct < 0.2) return 'LOW';
  return 'NORMAL';
}

function getMarketPhase(
  trendDir: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS',
  trendStrength: 'STRONG' | 'MODERATE' | 'WEAK',
  volatility: 'HIGH' | 'NORMAL' | 'LOW',
  rsi: number,
): 'TRENDING' | 'RANGING' | 'BREAKOUT' | 'REVERSAL' {
  if (trendDir === 'SIDEWAYS' && volatility === 'LOW') return 'RANGING';
  if (volatility === 'HIGH' && trendStrength === 'WEAK') return 'BREAKOUT';
  if ((rsi < 28 || rsi > 72) && trendStrength === 'WEAK') return 'REVERSAL';
  if (trendStrength === 'STRONG') return 'TRENDING';
  return 'RANGING';
}

function getSmartMoneyBias(
  prices: number[],
  vwap: number,
  volumeRatio: number,
  momentum: number,
): 'ACCUMULATION' | 'DISTRIBUTION' | 'NEUTRAL' {
  const current = prices[prices.length - 1]!;
  const recent5 = prices.slice(-5);
  const bullishBars = recent5.filter((p, i) => i > 0 && p > recent5[i - 1]!).length;
  const isAboveVWAP = current > vwap;
  const hasVolume = volumeRatio > 1.2;

  if (isAboveVWAP && hasVolume && momentum > 0 && bullishBars >= 3) return 'ACCUMULATION';
  if (!isAboveVWAP && hasVolume && momentum < 0 && bullishBars <= 1) return 'DISTRIBUTION';
  return 'NEUTRAL';
}

function analyzeHistoricalBehavior(prices: number[]): {
  recentHigh: number;
  recentLow: number;
  avgRange: number;
  priceReactionZones: number[];
  consecutiveDir: number;
} {
  const lookback = Math.min(prices.length, 60);
  const slice = prices.slice(-lookback);
  const recentHigh = Math.max(...slice);
  const recentLow = Math.min(...slice);

  const ranges: number[] = [];
  for (let i = 1; i < slice.length; i++) {
    ranges.push(Math.abs(slice[i]! - slice[i - 1]!));
  }
  const avgRange = ranges.reduce((a, b) => a + b, 0) / ranges.length;

  const reactionZones: number[] = [];
  for (let i = 3; i < slice.length - 3; i++) {
    const win5 = slice.slice(i - 2, i + 3);
    const val = slice[i]!;
    if (val === Math.max(...win5) || val === Math.min(...win5)) {
      reactionZones.push(val);
    }
  }

  let consecutiveDir = 0;
  const last5 = prices.slice(-6);
  for (let i = last5.length - 1; i > 0; i--) {
    const dir = last5[i]! > last5[i - 1]! ? 1 : -1;
    if (consecutiveDir === 0) consecutiveDir = dir;
    else if (consecutiveDir > 0 && dir > 0) consecutiveDir++;
    else if (consecutiveDir < 0 && dir < 0) consecutiveDir--;
    else break;
  }

  return { recentHigh, recentLow, avgRange, priceReactionZones: reactionZones, consecutiveDir };
}

function detectBreakoutOrFakeout(
  prices: number[],
  resistance: number,
  support: number,
  atr: number,
): { isBreakout: boolean; isFakeout: boolean; direction: 1 | -1 | 0 } {
  const current = prices[prices.length - 1]!;
  const prev3 = prices.slice(-4, -1);
  const prevAvg = prev3.reduce((a, b) => a + b, 0) / prev3.length;

  const breakAbove = current > resistance && prevAvg <= resistance;
  const breakBelow = current < support && prevAvg >= support;

  if (breakAbove) {
    const confirmationCandles = prices.slice(-3).filter(p => p > resistance).length;
    const isFakeout = confirmationCandles < 2 || (current - resistance) < atr * 0.3;
    return { isBreakout: !isFakeout, isFakeout, direction: 1 };
  }
  if (breakBelow) {
    const confirmationCandles = prices.slice(-3).filter(p => p < support).length;
    const isFakeout = confirmationCandles < 2 || (support - current) < atr * 0.3;
    return { isBreakout: !isFakeout, isFakeout, direction: -1 };
  }
  return { isBreakout: false, isFakeout: false, direction: 0 };
}

function buildLogicPoints(scores: SystemScore[], _pattern: PatternResult, isBuy: boolean): LogicPoint[] {
  const points: LogicPoint[] = [];
  for (const s of scores) {
    if (s.vote === 0 || s.confidence < 35) continue;
    const agrees = (s.vote === 1 && isBuy) || (s.vote === -1 && !isBuy);
    if (!agrees) continue;
    const weight: 'strong' | 'medium' | 'weak' = s.confidence >= 75 ? 'strong' : s.confidence >= 55 ? 'medium' : 'weak';
    points.push({ label: s.name, detail: s.reason, weight, bullish: isBuy });
  }
  return points.sort((a, b) => {
    const w = { strong: 3, medium: 2, weak: 1 };
    return w[b.weight] - w[a.weight];
  });
}

function isSignalValid(scores: SystemScore[], isBuy: boolean): { valid: boolean; reasons: string[] } {
  const agreeing = scores.filter(s => (isBuy ? s.vote === 1 : s.vote === -1));
  const opposing = scores.filter(s => (isBuy ? s.vote === -1 : s.vote === 1));
  const highConf = agreeing.filter(s => s.confidence >= 70);
  const reasons: string[] = [];

  if (agreeing.length < 3) {
    reasons.push(`Only ${agreeing.length}/12 systems confirm — minimum 3 required`);
  }
  if (highConf.length < 1) {
    reasons.push(`Only ${highConf.length} high-confidence confirmations — minimum 1 required`);
  }
  if (opposing.length >= 5) {
    reasons.push(`${opposing.length} opposing signals — too many conflicting conditions`);
  }
  const agreeScore = agreeing.reduce((s, x) => s + x.confidence, 0);
  const opposeScore = opposing.reduce((s, x) => s + x.confidence * 0.5, 0);
  const netScore = agreeScore - opposeScore;
  if (netScore < 120) {
    reasons.push(`Net confluence score ${netScore.toFixed(0)} below minimum threshold of 120`);
  }

  return { valid: reasons.length === 0, reasons };
}

function calculateConfidence(scores: SystemScore[], isBuy: boolean, pattern: PatternResult): number {
  const agreeing = scores.filter(s => (isBuy ? s.vote === 1 : s.vote === -1));
  const opposing = scores.filter(s => (isBuy ? s.vote === -1 : s.vote === 1));
  const agreeScore = agreeing.reduce((s, x) => s + x.confidence, 0);
  const opposeScore = opposing.reduce((s, x) => s + x.confidence * 0.45, 0);
  const patternBonus = pattern.detected && ((isBuy && pattern.bullish) || (!isBuy && !pattern.bullish)) ? pattern.reliability * 0.08 : 0;
  const countBonus = Math.min(agreeing.length * 2.5, 15);
  const highConfBonus = agreeing.filter(s => s.confidence >= 75).length * 2;
  const raw = (agreeScore - opposeScore) / 6 + patternBonus + countBonus + highConfBonus + 32;
  return Math.min(Math.max(parseFloat(raw.toFixed(1)), 65), 95);
}

export async function generateSignal(pair: MarketPair): Promise<SignalResult | WeakSignalError> {
  const analysisDelay = 1500 + Math.random() * 1500;
  await new Promise(r => setTimeout(r, analysisDelay));

  const { fast, medium, slow } = generateMultiTimeframe(pair);
  const fastInd = calculateAllIndicators(fast);
  const medInd = calculateAllIndicators(medium);
  const slowInd = calculateAllIndicators(slow);
  const currentPrice = fast[fast.length - 1]!;

  const pattern = detectCandlePattern(fast);
  const history = analyzeHistoricalBehavior(fast);
  const breakoutInfo = detectBreakoutOrFakeout(
    fast,
    fastInd.supportResistance.nearestResistance,
    fastInd.supportResistance.nearestSupport,
    fastInd.atr,
  );

  const trendDir = getTrendDirection(fast, fastInd);
  const emaTrend = fastInd.ema9 > fastInd.ema21 ? 1 : fastInd.ema9 < fastInd.ema21 ? -1 : 0;
  const trendStrength = getTrendStrength(fastInd.adx, fastInd.rsi, emaTrend);
  const volatilityState = getVolatilityState(fastInd.bbWidth, fastInd.atr, currentPrice);
  const marketPhase = getMarketPhase(trendDir, trendStrength, volatilityState, fastInd.rsi);
  const smartMoney = getSmartMoneyBias(fast, fastInd.vwap, fastInd.volumeRatio, fastInd.momentum);

  const marketContext: MarketContext = {
    trendDirection: trendDir,
    trendStrength,
    volatilityState,
    marketPhase,
    volumeContext: fastInd.volumeRatio > 1.5 ? 'INSTITUTIONAL' : fastInd.volumeRatio < 0.7 ? 'THIN' : 'NORMAL',
    smartMoneyBias: smartMoney,
  };

  // Simplified, more balanced scoring system
  const scores: SystemScore[] = [];

  // Trend confirmation
  if (trendDir === 'UPTREND') {
    scores.push({ name: 'Trend Direction', vote: 1, confidence: 75, reason: 'Uptrend detected — bullish structure' });
  } else if (trendDir === 'DOWNTREND') {
    scores.push({ name: 'Trend Direction', vote: -1, confidence: 75, reason: 'Downtrend detected — bearish structure' });
  } else {
    scores.push({ name: 'Trend Direction', vote: 0, confidence: 0, reason: 'Sideways market — no clear trend' });
  }

  // Momentum confirmation
  const rsiMomentum = fastInd.rsi > 55 ? 1 : fastInd.rsi < 45 ? -1 : 0;
  const macdDir = fastInd.macdHistogram > 0 ? 1 : -1;
  const stochMomentum = fastInd.stochK > fastInd.stochD && fastInd.stochK < 75 ? 1 : fastInd.stochK < fastInd.stochD && fastInd.stochK > 25 ? -1 : 0;

  if (Math.abs(rsiMomentum + macdDir + stochMomentum) >= 2) {
    const vote = (rsiMomentum + macdDir + stochMomentum) > 0 ? 1 : -1 as 1 | -1;
    scores.push({ name: 'Momentum', vote, confidence: 72, reason: `Momentum aligned ${vote === 1 ? 'bullish' : 'bearish'}` });
  } else {
    scores.push({ name: 'Momentum', vote: 0, confidence: 0, reason: 'Mixed momentum signals' });
  }

  // Support/Resistance
  const distToSupport = Math.abs(currentPrice - fastInd.supportResistance.nearestSupport);
  const distToResistance = Math.abs(currentPrice - fastInd.supportResistance.nearestResistance);
  const threshold = fastInd.atr * 1.2;

  if (distToSupport < threshold && distToSupport < distToResistance) {
    const proximity = 1 - distToSupport / threshold;
    const conf = Math.round(65 + proximity * 20);
    scores.push({ name: 'Support/Resistance', vote: 1, confidence: conf, reason: `Price near strong support` });
  } else if (distToResistance < threshold && distToResistance < distToSupport) {
    const proximity = 1 - distToResistance / threshold;
    const conf = Math.round(65 + proximity * 20);
    scores.push({ name: 'Support/Resistance', vote: -1, confidence: conf, reason: `Price near strong resistance` });
  } else {
    scores.push({ name: 'Support/Resistance', vote: 0, confidence: 0, reason: 'No nearby support/resistance' });
  }

  // Volume analysis
  if (fastInd.volumeRatio > 1.3 && rsiMomentum === 1) {
    scores.push({ name: 'Volume', vote: 1, confidence: 68, reason: `Above-average volume with bullish momentum` });
  } else if (fastInd.volumeRatio > 1.3 && rsiMomentum === -1) {
    scores.push({ name: 'Volume', vote: -1, confidence: 68, reason: `Above-average volume with bearish momentum` });
  } else {
    scores.push({ name: 'Volume', vote: 0, confidence: 0, reason: 'Volume insufficient or conflicting' });
  }

  // Pattern analysis
  if (pattern.detected && pattern.bullish) {
    scores.push({ name: `Pattern: ${pattern.name}`, vote: 1, confidence: pattern.reliability, reason: pattern.description });
  } else if (pattern.detected && !pattern.bullish) {
    scores.push({ name: `Pattern: ${pattern.name}`, vote: -1, confidence: pattern.reliability, reason: pattern.description });
  } else {
    scores.push({ name: 'Pattern', vote: 0, confidence: 0, reason: 'No significant pattern' });
  }

  // Multi-timeframe confluence
  const fastBull = fastInd.ema9 > fastInd.ema21 && fastInd.rsi > 50;
  const medBull = medInd.ema9 > medInd.ema21 && medInd.rsi > 48;
  const slowBull = slowInd.ema9 > slowInd.ema21 && slowInd.rsi > 48;

  const bullCount = [fastBull, medBull, slowBull].filter(Boolean).length;

  if (bullCount === 3) {
    scores.push({ name: 'Multi-Timeframe', vote: 1, confidence: 90, reason: 'All timeframes aligned bullish' });
  } else if (bullCount === 0) {
    scores.push({ name: 'Multi-Timeframe', vote: -1, confidence: 90, reason: 'All timeframes aligned bearish' });
  } else if (bullCount === 2) {
    scores.push({ name: 'Multi-Timeframe', vote: 1, confidence: 72, reason: '2/3 timeframes bullish' });
  } else if (bullCount === 1) {
    scores.push({ name: 'Multi-Timeframe', vote: -1, confidence: 72, reason: '2/3 timeframes bearish' });
  }

  // Breakout/Fakeout
  if (breakoutInfo.isBreakout) {
    const vote: 1 | -1 = breakoutInfo.direction as 1 | -1;
    scores.push({ name: 'Breakout', vote, confidence: 80, reason: `Confirmed ${vote === 1 ? 'bullish' : 'bearish'} breakout` });
  } else if (breakoutInfo.isFakeout) {
    const counter: 1 | -1 = breakoutInfo.direction === 1 ? -1 : 1;
    scores.push({ name: 'Fakeout', vote: counter, confidence: 75, reason: `Failed breakout — mean reversion opportunity` });
  } else {
    scores.push({ name: 'Breakout', vote: 0, confidence: 0, reason: 'No active breakout' });
  }

  // Historical behavior momentum
  if (Math.abs(history.consecutiveDir) >= 3) {
    const dir = history.consecutiveDir > 0 ? 1 : -1 as 1 | -1;
    scores.push({ name: 'Price Action', vote: dir, confidence: 68, reason: `${Math.abs(history.consecutiveDir)} consecutive ${dir === 1 ? 'up' : 'down'} bars` });
  } else {
    scores.push({ name: 'Price Action', vote: 0, confidence: 0, reason: 'No clear directional momentum' });
  }

  // Volatility context
  if (volatilityState === 'HIGH' && marketPhase === 'BREAKOUT') {
    scores.push({ name: 'Volatility', vote: 1, confidence: 50, reason: 'High volatility breakout opportunity' });
  } else if (volatilityState === 'NORMAL') {
    scores.push({ name: 'Volatility', vote: 0, confidence: 40, reason: 'Normal volatility — optimal conditions' });
  } else {
    scores.push({ name: 'Volatility', vote: 0, confidence: 25, reason: 'Extreme volatility — caution advised' });
  }

  const buyVotes = scores.filter(s => s.vote === 1).reduce((acc, s) => acc + s.confidence, 0);
  const sellVotes = scores.filter(s => s.vote === -1).reduce((acc, s) => acc + s.confidence, 0);
  const patternDir = pattern.detected ? (pattern.bullish ? 1 : -1) : 0;
  const totalBuyWeight = buyVotes + (patternDir === 1 ? pattern.reliability * 0.4 : 0);
  const totalSellWeight = sellVotes + (patternDir === -1 ? pattern.reliability * 0.4 : 0);
  const isBuy = totalBuyWeight >= totalSellWeight;

  const { valid, reasons } = isSignalValid(scores, isBuy);
  if (!valid) {
    return { type: 'WEAK_SIGNAL', message: 'Market conditions unclear', details: reasons };
  }

  const direction: SignalDirection = isBuy ? 'BUY' : 'SELL';
  const confidence = calculateConfidence(scores, isBuy, pattern);
  const logicPoints = buildLogicPoints(scores, pattern, isBuy);
  const rejectedReasons = scores
    .filter(s => (isBuy ? s.vote === -1 : s.vote === 1) && s.confidence >= 45)
    .map(s => s.reason);

  const riskMultiplier = volatilityState === 'HIGH' ? 2.5 : volatilityState === 'LOW' ? 1.6 : 2.0;
  const rrRatio = confidence >= 85 ? 2.2 + Math.random() * 0.6 : 1.8 + Math.random() * 0.5;
  const zoneHalf = fastInd.atr * 0.6;
  const slDist = fastInd.atr * riskMultiplier;
  const tpDist = slDist * rrRatio;

  return {
    direction,
    confidence,
    entryLow: currentPrice - zoneHalf,
    entryHigh: currentPrice + zoneHalf,
    stopLoss: isBuy ? currentPrice - slDist : currentPrice + slDist,
    takeProfit: isBuy ? currentPrice + tpDist : currentPrice - tpDist,
    riskReward: parseFloat(rrRatio.toFixed(2)),
    currentPrice,
    indicators: fastInd,
    candlePattern: pattern,
    systemScores: scores,
    logicPoints,
    rejectedReasons,
    isHighConfidence: confidence >= 85,
    marketContext,
  };
}

export function isWeakSignal(r: SignalResult | WeakSignalError): r is WeakSignalError {
  return (r as WeakSignalError).type === 'WEAK_SIGNAL';
}
