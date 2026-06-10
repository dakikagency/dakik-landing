import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
} from "lucide-react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/react/components/toggle-group";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <ToggleGroup defaultValue={["bold"]}>
          <ToggleGroupItem aria-label="Toggle bold" value="bold">
            <BoldIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle italic" value="italic">
            <ItalicIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Toggle underline" value="underline">
            <UnderlineIcon />
          </ToggleGroupItem>
        </ToggleGroup>
        <span className="text-muted-foreground text-sm">Multiple selection</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <ToggleGroup
          defaultValue={["center"]}
          multiple={false}
          variant="outline"
        >
          <ToggleGroupItem aria-label="Align left" value="left">
            <AlignLeftIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Align center" value="center">
            <AlignCenterIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Align right" value="right">
            <AlignRightIcon />
          </ToggleGroupItem>
        </ToggleGroup>
        <span className="text-muted-foreground text-sm">
          Single selection, outline variant
        </span>
      </div>
    </div>
  );
}
