import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimerIcon from '@mui/icons-material/Timer';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import type { SignalResult } from '../utils/signalEngine';
import type { MarketPair, DurationOption } from '../data/markets';
import { keyframes } from '@mui/system';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;
const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

function formatPrice(price: number, decimals: number) {
  if (price > 1000) return price.toFixed(2);
  if (price > 100) return price.toFixed(3);
  return price.toFixed(decimals);
}

interface Props {
  signal: SignalResult;
  pair: MarketPair;
  duration: DurationOption;
}

export default function SignalCard({ signal, pair, duration }: Props) {
  const [timeLeft, setTimeLeft] = useState(duration.value * 60);
  const isBuy = signal.direction === 'BUY';
  const signalColor = isBuy ? '#00e676' : '#ff1744';
  const signalRgb = isBuy ? '0,230,118' : '255,23,68';

  useEffect(() => {
    setTimeLeft(duration.value * 60);
    const interval = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(interval); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(interval);
  }, [signal, duration.value]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const progress = (timeLeft / (duration.value * 60)) * 100;

  return (
    <Paper
      sx={{
        p: 0,
        overflow: 'hidden',
        border: `1px solid rgba(${signalRgb},0.3)`,
        background: `linear-gradient(160deg, #0c1520, rgba(${signalRgb},0.06))`,
        animation: `${fadeInUp} 0.5s ease`,
        boxShadow: `0 12px 45px rgba(${signalRgb},0.12)`,
      }}
    >
      <Box
        sx={{
          px: 2, py: 1.5,
          background: `linear-gradient(90deg, rgba(${signalRgb},0.12), rgba(${signalRgb},0.06))`,
          borderBottom: `1px solid rgba(${signalRgb},0.15)`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
          <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.65rem' }}>
            AI Signal Generated
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
          {signal.isHighConfidence && (
            <Chip label="HIGH CONFIDENCE" size="small" sx={{ height: 18, fontSize: '0.55rem', fontWeight: 800, bgcolor: 'rgba(255,215,0,0.15)', color: 'secondary.main', border: '1px solid rgba(255,215,0,0.3)' }} />
          )}
          <Chip label={pair.label} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'rgba(255,255,255,0.06)', color: 'text.secondary' }} />
        </Box>
      </Box>

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            textAlign: 'center', py: 2.5, mb: 2, borderRadius: 3,
            background: `rgba(${signalRgb},0.07)`,
            border: `1px solid rgba(${signalRgb},0.2)`,
            animation: `${pulse} 3s ease-in-out infinite`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            {isBuy ? <TrendingUpIcon sx={{ fontSize: 44, color: 'success.main' }} /> : <TrendingDownIcon sx={{ fontSize: 44, color: 'error.main' }} />}
            <Box>
              <Typography sx={{
                color: signalColor, fontWeight: 900, letterSpacing: 4,
                fontSize: { xs: '2.2rem', sm: '2.8rem' },
                textShadow: `0 0 30px ${signalColor}55`,
                lineHeight: 1,
              }}>
                {signal.direction}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', letterSpacing: 1 }}>
                {pair.category} · {duration.label}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              AI Confidence
            </Typography>
            <Typography variant="subtitle2" sx={{
              background: `linear-gradient(90deg, #00d4ff, #ffd700, #00d4ff)`,
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 900,
              animation: `${shimmer} 3s linear infinite`,
            }}>
              {signal.confidence}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={signal.confidence}
            sx={{
              height: 6, borderRadius: 3, mb: 0.4,
              '& .MuiLinearProgress-bar': {
                background: signal.confidence >= 90
                  ? 'linear-gradient(90deg, #00e676, #00d4ff)'
                  : signal.confidence >= 80
                  ? 'linear-gradient(90deg, #00d4ff, #ffd700)'
                  : 'linear-gradient(90deg, #ff9100, #ffd700)',
                borderRadius: 3,
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
            Based on {signal.systemScores.filter(s => (signal.direction === 'BUY' ? s.vote === 1 : s.vote === -1)).length}/12 expert analysis systems confirming
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mb: 2 }}>
          <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: 0.8 }}>Entry Zone</Typography>
            <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700, fontSize: '0.68rem', display: 'block' }}>
              {formatPrice(signal.entryLow, pair.decimals)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
              — {formatPrice(signal.entryHigh, pair.decimals)}
            </Typography>
          </Box>
          <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'rgba(255,23,68,0.06)', border: '1px solid rgba(255,23,68,0.2)', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: 0.8 }}>Stop Loss</Typography>
            <Typography sx={{ color: 'error.main', fontWeight: 800, fontSize: '0.8rem' }}>
              {formatPrice(signal.stopLoss, pair.decimals)}
            </Typography>
          </Box>
          <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.2)', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: 0.8 }}>Take Profit</Typography>
            <Typography sx={{ color: 'success.main', fontWeight: 800, fontSize: '0.8rem' }}>
              {formatPrice(signal.takeProfit, pair.decimals)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7, mb: 2 }}>
          {[
            { label: signal.marketContext.trendDirection, color: signal.marketContext.trendDirection === 'UPTREND' ? '#00e676' : signal.marketContext.trendDirection === 'DOWNTREND' ? '#ff1744' : '#ff9100' },
            { label: signal.marketContext.trendStrength, color: signal.marketContext.trendStrength === 'STRONG' ? '#00e676' : signal.marketContext.trendStrength === 'MODERATE' ? '#00d4ff' : '#ff9100' },
            { label: signal.marketContext.marketPhase, color: '#00d4ff' },
            { label: signal.marketContext.volatilityState + ' VOL', color: signal.marketContext.volatilityState === 'HIGH' ? '#ff1744' : signal.marketContext.volatilityState === 'LOW' ? '#ff9100' : '#888' },
            { label: signal.marketContext.smartMoneyBias, color: signal.marketContext.smartMoneyBias === 'ACCUMULATION' ? '#00e676' : signal.marketContext.smartMoneyBias === 'DISTRIBUTION' ? '#ff1744' : '#555' },
          ].map((item, i) => (
            <Chip
              key={i}
              icon={<ShowChartIcon sx={{ fontSize: '10px !important', color: `${item.color} !important` }} />}
              label={item.label}
              size="small"
              sx={{ height: 20, fontSize: '0.56rem', fontWeight: 700, bgcolor: `${item.color}14`, color: item.color, border: `1px solid ${item.color}33`, '& .MuiChip-icon': { ml: '4px' } }}
            />
          ))}
        </Box>

        <Divider sx={{ mb: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.8 }}>
            <Chip label={`R:R  1 : ${signal.riskReward}`} size="small" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(0,212,255,0.1)', color: 'primary.light', border: '1px solid rgba(0,212,255,0.25)' }} />
            {signal.candlePattern.detected && (
              <Chip label={signal.candlePattern.name} size="small" sx={{ height: 22, fontSize: '0.6rem', bgcolor: 'rgba(255,215,0,0.08)', color: 'secondary.light', border: '1px solid rgba(255,215,0,0.2)' }} />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TimerIcon sx={{ fontSize: 14, color: timeLeft < 60 ? 'error.main' : 'text.secondary' }} />
            <Typography variant="subtitle2" sx={{ color: timeLeft < 60 ? 'error.main' : timeLeft < 120 ? 'warning.main' : 'text.secondary', fontWeight: 800, fontFamily: 'monospace', fontSize: '0.9rem' }}>
              {mins}:{secs}
            </Typography>
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 3, borderRadius: 2,
            '& .MuiLinearProgress-bar': {
              bgcolor: progress > 50 ? signalColor : progress > 25 ? '#ff9100' : '#ff1744',
              transition: 'background-color 0.5s ease',
            },
          }}
        />

        <Box sx={{ mt: 1.5, p: 1, borderRadius: 2, bgcolor: 'rgba(255,145,0,0.06)', border: '1px solid rgba(255,145,0,0.15)' }}>
          <Typography variant="caption" sx={{ color: 'warning.light', fontSize: '0.6rem', fontWeight: 600, display: 'block', lineHeight: 1.5 }}>
            Risk Warning: Trading involves substantial risk. This AI analysis is for educational purposes only. Always use proper risk management. Never risk more than 1–2% per trade.
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
