import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/registry/react/components/button";
import {
  Timer,
  TimerArea,
  TimerControl,
  TimerItem,
  TimerItemGroup,
  TimerItemLabel,
  TimerPause,
  TimerPlay,
  TimerReset,
  TimerSeparator,
} from "@/registry/react/components/timer";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Timer countdown className="items-center" startMs={5 * 60 * 1000}>
        <TimerArea>
          <TimerItemGroup>
            <TimerItem type="minutes" />
            <TimerItemLabel>min</TimerItemLabel>
          </TimerItemGroup>
          <TimerSeparator />
          <TimerItemGroup>
            <TimerItem type="seconds" />
            <TimerItemLabel>sec</TimerItemLabel>
          </TimerItemGroup>
        </TimerArea>

        <TimerControl>
          <Button asChild size="sm" variant="default">
            <TimerPlay>
              <Play /> Start
            </TimerPlay>
          </Button>
          <Button asChild size="sm" variant="outline">
            <TimerPause>
              <Pause /> Pause
            </TimerPause>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <TimerReset>
              <RotateCcw /> Reset
            </TimerReset>
          </Button>
        </TimerControl>
      </Timer>

      <p className="text-muted-foreground text-sm">
        A five-minute countdown with start, pause, and reset controls.
      </p>
    </div>
  );
}
