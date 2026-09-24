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
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: '2.75rem',
          paddingInline: '1.25rem',
          borderRadius: '0.625rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          transition:
            'background-color 0.3s ease-in-out, border-color 0.3s ease-in-out, color 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: 'none',
          },
          '&:focus-visible': {
            outline: '0.1875rem solid rgba(109, 40, 217, 0.28)',
            outlineOffset: '0.125rem',
          },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        },
        contained: {
          '&.MuiButton-colorPrimary': {
            position: 'relative',
            isolation: 'isolate',
            overflow: 'hidden',

            backgroundImage:
              'linear-gradient(135deg, rgb(124, 58, 237) 0%, rgb(91, 33, 214) 100%)',

            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              zIndex: -1,

              borderRadius: 'inherit',

              backgroundImage:
                'linear-gradient(135deg, rgb(109, 40, 217) 0%, rgb(76, 29, 149) 100%)',

              opacity: 0,
              pointerEvents: 'none',

              transition: 'opacity 0.3s ease-in-out',
            },

            '&:hover::before': {
              opacity: 1,
            },

            '&.Mui-disabled': {
              color: 'rgb(124, 132, 152)',
              backgroundColor: 'rgb(241, 243, 247)',
              backgroundImage: 'none',

              '&::before': {
                opacity: 0,
              },
            },

            '@media (prefers-reduced-motion: reduce)': {
              '&::before': {
                transition: 'none',
              },
            },
          },
        },
        outlined: {
          borderColor: 'rgb(228, 231, 238)',
          color: 'rgb(17, 24, 39)',
          backgroundColor: 'rgb(255, 255, 255)',
          '&:hover': {
            borderColor: 'rgb(109, 40, 217)',
            color: 'rgb(109, 40, 217)',
            backgroundColor: 'rgb(241, 234, 254)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          backgroundColor: 'rgb(255, 255, 255)',
          '&:not(.MuiInputBase-multiline)': {
            height: '3rem',
          },
          '&:not(.MuiInputBase-multiline) .MuiOutlinedInput-input': {
            boxSizing: 'border-box',
            height: '100%',
            padding: '0 0.875rem',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgb(228, 231, 238)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgb(209, 213, 219)',
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 0.1875rem rgba(109, 40, 217, 0.28)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: '1px',
            borderColor: 'rgb(109, 40, 217)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          display: 'flex',
          alignItems: 'center',
        },
      },
    },
  },
} satisfies ThemeOptions;

export const theme = createTheme(themeOptions);
