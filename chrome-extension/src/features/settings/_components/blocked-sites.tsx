import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useBlockedSites } from "../_hooks/use-blocked-sites";
import { SiteRow } from "./site-row";

export function BlockedSites(): ReactNode {
  const { sites, isLocked, isLoaded, add, remove } = useBlockedSites();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    const result = add(input.trim());
    if (result.ok) {
      setInput("");
      setError(null);
    } else {
      setError(result.error ?? "Invalid domain");
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="Add domain..."
          disabled={isLocked}
          className="bg-tunl-surface border-tunl-border text-tunl-text placeholder:text-tunl-dim focus:border-tunl-sage/30 flex-1 rounded-lg border px-3 py-2 text-[13px] outline-none disabled:opacity-40"
        />
        <Button
          variant={isLocked ? "locked" : "sage"}
          className="shrink-0 px-4 py-2 text-[12px]"
          onClick={handleAdd}
        >
          +
        </Button>
      </div>

      {isLocked && <p className="text-tunl-amber m-0 text-[11px]">Locked during focus sessions</p>}

      {error && <p className="text-tunl-rose m-0 text-[11px]">{error}</p>}

      <div className="mt-1 flex flex-col gap-1.5">
        {sites.map((domain) => (
          <SiteRow
            key={domain}
            domain={domain}
            isLocked={isLocked}
            onDelete={() => {
              remove(domain);
            }}
          />
        ))}
      </div>
    </div>
  );
}
