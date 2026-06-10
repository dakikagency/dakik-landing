import { useEffect, useState } from "react";
import { Progress, ProgressValue } from "@/registry/react/components/progress";

export default function Demo() {
  const [value, setValue] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => (prev >= 100 ? 0 : prev + 10));
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Syncing files</span>
        </div>
        <Progress value={value}>
          <ProgressValue />
        </Progress>
      </div>

      <div className="flex w-full flex-col gap-2">
        <span className="text-muted-foreground text-sm">Static at 65%</span>
        <Progress value={65} />
      </div>

      <div className="flex w-full flex-col gap-2">
        <span className="text-muted-foreground text-sm">Indeterminate</span>
        <Progress indeterminate />
      </div>
    </div>
  );
}
