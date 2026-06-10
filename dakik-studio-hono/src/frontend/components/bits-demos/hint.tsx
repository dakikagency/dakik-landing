import { CircleHelpIcon, SparklesIcon } from "lucide-react";
import {
  Hint,
  HintContent,
  HintTrigger,
} from "@/registry/react/components/hint";
import { Button } from "@/registry/react/components/button";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex items-center gap-8">
        <Hint>
          <HintTrigger asChild>
            <Button variant="outline">
              <SparklesIcon />
              Hover me
            </Button>
          </HintTrigger>
          <HintContent>Lightweight hint, no portal needed</HintContent>
        </Hint>

        <Hint positioning={{ placement: "bottom" }}>
          <HintTrigger asChild>
            <Button size="icon-md" variant="ghost" aria-label="Help">
              <CircleHelpIcon />
            </Button>
          </HintTrigger>
          <HintContent>Placed below the trigger</HintContent>
        </Hint>

        <Hint positioning={{ placement: "right", gutter: "14px" }}>
          <HintTrigger className="text-sm text-muted-foreground underline decoration-dotted underline-offset-4">
            plain trigger
          </HintTrigger>
          <HintContent>Custom gutter on the right</HintContent>
        </Hint>
      </div>
    </div>
  );
}
