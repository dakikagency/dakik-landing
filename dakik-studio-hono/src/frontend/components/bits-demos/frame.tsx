import { Button } from "@/registry/react/components/button";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/registry/react/components/frame";
import { Switch } from "@/registry/react/components/switch";

export default function Demo() {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <Frame className="w-full">
        <FrameHeader
          description="Choose how Dakik Studio keeps you in the loop."
          title="Notifications"
        />

        <FramePanel className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <FrameTitle>Deploy alerts</FrameTitle>
            <FrameDescription>
              Get notified when a deploy succeeds or fails.
            </FrameDescription>
          </div>
          <Switch defaultChecked />
        </FramePanel>

        <FramePanel className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <FrameTitle>Weekly digest</FrameTitle>
            <FrameDescription>
              A summary of usage and incidents, every Monday.
            </FrameDescription>
          </div>
          <Switch />
        </FramePanel>

        <FrameFooter className="flex justify-end gap-2">
          <Button size="sm" variant="ghost">
            Reset
          </Button>
          <Button size="sm">Save preferences</Button>
        </FrameFooter>
      </Frame>
    </div>
  );
}
