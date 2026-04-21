import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import type { SignalHistoryRow } from '../lib/supabase';
import { fetchSignalHistory, updateSignalResult, getSessionId } from '../lib/supabase';

function ResultIcon({ result }: { result: string }) {
  if (result === 'WIN') return <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />;
  if (result === 'LOSS') return <CancelIcon sx={{ fontSize: 16, color: 'error.main' }} />;
  return <HourglassEmptyIcon sx={{ fontSize: 16, color: 'warning.main' }} />;
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function SignalHistory() {
  const [rows, setRows] = useState<SignalHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const session = getSessionId();
    const data = await fetchSignalHistory(session);
    setRows(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleResult = async (id: string, result: 'WIN' | 'LOSS') => {
    await updateSignalResult(id, result);
    setRows(prev => prev.map(r => r.id === id ? { ...r, result } : r));
  };

  const wins = rows.filter(r => r.result === 'WIN').length;
  const losses = rows.filter(r => r.result === 'LOSS').length;
  const total = wins + losses;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  if (loading) return null;
  if (rows.length === 0) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon sx={{ color: 'primary.main', fontSize: 18 }} />
          <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}>
            Signal History
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {total > 0 && (
            <Chip
              label={`Win Rate: ${winRate}%`}
              size="small"
              sx={{ height: 22, fontSize: '0.65rem', fontWeight: 700, bgcolor: winRate >= 60 ? 'rgba(0,230,118,0.12)' : 'rgba(255,23,68,0.12)', color: winRate >= 60 ? 'success.main' : 'error.main', border: `1px solid ${winRate >= 60 ? 'rgba(0,230,118,0.3)' : 'rgba(255,23,68,0.3)'}` }}
            />
          )}
          <Chip label={`${rows.length} signals`} size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: 'rgba(0,212,255,0.08)', color: 'primary.light', border: '1px solid rgba(0,212,255,0.2)' }} />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {rows.slice(0, 10).map(row => (
          <Paper
            key={row.id}
            sx={{
              p: 1.5,
              border: `1px solid ${row.result === 'WIN' ? 'rgba(0,230,118,0.15)' : row.result === 'LOSS' ? 'rgba(255,23,68,0.15)' : 'rgba(255,255,255,0.07)'}`,
              transition: 'all 0.2s ease',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={row.direction}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    bgcolor: row.direction === 'BUY' ? 'rgba(0,230,118,0.15)' : 'rgba(255,23,68,0.15)',
                    color: row.direction === 'BUY' ? 'success.main' : 'error.main',
                    border: `1px solid ${row.direction === 'BUY' ? 'rgba(0,230,118,0.3)' : 'rgba(255,23,68,0.3)'}`,
                  }}
                />
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'secondary.light', fontSize: '0.75rem' }}>
                  {row.pair}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  {row.confidence}% conf.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ResultIcon result={row.result} />
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: row.result === 'WIN' ? 'success.main' : row.result === 'LOSS' ? 'error.main' : 'warning.main', fontWeight: 700 }}>
                  {row.result}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.5, mb: 0.8 }}>
              <Box sx={{ textAlign: 'center', p: 0.5, borderRadius: 1, bgcolor: 'rgba(255,215,0,0.05)' }}>
                <Typography variant="caption" sx={{ display: 'block', fontSize: '0.55rem', color: 'text.secondary' }}>Entry</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'secondary.light', fontWeight: 600 }}>
                  {row.entry_low.toFixed(4)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 0.5, borderRadius: 1, bgcolor: 'rgba(255,23,68,0.05)' }}>
                <Typography variant="caption" sx={{ display: 'block', fontSize: '0.55rem', color: 'text.secondary' }}>SL</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'error.light', fontWeight: 600 }}>
                  {row.stop_loss.toFixed(4)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 0.5, borderRadius: 1, bgcolor: 'rgba(0,230,118,0.05)' }}>
                <Typography variant="caption" sx={{ display: 'block', fontSize: '0.55rem', color: 'text.secondary' }}>TP</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'success.light', fontWeight: 600 }}>
                  {row.take_profit.toFixed(4)}
                </Typography>
              </Box>
            </Box>

            {row.result === 'PENDING' && (
              <>
                <Divider sx={{ my: 0.8, borderColor: 'rgba(255,255,255,0.05)' }} />
                <Box sx={{ display: 'flex', gap: 0.8, justifyContent: 'center' }}>
                  <Tooltip title="Mark as Win">
                    <IconButton
                      size="small"
                      onClick={() => handleResult(row.id, 'WIN')}
                      sx={{ bgcolor: 'rgba(0,230,118,0.1)', color: 'success.main', '&:hover': { bgcolor: 'rgba(0,230,118,0.2)' }, borderRadius: 1.5, width: 28, height: 28 }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Mark as Loss">
                    <IconButton
                      size="small"
                      onClick={() => handleResult(row.id, 'LOSS')}
                      sx={{ bgcolor: 'rgba(255,23,68,0.1)', color: 'error.main', '&:hover': { bgcolor: 'rgba(255,23,68,0.2)' }, borderRadius: 1.5, width: 28, height: 28 }}
                    >
                      <CancelIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.58rem', textAlign: 'right' }}>
              {formatTime(row.created_at)}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
