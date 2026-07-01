import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

export const AlertDialog = ({
  open,
  title = 'Сообщение',
  description = '',
  onClose,
  closeText = 'OK',
}) => {
  const blurActiveElement = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleClose = () => {
    blurActiveElement();
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="alert-dialog-title"
      aria-describedby={description ? 'alert-dialog-description' : undefined}
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>

      {description && (
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {description}
          </DialogContentText>
        </DialogContent>
      )}

      <DialogActions>
        <Button autoFocus onClick={handleClose} variant="contained">
          {closeText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
