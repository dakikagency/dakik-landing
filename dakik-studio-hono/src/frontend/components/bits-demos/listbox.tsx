import { createListCollection } from "@ark-ui/react/listbox";
import {
  Listbox,
  ListboxContent,
  ListboxItem,
  ListboxItemIndicator,
  ListboxItemText,
} from "@/registry/react/components/listbox";

const frameworks = createListCollection({
  items: [
    { label: "React", value: "react" },
    { label: "Svelte", value: "svelte" },
    { label: "Vue", value: "vue" },
    { label: "Solid", value: "solid" },
    { label: "Angular", value: "angular", disabled: true },
  ],
});

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Listbox
        className="max-w-64 rounded-2xl border bg-card p-1.5"
        collection={frameworks}
        defaultValue={["react"]}
      >
        <ListboxContent>
          {frameworks.items.map((item) => (
            <ListboxItem item={item} key={item.value}>
              <ListboxItemText>{item.label}</ListboxItemText>
              <ListboxItemIndicator />
            </ListboxItem>
          ))}
        </ListboxContent>
      </Listbox>
    </div>
  );
}
