'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#60a5fa', // Blue-400
      light: '#93c5fd', // Blue-300
      dark: '#3b82f6', // Blue-500
      50: '#374151',
    },
    secondary: {
      main: '#34d399', // Emerald-400
      light: '#6ee7b7', // Emerald-300
      dark: '#10b981', // Emerald-500
    },
    background: {
      default: '#111827', // Gray-900
      paper: '#1f2937', // Gray-800
    },
    text: {
      primary: '#f9fafb', // Gray-50
      secondary: '#d1d5db', // Gray-300
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      background: 'linear-gradient(45deg, #60a5fa, #34d399)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#60a5fa',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 14px 0 rgba(96, 165, 250, 0.25)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #374151',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1f2937',
          borderBottom: '1px solid #374151',
          boxShadow: 'none',
        },
      },
    },
  },
});