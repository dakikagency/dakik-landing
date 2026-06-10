import { Checkbox, CheckboxGroup } from "@/registry/react/components/checkbox";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-foreground text-sm">
          <Checkbox defaultChecked />
          Checked
        </label>
        <label className="flex items-center gap-2 text-foreground text-sm">
          <Checkbox checked="indeterminate" />
          Indeterminate
        </label>
        <label className="flex items-center gap-2 text-muted-foreground text-sm">
          <Checkbox defaultChecked disabled />
          Disabled
        </label>
      </div>

      <CheckboxGroup
        className="w-full max-w-56 rounded-2xl border bg-card p-4"
        defaultValue={["updates"]}
        name="notifications"
      >
        <span className="font-medium text-foreground text-sm">
          Email notifications
        </span>
        <label className="flex items-center gap-2 text-muted-foreground text-sm">
          <Checkbox value="updates" />
          Product updates
        </label>
        <label className="flex items-center gap-2 text-muted-foreground text-sm">
          <Checkbox value="security" />
          Security alerts
        </label>
        <label className="flex items-center gap-2 text-muted-foreground text-sm">
          <Checkbox value="digest" />
          Weekly digest
        </label>
      </CheckboxGroup>
    </div>
  );
}
