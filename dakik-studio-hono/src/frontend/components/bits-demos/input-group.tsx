import { ArrowRightIcon, SearchIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/registry/react/components/input-group";
import { Kbd } from "@/registry/react/components/kbd";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search components..." />
        <InputGroupAddon align="inline-end">
          <Kbd>⌘K</Kbd>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="yoursite" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>.dakik.co.uk</InputGroupText>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup size="lg">
        <InputGroupInput placeholder="Join the waitlist" type="email" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="sm" variant="secondary">
            Subscribe
            <ArrowRightIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
