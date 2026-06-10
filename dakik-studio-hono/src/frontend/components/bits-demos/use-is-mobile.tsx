import { Monitor, Smartphone } from "lucide-react";
import { useIsMobile } from "@/registry/react/hooks/use-is-mobile";

export default function Demo() {
  const isMobile = useIsMobile();

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex items-center gap-3 rounded-lg border border-border px-5 py-4">
        {isMobile ? (
          <Smartphone className="size-5 text-foreground" />
        ) : (
          <Monitor className="size-5 text-foreground" />
        )}
        <div className="flex flex-col">
          <span className="font-medium text-foreground text-sm">
            viewport: {isMobile ? "mobile" : "desktop"}
          </span>
          <span className="text-muted-foreground text-xs">
            breakpoint at 768px — resize the window to see it change
          </span>
        </div>
      </div>

      <code className="rounded-md bg-muted px-3 py-1.5 font-mono text-muted-foreground text-xs">
        useIsMobile() → {String(isMobile)}
      </code>
    </div>
  );
}
