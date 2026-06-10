import {
  Resizable,
  ResizablePanel,
  ResizableResizeTrigger,
} from "@/registry/react/components/resizable";

export default function Demo() {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <div className="relative h-72 w-full overflow-hidden rounded-lg border border-white/10">
        <Resizable
          defaultSize={[30, 70]}
          panels={[
            { id: "sidebar", minSize: 20 },
            { id: "main", minSize: 30 },
          ]}
        >
          <ResizablePanel
            className="flex items-center justify-center"
            id="sidebar"
          >
            <span className="font-medium text-muted-foreground text-sm">
              Sidebar
            </span>
          </ResizablePanel>

          <ResizableResizeTrigger id="sidebar:main" withHandle />

          <ResizablePanel className="min-h-0" id="main">
            <Resizable
              defaultSize={[60, 40]}
              orientation="vertical"
              panels={[
                { id: "editor", minSize: 25 },
                { id: "terminal", minSize: 20 },
              ]}
            >
              <ResizablePanel
                className="flex items-center justify-center"
                id="editor"
              >
                <span className="font-medium text-muted-foreground text-sm">
                  Editor
                </span>
              </ResizablePanel>

              <ResizableResizeTrigger id="editor:terminal" />

              <ResizablePanel
                className="flex items-center justify-center"
                id="terminal"
              >
                <span className="font-medium text-muted-foreground text-sm">
                  Terminal
                </span>
              </ResizablePanel>
            </Resizable>
          </ResizablePanel>
        </Resizable>
      </div>
      <p className="text-muted-foreground text-sm">
        Drag the handles — nested horizontal and vertical splits
      </p>
    </div>
  );
}
