import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { keyframes } from '@mui/system';

const pulse = keyframes`
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
`;

const metrics = [
  { label: 'Win Rate', value: '85–95%' },
  { label: 'Avg R:R', value: '1:2.2' },
  { label: 'Indicators', value: '6 Active' },
  { label: 'Signals', value: 'Live AI' },
];

export default function StatusBar() {
  return (
    <Paper
      sx={{
        p: 1.5,
        background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(255,215,0,0.04))',
        border: '1px solid rgba(0,212,255,0.15)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 1 }}>
        {metrics.map((m) => (
          <Box key={m.label} sx={{ textAlign: 'center' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 1 }}
            >
              {m.label}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: 'primary.light', fontWeight: 800, fontSize: '0.8rem' }}>
              {m.value}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5, gap: 1 }}>
        <Chip
          size="small"
          label="AI Powered"
          sx={{
            height: 20,
            fontSize: '0.6rem',
            bgcolor: 'rgba(0,212,255,0.1)',
            color: 'primary.light',
            border: '1px solid rgba(0,212,255,0.2)',
            animation: `${pulse} 3s infinite`,
          }}
        />
        <Chip
          size="small"
          label="Multi-Indicator Analysis"
          sx={{
            height: 20,
            fontSize: '0.6rem',
            bgcolor: 'rgba(255,215,0,0.08)',
            color: 'secondary.light',
            border: '1px solid rgba(255,215,0,0.2)',
          }}
        />
        <Chip
          size="small"
          label="EXNESS Ready"
          sx={{
            height: 20,
            fontSize: '0.6rem',
            bgcolor: 'rgba(0,230,118,0.08)',
            color: 'success.light',
            border: '1px solid rgba(0,230,118,0.2)',
          }}
        />
      </Box>
    </Paper>
  );
}
