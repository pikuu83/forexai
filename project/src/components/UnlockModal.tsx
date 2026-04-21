import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import TimerIcon from '@mui/icons-material/Timer';
import { keyframes } from '@mui/system';

const ACCESS_CODE = 'Rubayet 112010';
const MAX_ATTEMPTS = 3;
const LOCK_DURATION_MS = 5 * 60 * 1000;

const STORAGE_ATTEMPTS = 'unlock_attempts';
const STORAGE_LOCK_UNTIL = 'unlock_lock_until';

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
`;
const lockPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(255,23,68,0.3), 0 0 40px rgba(255,23,68,0.15); }
  50% { box-shadow: 0 0 35px rgba(255,23,68,0.5), 0 0 60px rgba(255,23,68,0.25); }
`;
const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 30px rgba(0,212,255,0.2); }
  50% { box-shadow: 0 0 50px rgba(0,212,255,0.4); }
`;

function getLockState(): { attempts: number; lockUntil: number } {
  const attempts = parseInt(sessionStorage.getItem(STORAGE_ATTEMPTS) ?? '0', 10);
  const lockUntil = parseInt(sessionStorage.getItem(STORAGE_LOCK_UNTIL) ?? '0', 10);
  return { attempts, lockUntil };
}

function setLockState(attempts: number, lockUntil: number) {
  sessionStorage.setItem(STORAGE_ATTEMPTS, String(attempts));
  sessionStorage.setItem(STORAGE_LOCK_UNTIL, String(lockUntil));
}

function clearLockState() {
  sessionStorage.removeItem(STORAGE_ATTEMPTS);
  sessionStorage.removeItem(STORAGE_LOCK_UNTIL);
}

interface Props {
  open: boolean;
  onUnlock: () => void;
}

export default function UnlockModal({ open, onUnlock }: Props) {
  const [code, setCode] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const { attempts: a, lockUntil: lu } = getLockState();
    setAttempts(a);
    setLockUntil(lu);
    if (lu > Date.now()) {
      setTimeLeft(Math.ceil((lu - Date.now()) / 1000));
    }
  }, [open]);

  useEffect(() => {
    if (lockUntil > Date.now()) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        const remaining = lockUntil - Date.now();
        if (remaining <= 0) {
          setTimeLeft(0);
          setLockUntil(0);
          setAttempts(0);
          setLockState(0, 0);
          if (timerRef.current) clearInterval(timerRef.current);
        } else {
          setTimeLeft(Math.ceil(remaining / 1000));
        }
      }, 250);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lockUntil]);

  const isLocked = timeLeft > 0;
  const remainingAttempts = MAX_ATTEMPTS - attempts;
  const lockProgress = isLocked ? (timeLeft / (LOCK_DURATION_MS / 1000)) * 100 : 0;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleUnlock = () => {
    if (isLocked) return;

    if (code.trim() === ACCESS_CODE) {
      clearLockState();
      setAttempts(0);
      setLockUntil(0);
      setErrorMsg('');
      onUnlock();
    } else {
      const newAttempts = attempts + 1;
      setShaking(true);
      setTimeout(() => setShaking(false), 600);

      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCK_DURATION_MS;
        setAttempts(newAttempts);
        setLockUntil(until);
        setTimeLeft(Math.ceil(LOCK_DURATION_MS / 1000));
        setLockState(newAttempts, until);
        setErrorMsg('Too many failed attempts. Locked for 5 minutes.');
        setCode('');
      } else {
        setAttempts(newAttempts);
        setLockState(newAttempts, 0);
        setErrorMsg(`Wrong password (attempt ${newAttempts}/${MAX_ATTEMPTS})`);
      }
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleUnlock();
  };

  return (
    <Dialog open={open} maxWidth="xs" fullWidth disableEscapeKeyDown>
      <DialogContent
        sx={{
          p: 0,
          background: 'linear-gradient(160deg, #070e18, #0a1520, #0c1a28)',
          textAlign: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: isLocked
              ? 'radial-gradient(circle, rgba(255,23,68,0.08) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ p: 4, pb: 3, position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: isLocked ? 'rgba(255,23,68,0.1)' : 'rgba(0,212,255,0.1)',
              border: `2px solid ${isLocked ? 'rgba(255,23,68,0.4)' : 'rgba(0,212,255,0.4)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
              animation: isLocked ? `${lockPulse} 2s ease-in-out infinite` : `${glowPulse} 3s ease-in-out infinite`,
              transition: 'all 0.4s ease',
            }}
          >
            {isLocked
              ? <LockIcon sx={{ fontSize: 32, color: 'error.main' }} />
              : <LockOpenIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            }
          </Box>

          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              background: isLocked
                ? 'linear-gradient(90deg, #ff1744, #ff6b6b, #ff1744)'
                : 'linear-gradient(90deg, #00d4ff, #ffd700, #00d4ff)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: `${shimmer} 3s linear infinite`,
              mb: 0.8,
            }}
          >
            {isLocked ? 'Access Locked' : 'Premium Access'}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: '0.82rem' }}>
            {isLocked
              ? 'Too many failed attempts detected'
              : 'Enter your activation code to unlock AI signals'
            }
          </Typography>

          {isLocked ? (
            <Box
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: 'rgba(255,23,68,0.06)',
                border: '1px solid rgba(255,23,68,0.2)',
                mb: 2.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1.5 }}>
                <TimerIcon sx={{ fontSize: 18, color: 'error.main' }} />
                <Typography variant="caption" color="error.light" fontWeight={700} sx={{ fontSize: '0.7rem', letterSpacing: 1 }}>
                  LOCKED — TRY AGAIN IN
                </Typography>
              </Box>
              <Typography
                variant="h3"
                fontWeight={900}
                sx={{
                  color: 'error.light',
                  fontFamily: 'monospace',
                  letterSpacing: 4,
                  lineHeight: 1,
                  mb: 1.5,
                  textShadow: '0 0 20px rgba(255,23,68,0.4)',
                }}
              >
                {formatTime(timeLeft)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={lockProgress}
                sx={{
                  height: 5,
                  borderRadius: 3,
                  bgcolor: 'rgba(255,23,68,0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'error.main',
                    borderRadius: 3,
                  },
                }}
              />
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1, fontSize: '0.6rem' }}>
                Security lockout after 3 failed attempts
              </Typography>
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  animation: shaking ? `${shake} 0.5s ease` : 'none',
                  mb: errorMsg ? 1.5 : 2,
                }}
              >
                <TextField
                  fullWidth
                  type="password"
                  placeholder="Enter access code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (errorMsg && attempts < MAX_ATTEMPTS) setErrorMsg('');
                  }}
                  onKeyUp={handleKeyUp}
                  disabled={isLocked}
                  error={!!errorMsg}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(0,0,0,0.35)',
                      '& fieldset': { borderColor: errorMsg ? 'error.main' : 'rgba(0,212,255,0.25)' },
                      '&:hover fieldset': { borderColor: errorMsg ? 'error.main' : 'primary.main' },
                      '&.Mui-focused fieldset': { borderColor: errorMsg ? 'error.main' : 'primary.main' },
                    },
                  }}
                />
              </Box>

              {errorMsg && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    bgcolor: 'rgba(255,23,68,0.08)',
                    border: '1px solid rgba(255,23,68,0.25)',
                    color: 'error.light',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    '& .MuiAlert-icon': { color: 'error.main' },
                  }}
                >
                  {errorMsg}
                </Alert>
              )}

              {attempts > 0 && attempts < MAX_ATTEMPTS && (
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.7, mb: 2 }}>
                  {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: i < attempts ? 'error.main' : 'rgba(255,255,255,0.1)',
                        border: `1px solid ${i < attempts ? 'rgba(255,23,68,0.6)' : 'rgba(255,255,255,0.15)'}`,
                        transition: 'all 0.3s ease',
                        boxShadow: i < attempts ? '0 0 8px rgba(255,23,68,0.5)' : 'none',
                      }}
                    />
                  ))}
                </Box>
              )}

              <Button
                fullWidth
                size="large"
                onClick={handleUnlock}
                disabled={isLocked || !code.trim()}
                sx={{
                  background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '1rem',
                  py: 1.5,
                  boxShadow: '0 8px 25px rgba(0,212,255,0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #66e8ff, #00d4ff)',
                    boxShadow: '0 12px 35px rgba(0,212,255,0.5)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: 'rgba(255,255,255,0.05)',
                    color: 'text.disabled',
                    boxShadow: 'none',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Unlock Signals
              </Button>

              {remainingAttempts < MAX_ATTEMPTS && remainingAttempts > 0 && (
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1.5, fontSize: '0.6rem' }}>
                  {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining before 5-minute lockout
                </Typography>
              )}
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
