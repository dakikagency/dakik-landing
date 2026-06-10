import { Button } from "@/registry/react/components/button";
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerContent,
  ColorPickerControl,
  ColorPickerEyeDropperTrigger,
  ColorPickerSlider,
  ColorPickerSwatch,
  ColorPickerSwatchGroup,
  ColorPickerSwatchIndicator,
  ColorPickerSwatchTrigger,
  ColorPickerTransparencyGrid,
  ColorPickerTrigger,
  ColorPickerValue,
  ColorPickerValueSwatch,
} from "@/registry/react/components/color-picker";

const swatches = [
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <ColorPicker defaultValue="#8b5cf6">
        <ColorPickerControl>
          <ColorPickerTrigger asChild>
            <Button variant="outline">
              <ColorPickerValueSwatch className="size-4" />
              <ColorPickerValue />
            </Button>
          </ColorPickerTrigger>
        </ColorPickerControl>

        <ColorPickerContent>
          <ColorPickerArea>
            <ColorPickerAreaThumb />
          </ColorPickerArea>

          <div className="flex items-center gap-3">
            <ColorPickerEyeDropperTrigger />
            <div className="flex flex-1 flex-col gap-2.5">
              <ColorPickerSlider channel="hue" />
              <ColorPickerSlider channel="alpha">
                <ColorPickerTransparencyGrid className="rounded-full" />
              </ColorPickerSlider>
            </div>
          </div>

          <ColorPickerSwatchGroup>
            {swatches.map((color) => (
              <ColorPickerSwatchTrigger key={color} value={color}>
                <ColorPickerSwatch value={color}>
                  <ColorPickerSwatchIndicator />
                </ColorPickerSwatch>
              </ColorPickerSwatchTrigger>
            ))}
          </ColorPickerSwatchGroup>
        </ColorPickerContent>
      </ColorPicker>
    </div>
  );
}
