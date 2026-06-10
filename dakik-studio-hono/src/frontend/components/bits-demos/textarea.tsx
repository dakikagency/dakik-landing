import { useState } from "react";
import { Textarea } from "@/registry/react/components/textarea";

const MAX_LENGTH = 200;

export default function Demo() {
  const [message, setMessage] = useState("");

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex w-full flex-col gap-2">
        <span className="font-medium text-foreground text-sm">
          Your message
        </span>
        <Textarea
          maxLength={MAX_LENGTH}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tell us what you're building..."
          value={message}
        />
        <span className="self-end text-muted-foreground text-xs tabular-nums">
          {message.length}/{MAX_LENGTH}
        </span>
      </div>

      <div className="flex w-full flex-col gap-2">
        <span className="font-medium text-muted-foreground text-sm">
          Disabled
        </span>
        <Textarea disabled placeholder="This field is read-only for now" />
      </div>
    </div>
  );
}
