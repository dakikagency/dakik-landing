import { useState } from "react";
import {
  InputOTP,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/registry/react/components/input-otp";

export default function Demo() {
  const [complete, setComplete] = useState(false);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-1.5">
        <span className="font-medium text-foreground text-sm">
          Verify your device
        </span>
        <span className="text-muted-foreground text-sm">
          Enter the 6-digit code we sent to your phone.
        </span>
      </div>

      <InputOTP
        onValueChange={() => setComplete(false)}
        onValueComplete={() => setComplete(true)}
      >
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSeparator />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTP>

      <p className="h-5 text-muted-foreground text-sm">
        {complete ? "Code received — verifying..." : "Didn't get a code? Resend"}
      </p>
    </div>
  );
}
