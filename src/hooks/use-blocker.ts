import { useState } from "react";

import { blockSites, unblockSites } from "../lib/blocker";

export type UseBlockerResult = {
  isBlocking: boolean;
  blockError: string | null;
  startBlocking: (sites: string[]) => void;
  stopBlocking: () => void;
};

export function useBlocker(): UseBlockerResult {
  const [isBlocking, setIsBlocking] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);

  function startBlocking(sites: string[]): void {
    try {
      blockSites(sites);
      setIsBlocking(true);
      setBlockError(null);
    } catch (err: any) {
      setBlockError(err?.message || "Failed to block sites");
    }
  }

  function stopBlocking(): void {
    if (!isBlocking) return;
    try { unblockSites(); } catch {}
    setIsBlocking(false);
  }

  return { isBlocking, blockError, startBlocking, stopBlocking };
}
