import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/react/components/tooltip";
import { Button } from "@/registry/react/components/button";

const tools = [
  { label: "Bold", shortcut: "⌘B", icon: BoldIcon },
  { label: "Italic", shortcut: "⌘I", icon: ItalicIcon },
  { label: "Underline", shortcut: "⌘U", icon: UnderlineIcon },
];

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex items-center gap-1 rounded-xl border p-1">
        {tools.map(({ label, shortcut, icon: Icon }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <Button aria-label={label} size="icon-md" variant="ghost">
                <Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {label}{" "}
              <span className="text-background/64">{shortcut}</span>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <Tooltip positioning={{ placement: "bottom" }}>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover for details</Button>
        </TooltipTrigger>
        <TooltipContent>Tooltips can be placed on any side</TooltipContent>
      </Tooltip>
    </div>
  );
}
