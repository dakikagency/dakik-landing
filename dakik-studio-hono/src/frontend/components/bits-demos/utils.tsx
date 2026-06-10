import { cn } from "@/lib/utils";

const examples = [
  {
    label: "Conflicting utilities — last one wins",
    code: 'cn("px-4 py-2 bg-muted", "px-8 bg-primary")',
    result: cn("px-4 py-2 bg-muted", "px-8 bg-primary"),
  },
  {
    label: "Conditional classes are flattened",
    code: 'cn("text-sm", false && "hidden", { "font-semibold": true })',
    result: cn("text-sm", false && "hidden", { "font-semibold": true }),
  },
] as const;

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      {examples.map((example) => (
        <div
          className="flex w-full flex-col gap-2 rounded-lg border border-border p-4"
          key={example.label}
        >
          <span className="text-muted-foreground text-xs">
            {example.label}
          </span>
          <code className="font-mono text-foreground text-xs">
            {example.code}
          </code>
          <code className="rounded-md bg-muted px-2 py-1 font-mono text-primary text-xs">
            → "{example.result}"
          </code>
        </div>
      ))}
      <p className="text-muted-foreground text-sm">
        cn() merges clsx conditionals with tailwind-merge conflict resolution.
      </p>
    </div>
  );
}
