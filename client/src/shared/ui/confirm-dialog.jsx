import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { Fragment } from 'react';
import { Button } from './button';

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
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onCancel} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="transition-opacity ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="transition-all ease-out duration-150"
            enterFrom="opacity-0 -translate-y-2 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="transition-all ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 -translate-y-2 scale-95"
          >
            <DialogPanel className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
              <DialogTitle className="text-lg font-semibold mb-2">
                {title}
              </DialogTitle>
              {description && (
                <Description className="text-sm text-gray-600 mb-4">
                  {description}
                </Description>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  onClick={onCancel}
                  className="bg-gray-100 hover:bg-gray-200 border-gray-300"
                >
                  {cancelText}
                </Button>
                <Button
                  onClick={onConfirm}
                  className="bg-red-100 hover:bg-red-200 border-red-300"
                >
                  {confirmText}
                </Button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};
