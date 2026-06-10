import { CheckIcon, PencilIcon, XIcon } from "lucide-react";
import { Button } from "@/registry/react/components/button";
import {
  Editable,
  EditableArea,
  EditableCancelTrigger,
  EditableControl,
  EditableEditTrigger,
  EditableInput,
  EditablePreview,
  EditableSubmitTrigger,
  useEditable,
} from "@/registry/react/components/editable";

function EditableControls() {
  const editable = useEditable();

  return (
    <EditableControl>
      {editable.editing ? (
        <>
          <EditableSubmitTrigger asChild>
            <Button size="icon-md">
              <CheckIcon />
            </Button>
          </EditableSubmitTrigger>
          <EditableCancelTrigger asChild>
            <Button size="icon-md" variant="outline">
              <XIcon />
            </Button>
          </EditableCancelTrigger>
        </>
      ) : (
        <EditableEditTrigger asChild>
          <Button size="icon-md" variant="ghost">
            <PencilIcon />
          </Button>
        </EditableEditTrigger>
      )}
    </EditableControl>
  );
}

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex w-full max-w-80 flex-col gap-2">
        <span className="text-muted-foreground text-sm">
          Project name — click the text to edit
        </span>

        <Editable
          activationMode="click"
          defaultValue="Dakik Bits"
          placeholder="Enter a project name"
        >
          <EditableArea>
            <EditableInput />
            <EditablePreview />
          </EditableArea>

          <EditableControls />
        </Editable>
      </div>
    </div>
  );
}
