import { ArrowUpRightIcon, SparklesIcon } from "lucide-react";
import { LinkBox, LinkOverlay } from "@/registry/react/components/link-overlay";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <LinkBox className="group w-full rounded-xl border border-white/10 bg-card p-5 transition-colors hover:border-white/20">
        <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <SparklesIcon className="size-5" />
        </div>

        <h3 className="mb-1 font-semibold text-foreground">
          <LinkOverlay href="#">
            Design tokens, explained
            <ArrowUpRightIcon className="ms-1 inline size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </LinkOverlay>
        </h3>

        <p className="text-muted-foreground text-sm">
          The entire card is clickable thanks to the overlay, while nested
          links stay independently interactive.
        </p>

        <p className="mt-4 text-muted-foreground text-xs">
          Written by{" "}
          <a className="text-foreground underline underline-offset-2" href="#author">
            Dakik Studio
          </a>{" "}
          — a separate, elevated link.
        </p>
      </LinkBox>
    </div>
  );
}
