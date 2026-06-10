import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import {
  Announcement,
  AnnouncementTitle,
} from "@/registry/react/components/announcement";
import { Badge } from "@/registry/react/components/badge";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Announcement>
        <SparklesIcon />
        <AnnouncementTitle>Dakik Bits is now in public beta</AnnouncementTitle>
      </Announcement>

      <Announcement asChild>
        <a href="#changelog" onClick={(event) => event.preventDefault()}>
          <Badge>New</Badge>
          <AnnouncementTitle>
            v2.0 released — see what changed
            <ArrowRightIcon />
          </AnnouncementTitle>
        </a>
      </Announcement>
    </div>
  );
}
