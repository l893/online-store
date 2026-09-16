import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

const themeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: 'rgb(109, 40, 217)',
      dark: 'rgb(91, 33, 182)',
      contrastText: 'rgb(255, 255, 255)',
    },
    secondary: {
      main: 'rgb(139, 92, 246)',
    },
    error: {
      main: 'rgb(185, 28, 28)',
    },
    success: {
      main: 'rgb(21, 128, 61)',
    },
    text: {
      primary: 'rgb(17, 24, 39)',
      secondary: 'rgb(102, 112, 133)',
    },
    background: {
      default: 'rgb(247, 248, 252)',
      paper: 'rgb(255, 255, 255)',
    },
    divider: 'rgb(228, 231, 238)',
  },
  typography: {
    fontFamily: [
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Arial',
      'sans-serif',
    ].join(', '),
  },
  shape: {
    borderRadius: 12,
  },
} satisfies ThemeOptions;

export const theme = createTheme(themeOptions);
