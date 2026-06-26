import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

export const ConfirmDialog = ({
  open,
  title = 'Подтвердить действие',
  description = '',
  onCancel,
  onConfirm,
  cancelText = 'Отмена',
  confirmText = 'OK',
}) => {
  const blurActiveElement = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleCancel = () => {
    blurActiveElement();
    onCancel();
  };

  const handleConfirm = () => {
    blurActiveElement();
    onConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullWidth
      maxWidth="xs"
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? 'confirm-dialog-description' : undefined}
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>

      {description && (
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {description}
          </DialogContentText>
        </DialogContent>
      )}

      <DialogActions>
        <Button autoFocus onClick={handleCancel} color="inherit">
          {cancelText}
        </Button>
        <Button onClick={handleConfirm} color="error" variant="contained">
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
