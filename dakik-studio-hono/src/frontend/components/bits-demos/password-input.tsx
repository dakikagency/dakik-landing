import { LockIcon } from "lucide-react";
import { InputGroupAddon } from "@/registry/react/components/input-group";
import {
  PasswordInput,
  PasswordInputGroup,
  PasswordInputInput,
  PasswordInputTrigger,
} from "@/registry/react/components/password-input";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <PasswordInput>
        <span className="font-medium text-foreground text-sm">Password</span>
        <PasswordInputGroup>
          <InputGroupAddon>
            <LockIcon />
          </InputGroupAddon>
          <PasswordInputInput placeholder="Enter your password" />
          <PasswordInputTrigger />
        </PasswordInputGroup>
        <span className="text-muted-foreground text-sm">
          Use the eye toggle to reveal what you typed.
        </span>
      </PasswordInput>

      <PasswordInput defaultVisible size="lg">
        <span className="font-medium text-foreground text-sm">
          Visible by default
        </span>
        <PasswordInputGroup>
          <PasswordInputInput defaultValue="correct-horse-battery" />
          <PasswordInputTrigger />
        </PasswordInputGroup>
      </PasswordInput>
    </div>
  );
}
