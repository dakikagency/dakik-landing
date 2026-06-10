import { useState } from "react";
import {
  Slider,
  SliderLabel,
  SliderValue,
} from "@/registry/react/components/slider";

export default function Demo() {
  const [volume, setVolume] = useState([35]);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-10">
      <Slider
        max={100}
        min={0}
        onValueChange={(details) => setVolume(details.value)}
        value={volume}
      >
        <div className="flex w-full items-center justify-between">
          <SliderLabel>Volume</SliderLabel>
          <SliderValue />
        </div>
      </Slider>

      <Slider defaultValue={[200, 650]} max={1000} min={0} step={10}>
        <div className="flex w-full items-center justify-between">
          <SliderLabel>Price range</SliderLabel>
          <SliderValue />
        </div>
      </Slider>

      <Slider defaultValue={[4]} markerInterval={2} max={8} min={0} showMarkers>
        <SliderLabel>Team size</SliderLabel>
      </Slider>
    </div>
  );
}
