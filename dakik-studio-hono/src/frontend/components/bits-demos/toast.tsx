import { Button } from "@/registry/react/components/button";
import { Toaster, toast } from "@/registry/react/components/toast";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() =>
            toast.create({
              title: "Changes saved",
              description: "Your profile has been updated.",
              type: "success",
            })
          }
          variant="outline"
        >
          Success
        </Button>

        <Button
          onClick={() =>
            toast.create({
              title: "Upload failed",
              description: "The file exceeds the 10 MB limit.",
              type: "error",
            })
          }
          variant="outline"
        >
          Error
        </Button>

        <Button
          onClick={() =>
            toast.create({
              title: "Scheduled maintenance",
              description: "The API will be read-only tonight at 02:00 UTC.",
              type: "info",
              action: {
                label: "Details",
                onClick: () => {},
              },
            })
          }
          variant="outline"
        >
          With action
        </Button>
      </div>

      <Toaster />
    </div>
  );
}
