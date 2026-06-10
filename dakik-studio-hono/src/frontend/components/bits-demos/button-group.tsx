import {
  BoldIcon,
  ChevronDownIcon,
  ItalicIcon,
  MinusIcon,
  PlusIcon,
  UnderlineIcon,
} from "lucide-react";
import { Button } from "@/registry/react/components/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/registry/react/components/button-group";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <ButtonGroup>
        <Button size="icon-md" variant="outline">
          <BoldIcon />
        </Button>
        <Button size="icon-md" variant="outline">
          <ItalicIcon />
        </Button>
        <Button size="icon-md" variant="outline">
          <UnderlineIcon />
        </Button>
      </ButtonGroup>

      <ButtonGroup>
        <Button variant="outline">Save changes</Button>
        <ButtonGroupSeparator />
        <Button size="icon-md" variant="outline">
          <ChevronDownIcon />
        </Button>
      </ButtonGroup>

      <ButtonGroup>
        <Button size="icon-md" variant="outline">
          <MinusIcon />
        </Button>
        <ButtonGroupText>12</ButtonGroupText>
        <Button size="icon-md" variant="outline">
          <PlusIcon />
        </Button>
      </ButtonGroup>
    </div>
  );
}
