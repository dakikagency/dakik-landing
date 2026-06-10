import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@/registry/react/components/popover";
import { Button } from "@/registry/react/components/button";
import { Input } from "@/registry/react/components/input";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>

        <PopoverContent className="w-72" showCloseButton>
          <PopoverHeader
            description="Set the width and height for the layer."
            title="Dimensions"
          />

          <PopoverBody>
            <div className="flex flex-col gap-3">
              <label className="grid grid-cols-2 items-center gap-3 text-sm">
                <span className="text-muted-foreground">Width</span>
                <Input defaultValue="100%" name="width" size="sm" />
              </label>
              <label className="grid grid-cols-2 items-center gap-3 text-sm">
                <span className="text-muted-foreground">Height</span>
                <Input defaultValue="32px" name="height" size="sm" />
              </label>
            </div>
          </PopoverBody>

          <PopoverArrow />
        </PopoverContent>
      </Popover>
    </div>
  );
}
