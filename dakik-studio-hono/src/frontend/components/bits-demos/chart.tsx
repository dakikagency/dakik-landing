import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  type ChartConfig,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/registry/react/components/chart";

const data = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
];

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;

export default function Demo() {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <ChartContainer className="min-h-52 w-full" config={config}>
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="month"
            tickLine={false}
            tickMargin={10}
          />
          <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
          <ChartLegend content={<ChartLegendContent />} />
          {/* recharts 2.x bar animation never completes under React 19 — the
              rectangles stay empty — so draw the bars statically. */}
          <Bar
            dataKey="desktop"
            fill="var(--color-desktop)"
            isAnimationActive={false}
            radius={4}
          />
          <Bar
            dataKey="mobile"
            fill="var(--color-mobile)"
            isAnimationActive={false}
            radius={4}
          />
        </BarChart>
      </ChartContainer>
      <p className="text-muted-foreground text-sm">
        Visitors by device, first half of the year
      </p>
    </div>
  );
}
