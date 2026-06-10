import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from "@/registry/react/components/sheet";
import { Button } from "@/registry/react/components/button";

const PLACEMENTS = ["right", "left", "bottom", "top"] as const;

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {PLACEMENTS.map((placement) => (
          <Sheet key={placement}>
            <SheetTrigger asChild>
              <Button size="sm" variant="outline">
                {placement}
              </Button>
            </SheetTrigger>

            <SheetContent placement={placement}>
              <SheetHeader
                className="pt-(--space)"
                description="Panels that slide in from any edge of the screen."
                title="Notifications"
              />

              <SheetBody>
                <ul className="flex flex-col gap-3 text-sm">
                  <li className="rounded-lg border p-3">
                    <p className="font-medium">Deploy finished</p>
                    <p className="text-muted-foreground">
                      dakik-studio built in 42s
                    </p>
                  </li>
                  <li className="rounded-lg border p-3">
                    <p className="font-medium">New comment</p>
                    <p className="text-muted-foreground">
                      “Love the new component pages!”
                    </p>
                  </li>
                </ul>
              </SheetBody>

              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Dismiss all</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ))}
      </div>
    </div>
  );
}
