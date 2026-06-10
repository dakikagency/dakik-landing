import { Button } from "@/registry/react/components/button";
import {
  Steps,
  StepsCompletedContent,
  StepsContent,
  StepsIndicator,
  StepsItem,
  StepsList,
  StepsNext,
  StepsPrevious,
  StepsSeparator,
  StepsTitle,
  StepsTrigger,
} from "@/registry/react/components/steps";

const steps = [
  { title: "Account", description: "Create your login" },
  { title: "Details", description: "Tell us about you" },
  { title: "Confirm", description: "Review and finish" },
];

export default function Demo() {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <Steps className="w-full" count={steps.length} defaultStep={1}>
        <StepsList>
          {steps.map((step, index) => (
            <StepsItem index={index} key={step.title}>
              <StepsTrigger>
                <StepsIndicator>{index + 1}</StepsIndicator>
                <StepsTitle className="max-sm:hidden">{step.title}</StepsTitle>
              </StepsTrigger>
              <StepsSeparator />
            </StepsItem>
          ))}
        </StepsList>

        {steps.map((step, index) => (
          <StepsContent
            className="rounded-lg border border-white/10 px-4 py-6 text-center"
            index={index}
            key={step.title}
          >
            <p className="font-medium text-foreground text-sm">{step.title}</p>
            <p className="mt-1 text-muted-foreground text-xs">
              {step.description}
            </p>
          </StepsContent>
        ))}

        <StepsCompletedContent className="rounded-lg border border-white/10 px-4 py-6 text-center text-sm">
          All steps complete — you&apos;re all set!
        </StepsCompletedContent>

        <div className="flex justify-center gap-2">
          <StepsPrevious asChild>
            <Button size="sm" variant="outline">
              Back
            </Button>
          </StepsPrevious>
          <StepsNext asChild>
            <Button size="sm">Next</Button>
          </StepsNext>
        </div>
      </Steps>
    </div>
  );
}
