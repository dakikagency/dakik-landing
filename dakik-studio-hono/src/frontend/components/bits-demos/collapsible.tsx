import {
  Collapsible,
  CollapsibleContent,
  CollapsibleIndicator,
  CollapsibleTrigger,
} from "@/registry/react/components/collapsible";
import { Button } from "@/registry/react/components/button";

const repos = [
  "dakik/bits-registry",
  "dakik/studio-hono",
  "dakik/landing-pages",
];

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Collapsible className="w-full" defaultOpen>
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-foreground text-sm">
            Pinned repositories
          </span>
          <CollapsibleTrigger asChild>
            <Button aria-label="Toggle repositories" size="icon-sm" variant="ghost">
              <CollapsibleIndicator />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="flex flex-col gap-2 pt-2">
          {repos.map((repo) => (
            <div
              className="rounded-lg border px-3 py-2 font-mono text-muted-foreground text-sm"
              key={repo}
            >
              {repo}
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
