import { useEffect, useState } from "react";
import {
  CircularProgress,
  CircularProgressValue,
} from "@/registry/react/components/circular-progress";

export default function Demo() {
  const [value, setValue] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => (prev >= 100 ? 0 : prev + 5));
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex items-end gap-10">
        <div className="flex flex-col items-center gap-2">
          <CircularProgress size={56} thickness={5} value={value}>
            <span className="absolute">
              <CircularProgressValue />
            </span>
          </CircularProgress>
          <span className="text-muted-foreground text-xs">Uploading</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <CircularProgress size={56} thickness={5} value={66} />
          <span className="text-muted-foreground text-xs">Static</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <CircularProgress indeterminate size={56} thickness={5} />
          <span className="text-muted-foreground text-xs">Indeterminate</span>
        </div>
      </div>
    </div>
  );
}
