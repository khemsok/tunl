import type { ReactNode } from "react";
import * as Switch from "@radix-ui/react-switch";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, disabled }: ToggleProps): ReactNode {
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={(checked) => {
        onChange(checked);
      }}
      disabled={disabled}
      className="bg-tunl-dim data-[state=checked]:bg-tunl-sage relative h-[18px] w-[34px] cursor-pointer rounded-[9px] border-none transition-colors duration-200 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40"
    >
      <Switch.Thumb className="block h-3.5 w-3.5 translate-x-0.5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-transform duration-200 data-[state=checked]:translate-x-4" />
    </Switch.Root>
  );
}
