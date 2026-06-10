import { CheckIcon, Trash2Icon, XIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ActionBar,
  ActionBarBody,
  ActionBarClose,
  ActionBarSeparator,
  ActionBarValue,
} from "@/registry/react/components/action-bar";
import { Button } from "@/registry/react/components/button";

const rows = ["Invoice #1042", "Invoice #1043", "Invoice #1044"];

export default function Demo() {
  const [selected, setSelected] = useState<string[]>([rows[0]]);

  const toggle = (row: string) =>
    setSelected((prev) =>
      prev.includes(row) ? prev.filter((r) => r !== row) : [...prev, row]
    );

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <ActionBar onOpenChange={(open) => !open && setSelected([])} open={selected.length > 0}>
        <div className="relative h-64 w-full overflow-hidden rounded-lg border border-white/10">
          <div className="flex flex-col gap-1 p-3">
            <p className="px-2 pb-1 text-muted-foreground text-xs">
              Select rows to reveal the action bar
            </p>
            {rows.map((row) => {
              const isSelected = selected.includes(row);
              return (
                <button
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors",
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50"
                  )}
                  key={row}
                  onClick={() => toggle(row)}
                  type="button"
                >
                  {row}
                  {isSelected && <CheckIcon className="size-4" />}
                </button>
              );
            })}
          </div>

          {selected.length > 0 && (
            <div className="absolute inset-x-0 bottom-3 flex justify-center px-4">
              <div className="flex w-fit items-center gap-1 rounded-xl border bg-popover px-2.5 py-2 text-popover-foreground shadow-lg/5">
                <ActionBarValue count={selected.length} label={`${selected.length} selected`} />
                <ActionBarSeparator />
                <ActionBarBody>
                  <Button onClick={() => setSelected([])} size="sm" variant="ghost">
                    <Trash2Icon />
                    Delete
                  </Button>
                </ActionBarBody>
                <ActionBarSeparator />
                <ActionBarClose className="px-1">
                  <XIcon className="size-4" />
                </ActionBarClose>
              </div>
            </div>
          )}
        </div>
      </ActionBar>
    </div>
  );
}
