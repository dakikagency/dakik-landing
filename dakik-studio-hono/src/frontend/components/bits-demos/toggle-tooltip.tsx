import { useState } from "react";
import { CheckIcon, CopyIcon, InfoIcon } from "lucide-react";
import {
  ToggleTooltip,
  ToggleTooltipContent,
  ToggleTooltipTrigger,
} from "@/registry/react/components/toggle-tooltip";
import { Button } from "@/registry/react/components/button";

export default function Demo() {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex items-center gap-4">
        <ToggleTooltip>
          <ToggleTooltipTrigger asChild>
            <Button size="icon-md" variant="outline" aria-label="More info">
              <InfoIcon />
            </Button>
          </ToggleTooltipTrigger>
          <ToggleTooltipContent>
            Click to toggle — stays open until dismissed
          </ToggleTooltipContent>
        </ToggleTooltip>

        <ToggleTooltip
          onOpenChange={({ open }) => {
            if (open) {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }
          }}
        >
          <ToggleTooltipTrigger asChild>
            <Button variant="outline">
              {copied ? <CheckIcon /> : <CopyIcon />}
              npx dakik add button
            </Button>
          </ToggleTooltipTrigger>
          <ToggleTooltipContent>Copied to clipboard</ToggleTooltipContent>
        </ToggleTooltip>
      </div>
    </div>
  );
}
