import { type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
}: ConfirmDialogProps): ReactNode {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content className="bg-tunl-bg border-tunl-border fixed top-1/2 left-1/2 w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-xl border p-5 outline-none">
          <Dialog.Title className="text-tunl-text m-0 text-[14px] font-semibold">
            {title}
          </Dialog.Title>
          <Dialog.Description className="text-tunl-text-2 mt-2 text-[12px] leading-relaxed">
            {description}
          </Dialog.Description>
          <div className="mt-4 flex gap-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button variant="rose-outline" className="flex-1" onClick={handleConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
