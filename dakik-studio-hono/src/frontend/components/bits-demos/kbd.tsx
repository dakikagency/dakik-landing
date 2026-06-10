import { ArrowDown, ArrowUp, Command, CornerDownLeft } from "lucide-react";
import { Kbd, KbdGroup } from "@/registry/react/components/kbd";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex items-center gap-3">
        <Kbd>
          <Command />K
        </Kbd>
        <Kbd variant="outline">Esc</Kbd>
        <Kbd variant="outline">
          <CornerDownLeft />
        </Kbd>
      </div>

      <div className="flex w-full flex-col gap-2 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Open command palette</span>
          <KbdGroup>
            <Kbd>
              <Command />
            </Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Navigate results</span>
          <KbdGroup>
            <Kbd variant="outline">
              <ArrowUp />
            </Kbd>
            <Kbd variant="outline">
              <ArrowDown />
            </Kbd>
          </KbdGroup>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Toggle sidebar</span>
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <span className="text-muted-foreground text-xs">+</span>
            <Kbd>B</Kbd>
          </KbdGroup>
        </div>
      </div>
    </div>
  );
}
