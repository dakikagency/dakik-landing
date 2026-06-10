import { TerminalIcon, XIcon } from "lucide-react";
import { Button } from "@/registry/react/components/button";
import {
  FloatingPanel,
  FloatingPanelBody,
  FloatingPanelCloseTrigger,
  FloatingPanelContent,
  FloatingPanelControl,
  FloatingPanelFooter,
  FloatingPanelHeader,
  FloatingPanelMaximize,
  FloatingPanelMinimize,
  FloatingPanelRestore,
  FloatingPanelTitle,
  FloatingPanelTrigger,
} from "@/registry/react/components/floating-panel";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="relative flex h-72 w-full items-center justify-center overflow-hidden rounded-lg border border-white/10">
        <FloatingPanel
          defaultSize={{ width: 320, height: 224 }}
          getAnchorPosition={({ triggerRect }) => ({
            x: (triggerRect?.x ?? 80) - 96,
            y: (triggerRect?.y ?? 80) - 260,
          })}
        >
          <FloatingPanelTrigger asChild>
            <Button variant="outline">
              <TerminalIcon /> Open session panel
            </Button>
          </FloatingPanelTrigger>

          <FloatingPanelContent>
            <FloatingPanelHeader>
              <FloatingPanelTitle>
                <TerminalIcon /> Session logs
              </FloatingPanelTitle>
              <FloatingPanelControl>
                <FloatingPanelMinimize />
                <FloatingPanelMaximize />
                <FloatingPanelRestore />
                <FloatingPanelCloseTrigger asChild>
                  <Button aria-label="Close" size="icon-xs" variant="ghost">
                    <XIcon />
                  </Button>
                </FloatingPanelCloseTrigger>
              </FloatingPanelControl>
            </FloatingPanelHeader>

            <FloatingPanelBody scrollFade>
              <p className="text-muted-foreground text-sm">
                Drag the header to move this panel, grab any edge to resize,
                or use the stage controls to minimize and maximize.
              </p>
              <p className="text-muted-foreground text-sm">
                Deploy finished in 12.4s — 0 errors, 2 warnings.
              </p>
            </FloatingPanelBody>

            <FloatingPanelFooter>
              <Button size="sm" variant="outline">
                Clear logs
              </Button>
            </FloatingPanelFooter>
          </FloatingPanelContent>
        </FloatingPanel>
      </div>
      <p className="text-muted-foreground text-sm">
        Draggable, resizable panel with minimize / maximize stages
      </p>
    </div>
  );
}
