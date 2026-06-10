import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/react/components/accordion";

const items = [
  {
    value: "what",
    question: "What is Dakik Bits?",
    answer:
      "A collection of accessible, themeable components built on Ark UI and styled with Tailwind. Copy them into your project and own the code.",
  },
  {
    value: "styling",
    question: "Can I customize the styling?",
    answer:
      "Yes. Every component ships as plain TypeScript and Tailwind classes in your codebase, so you can change anything without fighting a library.",
  },
  {
    value: "a11y",
    question: "Is it accessible?",
    answer:
      "Components follow WAI-ARIA patterns out of the box — keyboard navigation, focus management, and screen reader support included.",
  },
];

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Accordion className="w-full" defaultValue={["what"]}>
        {items.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">{item.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
