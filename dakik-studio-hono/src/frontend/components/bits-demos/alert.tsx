import { CircleAlertIcon, CircleCheckIcon, TerminalIcon } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/registry/react/components/alert";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Alert>
        <TerminalIcon />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components to your app using the CLI.
        </AlertDescription>
      </Alert>

      <Alert variant="success">
        <CircleCheckIcon />
        <AlertTitle>Deployment complete</AlertTitle>
        <AlertDescription>
          Your changes are live on the production environment.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>
          Your card was declined. Update your billing details and try again.
        </AlertDescription>
      </Alert>
    </div>
  );
}
