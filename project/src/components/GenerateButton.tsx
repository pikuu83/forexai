import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import BoltIcon from '@mui/icons-material/Bolt';
import { keyframes } from '@mui/system';

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 8px 30px rgba(0,212,255,0.35), 0 0 20px rgba(0,212,255,0.2); }
  50% { box-shadow: 0 12px 45px rgba(0,212,255,0.55), 0 0 40px rgba(0,212,255,0.3); }
`;

const slideShimmer = keyframes`
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(300%) skewX(-15deg); }
`;

interface Props {
  loading: boolean;
  onClick: () => void;
}

export default function GenerateButton({ loading, onClick }: Props) {
  return (
    <Button
      fullWidth
      size="large"
      onClick={onClick}
      disabled={loading}
      sx={{
        py: 2,
        fontSize: '1.05rem',
        fontWeight: 900,
        letterSpacing: 2,
        position: 'relative',
        overflow: 'hidden',
        background: loading
          ? 'rgba(0,212,255,0.1)'
          : 'linear-gradient(135deg, #00d4ff 0%, #0099cc 50%, #006688 100%)',
        color: loading ? 'text.secondary' : '#000',
        border: loading ? '1px solid rgba(0,212,255,0.2)' : 'none',
        animation: loading ? 'none' : `${glowPulse} 2s ease-in-out infinite`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '40%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          animation: loading ? 'none' : `${slideShimmer} 2.5s ease-in-out infinite`,
        },
        '&:hover': {
          background: 'linear-gradient(135deg, #66e8ff 0%, #00d4ff 50%, #0099cc 100%)',
          transform: 'translateY(-2px)',
        },
        '&:active': { transform: 'scale(0.98)' },
        '&.Mui-disabled': {
          color: 'rgba(0,212,255,0.4)',
          background: 'rgba(0,212,255,0.05)',
        },
        transition: 'background 0.3s ease, transform 0.2s ease',
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CircularProgress size={20} sx={{ color: 'primary.main' }} />
          Analyzing Market Data...
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BoltIcon sx={{ fontSize: 22 }} />
          GENERATE AI SIGNAL
        </Box>
      )}
    </Button>
  );
}
