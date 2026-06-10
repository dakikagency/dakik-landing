import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupLabel,
} from "@/registry/react/components/radio-group";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <RadioGroup className="w-full" defaultValue="standard">
        <RadioGroupLabel>Shipping speed</RadioGroupLabel>
        <RadioGroupItem value="standard">
          Standard — 4 to 6 business days
        </RadioGroupItem>
        <RadioGroupItem value="express">
          Express — 1 to 2 business days
        </RadioGroupItem>
        <RadioGroupItem value="overnight">Overnight — next day</RadioGroupItem>
        <RadioGroupItem disabled value="drone">
          Drone delivery — coming soon
        </RadioGroupItem>
      </RadioGroup>
    </div>
  );
}
