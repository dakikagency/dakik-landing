import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/registry/react/components/dialog";
import { Button } from "@/registry/react/components/button";
import { Input } from "@/registry/react/components/input";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Edit profile</Button>
        </DialogTrigger>

        <DialogContent size="sm">
          <DialogHeader
            description="Make changes to your profile here. Click save when you are done."
            title="Edit profile"
          />

          <DialogBody>
            <div className="flex flex-col gap-4 text-start">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">Name</span>
                <Input defaultValue="Erdeniz Korkmaz" name="name" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">Username</span>
                <Input defaultValue="@dakik" name="username" />
              </label>
            </div>
          </DialogBody>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button>Save changes</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
