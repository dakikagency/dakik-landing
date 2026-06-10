import { BellIcon, MailIcon } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/react/components/avatar";
import { Badge } from "@/registry/react/components/badge";
import { Button } from "@/registry/react/components/button";
import { Float } from "@/registry/react/components/float";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex items-center gap-10">
        <div className="relative">
          <Button size="icon-lg" variant="outline">
            <BellIcon />
          </Button>
          <Float placement="top-end">
            <Badge pill size="sm" variant="destructive">
              3
            </Badge>
          </Float>
        </div>

        <div className="relative">
          <Avatar size="lg">
            <AvatarImage
              alt="Avatar"
              src="https://i.pravatar.cc/80?img=12"
            />
            <AvatarFallback>EK</AvatarFallback>
          </Avatar>
          <Float placement="bottom-end">
            <span className="block size-3 rounded-full border-2 border-background bg-emerald-500" />
          </Float>
        </div>

        <div className="relative rounded-xl border border-white/10 px-6 py-4">
          <MailIcon className="size-5 text-muted-foreground" />
          <Float placement="top-start">
            <Badge pill size="sm">
              New
            </Badge>
          </Float>
        </div>
      </div>
      <p className="text-muted-foreground text-sm">
        Anchored overlays via the <code>placement</code> prop
      </p>
    </div>
  );
}
