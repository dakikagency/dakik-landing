import { useState } from "react";
import { SignaturePad } from "@/registry/react/components/signature-pad";

export default function Demo() {
  const [signed, setSigned] = useState(false);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex w-full flex-col gap-2">
        <span className="font-medium text-foreground text-sm">
          Sign below to confirm
        </span>
        <SignaturePad
          onDrawEnd={(details) => setSigned(details.paths.length > 0)}
        />
        <span className="text-muted-foreground text-sm">
          {signed
            ? "Signature captured — use the reset button to start over."
            : "Draw your signature with a mouse, finger, or stylus."}
        </span>
      </div>
    </div>
  );
}
