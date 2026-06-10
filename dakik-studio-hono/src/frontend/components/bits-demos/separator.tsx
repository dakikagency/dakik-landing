import { Separator } from "@/registry/react/components/separator";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="w-full">
        <h4 className="font-medium text-foreground text-sm">Dakik Bits</h4>
        <p className="text-muted-foreground text-sm">
          Ark UI primitives, styled and ready to copy.
        </p>
        <Separator className="my-4" />
        <div className="flex h-5 items-center gap-4 text-sm">
          <span className="text-foreground">Docs</span>
          <Separator orientation="vertical" />
          <span className="text-muted-foreground">Components</span>
          <Separator orientation="vertical" />
          <span className="text-muted-foreground">Changelog</span>
        </div>
      </div>
    </div>
  );
}
