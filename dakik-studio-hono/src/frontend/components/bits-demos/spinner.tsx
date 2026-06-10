import { Spinner } from "@/registry/react/components/spinner";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <Spinner />
          <span className="text-muted-foreground text-xs">Default</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Spinner className="size-6" />
          <span className="text-muted-foreground text-xs">Large</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Spinner className="size-8 text-info" />
          <span className="text-muted-foreground text-xs">Colored</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Spinner />
        Loading your dashboard…
      </div>
    </div>
  );
}
