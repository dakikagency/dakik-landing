import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerContentInner,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "@/registry/react/components/drawer";
import { Button } from "@/registry/react/components/button";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Open drawer</Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerContentInner>
            <DrawerHeader
              description="Set your daily activity goal. You can change this at any time."
              title="Move goal"
            />

            <DrawerBody>
              <div className="flex items-center justify-center gap-6">
                <span className="font-heading text-5xl font-semibold tabular-nums">
                  350
                </span>
                <span className="text-muted-foreground text-sm">
                  calories / day
                </span>
              </div>
            </DrawerBody>

            <DrawerFooter>
              <DrawerClose asChild>
                <Button>Set goal</Button>
              </DrawerClose>
              <DrawerClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContentInner>
        </DrawerContent>
      </Drawer>

      <p className="text-muted-foreground text-xs">
        Swipe down or tap outside to dismiss
      </p>
    </div>
  );
}
