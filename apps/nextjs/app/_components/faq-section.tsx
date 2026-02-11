"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@packages/ui/components/ui/accordion";
import { faqItems } from "./faq-data";

export function FaqSection() {
  return (
    <section aria-label="FAQ" className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
          <Accordion type="multiple" className="space-y-2">
            {faqItems
              .filter((_, i) => i % 2 === 0)
              .map((item) => (
                <AccordionItem
                  key={item.question}
                  value={item.question}
                  className="rounded-lg border bg-card px-5"
                >
                  <AccordionTrigger className="text-sm font-medium hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
          <Accordion type="multiple" className="space-y-2">
            {faqItems
              .filter((_, i) => i % 2 === 1)
              .map((item) => (
                <AccordionItem
                  key={item.question}
                  value={item.question}
                  className="rounded-lg border bg-card px-5"
                >
                  <AccordionTrigger className="text-sm font-medium hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
