import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import type { IndicatorResult } from '../utils/indicators';

interface IndicatorCardProps {
  name: string;
  value: string;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  progress: number;
  description: string;
}

function IndicatorCard({ name, value, signal, progress, description }: IndicatorCardProps) {
  const signalColor = signal === 'BUY' ? 'success.main' : signal === 'SELL' ? 'error.main' : 'warning.main';
  const progressColor = signal === 'BUY' ? '#00e676' : signal === 'SELL' ? '#ff1744' : '#ff9100';
  const icon = signal === 'BUY'
    ? <TrendingUpIcon sx={{ fontSize: 13, color: 'success.main' }} />
    : signal === 'SELL'
    ? <TrendingDownIcon sx={{ fontSize: 13, color: 'error.main' }} />
    : <RemoveIcon sx={{ fontSize: 13, color: 'warning.main' }} />;

  return (
    <Paper
      sx={{
        p: 1.5,
        border: `1px solid ${signal === 'BUY' ? 'rgba(0,230,118,0.15)' : signal === 'SELL' ? 'rgba(255,23,68,0.15)' : 'rgba(255,145,0,0.12)'}`,
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: `0 6px 16px ${signal === 'BUY' ? 'rgba(0,230,118,0.1)' : signal === 'SELL' ? 'rgba(255,23,68,0.1)' : 'rgba(255,145,0,0.08)'}`,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.6 }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', fontSize: '0.58rem', display: 'block' }}>
            {name}
          </Typography>
          <Typography sx={{ color: signalColor, fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.2 }}>
            {value}
          </Typography>
        </Box>
        <Chip
          icon={icon}
          label={signal}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.58rem',
            fontWeight: 800,
            '& .MuiChip-icon': { ml: '4px' },
            bgcolor: signal === 'BUY' ? 'rgba(0,230,118,0.12)' : signal === 'SELL' ? 'rgba(255,23,68,0.12)' : 'rgba(255,145,0,0.1)',
            color: signalColor,
            border: `1px solid ${progressColor}44`,
          }}
        />
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(Math.max(progress, 0), 100)}
        sx={{
          height: 3, borderRadius: 2, mb: 0.4,
          '& .MuiLinearProgress-bar': { bgcolor: progressColor, borderRadius: 2 },
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.58rem', lineHeight: 1.3 }}>
        {description}
      </Typography>
    </Paper>
  );
}

function sig(cond: boolean | number): 'BUY' | 'SELL' | 'NEUTRAL' {
  if (cond === true || cond === 1) return 'BUY';
  if (cond === false || cond === -1) return 'SELL';
  return 'NEUTRAL';
}

interface Props {
  indicators: IndicatorResult;
  currentPrice: number;
}

