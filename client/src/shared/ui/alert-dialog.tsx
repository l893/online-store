import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

export interface AlertDialogProps {
  readonly open: boolean;
  readonly title?: string;
  readonly description?: string;
  readonly onClose?: () => void;
  readonly closeText?: string;
}

export const AlertDialog = ({
  open,
  title = 'Сообщение',
  description = '',
  onClose,
  closeText = 'OK',
}: AlertDialogProps) => {
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
