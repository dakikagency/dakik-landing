import {
  Tour,
  TourContent,
  TourDescription,
  TourFooter,
  TourHeader,
  TourNextStep,
  TourPreviousStep,
  TourProgressText,
  TourTitle,
  TourTrigger,
  type TourStepType,
} from "@/registry/react/components/tour";
import { Button } from "@/registry/react/components/button";

const steps: TourStepType[] = [
  {
    id: "welcome",
    type: "dialog",
    title: "Welcome to the tour",
    description: "Let us walk you through the key parts of this demo.",
    actions: [
      { label: "Skip", action: "dismiss" },
      { label: "Start", action: "next" },
    ],
  },
  {
    id: "search",
    type: "tooltip",
    placement: "bottom",
    target: () => document.getElementById("tour-demo-search"),
    title: "Search anything",
    description: "Find components, docs and examples from one place.",
    actions: [
      { label: "Back", action: "prev" },
      { label: "Next", action: "next" },
    ],
  },
  {
    id: "publish",
    type: "tooltip",
    placement: "top",
    target: () => document.getElementById("tour-demo-publish"),
    title: "Ship it",
    description: "When you are happy with the result, publish in one click.",
    actions: [
      { label: "Back", action: "prev" },
      { label: "Finish", action: "dismiss" },
    ],
  },
];

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Tour steps={steps}>
        <div className="flex w-full flex-col gap-4 rounded-xl border p-4">
          <div
            className="rounded-lg border bg-muted/40 px-3 py-2 text-muted-foreground text-sm"
            id="tour-demo-search"
          >
            Search components…
          </div>

          <div className="flex items-center justify-between">
            <TourTrigger asChild>
              <Button variant="outline">Start tour</Button>
            </TourTrigger>

            <Button id="tour-demo-publish">Publish</Button>
          </div>
        </div>

        <TourContent>
          <TourHeader>
            <TourTitle />
            <TourDescription />
          </TourHeader>

          <TourFooter>
            <TourProgressText className="me-auto self-center" />
            <TourPreviousStep />
            <TourNextStep />
          </TourFooter>
        </TourContent>
      </Tour>
    </div>
  );
}
