import { createListCollection } from "@ark-ui/react/collection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/react/components/select";

const frameworks = createListCollection({
  items: [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Svelte", value: "svelte" },
    { label: "Solid", value: "solid" },
    { label: "Angular", value: "angular", disabled: true },
  ],
});

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex w-full flex-col gap-2">
        <span className="font-medium text-foreground text-sm">Framework</span>
        <Select collection={frameworks} defaultValue={["react"]}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a framework" />
          </SelectTrigger>
          <SelectContent>
            {frameworks.items.map((item) => (
              <SelectItem item={item} key={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex w-full flex-col gap-2">
        <span className="font-medium text-foreground text-sm">
          With clear button
        </span>
        <Select collection={frameworks}>
          <SelectTrigger className="w-full" showClear>
            <SelectValue placeholder="Pick your stack" />
          </SelectTrigger>
          <SelectContent>
            {frameworks.items.map((item) => (
              <SelectItem item={item} key={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
