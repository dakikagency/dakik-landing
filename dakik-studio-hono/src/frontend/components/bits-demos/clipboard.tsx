import {
  Clipboard,
  ClipboardIndicator,
  ClipboardInput,
  ClipboardTrigger,
  ClipboardValue,
} from "@/registry/react/components/clipboard";
import { Button } from "@/registry/react/components/button";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex w-full flex-col gap-2">
        <span className="text-muted-foreground text-sm">Install command</span>
        <Clipboard rootClassName="w-full" value="npm install @dakik/bits">
          <ClipboardValue className="flex-1 font-mono" />
          <ClipboardTrigger asChild>
            <Button aria-label="Copy install command" size="icon-md" variant="outline">
              <ClipboardIndicator />
            </Button>
          </ClipboardTrigger>
        </Clipboard>
      </div>

      <div className="flex w-full flex-col gap-2">
        <span className="text-muted-foreground text-sm">API key</span>
        <Clipboard rootClassName="w-full" value="sk_live_9f4c2d8e7b1a">
          <ClipboardInput className="flex-1 font-mono" readOnly />
          <ClipboardTrigger asChild>
            <Button size="md" variant="secondary">
              <ClipboardIndicator />
              Copy
            </Button>
          </ClipboardTrigger>
        </Clipboard>
      </div>
    </div>
  );
}
