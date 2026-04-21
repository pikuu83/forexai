import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4ff',
      light: '#66e8ff',
      dark: '#0099cc',
      contrastText: '#000',
    },
    secondary: {
      main: '#ffd700',
      light: '#ffe44d',
      dark: '#b39800',
      contrastText: '#000',
    },
    success: {
      main: '#00e676',
      light: '#69f0ae',
      dark: '#00b248',
      contrastText: '#000',
    },
    error: {
      main: '#ff1744',
      light: '#ff6b6b',
      dark: '#c4001d',
      contrastText: '#fff',
    },
    warning: {
      main: '#ff9100',
      light: '#ffb74d',
      dark: '#c56200',
    },
    info: {
      main: '#00b0ff',
      light: '#69e2ff',
      dark: '#0081cb',
    },
    background: {
      default: '#060b12',
      paper: '#0c1520',
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#8899aa',
    },
    divider: 'rgba(255,255,255,0.07)',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 900, letterSpacing: 1 },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, fontSize: '0.8rem' },
    caption: { fontSize: '0.72rem' },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(160deg, #060b12 0%, #080e18 50%, #060b12 100%)',
          minHeight: '100vh',
        },
        '::-webkit-scrollbar': { width: 6 },
        '::-webkit-scrollbar-track': { background: '#0c1520' },
        '::-webkit-scrollbar-thumb': { background: '#1e3050', borderRadius: 3 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#0c1520',
          border: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 12,
          letterSpacing: 0.5,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: 'rgba(255,255,255,0.08)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0c1520',
          backgroundImage: 'none',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 20,
        },
      },
    },
  },
});

export default theme;
