import { useState } from "react";
import { Switch } from "@/registry/react/components/switch";

export default function Demo() {
  const [wifi, setWifi] = useState(true);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex w-full max-w-xs flex-col gap-4">
        <label className="flex items-center justify-between gap-3">
          <span className="font-medium text-foreground text-sm">
            Wi-Fi {wifi ? "on" : "off"}
          </span>
          <Switch
            checked={wifi}
            onCheckedChange={(details) => setWifi(details.checked)}
          />
        </label>

        <label className="flex items-center justify-between gap-3">
          <span className="font-medium text-foreground text-sm">Bluetooth</span>
          <Switch />
        </label>

        <label className="flex items-center justify-between gap-3">
          <span className="font-medium text-muted-foreground text-sm">
            Airplane mode (disabled)
          </span>
          <Switch defaultChecked disabled />
        </label>
      </div>
    </div>
  );
}
