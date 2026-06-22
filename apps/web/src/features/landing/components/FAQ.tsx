import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui';

export const FAQ = () => (
  <section id="faq" className="container mx-auto px-6 py-24">
    <h2 className="text-center text-4xl font-bold">
      Frequently Asked Questions
    </h2>

    <div className="mx-auto mt-12 max-w-3xl">
      <Accordion type="single" collapsible>
        <AccordionItem value="1">
          <AccordionTrigger className="cursor-pointer">
            Can I manage multiple conferences?
          </AccordionTrigger>

          <AccordionContent>
            Yes. Organizations can manage multiple events from a single
            workspace.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="2">
          <AccordionTrigger className="cursor-pointer">
            Can reviewers score anonymously?
          </AccordionTrigger>

          <AccordionContent>Yes.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </section>
);
