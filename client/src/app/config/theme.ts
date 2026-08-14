import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

const themeOptions = {
  typography: {
    fontFamily: [
      'system-ui',
      'Avenir',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(', '),
  },
  shape: {
    borderRadius: 12,
  },
} satisfies ThemeOptions;

export const theme = createTheme(themeOptions);
