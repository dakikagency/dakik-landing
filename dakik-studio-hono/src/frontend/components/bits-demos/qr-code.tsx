import { Sparkles } from "lucide-react";
import {
  QrCode,
  QrCodeFrame,
  QrCodeOverlay,
} from "@/registry/react/components/qr-code";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex items-start gap-8">
        <div className="flex flex-col items-center gap-2">
          <QrCode defaultValue="https://dakik.co.uk/bits">
            <QrCodeFrame />
          </QrCode>
          <span className="text-muted-foreground text-xs">Plain</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <QrCode defaultValue="https://dakik.co.uk/bits">
            <QrCodeFrame />
            <QrCodeOverlay className="m-auto">
              <Sparkles />
            </QrCodeOverlay>
          </QrCode>
          <span className="text-muted-foreground text-xs">With overlay</span>
        </div>
      </div>
      <p className="text-muted-foreground text-sm">
        Scan to open <span className="text-foreground">dakik.co.uk/bits</span>
      </p>
    </div>
  );
}
