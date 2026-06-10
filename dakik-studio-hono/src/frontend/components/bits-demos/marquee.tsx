import {
  Marquee,
  MarqueeContent,
  MarqueeItem,
} from "@/registry/react/components/marquee";

const brands = [
  "Acme Corp",
  "Globex",
  "Initech",
  "Umbrella",
  "Stark Industries",
  "Wayne Enterprises",
  "Hooli",
  "Aperture",
];

export default function Demo() {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <Marquee>
        <MarqueeContent>
          {brands.map((brand) => (
            <MarqueeItem key={brand}>
              <span className="flex h-12 items-center rounded-lg border border-border bg-muted/30 px-5 font-medium text-muted-foreground text-sm">
                {brand}
              </span>
            </MarqueeItem>
          ))}
        </MarqueeContent>
      </Marquee>

      <Marquee speed={30}>
        <MarqueeContent data-reverse>
          {brands.map((brand) => (
            <MarqueeItem key={brand}>
              <span className="flex h-12 items-center px-5 font-semibold text-foreground/70 text-lg tracking-tight">
                {brand}
              </span>
            </MarqueeItem>
          ))}
        </MarqueeContent>
      </Marquee>

      <p className="text-muted-foreground text-sm">
        Trusted by teams everywhere — hover to inspect, edges fade out.
      </p>
    </div>
  );
}
