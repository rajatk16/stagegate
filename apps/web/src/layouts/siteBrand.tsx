import { Link } from "react-router";
import { Layers3 } from "lucide-react";

interface Props {
  to?: string;
}

export const SiteBrand = ({ to = "/" }: Props) => (
  <Link
    to={to}
    className="inline-flex items-center gap-3 rounded-lg focus-visible::outline-2 focus:visible:outline-offset-4 focus:visible:outline-ring"
  >
    <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
      <Layers3 aria-hidden="true" className="size-5" />
    </span>

    <span className="font-semibold tracking-tight">StageGate</span>
  </Link>
);
