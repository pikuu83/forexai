import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimerIcon from '@mui/icons-material/Timer';
import type { SignalResult } from '../utils/signalEngine';
import type { DurationOption } from '../data/markets';

interface ActiveTradeProps {
  signal: SignalResult | null;
  duration: DurationOption;
  onTradeExpire: (result: 'WIN' | 'LOSS') => void;
}

export default function ActiveTrade({ signal, duration, onTradeExpire }: ActiveTradeProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tradeStartedRef = useRef<number | null>(null);

  useEffect(() => {
    if (!signal) {
      setTimeLeft(0);
      setProgress(0);
      tradeStartedRef.current = null;
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    tradeStartedRef.current = Date.now();
    const durationMs = duration.value * 60 * 1000;

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - (tradeStartedRef.current ?? Date.now());
      const remaining = Math.max(0, durationMs - elapsed);
      const progressPct = ((durationMs - remaining) / durationMs) * 100;

      setTimeLeft(Math.ceil(remaining / 1000));
      setProgress(Math.min(progressPct, 100));

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        const result = signal.direction === 'BUY'
          ? signal.currentPrice > signal.entryLow ? 'WIN' : 'LOSS'
          : signal.currentPrice < signal.entryHigh ? 'WIN' : 'LOSS';
        onTradeExpire(result);
      }
    }, 250);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [signal, duration, onTradeExpire]);

  if (!signal) return null;

  const isBuy = signal.direction === 'BUY';
  const Icon = isBuy ? TrendingUpIcon : TrendingDownIcon;
  const dirColor = isBuy ? 'success' : 'error';
  const minDisplay = Math.floor(timeLeft / 60);
  const secDisplay = timeLeft % 60;

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${isBuy ? 'rgba(0,230,118,0.08)' : 'rgba(255,23,68,0.08)'}, ${isBuy ? 'rgba(0,230,118,0.02)' : 'rgba(255,23,68,0.02)'})`,
        border: `1.5px solid ${isBuy ? 'rgba(0,230,118,0.25)' : 'rgba(255,23,68,0.25)'}`,
        backdropFilter: 'blur(8px)',
        p: 2,
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Icon sx={{ color: dirColor + '.main', fontSize: 20 }} />
            <Typography variant="h6" fontWeight={800} sx={{ color: dirColor + '.light' }}>
              {signal.direction}
            </Typography>
          </Box>
          <Chip
            label={`${signal.confidence}% Confidence`}
            size="small"
            sx={{
              bgcolor: signal.isHighConfidence ? 'success.dark' : 'warning.dark',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
            <TimerIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{
                fontFamily: 'monospace',
                color: timeLeft <= 60 ? 'warning.main' : 'text.primary',
                fontSize: '0.95rem',
              }}
            >
              {String(minDisplay).padStart(2, '0')}:{String(secDisplay).padStart(2, '0')}
            </Typography>
          </Box>
        </Box>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 3,
          borderRadius: 2,
          bgcolor: 'rgba(255,255,255,0.05)',
          mb: 1.5,
          '& .MuiLinearProgress-bar': {
            background: isBuy ? 'linear-gradient(90deg, #00e676, #1dd1a1)' : 'linear-gradient(90deg, #ff5252, #ff1744)',
            borderRadius: 2,
          },
        }}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        <Box sx={{ p: 1, bgcolor: 'rgba(0,212,255,0.06)', borderRadius: 1.5, border: '1px solid rgba(0,212,255,0.15)' }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
            ENTRY
          </Typography>
          <Typography variant="body2" fontWeight={700} sx={{ color: 'primary.light', mt: 0.25 }}>
            {signal.currentPrice.toFixed(signal.currentPrice > 100 ? 2 : 5)}
          </Typography>
        </Box>
        <Box sx={{ p: 1, bgcolor: 'rgba(0,230,118,0.06)', borderRadius: 1.5, border: '1px solid rgba(0,230,118,0.15)' }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
            TAKE PROFIT
          </Typography>
          <Typography variant="body2" fontWeight={700} sx={{ color: 'success.light', mt: 0.25 }}>
            {signal.takeProfit.toFixed(signal.takeProfit > 100 ? 2 : 5)}
          </Typography>
        </Box>
        <Box sx={{ p: 1, bgcolor: 'rgba(255,23,68,0.06)', borderRadius: 1.5, border: '1px solid rgba(255,23,68,0.15)' }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
            STOP LOSS
          </Typography>
          <Typography variant="body2" fontWeight={700} sx={{ color: 'error.light', mt: 0.25 }}>
            {signal.stopLoss.toFixed(signal.stopLoss > 100 ? 2 : 5)}
          </Typography>
        </Box>
        <Box sx={{ p: 1, bgcolor: 'rgba(255,215,0,0.06)', borderRadius: 1.5, border: '1px solid rgba(255,215,0,0.15)' }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
            R:R RATIO
          </Typography>
          <Typography variant="body2" fontWeight={700} sx={{ color: 'warning.light', mt: 0.25 }}>
            1:{signal.riskReward.toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
