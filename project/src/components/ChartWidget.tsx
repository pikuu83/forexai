import { useEffect, useRef, useId } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import type { MarketPair } from '../data/markets';

interface Props {
  pair: MarketPair;
  interval: string;
}

export default function ChartWidget({ pair, interval }: Props) {
  const uid = useId().replace(/:/g, 'c');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = '';
    let disposed = false;

    const innerDiv = document.createElement('div');
    innerDiv.id = uid;
    innerDiv.style.cssText = 'width:100%;height:100%;';
    el.appendChild(innerDiv);

    function tryInit() {
      if (disposed || !document.getElementById(uid)) return;
      if (typeof window.TradingView === 'undefined') {
        setTimeout(tryInit, 400);
        return;
      }
      new window.TradingView.widget({
        width: el!.clientWidth || 500,
        height: el!.clientHeight || 360,
        symbol: pair.symbol,
        interval: pair.tvInterval ?? interval,
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#060b12',
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        allow_symbol_change: false,
        save_image: false,
        container_id: uid,
        overrides: {
          'paneProperties.background': '#060b12',
          'paneProperties.backgroundType': 'solid',
          'scalesProperties.textColor': '#8899aa',
          'mainSeriesProperties.candleStyle.upColor': '#00e676',
          'mainSeriesProperties.candleStyle.downColor': '#ff1744',
          'mainSeriesProperties.candleStyle.borderUpColor': '#00e676',
          'mainSeriesProperties.candleStyle.borderDownColor': '#ff1744',
          'mainSeriesProperties.candleStyle.wickUpColor': '#00e676',
          'mainSeriesProperties.candleStyle.wickDownColor': '#ff1744',
        },
        studies: ['RSI@tv-basicstudies', 'MACD@tv-basicstudies'],
      });
    }

    const t = setTimeout(tryInit, 200);
    return () => {
      disposed = true;
      clearTimeout(t);
      if (el) el.innerHTML = '';
    };
  }, [pair.symbol, interval, uid, pair.tvInterval]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}
        >
          Live Chart — RSI & MACD Enabled
        </Typography>
        <Chip
          label={`${pair.label} · ${interval}m`}
          size="small"
          sx={{ height: 20, fontSize: '0.6rem', bgcolor: 'rgba(0,212,255,0.08)', color: 'primary.light', border: '1px solid rgba(0,212,255,0.2)' }}
        />
      </Box>
      <Box
        ref={containerRef}
        sx={{
          height: { xs: 320, sm: 400 },
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid rgba(0,212,255,0.1)',
          bgcolor: '#060b12',
        }}
      />
    </Box>
  );
}
