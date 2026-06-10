import { cn } from "../../lib/cn";

interface Props {
  className?: string;
  children: React.ReactNode;
}

export const Section = ({ children, className }: Props) => (
  <section className={cn("mx-auto max-w-7xl px-6 lg:px-8", className)}>
    {children}
  </section>
);
