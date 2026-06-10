import { Field, FieldHelper, FieldLabel } from "@/registry/react/components/field";
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/registry/react/components/native-select";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Field>
        <FieldLabel>Timezone</FieldLabel>
        <NativeSelect className="w-full" defaultValue="">
          <NativeSelectOption disabled value="">
            Select a timezone
          </NativeSelectOption>
          <NativeSelectOptGroup label="Europe">
            <NativeSelectOption value="europe/london">
              London (GMT)
            </NativeSelectOption>
            <NativeSelectOption value="europe/istanbul">
              Istanbul (GMT+3)
            </NativeSelectOption>
            <NativeSelectOption value="europe/berlin">
              Berlin (GMT+1)
            </NativeSelectOption>
          </NativeSelectOptGroup>
          <NativeSelectOptGroup label="Americas">
            <NativeSelectOption value="america/new_york">
              New York (GMT-5)
            </NativeSelectOption>
            <NativeSelectOption value="america/los_angeles">
              Los Angeles (GMT-8)
            </NativeSelectOption>
          </NativeSelectOptGroup>
        </NativeSelect>
        <FieldHelper>Used for scheduling and reminders.</FieldHelper>
      </Field>

      <Field>
        <FieldLabel>Plan (large)</FieldLabel>
        <NativeSelect className="w-full" defaultValue="pro" size="lg">
          <NativeSelectOption value="free">Free</NativeSelectOption>
          <NativeSelectOption value="pro">Pro</NativeSelectOption>
          <NativeSelectOption value="team">Team</NativeSelectOption>
        </NativeSelect>
      </Field>
    </div>
  );
}
