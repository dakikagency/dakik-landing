import { useState } from "react";
import { HeartIcon } from "lucide-react";
import { Rating } from "@/registry/react/components/rating";

export default function Demo() {
  const [value, setValue] = useState(3);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <Rating
          onValueChange={(details) => setValue(details.value)}
          value={value}
        />
        <span className="text-muted-foreground text-sm">
          You rated {value} out of 5
        </span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Rating allowHalf defaultValue={3.5} readOnly />
        <span className="text-muted-foreground text-sm">
          Half ratings, read-only
        </span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Rating
          className="text-destructive"
          defaultValue={4}
          icon={<HeartIcon />}
        />
        <span className="text-muted-foreground text-sm">Custom icon</span>
      </div>
    </div>
  );
}
