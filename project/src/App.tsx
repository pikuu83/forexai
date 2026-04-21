import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Fade from '@mui/material/Fade';
import theme from './theme';
import { MARKET_PAIRS, DURATION_OPTIONS } from './data/markets';
import type { MarketPair, DurationOption } from './data/markets';
import { generateSignal, isWeakSignal } from './utils/signalEngine';
import type { SignalResult } from './utils/signalEngine';
import { saveSignal, getSessionId, fetchSignalHistory, updateSignalResult, type SignalHistoryRow } from './lib/supabase';
import Header from './components/Header';
import AnimatedBackground from './components/AnimatedBackground';
import UnlockModal from './components/UnlockModal';
import MarketSelector from './components/MarketSelector';
import GenerateButton from './components/GenerateButton';
import SignalCard from './components/SignalCard';
import LogicPanel from './components/LogicPanel';
import IndicatorPanel from './components/IndicatorPanel';
import SignalHistory from './components/SignalHistory';
import ChartWidget from './components/ChartWidget';
import StatusBar from './components/StatusBar';
import ActiveTrade from './components/ActiveTrade';
import TradeResults from './components/TradeResults';

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPair, setSelectedPair] = useState<MarketPair>(MARKET_PAIRS[0]!);
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>(DURATION_OPTIONS[2]!);
  const [signal, setSignal] = useState<SignalResult | null>(null);
  const [activeTrade, setActiveTrade] = useState<SignalResult | null>(null);
  const [snackMsg, setSnackMsg] = useState<{ text: string; severity: 'success' | 'error' | 'warning' } | null>(null);
  const [historyRows, setHistoryRows] = useState<SignalHistoryRow[]>([]);
  const [tradeId, setTradeId] = useState<string | null>(null);

  const loadHistory = async () => {
    const sessionId = getSessionId();
    const data = await fetchSignalHistory(sessionId);
    setHistoryRows(data);
  };

  useEffect(() => {
    loadHistory();
    const interval = setInterval(loadHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await generateSignal(selectedPair);
      if (isWeakSignal(result)) {
        const reason = result.details[0] || result.message;
        console.log('Signal filtered:', result.details);
        setSnackMsg({ text: `Market unclear: ${reason.substring(0, 50)}...`, severity: 'warning' });
        return;
      }
      setSignal(result);
      setActiveTrade(result);
      const badge = result.isHighConfidence ? '⭐' : '•';
      setSnackMsg({ text: `${badge} ${result.direction} — ${result.confidence}% confidence`, severity: result.confidence >= 80 ? 'success' : 'error' });

      const sessionId = getSessionId();
      const id = await saveSignal({
        session_id: sessionId,
        pair: selectedPair.label,
        symbol: selectedPair.symbol,
        direction: result.direction,
        confidence: result.confidence,
        entry_low: result.entryLow,
        entry_high: result.entryHigh,
        stop_loss: result.stopLoss,
        take_profit: result.takeProfit,
        risk_reward: result.riskReward,
        duration_minutes: selectedDuration.value,
        logic_points: result.logicPoints.map(p => p.label),
        result: 'PENDING',
      });
      setTradeId(id);
    } catch {
      setSnackMsg({ text: 'Signal generation failed. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTradeExpire = async (result: 'WIN' | 'LOSS') => {
    if (tradeId) {
      await updateSignalResult(tradeId, result);
      await loadHistory();
      setSnackMsg({ text: `Trade closed — ${result}`, severity: result === 'WIN' ? 'success' : 'error' });
    }
    setActiveTrade(null);
  };

  const handlePairChange = (pair: MarketPair) => {
    setSelectedPair(pair);
    setSignal(null);
    setActiveTrade(null);
  };

  const chartInterval =
    selectedDuration.value <= 5 ? '5' :
    selectedDuration.value <= 10 ? '10' :
    selectedDuration.value <= 15 ? '15' :
    selectedDuration.value <= 30 ? '30' : '60';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AnimatedBackground />

      <UnlockModal open={!unlocked} onUnlock={() => setUnlocked(true)} />

      <Container
        maxWidth="sm"
        sx={{
          py: 3,
          px: { xs: 1.5, sm: 2 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Header />

        <MarketSelector
          selectedPair={selectedPair}
          selectedDuration={selectedDuration}
          onPairChange={handlePairChange}
          onDurationChange={setSelectedDuration}
        />

        <GenerateButton loading={loading} onClick={handleGenerate} />

        <Fade in={signal !== null} timeout={500}>
          <Box>
            {signal && (
              <SignalCard signal={signal} pair={selectedPair} duration={selectedDuration} />
            )}
          </Box>
        </Fade>

        <ChartWidget pair={selectedPair} interval={chartInterval} />

        <ActiveTrade signal={activeTrade} duration={selectedDuration} onTradeExpire={handleTradeExpire} />

        <Fade in={signal !== null} timeout={600}>
          <Box>
            {signal && (
              <>
                <Box sx={{ mt: 1 }}>
                  <LogicPanel
                    logicPoints={signal.logicPoints}
                    rejectedReasons={signal.rejectedReasons}
                    candlePattern={signal.candlePattern}
                    isBuy={signal.direction === 'BUY'}
                    confidence={signal.confidence}
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <IndicatorPanel
                    indicators={signal.indicators}
                    currentPrice={signal.currentPrice}
                  />
                </Box>
              </>
            )}
          </Box>
        </Fade>

        <TradeResults trades={historyRows} />

        <SignalHistory />

        <StatusBar />
      </Container>

      <Snackbar
        open={snackMsg !== null}
        autoHideDuration={4000}
        onClose={() => setSnackMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackMsg?.severity ?? 'info'}
          sx={{
            bgcolor: snackMsg?.severity === 'success' ? 'rgba(0,230,118,0.15)'
              : snackMsg?.severity === 'error' ? 'rgba(255,23,68,0.15)'
              : 'rgba(255,145,0,0.15)',
            border: `1px solid ${snackMsg?.severity === 'success' ? 'rgba(0,230,118,0.4)'
              : snackMsg?.severity === 'error' ? 'rgba(255,23,68,0.4)'
              : 'rgba(255,145,0,0.4)'}`,
            color: snackMsg?.severity === 'success' ? 'success.light'
              : snackMsg?.severity === 'error' ? 'error.light'
              : 'warning.light',
            fontWeight: 700,
          }}
          onClose={() => setSnackMsg(null)}
        >
          {snackMsg?.text}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
