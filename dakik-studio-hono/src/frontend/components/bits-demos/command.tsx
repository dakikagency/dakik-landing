import { useListCollection } from "@ark-ui/react/combobox";
import { useFilter } from "@ark-ui/react/locale";
import {
  CalculatorIcon,
  CalendarIcon,
  FilePlusIcon,
  FolderOpenIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import {
  Command,
  CommandContent,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/registry/react/components/command";

const commands = [
  { value: "new-file", label: "New File", group: "Files", icon: FilePlusIcon, shortcut: "⌘N" },
  { value: "open-folder", label: "Open Folder", group: "Files", icon: FolderOpenIcon, shortcut: "⌘O" },
  { value: "calendar", label: "Calendar", group: "Tools", icon: CalendarIcon, shortcut: "" },
  { value: "calculator", label: "Calculator", group: "Tools", icon: CalculatorIcon, shortcut: "" },
  { value: "profile", label: "Profile", group: "Settings", icon: UserIcon, shortcut: "⌘P" },
  { value: "preferences", label: "Preferences", group: "Settings", icon: SettingsIcon, shortcut: "⌘," },
];

const groups = ["Files", "Tools", "Settings"];

export default function Demo() {
  const { contains } = useFilter({ sensitivity: "base" });

  const { collection, filter } = useListCollection({
    initialItems: commands,
    filter: contains,
  });

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Command
        className="w-full"
        collection={collection}
        onInputValueChange={({ inputValue }) => filter(inputValue)}
      >
        <CommandInput />
        <CommandContent>
          <CommandList>
            <CommandEmpty />
            {groups.map((group) => {
              const items = collection.items.filter(
                (item) => item.group === group
              );

              if (items.length === 0) {
                return null;
              }

              return (
                <CommandGroup heading={group} key={group}>
                  {items.map((item) => (
                    <CommandItem item={item} key={item.value}>
                      <item.icon className="text-muted-foreground" />
                      {item.label}
                      {!!item.shortcut && (
                        <CommandShortcut>{item.shortcut}</CommandShortcut>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </CommandContent>
        <CommandFooter>
          <span>Navigate with arrow keys</span>
          <span>↵ to select</span>
        </CommandFooter>
      </Command>
    </div>
  );
}
