import {
  CircularSlider,
  CircularSliderValue,
} from "@/registry/react/components/circular-slider";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex flex-wrap items-end justify-center gap-10">
        <div className="flex flex-col items-center gap-3">
          <CircularSlider defaultValue={130} size={120} thickness={8}>
            <CircularSliderValue suffix="°" />
          </CircularSlider>
          <span className="text-muted-foreground text-xs">Default</span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <CircularSlider
            defaultValue={240}
            markers
            size={120}
            step={15}
            thickness={6}
          >
            <CircularSliderValue suffix="°" />
          </CircularSlider>
          <span className="text-muted-foreground text-xs">
            Markers, step 15°
          </span>
        </div>
      </div>
    </div>
  );
}
