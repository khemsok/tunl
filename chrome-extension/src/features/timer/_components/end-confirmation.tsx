import { useState, useRef, useEffect, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { sendMessage } from "@/lib/messaging";
import { END_CONFIRM_DURATION_MS } from "@/lib/constants";
import { useCountdown } from "../_hooks/use-countdown";

interface EndConfirmationProps {
  endConfirmStartedAt: number | null;
}

export function EndConfirmation({ endConfirmStartedAt }: EndConfirmationProps): ReactNode {
  const { remainingMs, progress, isComplete } = useCountdown(
    endConfirmStartedAt,
    END_CONFIRM_DURATION_MS,
  );
  const countdownSec = Math.ceil(remainingMs / 1000);
  const [confirmInput, setConfirmInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isComplete) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isComplete]);

  useEffect(() => {
    if (!endConfirmStartedAt) setConfirmInput("");
  }, [endConfirmStartedAt]);

  const handleConfirm = () => {
    void sendMessage({ type: "CONFIRM_END" });
    setConfirmInput("");
  };

  const handleCancel = () => {
    void sendMessage({ type: "CANCEL_END" });
    setConfirmInput("");
  };

  return (
    <Dialog.Root open={endConfirmStartedAt !== null}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-tunl-bg/95 fixed inset-0" />
        <Dialog.Content className="fixed inset-0 flex flex-col items-center justify-center outline-none">
          <div className="flex flex-col items-center gap-4">
            {!isComplete ? (
              <>
                <ProgressRing progress={progress} size={100} strokeWidth={3} variant="rose">
                  <div className="text-tunl-rose font-mono text-[26px] leading-none font-light">
                    {countdownSec}
                  </div>
                </ProgressRing>

                <Dialog.Title className="text-tunl-rose m-0 text-[9px] font-semibold tracking-[1.6px] uppercase">
                  Ending session...
                </Dialog.Title>
              </>
            ) : (
              <div className="flex w-full max-w-[220px] flex-col items-center gap-3">
                <Dialog.Title className="text-tunl-rose/60 m-0 text-[9px] font-semibold tracking-[1.6px] uppercase">
                  Type &ldquo;end&rdquo; to confirm
                </Dialog.Title>
                <input
                  ref={inputRef}
                  type="text"
                  value={confirmInput}
                  onChange={(e) => {
                    setConfirmInput(e.target.value.toLowerCase());
                  }}
                  placeholder="end"
                  spellCheck={false}
                  autoComplete="off"
                  className="bg-tunl-surface border-tunl-border text-tunl-rose placeholder:text-tunl-dim focus:border-tunl-rose/40 w-full rounded-lg border px-3 py-2 text-center font-mono text-[15px] tracking-widest outline-none"
                />
              </div>
            )}

            <div className="mt-2 flex w-full max-w-[200px] gap-2">
              <Button variant="ghost" className="flex-1" onClick={handleCancel}>
                Cancel
              </Button>
              {isComplete && (
                <Button
                  variant="rose-outline"
                  className="flex-1"
                  disabled={confirmInput !== "end"}
                  onClick={handleConfirm}
                >
                  End
                </Button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
