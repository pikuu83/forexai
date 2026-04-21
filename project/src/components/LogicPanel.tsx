import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { keyframes } from '@mui/system';
import type { LogicPoint } from '../utils/signalEngine';
import type { PatternResult } from '../utils/candlePatterns';

const scanAnim = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

interface Props {
  logicPoints: LogicPoint[];
  rejectedReasons: string[];
  candlePattern: PatternResult;
  isBuy: boolean;
  confidence: number;
}

const weightColor = { strong: '#00e676', medium: '#00d4ff', weak: '#ff9100' };
const weightLabel = { strong: 'STRONG', medium: 'MEDIUM', weak: 'WEAK' };

export default function LogicPanel({ logicPoints, rejectedReasons, candlePattern, isBuy, confidence }: Props) {
  const signalColor = isBuy ? '#00e676' : '#ff1744';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <PsychologyIcon sx={{ color: 'primary.main', fontSize: 20 }} />
        <Typography
          variant="subtitle2"
          sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}
        >
          AI Analysis Logic
        </Typography>
        <Box sx={{ ml: 'auto' }}>
          <Chip
            label={`${confidence}% confidence`}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.7rem',
              fontWeight: 800,
              background: `linear-gradient(90deg, ${signalColor}22, ${signalColor}44)`,
              color: signalColor,
              border: `1px solid ${signalColor}66`,
              backgroundSize: '200% auto',
              animation: `${scanAnim} 3s linear infinite`,
            }}
          />
        </Box>
      </Box>

      <Paper
        sx={{
          p: 2,
          background: `linear-gradient(160deg, #0c1520, ${isBuy ? 'rgba(0,230,118,0.04)' : 'rgba(255,23,68,0.04)'})`,
          border: `1px solid ${isBuy ? 'rgba(0,230,118,0.2)' : 'rgba(255,23,68,0.2)'}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', display: 'block', mb: 1.5, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', fontSize: '0.6rem' }}
        >
          Confirmed Signals ({logicPoints.length})
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {logicPoints.map((point, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                gap: 1.2,
                alignItems: 'flex-start',
                p: 1.2,
                borderRadius: 2,
                bgcolor: `rgba(${isBuy ? '0,230,118' : '255,23,68'},0.05)`,
                border: `1px solid rgba(${isBuy ? '0,230,118' : '255,23,68'},0.1)`,
              }}
            >
              <CheckCircleIcon sx={{ color: weightColor[point.weight], fontSize: 15, mt: 0.1, flexShrink: 0 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3, flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.75rem' }}>
                    {point.label}
                  </Typography>
                  <Chip
                    label={weightLabel[point.weight]}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '0.55rem',
                      fontWeight: 700,
                      bgcolor: `${weightColor[point.weight]}18`,
                      color: weightColor[point.weight],
                      border: `1px solid ${weightColor[point.weight]}44`,
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', lineHeight: 1.4 }}>
                  {point.detail}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {candlePattern.detected && (
          <>
            <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />
            <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'flex-start', p: 1.2, borderRadius: 2, bgcolor: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)' }}>
              <WarningAmberIcon sx={{ color: 'secondary.main', fontSize: 15, mt: 0.1, flexShrink: 0 }} />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'secondary.main', fontSize: '0.75rem' }}>
                    {candlePattern.name}
                  </Typography>
                  <Chip label={`${candlePattern.reliability}% reliable`} size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: 'rgba(255,215,0,0.1)', color: 'secondary.main', border: '1px solid rgba(255,215,0,0.3)' }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', lineHeight: 1.4 }}>
                  {candlePattern.description}
                </Typography>
              </Box>
            </Box>
          </>
        )}

        {rejectedReasons.length > 0 && (
          <>
            <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', fontSize: '0.6rem' }}>
              Opposing Signals Overridden ({rejectedReasons.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
              {rejectedReasons.slice(0, 2).map((r, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <CancelIcon sx={{ color: 'error.main', fontSize: 13, mt: 0.2, flexShrink: 0, opacity: 0.7 }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.63rem', lineHeight: 1.35 }}>
                    {r}
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
