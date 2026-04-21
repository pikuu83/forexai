import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { keyframes } from '@mui/system';

const pulseAnim = keyframes`
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
`;

const glowAnim = keyframes`
  0%, 100% { text-shadow: 0 0 20px rgba(0, 212, 255, 0.4); }
  50% { text-shadow: 0 0 40px rgba(0, 212, 255, 0.8), 0 0 60px rgba(0, 180, 255, 0.3); }
`;

export default function Header() {
  return (
    <Box sx={{ textAlign: 'center', pt: 1, pb: 0.5 }}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          mb: 0.5,
        }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: 'success.main',
            boxShadow: '0 0 10px #00e676, 0 0 20px #00e676',
            animation: `${pulseAnim} 2s infinite`,
          }}
        />
        <Typography
          variant="caption"
          sx={{ color: 'success.main', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}
        >
          Live AI Analysis
        </Typography>
      </Box>

      <Typography
        variant="h4"
        sx={{
          background: 'linear-gradient(90deg, #00d4ff 0%, #00a8e8 40%, #ffd700 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: { xs: '1.6rem', sm: '2rem' },
          animation: `${glowAnim} 3s ease-in-out infinite`,
          mb: 0.5,
        }}
      >
        Forex AI Signal Pro
      </Typography>

      <Typography
        variant="subtitle2"
        sx={{
          color: 'secondary.main',
          letterSpacing: 1,
          mb: 1.5,
          fontWeight: 700,
        }}
      >
        Piku Trader — Powered by Multi-Indicator AI
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
        {['RSI', 'MACD', 'Bollinger', 'Stochastic', 'EMA'].map((ind) => (
          <Chip
            key={ind}
            label={ind}
            size="small"
            sx={{
              bgcolor: 'rgba(0, 212, 255, 0.08)',
              color: 'primary.light',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              fontSize: '0.65rem',
              height: 22,
              animation: `${pulseAnim} ${2 + Math.random()}s infinite`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
