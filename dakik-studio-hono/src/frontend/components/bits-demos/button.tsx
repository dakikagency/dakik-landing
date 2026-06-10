import { ArrowRightIcon, PlusIcon } from "lucide-react";
import { Button } from "@/registry/react/components/button";

export default function Demo() {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button size="sm" variant="outline">
          Small
        </Button>
        <Button size="md" variant="outline">
          Medium
        </Button>
        <Button size="lg" variant="outline">
          Large
        </Button>
        <Button size="icon-md" variant="outline">
          <PlusIcon />
        </Button>
        <Button pill size="lg">
          Get started
          <ArrowRightIcon />
        </Button>
        <Button isLoading>Saving…</Button>
      </div>
    </div>
  );
}
