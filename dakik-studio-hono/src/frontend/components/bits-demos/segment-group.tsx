import {
  SegmentGroup,
  SegmentGroupItem,
  SegmentGroupItemText,
} from "@/registry/react/components/segment-group";

const periods = ["Daily", "Weekly", "Monthly", "Yearly"];
const sections = ["Overview", "Analytics", "Reports"];

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8">
      <SegmentGroup
        className="rounded-lg bg-muted/48 p-1"
        defaultValue="Weekly"
      >
        {periods.map((period) => (
          <SegmentGroupItem
            className="px-3 py-1.5 text-sm"
            key={period}
            value={period}
          >
            <SegmentGroupItemText>{period}</SegmentGroupItemText>
          </SegmentGroupItem>
        ))}
      </SegmentGroup>

      <SegmentGroup defaultValue="Overview" variant="underline">
        {sections.map((section) => (
          <SegmentGroupItem
            className="px-3 pb-2 text-sm"
            key={section}
            value={section}
          >
            <SegmentGroupItemText>{section}</SegmentGroupItemText>
          </SegmentGroupItem>
        ))}
      </SegmentGroup>
    </div>
  );
}
