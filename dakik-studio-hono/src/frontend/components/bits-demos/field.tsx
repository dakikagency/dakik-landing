import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldHelper,
  FieldLabel,
  FieldRequiredIndicator,
} from "@/registry/react/components/field";
import { Input } from "@/registry/react/components/input";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <FieldGroup>
        <Field required>
          <FieldLabel>
            Full name
            <FieldRequiredIndicator />
          </FieldLabel>
          <Input placeholder="Ada Lovelace" />
          <FieldHelper>This appears on your public profile.</FieldHelper>
        </Field>

        <Field>
          <FieldLabel>Workspace URL</FieldLabel>
          <FieldDescription>
            Lowercase letters, numbers and dashes only.
          </FieldDescription>
          <Input placeholder="acme-inc" />
        </Field>

        <Field invalid>
          <FieldLabel>Email</FieldLabel>
          <Input defaultValue="ada@invalid" type="email" />
          <FieldError>Please enter a valid email address.</FieldError>
        </Field>
      </FieldGroup>
    </div>
  );
}
