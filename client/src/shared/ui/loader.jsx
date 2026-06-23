import { CircularProgress, Stack, Typography } from '@mui/material';

export const Loader = ({ label = 'Loading…' }) => {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <CircularProgress size={16} color="inherit" />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
};
