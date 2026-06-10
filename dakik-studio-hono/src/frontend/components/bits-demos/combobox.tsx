import { createListCollection } from "@ark-ui/react/combobox";
import { useMemo, useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/registry/react/components/combobox";

const timezones = [
  { label: "London (GMT)", value: "europe/london" },
  { label: "Istanbul (TRT)", value: "europe/istanbul" },
  { label: "Berlin (CET)", value: "europe/berlin" },
  { label: "New York (EST)", value: "america/new_york" },
  { label: "Los Angeles (PST)", value: "america/los_angeles" },
  { label: "Tokyo (JST)", value: "asia/tokyo" },
  { label: "Sydney (AEST)", value: "australia/sydney" },
];

export default function Demo() {
  const [items, setItems] = useState(timezones);

  const collection = useMemo(
    () =>
      createListCollection({
        items,
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
      }),
    [items]
  );

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex w-full max-w-72 flex-col gap-2">
        <span className="text-muted-foreground text-sm">Timezone</span>

        <Combobox
          collection={collection}
          defaultValue={["europe/london"]}
          onInputValueChange={(e) => {
            const query = e.inputValue.toLowerCase();
            setItems(
              timezones.filter((tz) => tz.label.toLowerCase().includes(query))
            );
          }}
        >
          <ComboboxInput placeholder="Select a timezone…" />

          <ComboboxContent>
            <ComboboxList>
              <ComboboxEmpty />
              {collection.items.map((item) => (
                <ComboboxItem item={item} key={item.value}>
                  {item.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  );
}
