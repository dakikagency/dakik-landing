import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselIndicatorGroup,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/registry/react/components/carousel";

const slides = [
  { seed: "alps", label: "Alpine ridge" },
  { seed: "coast", label: "Quiet coastline" },
  { seed: "forest", label: "Morning forest" },
  { seed: "dunes", label: "Desert dunes" },
];

export default function Demo() {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6 px-14">
      <Carousel className="w-full gap-4" loop slideCount={slides.length}>
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem index={index} key={slide.seed}>
              <div className="relative aspect-video w-full">
                <img
                  alt={slide.label}
                  className="aspect-video"
                  src={`https://picsum.photos/seed/${slide.seed}/640/360`}
                />
                <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-white text-xs">
                  {slide.label}
                </span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselIndicatorGroup>
          {slides.map((slide, index) => (
            <CarouselIndicator
              aria-label={`Go to slide ${index + 1}`}
              index={index}
              key={slide.seed}
            />
          ))}
        </CarouselIndicatorGroup>
      </Carousel>
    </div>
  );
}
