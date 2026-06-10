import { AspectRatio } from "@/registry/react/components/aspect-ratio";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <AspectRatio className="[--ratio:16/9] overflow-hidden rounded-xl border border-white/10">
        <img
          alt="Landscape preview at a 16:9 ratio"
          className="absolute inset-0 size-full object-cover"
          src="https://picsum.photos/seed/frame/800/450"
        />
      </AspectRatio>
      <p className="text-muted-foreground text-sm">
        16 / 9 — set the ratio with the <code>--ratio</code> variable
      </p>

      <div className="grid w-full grid-cols-2 gap-4">
        <AspectRatio className="[--ratio:1] overflow-hidden rounded-xl border border-white/10">
          <img
            alt="Square preview"
            className="absolute inset-0 size-full object-cover"
            src="https://picsum.photos/seed/square/600/600"
          />
        </AspectRatio>
        <AspectRatio className="[--ratio:4/3] flex items-center justify-center rounded-xl border border-dashed border-white/15">
          <span className="text-muted-foreground text-xs">4 / 3</span>
        </AspectRatio>
      </div>
    </div>
  );
}
