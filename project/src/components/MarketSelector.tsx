import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Radio from '@mui/material/Radio';
import Chip from '@mui/material/Chip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { MarketPair, DurationOption } from '../data/markets';
import { MARKET_PAIRS, DURATION_OPTIONS, MARKET_CATEGORIES } from '../data/markets';

interface Props {
  selectedPair: MarketPair;
  selectedDuration: DurationOption;
  onPairChange: (pair: MarketPair) => void;
  onDurationChange: (dur: DurationOption) => void;
}

export default function MarketSelector({ selectedPair, selectedDuration, onPairChange, onDurationChange }: Props) {
  const [pairOpen, setPairOpen] = useState(false);
  const [durOpen, setDurOpen] = useState(false);

  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        <Paper
          onClick={() => setPairOpen(true)}
          sx={{
            p: 2,
            cursor: 'pointer',
            border: '1px solid rgba(0,212,255,0.15)',
            transition: 'all 0.3s ease',
            '&:hover': {
              border: '1px solid rgba(0,212,255,0.5)',
              boxShadow: '0 0 20px rgba(0,212,255,0.15)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
            Market Pair
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="subtitle1" sx={{ color: 'secondary.main', fontWeight: 800 }}>
              {selectedPair.label}
            </Typography>
            <ExpandMoreIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
          </Box>
          <Chip
            label={selectedPair.category}
            size="small"
            sx={{
              mt: 0.5,
              height: 18,
              fontSize: '0.6rem',
              bgcolor: 'rgba(0,212,255,0.1)',
              color: 'primary.light',
              border: '1px solid rgba(0,212,255,0.2)',
            }}
          />
        </Paper>

        <Paper
          onClick={() => setDurOpen(true)}
          sx={{
            p: 2,
            cursor: 'pointer',
            border: '1px solid rgba(0,212,255,0.15)',
            transition: 'all 0.3s ease',
            '&:hover': {
              border: '1px solid rgba(0,212,255,0.5)',
              boxShadow: '0 0 20px rgba(0,212,255,0.15)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
            Duration
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon sx={{ color: 'primary.main', fontSize: 16 }} />
              <Typography variant="subtitle1" sx={{ color: 'secondary.main', fontWeight: 800 }}>
                {selectedDuration.label}
              </Typography>
            </Box>
            <ExpandMoreIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
          </Box>
          <Chip
            label="Signal Expiry"
            size="small"
            sx={{
              mt: 0.5,
              height: 18,
              fontSize: '0.6rem',
              bgcolor: 'rgba(255,215,0,0.08)',
              color: 'secondary.light',
              border: '1px solid rgba(255,215,0,0.2)',
            }}
          />
        </Paper>
      </Box>

      <Dialog open={pairOpen} onClose={() => setPairOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#0c1520', color: 'secondary.main', borderBottom: '1px solid rgba(255,255,255,0.07)', pb: 1.5 }}>
          Select Market Pair
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#0c1520', p: 0 }}>
          <List dense disablePadding>
            {MARKET_CATEGORIES.map((cat) => (
              <Box key={cat}>
                <ListSubheader
                  sx={{
                    bgcolor: 'rgba(0,212,255,0.05)',
                    color: 'primary.main',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    lineHeight: '36px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {cat}
                </ListSubheader>
                {MARKET_PAIRS.filter((p) => p.category === cat).map((pair) => (
                  <ListItemButton
                    key={pair.symbol}
                    selected={selectedPair.symbol === pair.symbol}
                    onClick={() => { onPairChange(pair); setPairOpen(false); }}
                    sx={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      '&.Mui-selected': { bgcolor: 'rgba(0,212,255,0.1)' },
                      '&:hover': { bgcolor: 'rgba(0,212,255,0.08)' },
                    }}
                  >
                    <ListItemText
                      primary={pair.label}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
                    />
                    <Radio
                      checked={selectedPair.symbol === pair.symbol}
                      size="small"
                      sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }}
                    />
                  </ListItemButton>
                ))}
              </Box>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <Dialog open={durOpen} onClose={() => setDurOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#0c1520', color: 'secondary.main', borderBottom: '1px solid rgba(255,255,255,0.07)', pb: 1.5 }}>
          Select Signal Duration
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#0c1520', p: 0 }}>
          <List dense disablePadding>
            {DURATION_OPTIONS.map((dur) => (
              <ListItemButton
                key={dur.value}
                selected={selectedDuration.value === dur.value}
                onClick={() => { onDurationChange(dur); setDurOpen(false); }}
                sx={{
                  py: 1.5,
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  '&.Mui-selected': { bgcolor: 'rgba(0,212,255,0.1)' },
                  '&:hover': { bgcolor: 'rgba(0,212,255,0.08)' },
                }}
              >
                <ListItemText
                  primary={dur.label}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
                <Radio
                  checked={selectedDuration.value === dur.value}
                  size="small"
                  sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }}
                />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
}
