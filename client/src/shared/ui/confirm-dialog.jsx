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
  return (
    <Dialog
      open={open}
      onClose={onCancel}
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
        <Button autoFocus onClick={onCancel} color="inherit">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
