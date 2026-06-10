import { ScrollArea } from "@/registry/react/components/scroll-area";
import { Separator } from "@/registry/react/components/separator";

const releases = Array.from({ length: 20 }, (_, i) => ({
  version: `v1.${19 - i}.0`,
  note: i === 0 ? "Latest release" : `Maintenance and bug fixes`,
}));

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="relative h-72 w-full overflow-hidden rounded-lg border border-white/10">
        <ScrollArea scrollFade>
          <div className="p-4">
            <h4 className="mb-3 font-medium text-foreground text-sm">
              Release history
            </h4>
            {releases.map((release, index) => (
              <div key={release.version}>
                {index > 0 && <Separator className="my-2" />}
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-foreground text-sm">
                    {release.version}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {release.note}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      <p className="text-muted-foreground text-sm">
        Hover to reveal the scrollbar — edges fade while scrolling
      </p>
    </div>
  );
}
