import {
  SkipNavContent,
  SkipNavLink,
} from "@/registry/react/components/skip-nav";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="relative w-full overflow-hidden rounded-lg border border-white/10">
        <SkipNavLink className="focus:absolute" id="demo-skip-nav">
          Skip to content
        </SkipNavLink>

        <header className="flex items-center justify-between border-white/10 border-b px-4 py-3">
          <span className="font-semibold text-foreground text-sm">Logo</span>
          <nav className="flex gap-4 text-muted-foreground text-xs">
            <a href="#demo-products">Products</a>
            <a href="#demo-pricing">Pricing</a>
            <a href="#demo-about">About</a>
          </nav>
        </header>

        <SkipNavContent className="px-4 py-6" id="demo-skip-nav">
          <p className="font-medium text-foreground text-sm">Main content</p>
          <p className="mt-1 text-muted-foreground text-xs">
            Click this preview, then press Tab — the skip link appears for
            keyboard users so they can jump straight here.
          </p>
        </SkipNavContent>
      </div>

      <p className="text-muted-foreground text-xs">
        Press <kbd className="rounded border border-white/15 px-1">Tab</kbd> to
        reveal the visually hidden link.
      </p>
    </div>
  );
}
