import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface SiteRowProps {
  domain: string;
  isLocked: boolean;
  onDelete: () => void;
}

export function SiteRow({ domain, isLocked, onDelete }: SiteRowProps): ReactNode {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div className="bg-tunl-surface border-tunl-border flex items-center justify-between rounded-lg border px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="bg-tunl-sage h-1.5 w-1.5 rounded-full" />
          <span className="text-tunl-text text-[13px]">{domain}</span>
        </div>
        {!isLocked && (
          <button
            onClick={() => {
              setShowConfirm(true);
            }}
            className="text-tunl-dim hover:text-tunl-rose cursor-pointer border-none bg-transparent p-0 transition-colors"
          >
            <Icon size={14}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </Icon>
          </button>
        )}
      </div>
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={`Remove ${domain}?`}
        description="This site will no longer be blocked during focus sessions."
        confirmLabel="Remove"
        onConfirm={onDelete}
      />
    </>
  );
}
