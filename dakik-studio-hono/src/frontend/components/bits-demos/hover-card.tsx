import { CalendarDaysIcon } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/react/components/hover-card";
import { Avatar, AvatarFallback } from "@/registry/react/components/avatar";
import { Button } from "@/registry/react/components/button";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <p className="text-muted-foreground text-sm">
        Latest release shipped by{" "}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button className="px-1 text-foreground" variant="link">
              @dakik
            </Button>
          </HoverCardTrigger>

          <HoverCardContent>
            <div className="flex gap-3">
              <Avatar>
                <AvatarFallback>DK</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-sm leading-none">
                  @dakik
                </span>
                <p className="text-muted-foreground text-sm">
                  Building Dakik Bits — accessible Ark UI components styled
                  with Tailwind.
                </p>
                <div className="flex items-center gap-1.5 pt-1 text-muted-foreground text-xs">
                  <CalendarDaysIcon className="size-3.5" />
                  Joined March 2024
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </p>
    </div>
  );
}
