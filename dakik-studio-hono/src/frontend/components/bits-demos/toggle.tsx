import { BoldIcon, ItalicIcon, PinIcon, UnderlineIcon } from "lucide-react";
import { useState } from "react";
import { Toggle } from "@/registry/react/components/toggle";

export default function Demo() {
  const [pinned, setPinned] = useState(false);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex items-center gap-1">
        <Toggle aria-label="Toggle bold" defaultPressed>
          <BoldIcon />
        </Toggle>
        <Toggle aria-label="Toggle italic">
          <ItalicIcon />
        </Toggle>
        <Toggle aria-label="Toggle underline">
          <UnderlineIcon />
        </Toggle>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Toggle
          onPressedChange={setPinned}
          pressed={pinned}
          size="lg"
          variant="outline"
        >
          <PinIcon />
          {pinned ? "Pinned" : "Pin to sidebar"}
        </Toggle>
        <span className="text-muted-foreground text-sm">
          Outline variant, controlled state
        </span>
      </div>
    </div>
  );
}
