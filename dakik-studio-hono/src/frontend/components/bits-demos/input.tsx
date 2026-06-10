import { Field, FieldLabel } from "@/registry/react/components/field";
import { Input } from "@/registry/react/components/input";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Field>
        <FieldLabel>Email</FieldLabel>
        <Input placeholder="you@example.com" type="email" />
      </Field>

      <Field>
        <FieldLabel>Large</FieldLabel>
        <Input placeholder="A larger input" size="lg" />
      </Field>

      <Field disabled>
        <FieldLabel>Disabled</FieldLabel>
        <Input placeholder="You can't touch this" />
      </Field>
    </div>
  );
}
