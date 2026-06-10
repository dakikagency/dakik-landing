import { ArrowUpRightIcon, CheckIcon, ShieldAlertIcon } from "lucide-react";
import { Badge } from "@/registry/react/components/badge";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="info">Info</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge pill size="sm" variant="success">
          <CheckIcon /> Verified
        </Badge>
        <Badge pill variant="outline">
          <ArrowUpRightIcon /> v2.4.0
        </Badge>
        <Badge pill size="lg" variant="warning">
          <ShieldAlertIcon /> Beta
        </Badge>
      </div>
    </div>
  );
}
