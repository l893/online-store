import { CircularProgress, Typography } from '@mui/material';

export const Loader = ({ className = '', label = 'Loading…' }) => {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <CircularProgress size={16} color="inherit" />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </span>
  );
};
