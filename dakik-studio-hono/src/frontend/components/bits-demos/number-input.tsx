import {
  NumberInput,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
  NumberInputInput,
  NumberInputScrubber,
} from "@/registry/react/components/number-input";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <NumberInput defaultValue="2" max={99} min={0}>
        <NumberInputScrubber>Seats</NumberInputScrubber>
        <NumberInputGroup>
          <NumberInputDecrement />
          <NumberInputInput />
          <NumberInputIncrement />
        </NumberInputGroup>
      </NumberInput>

      <NumberInput
        defaultValue="49.99"
        formatOptions={{ style: "currency", currency: "USD" }}
        min={0}
        step={5}
      >
        <NumberInputScrubber>Budget (scrub the label)</NumberInputScrubber>
        <NumberInputGroup>
          <NumberInputDecrement />
          <NumberInputInput />
          <NumberInputIncrement />
        </NumberInputGroup>
      </NumberInput>
    </div>
  );
}
