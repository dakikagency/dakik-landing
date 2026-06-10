import { createListCollection } from "@ark-ui/react/combobox";
import { useMemo, useState } from "react";
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@/registry/react/components/autocomplete";

const frameworks = [
  "React",
  "Vue",
  "Svelte",
  "Solid",
  "Angular",
  "Qwik",
  "Preact",
  "Astro",
];

export default function Demo() {
  const [items, setItems] = useState(frameworks);

  const collection = useMemo(() => createListCollection({ items }), [items]);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex w-full max-w-72 flex-col gap-2">
        <span className="text-muted-foreground text-sm">
          Pick a framework or type your own
        </span>

        <Autocomplete
          collection={collection}
          onInputValueChange={(e) => {
            const query = e.inputValue.toLowerCase();
            setItems(
              frameworks.filter((item) => item.toLowerCase().includes(query))
            );
          }}
        >
          <AutocompleteInput placeholder="Search frameworks…" showClear />

          <AutocompleteContent>
            <AutocompleteList>
              <AutocompleteEmpty />
              {collection.items.map((item) => (
                <AutocompleteItem item={item} key={item}>
                  {item}
                </AutocompleteItem>
              ))}
            </AutocompleteList>
          </AutocompleteContent>
        </Autocomplete>
      </div>
    </div>
  );
}