export default function IndicatorPanel({ indicators, currentPrice }: Props) {
  const bbRange = indicators.bbUpper - indicators.bbLower;
  const bbPos = bbRange > 0 ? ((currentPrice - indicators.bbLower) / bbRange) * 100 : 50;
  const rsiSig: 'BUY' | 'SELL' | 'NEUTRAL' = indicators.rsi < 35 ? 'BUY' : indicators.rsi > 65 ? 'SELL' : 'NEUTRAL';
  const macdSig: 'BUY' | 'SELL' | 'NEUTRAL' = indicators.macdHistogram > 0 ? 'BUY' : indicators.macdHistogram < 0 ? 'SELL' : 'NEUTRAL';
  const emaSig: 'BUY' | 'SELL' | 'NEUTRAL' = indicators.ema9 > indicators.ema21 && indicators.ema21 > indicators.ema50 ? 'BUY'
    : indicators.ema9 < indicators.ema21 && indicators.ema21 < indicators.ema50 ? 'SELL' : 'NEUTRAL';
  const bbSig: 'BUY' | 'SELL' | 'NEUTRAL' = bbPos < 15 ? 'BUY' : bbPos > 85 ? 'SELL' : 'NEUTRAL';
  const stochSig: 'BUY' | 'SELL' | 'NEUTRAL' = indicators.stochK < 25 ? 'BUY' : indicators.stochK > 75 ? 'SELL' : 'NEUTRAL';
  const momentumSig: 'BUY' | 'SELL' | 'NEUTRAL' = indicators.momentum > 0 ? 'BUY' : indicators.momentum < 0 ? 'SELL' : 'NEUTRAL';
  const vwapSig: 'BUY' | 'SELL' | 'NEUTRAL' = currentPrice < indicators.vwap * 0.999 ? 'BUY' : currentPrice > indicators.vwap * 1.001 ? 'SELL' : 'NEUTRAL';
  const adxSig: 'BUY' | 'SELL' | 'NEUTRAL' = indicators.adx > 35 ? (indicators.momentum > 0 ? 'BUY' : 'SELL') : 'NEUTRAL';
  const srSig: 'BUY' | 'SELL' | 'NEUTRAL' = Math.abs(currentPrice - indicators.supportResistance.nearestSupport) / currentPrice < 0.005 ? 'BUY'
    : Math.abs(currentPrice - indicators.supportResistance.nearestResistance) / currentPrice < 0.005 ? 'SELL' : 'NEUTRAL';
  const fibSig: 'BUY' | 'SELL' | 'NEUTRAL' = indicators.fibLevels.distancePct < 8 ? (currentPrice <= indicators.fibLevels.nearestLevel * 1.001 ? 'BUY' : 'SELL') : 'NEUTRAL';
  const volSig: 'BUY' | 'SELL' | 'NEUTRAL' = indicators.volumeRatio > 1.3 && indicators.momentum > 0 ? 'BUY'
    : indicators.volumeRatio > 1.3 && indicators.momentum < 0 ? 'SELL' : 'NEUTRAL';

  const bullSignals = [rsiSig, macdSig, emaSig, bbSig, stochSig, momentumSig, vwapSig, adxSig, srSig, fibSig, volSig].filter(s => s === 'BUY').length;
  const bearSignals = [rsiSig, macdSig, emaSig, bbSig, stochSig, momentumSig, vwapSig, adxSig, srSig, fibSig, volSig].filter(s => s === 'SELL').length;
  const overallBias: 'BUY' | 'SELL' | 'NEUTRAL' = bullSignals > bearSignals + 2 ? 'BUY' : bearSignals > bullSignals + 2 ? 'SELL' : 'NEUTRAL';
  const biasColor = overallBias === 'BUY' ? '#00e676' : overallBias === 'SELL' ? '#ff1744' : '#ff9100';

  const smaDiff = indicators.sma20 > 0 ? Math.abs((currentPrice - indicators.sma20) / indicators.sma20) * 100 : 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}>
          Technical Indicators
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.8 }}>
          <Chip
            label={`${bullSignals}↑ ${bearSignals}↓`}
            size="small"
            sx={{ height: 22, fontSize: '0.6rem', fontWeight: 700, bgcolor: `rgba(${overallBias === 'BUY' ? '0,230,118' : overallBias === 'SELL' ? '255,23,68' : '255,145,0'},0.1)`, color: biasColor, border: `1px solid ${biasColor}44` }}
          />
          <Chip
            label={`ADX: ${indicators.adx.toFixed(0)}`}
            size="small"
            sx={{ height: 22, fontSize: '0.6rem', bgcolor: 'rgba(0,212,255,0.08)', color: 'primary.light', border: '1px solid rgba(0,212,255,0.2)' }}
          />
        </Box>
      </Box>

      <Grid container spacing={1}>
        <Grid size={6}>
          <IndicatorCard
            name="RSI (14)"
            value={indicators.rsi.toFixed(1)}
            signal={rsiSig}
            progress={indicators.rsi}
            description={indicators.rsi < 30 ? 'Deeply oversold — reversal zone' : indicators.rsi < 35 ? 'Oversold — buying pressure' : indicators.rsi > 70 ? 'Deeply overbought — pullback risk' : indicators.rsi > 65 ? 'Overbought — selling pressure' : 'Neutral momentum zone'}
          />
        </Grid>
        <Grid size={6}>
          <IndicatorCard
            name="MACD Histogram"
            value={indicators.macdHistogram > 0 ? `+${indicators.macdHistogram.toFixed(5)}` : indicators.macdHistogram.toFixed(5)}
            signal={macdSig}
            progress={Math.min(Math.abs(indicators.macdHistogram) * 15000 + 40, 100)}
            description={indicators.macdHistogram > 0 ? 'Histogram positive — bullish momentum' : 'Histogram negative — bearish momentum'}
          />
        </Grid>
        <Grid size={6}>
          <IndicatorCard
            name="EMA 9/21/50"
            value={emaSig === 'BUY' ? 'Bullish Stack' : emaSig === 'SELL' ? 'Bearish Stack' : 'Mixed'}
            signal={emaSig}
            progress={emaSig === 'BUY' ? 80 : emaSig === 'SELL' ? 20 : 50}
            description={`EMA9: ${indicators.ema9.toFixed(4)} | EMA21: ${indicators.ema21.toFixed(4)}`}
          />
        </Grid>
        <Grid size={6}>
          <IndicatorCard
            name="Bollinger Bands"
            value={`${bbPos.toFixed(0)}% position`}
            signal={bbSig}
            progress={bbPos}
            description={bbPos < 15 ? 'Near lower band — support zone' : bbPos > 85 ? 'Near upper band — resistance' : `Width: ${(indicators.bbWidth * 100).toFixed(2)}%`}
          />
        </Grid>
        <Grid size={6}>
          <IndicatorCard
            name="Stochastic K/D"
            value={`K:${indicators.stochK.toFixed(0)}  D:${indicators.stochD.toFixed(0)}`}
            signal={stochSig}
            progress={indicators.stochK}
            description={indicators.stochK < 25 ? 'Oversold territory' : indicators.stochK > 75 ? 'Overbought territory' : 'Neutral range'}
          />
        </Grid>
        <Grid size={6}>
          <IndicatorCard
            name="VWAP"
            value={indicators.vwap.toFixed(4)}
            signal={vwapSig}
            progress={vwapSig === 'BUY' ? 25 : vwapSig === 'SELL' ? 75 : 50}
            description={currentPrice < indicators.vwap ? `${((indicators.vwap - currentPrice) / indicators.vwap * 100).toFixed(2)}% below VWAP` : `${((currentPrice - indicators.vwap) / indicators.vwap * 100).toFixed(2)}% above VWAP`}
          />
        </Grid>
        <Grid size={6}>
          <IndicatorCard
            name="SMA 20/50"
            value={currentPrice > indicators.sma20 ? 'Above SMA20' : 'Below SMA20'}
            signal={sig(currentPrice > indicators.sma20)}
            progress={Math.min(50 + (currentPrice > indicators.sma20 ? 1 : -1) * smaDiff * 10, 100)}
            description={`SMA20: ${indicators.sma20.toFixed(4)} | SMA50: ${indicators.sma50.toFixed(4)}`}
          />
        </Grid>
        <Grid size={6}>
          <IndicatorCard
            name="ATR / Momentum"
            value={`${indicators.momentum > 0 ? '+' : ''}${indicators.momentum.toFixed(3)}%`}
            signal={momentumSig}
            progress={Math.min(50 + indicators.momentum * 5, 100)}
            description={`ATR: ${indicators.atr.toFixed(5)} | Volatility measure`}
          />
        </Grid>
        <Grid size={6}>
          <IndicatorCard
            name="Fibonacci"
            value={indicators.fibLevels.nearestLevelName}
            signal={fibSig}
            progress={Math.max(100 - indicators.fibLevels.distancePct * 5, 10)}
            description={`Level: ${indicators.fibLevels.nearestLevel.toFixed(4)} | ${indicators.fibLevels.distancePct.toFixed(1)}% away`}
          />
        </Grid>
        <Grid size={6}>
          <IndicatorCard
            name="Support / Resist."
            value={srSig === 'BUY' ? 'Near Support' : srSig === 'SELL' ? 'Near Resist.' : 'Open Zone'}
            signal={srSig}
            progress={srSig === 'BUY' ? 20 : srSig === 'SELL' ? 80 : 50}
            description={`S: ${indicators.supportResistance.nearestSupport.toFixed(4)} | R: ${indicators.supportResistance.nearestResistance.toFixed(4)}`}
          />
        </Grid>
        <Grid size={6}>
          <IndicatorCard
            name="ADX (Trend)"
            value={`${indicators.adx.toFixed(0)}`}
            signal={adxSig}
            progress={Math.min(indicators.adx, 100)}
            description={indicators.adx > 50 ? 'Very strong trend' : indicators.adx > 35 ? 'Strong directional trend' : indicators.adx > 20 ? 'Moderate trend' : 'Weak / ranging market'}
          />
        </Grid>
        <Grid size={6}>
          <IndicatorCard
            name="Volume Ratio"
            value={`${indicators.volumeRatio.toFixed(2)}x`}
            signal={volSig}
            progress={Math.min(indicators.volumeRatio * 50, 100)}
            description={indicators.volumeRatio > 1.5 ? 'High institutional volume' : indicators.volumeRatio > 1.2 ? 'Above average volume' : 'Normal volume activity'}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />

      <Box sx={{ p: 1, borderRadius: 2, bgcolor: `rgba(${overallBias === 'BUY' ? '0,230,118' : overallBias === 'SELL' ? '255,23,68' : '255,145,0'},0.05)`, border: `1px solid rgba(${overallBias === 'BUY' ? '0,230,118' : overallBias === 'SELL' ? '255,23,68' : '255,145,0'},0.15)` }}>
        <Typography variant="caption" sx={{ color: biasColor, fontSize: '0.65rem', fontWeight: 700 }}>
          Overall Bias: {overallBias} — {bullSignals} bullish signals, {bearSignals} bearish, {11 - bullSignals - bearSignals} neutral
        </Typography>
      </Box>
    </Box>
  );
}
