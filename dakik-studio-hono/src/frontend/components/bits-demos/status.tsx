import { Status } from "@/registry/react/components/status";

const services = [
  { label: "API", variant: "success", state: "Operational" },
  { label: "Dashboard", variant: "warning", state: "Degraded" },
  { label: "Webhooks", variant: "destructive", state: "Outage" },
  { label: "CDN", variant: "info", state: "Maintenance" },
] as const;

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex w-full flex-col gap-3">
        {services.map((service) => (
          <div
            className="flex items-center justify-between text-sm"
            key={service.label}
          >
            <div className="flex items-center gap-2.5">
              <Status variant={service.variant} />
              <span className="text-foreground">{service.label}</span>
            </div>
            <span className="text-muted-foreground">{service.state}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Status size="sm" variant="success" />
        <Status size="md" variant="success" />
        <Status size="lg" variant="success" />
        <span className="text-muted-foreground text-xs">sm / md / lg</span>
      </div>
    </div>
  );
}
