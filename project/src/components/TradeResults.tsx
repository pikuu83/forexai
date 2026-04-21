import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import type { SignalHistoryRow } from '../lib/supabase';

interface TradeResultsProps {
  trades: (SignalHistoryRow & { displayResult?: string })[];
}

export default function TradeResults({ trades }: TradeResultsProps) {
  if (trades.length === 0) return null;

  const closedTrades = trades.filter(t => t.result !== 'PENDING');

  if (closedTrades.length === 0) return null;

  const wins = closedTrades.filter(t => t.result === 'WIN').length;
  const losses = closedTrades.filter(t => t.result === 'LOSS').length;
  const winRate = closedTrades.length > 0 ? Math.round((wins / closedTrades.length) * 100) : 0;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="overline"
        sx={{
          display: 'block',
          mb: 1,
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: 1,
          color: 'text.secondary',
        }}
      >
        Trade Performance
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip
          icon={<CheckCircleIcon />}
          label={`Wins: ${wins}`}
          sx={{
            bgcolor: 'success.dark',
            color: 'success.light',
            fontWeight: 700,
            fontSize: '0.8rem',
          }}
        />
        <Chip
          icon={<CancelIcon />}
          label={`Losses: ${losses}`}
          sx={{
            bgcolor: 'error.dark',
            color: 'error.light',
            fontWeight: 700,
            fontSize: '0.8rem',
          }}
        />
        <Chip
          label={`Win Rate: ${winRate}%`}
          sx={{
            bgcolor: winRate >= 60 ? 'success.dark' : winRate >= 50 ? 'warning.dark' : 'error.dark',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.8rem',
          }}
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
        {closedTrades.slice(0, 4).map((trade, idx) => {
          const isWin = trade.result === 'WIN';
          return (
            <Card
              key={idx}
              sx={{
                background: `linear-gradient(135deg, ${isWin ? 'rgba(0,230,118,0.08)' : 'rgba(255,23,68,0.08)'}, transparent)`,
                border: `1px solid ${isWin ? 'rgba(0,230,118,0.2)' : 'rgba(255,23,68,0.2)'}`,
                p: 1.2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary', fontSize: '0.75rem' }}>
                  {trade.pair}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.3,
                  }}
                >
                  {isWin ? (
                    <>
                      <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
                      <Typography variant="caption" sx={{ color: 'success.light', fontWeight: 700, fontSize: '0.7rem' }}>
                        WIN
                      </Typography>
                    </>
                  ) : (
                    <>
                      <CancelIcon sx={{ fontSize: 14, color: 'error.main' }} />
                      <Typography variant="caption" sx={{ color: 'error.light', fontWeight: 700, fontSize: '0.7rem' }}>
                        LOSS
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
                <Box>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>
                    {trade.direction}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'primary.light', fontWeight: 600, fontSize: '0.75rem' }}>
                    {trade.entry_low.toFixed(2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>
                    R:R
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'warning.light', fontWeight: 600, fontSize: '0.75rem' }}>
                    1:{trade.risk_reward.toFixed(1)}
                  </Typography>
                </Box>
              </Box>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
